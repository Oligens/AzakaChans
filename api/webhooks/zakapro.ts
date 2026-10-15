import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { Pool } from '@neondatabase/serverless';

type HeaderValue = string | string[] | undefined;
type WebhookRequest = AsyncIterable<Uint8Array | string> & { method?: string; headers: Record<string, HeaderValue> };
type WebhookResponse = { setHeader(name: string, value: string): void; status(code: number): WebhookResponse; json(body: Record<string, unknown>): void };
export const config = { api: { bodyParser: false } };
let pool: Pool | null = null;
function getPool(url: string) { return pool ??= new Pool({ connectionString: url, max: 1 }); }
function getHeader(value: HeaderValue): string { return Array.isArray(value) ? value[0] ?? '' : value ?? ''; }
async function readRawBody(req: WebhookRequest): Promise<Buffer> { const chunks: Buffer[]=[]; let total=0; for await(const chunk of req){const b=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk); total+=b.length; if(total>1024*1024)throw new Error('PAYLOAD_TOO_LARGE'); chunks.push(b);} return Buffer.concat(chunks); }
function isValidSignature(raw: Buffer, received: string, secret: string): boolean { if(!received.startsWith('sha256='))return false; const hex=received.slice(7); if(!/^[a-f0-9]{64}$/i.test(hex))return false; const a=Buffer.from(hex,'hex'),b=Buffer.from(createHmac('sha256',secret).update(raw).digest('hex'),'hex'); return a.length===b.length&&timingSafeEqual(a,b); }
function stringField(value: unknown): string | null { if(typeof value==='string'&&value.trim())return value.trim().slice(0,255); if(typeof value==='number'&&Number.isFinite(value))return String(value); return null; }
function successEvent(eventType: string, status: string): boolean { const e=eventType.toLowerCase(); const s=status.toLowerCase(); if(['failed','cancelled','canceled','expired','rejected'].some(x=>s===x||e.includes(x)))return false; return ['paid','completed','succeeded','success','confirmed'].some(x=>s===x)||['payment.paid','payment.completed','payment.succeeded','checkout.paid','checkout.completed','deposit.completed'].some(x=>e.includes(x)); }

