import { Pool } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';

type Req = { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> };
type Res = { setHeader(name: string, value: string): void; status(code: number): Res; json(body: unknown): void };
let pool: Pool | null = null;
function getPool(url: string) { return pool ??= new Pool({ connectionString: url, max: 1 }); }
function cookieValue(req: Req, name: string): string | null { const h=req.headers.cookie; const raw=Array.isArray(h)?h[0]:h; const e=raw?.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'=')); if(!e)return null; try{return decodeURIComponent(e.slice(name.length+1));}catch{return null;} }
function drawFromNonce(nonceHex:string){return Number(BigInt('0x'+nonceHex.slice(0,12))%1000000n);}
function prizeForDraw(roll:number,winRate:number,price:number,maxPrize:number){const threshold=Math.floor(winRate*1000000);if(roll>=threshold)return {winning:false,amount:0,tier:0};const relative=roll/Math.max(1,threshold);if(relative<0.75)return {winning:true,amount:Math.min(price*2,maxPrize),tier:1};if(relative<0.95)return {winning:true,amount:Math.min(price*10,maxPrize),tier:2};return {winning:true,amount:maxPrize,tier:3};}
function ticketJson(t:any,d:any,walletBalance:number|null){return {id:String(t.id),publicId:t.public_id,type:t.type,status:t.status,price:Number(t.price),prizeAmount:Number(t.prize_amount||0),prizeTier:t.prize_tier===null?null:Number(t.prize_tier),purchasedAt:t.purchased_at,revealedAt:t.revealed_at,draw:d?{id:String(d.id),algorithmVersion:d.algorithm_version,nonceHash:d.nonce_hash,roll:Number(d.roll),winning:Boolean(d.winning),prizeAmount:Number(d.prize_amount),prizeTier:Number(d.prize_tier),drawnAt:d.drawn_at}:null,walletBalance};}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control','no-store, max-age=0'); res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({success:false,error:'Méthode non autorisée.'});}
  const url=process.env.DATABASE_URL;if(!url)return res.status(503).json({success:false,error:'Base de données non configurée.'});
  const token=cookieValue(req,'azaka_session');if(!token)return res.status(401).json({success:false,error:'Session expirée. Veuillez vous reconnecter.'});
  const body=req.body&&typeof req.body==='object' ? req.body as Record<string,unknown> : {};
  const ticketId=typeof body.ticketId==='string'?body.ticketId.trim():'';if(!ticketId)return res.status(400).json({success:false,error:'Identifiant du ticket requis.'});
  const db=getPool(url),client=await db.connect();
  try{
    await client.query('BEGIN');
    const session=await client.query(`SELECT u.id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=$1 AND s.is_active=TRUE AND s.expires_at>NOW() AND u.is_active=TRUE AND u.is_suspended=FALSE AND u.email_verified=TRUE LIMIT 1`,[token]);
    if(!session.rowCount){await client.query('ROLLBACK');return res.status(401).json({success:false,error:'Session invalide. Veuillez vous reconnecter.'});}
    const userId=String(session.rows[0].id);
    const found=await client.query(`SELECT t.id,t.public_id,t.type,t.status,t.price,t.prize_amount,t.prize_tier,t.purchased_at,t.revealed_at,t.redeemed_at,t.batch_id,b.name AS batch_name,b.win_rate,b.max_prize FROM tickets t JOIN ticket_batches b ON b.id=t.batch_id WHERE t.id=$1::uuid AND t.owner_id=$2::uuid FOR UPDATE`,[ticketId,userId]);
    if(!found.rowCount){await client.query('ROLLBACK');return res.status(404).json({success:false,error:'Ticket introuvable ou non associé à votre compte.'});}
    const ticket=found.rows[0];
    if(ticket.status!=='SOLD'){
      const existingDraw=await client.query(`SELECT id,algorithm_version,nonce_hash,roll,winning,prize_amount,prize_tier,drawn_at FROM ticket_draws WHERE ticket_id=$1::uuid LIMIT 1`,[ticket.id]);
      const wallet=await client.query(`SELECT balance FROM wallets WHERE user_id=$1::uuid LIMIT 1`,[userId]);
      await client.query('COMMIT');
      if(ticket.status==='REVEALED'&&existingDraw.rowCount)return res.status(200).json({success:true,idempotent:true,ticket:ticketJson(ticket,existingDraw.rows[0],wallet.rowCount?Number(wallet.rows[0].balance):null)});
      return res.status(409).json({success:false,error:'Ce ticket ne peut plus être révélé.'});
    }
    const winRate=Number(ticket.win_rate),maxPrize=Number(ticket.max_prize),price=Number(ticket.price);
    if(!Number.isFinite(winRate)||winRate<=0||winRate>1||!Number.isSafeInteger(maxPrize)||maxPrize<price){await client.query('ROLLBACK');return res.status(409).json({success:false,error:'Configuration de tirage invalide pour cette série.'});}
    const nonceHex=String((await client.query(`SELECT encode(gen_random_bytes(32),'hex') AS nonce_hex`)).rows[0].nonce_hex);
    const nonceHash=createHash('sha256').update(nonceHex,'utf8').digest('hex');
    const roll=drawFromNonce(nonceHex);const result=prizeForDraw(roll,winRate,price,maxPrize);
    const draw=await client.query(`INSERT INTO ticket_draws(ticket_id,batch_id,algorithm_version,nonce_hex,nonce_hash,roll,winning,prize_amount,prize_tier) VALUES($1,$2,'AZAKA-DRAW-V1',$3,$4,$5,$6,$7,$8) RETURNING id,algorithm_version,nonce_hash,roll,winning,prize_amount,prize_tier,drawn_at`,[ticket.id,ticket.batch_id,nonceHex,nonceHash,roll,result.winning,result.amount,result.tier]);
    await client.query(`UPDATE tickets SET status='REVEALED',prize_amount=$1,prize_tier=$2,revealed_at=NOW() WHERE id=$3::uuid`,[result.amount,result.tier,ticket.id]);
    let walletBalance:number|null=null;
    if(result.amount>0){
      const wallet=await client.query(`SELECT id FROM wallets WHERE user_id=$1::uuid FOR UPDATE`,[userId]);
      if(!wallet.rowCount){await client.query('ROLLBACK');return res.status(409).json({success:false,error:'Portefeuille introuvable.'});}
      await client.query(`UPDATE wallets SET balance=balance+$1,total_winnings=total_winnings+$1,updated_at=NOW() WHERE id=$2`,[result.amount,wallet.rows[0].id]);
      const key=`win-credit:${ticket.id}`;
      await client.query(`INSERT INTO transactions(type,debit_account,credit_account,amount,currency,reference,description,status,idempotency_key,metadata,completed_at) VALUES('WIN_CREDIT','platform:prizes',$1,$2,'HTG',$3,$4,'COMPLETED',$5,$6::jsonb,NOW()) ON CONFLICT(idempotency_key) DO NOTHING`,[`user-${userId}-wallet`,result.amount,String(ticket.public_id),`Gain du ticket ${ticket.public_id}`,key,JSON.stringify({ticketId:String(ticket.id),userId,prize:result.amount,drawId:String(draw.rows[0].id),algorithmVersion:'AZAKA-DRAW-V1'})]);
      const w=await client.query(`SELECT balance FROM wallets WHERE id=$1`,[wallet.rows[0].id]);walletBalance=Number(w.rows[0].balance);
    }else{const w=await client.query(`SELECT balance FROM wallets WHERE user_id=$1::uuid LIMIT 1`,[userId]);walletBalance=w.rowCount?Number(w.rows[0].balance):null;}
    await client.query('COMMIT');
    ticket.status='REVEALED';ticket.prize_amount=result.amount;ticket.prize_tier=result.tier;ticket.revealed_at=new Date().toISOString();
    return res.status(200).json({success:true,idempotent:false,ticket:ticketJson(ticket,draw.rows[0],walletBalance)});
  }catch(error){try{await client.query('ROLLBACK');}catch{}console.error('Ticket reveal API error:',error instanceof Error?error.message:'unknown');return res.status(500).json({success:false,error:'Impossible de révéler le ticket.'});}finally{client.release();}
}