export default async function handler(req: WebhookRequest, res: WebhookResponse) {
  res.setHeader('Cache-Control','no-store, max-age=0'); res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'Method not allowed'});}
  const secret=process.env.ZAKAPRO_APP_SECRET; const databaseUrl=process.env.DATABASE_URL;
  if(!secret||!databaseUrl)return res.status(503).json({ok:false,error:'Webhook server configuration is incomplete'});
  let rawBody:Buffer; try{rawBody=await readRawBody(req);}catch(error){const tooLarge=error instanceof Error&&error.message==='PAYLOAD_TOO_LARGE';return res.status(tooLarge?413:400).json({ok:false,error:tooLarge?'Payload too large':'Could not read request body'});}
  if(!isValidSignature(rawBody,getHeader(req.headers['x-zakapro-signature']),secret))return res.status(401).json({ok:false,error:'Invalid webhook signature'});
  let event:Record<string,unknown>; try{const parsed:unknown=JSON.parse(rawBody.toString('utf8'));if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Invalid event');event=parsed as Record<string,unknown>;}catch{return res.status(400).json({ok:false,error:'Invalid JSON payload'});}
  const data=event.data&&typeof event.data==='object'?event.data as Record<string,unknown>:{};
  const eventType=stringField(event.event)??stringField(event.type); if(!eventType)return res.status(400).json({ok:false,error:'Missing event type'});
  const reference=stringField(event.reference)??stringField(data.reference);
  const providerEventId=stringField(event.id)??stringField(data.id);
  const eventKey=providerEventId??createHash('sha256').update(rawBody).digest('hex');
  const amountValue=event.amount??event.total_amount??data.amount??data.total_amount; const amount=typeof amountValue==='number'||typeof amountValue==='string'?Number(amountValue):NaN;
  const currency=(stringField(event.currency)??stringField(data.currency)??'HTG').toUpperCase();
  const method=stringField(event.method)??stringField(event.payment_method)??stringField(data.method)??stringField(data.payment_method);
  const status=stringField(event.status)??stringField(data.status)??'';
  const recipientUserId=stringField(event.recipientUserId)??stringField(event.recipient_user_id)??stringField(data.recipientUserId)??stringField(data.recipient_user_id);
  const db=getPool(databaseUrl); const client=await db.connect();
  try{
    await client.query('BEGIN');
    const stored=await client.query(`INSERT INTO zakapro_webhook_events(event_key,provider_event_id,event_type,payment_reference,amount,currency,payment_method,payment_status,payload_sha256) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(event_key) DO NOTHING RETURNING event_key`,[eventKey,providerEventId,eventType,reference,Number.isFinite(amount)?String(amount):null,currency,method,status,createHash('sha256').update(rawBody).digest('hex')]);
    if(!stored.rowCount){await client.query('ROLLBACK');return res.status(200).json({received:true,event:eventType,recorded:true,duplicate:true,walletCredited:false});}
    if(!reference||!successEvent(eventType,status)||currency!=='HTG'||!Number.isInteger(amount)||amount<=0){await client.query('COMMIT');return res.status(200).json({received:true,event:eventType,recorded:true,walletCredited:false});}

    const deposits=await client.query(`SELECT id,user_id,wallet_id,amount,status FROM deposits WHERE provider_confirmation_code=$1 ORDER BY requested_at DESC LIMIT 1 FOR UPDATE`,[reference]);
    if(!deposits.rowCount){await client.query('COMMIT');return res.status(200).json({received:true,event:eventType,recorded:true,walletCredited:false,reason:'deposit_not_found'});}
    const deposit=deposits.rows[0];
    if(Number(deposit.amount)!==amount){await client.query('COMMIT');return res.status(200).json({received:true,event:eventType,recorded:true,walletCredited:false,reason:'amount_mismatch'});}
    if(recipientUserId&&String(deposit.user_id)!==recipientUserId){await client.query('COMMIT');return res.status(200).json({received:true,event:eventType,recorded:true,walletCredited:false,reason:'user_mismatch'});}
    if(deposit.status==='COMPLETED'){await client.query('COMMIT');return res.status(200).json({received:true,event:eventType,recorded:true,walletCredited:true,duplicateDeposit:true});}

    await client.query(`UPDATE deposits SET status='COMPLETED',confirmed_at=NOW(),provider_transaction_id=COALESCE($1,provider_transaction_id),provider_confirmation_code=$2,metadata=COALESCE(metadata,'{}'::jsonb)||$3::jsonb WHERE id=$4`,[providerEventId,reference,JSON.stringify({zakaproEvent:eventType}),deposit.id]);
    await client.query(`UPDATE wallets SET balance=balance+$1,total_deposits=total_deposits+$1,updated_at=NOW() WHERE id=$2`,[amount,deposit.wallet_id]);
    const txKey=`deposit:${deposit.id}`;
    await client.query(`INSERT INTO transactions(type,debit_account,credit_account,amount,currency,reference,description,status,idempotency_key,metadata,completed_at) VALUES('DEPOSIT','zakapro',$1,$2,'HTG',$3,$4,'COMPLETED',$5,$6::jsonb,NOW()) ON CONFLICT(idempotency_key) DO NOTHING`,[`user-${deposit.user_id}-wallet`,amount,reference,`Dépôt ZakaPro ${reference}`,txKey,JSON.stringify({depositId:String(deposit.id),userId:String(deposit.user_id),providerEventId})]);
    const wallet=await client.query(`SELECT balance,(balance-reserved_amount) AS available_balance FROM wallets WHERE id=$1`,[deposit.wallet_id]);
    await client.query('COMMIT');
    return res.status(200).json({received:true,event:eventType,recorded:true,walletCredited:true,depositId:String(deposit.id),wallet:{balance:Number(wallet.rows[0].balance),availableBalance:Number(wallet.rows[0].available_balance),currency:'HTG'}});
  }catch(error){try{await client.query('ROLLBACK');}catch{} console.error('ZakaPro webhook processing error:',error instanceof Error?error.message:'unknown'); return res.status(500).json({ok:false,error:'Impossible de traiter le paiement ZakaPro.'});}finally{client.release();}
}
