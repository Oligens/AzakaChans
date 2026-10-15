import { Pool } from '@neondatabase/serverless';
import { randomUUID } from 'node:crypto';

type Req = { method?: string; body?: unknown; query?: Record<string, string | string[] | undefined>; headers: Record<string, string | string[] | undefined> };
type Res = { setHeader(name: string, value: string): void; status(code: number): Res; json(body: unknown): void };
let pool: Pool | null = null;
function getPool(url: string) { return pool ??= new Pool({ connectionString: url, max: 1 }); }
function value(v: unknown) { return Array.isArray(v) ? String(v[0] ?? '') : String(v ?? ''); }
function cookieValue(req: Req, name: string): string | null { const h=req.headers.cookie; const raw=Array.isArray(h)?h[0]:h; const e=raw?.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'=')); if(!e)return null; try{return decodeURIComponent(e.slice(name.length+1));}catch{return null;} }
function apiBase() { const raw=process.env.ZAKAPRO_API_URL?.trim(); return raw ? raw.replace(/\/+$/,'') : ''; }

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control','no-store, max-age=0'); res.setHeader('Content-Type','application/json; charset=utf-8');
  const url=process.env.DATABASE_URL; if(!url)return res.status(503).json({success:false,error:'Base de données non configurée.'});
  const token=cookieValue(req,'azaka_session'); if(!token)return res.status(401).json({success:false,error:'Session expirée. Veuillez vous reconnecter.'});
  const db=getPool(url); const client=await db.connect();
  try {
    const session=await client.query(`SELECT u.id,u.email,u.full_name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=$1 AND s.is_active=TRUE AND s.expires_at>NOW() AND u.is_active=TRUE AND u.is_suspended=FALSE AND u.email_verified=TRUE LIMIT 1`,[token]);
    if(!session.rowCount)return res.status(401).json({success:false,error:'Session invalide. Veuillez vous reconnecter.'});
    const user=session.rows[0]; const userId=String(user.id);

    if(req.method==='GET'){
      const reference=value(req.query?.reference).trim(); if(!reference)return res.status(400).json({success:false,error:'Référence de dépôt requise.'});
      const rows=await client.query(`SELECT id,amount,currency,payment_method,status,provider_transaction_id,provider_confirmation_code,requested_at,confirmed_at,failed_at,failure_reason FROM deposits WHERE user_id=$1::uuid AND provider_confirmation_code=$2 ORDER BY requested_at DESC LIMIT 1`,[userId,reference]);
      if(!rows.rowCount)return res.status(404).json({success:false,error:'Dépôt introuvable.'});
      const d=rows.rows[0]; return res.status(200).json({success:true,deposit:{id:String(d.id),reference,amount:Number(d.amount),currency:d.currency,paymentMethod:d.payment_method,status:d.status,providerTransactionId:d.provider_transaction_id,confirmedAt:d.confirmed_at,failedAt:d.failed_at,failureReason:d.failure_reason,requestedAt:d.requested_at}});
    }

    if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({success:false,error:'Méthode non autorisée.'});}
    const body=req.body&&typeof req.body==='object'?req.body as Record<string,unknown>:{};
    const amount=Number(body.amount); const method=value(body.method).toUpperCase(); const phone=value(body.phone).trim();
    if(!Number.isInteger(amount)||amount<50)return res.status(400).json({success:false,error:'Le montant minimum est de 50 HTG.'});
    if(method!=='MONCASH'&&method!=='NATCASH')return res.status(400).json({success:false,error:'Méthode de paiement invalide.'});
    if(!/^\+509\d{8}$/.test(phone.replace(/\D/g,'').replace(/^509/,'+509')))return res.status(400).json({success:false,error:'Numéro haïtien invalide. Utilisez 8 chiffres ou +509XXXXXXXX.'});
    const canonicalPhone=phone.replace(/\D/g,'').replace(/^509/,'+509');
    const base=apiBase(); const appKey=process.env.ZAKAPRO_APP_KEY?.trim();
    if(!base||!appKey)return res.status(503).json({success:false,error:'ZakaPro n’est pas configuré côté serveur. Configurez ZAKAPRO_API_URL et ZAKAPRO_APP_KEY dans Vercel.'});

    const reference=`AZK-${randomUUID().replace(/-/g,'').slice(0,16).toUpperCase()}`;
    const wallet=await client.query(`INSERT INTO wallets(user_id) VALUES($1::uuid) ON CONFLICT(user_id) DO UPDATE SET user_id=EXCLUDED.user_id RETURNING id`,[userId]);
    await client.query(`INSERT INTO deposits(user_id,wallet_id,amount,currency,payment_method,status,provider_confirmation_code,metadata) VALUES($1,$2,$3,'HTG',$4,'PENDING',$5,$6::jsonb)`,[userId,wallet.rows[0].id,amount,method,reference,JSON.stringify({provider:'ZakaPro'})]);

    const checkoutUrl=`${base}/api/apps/${encodeURIComponent(appKey)}/checkout?appKey=${encodeURIComponent(appKey)}`;
    const intentResponse=await fetch(checkoutUrl,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({action:'donation_intent',recipientUserId:userId,customerName:String(user.full_name||user.email).slice(0,120),email:String(user.email),phone:canonicalPhone,amount})});
    const intent=await intentResponse.json().catch(()=>({}));
    if(!intentResponse.ok||!intent?.ok){
      await client.query(`UPDATE deposits SET status='FAILED',failed_at=NOW(),failure_reason=$1 WHERE user_id=$2::uuid AND provider_confirmation_code=$3`,[String(intent?.error||`ZakaPro HTTP ${intentResponse.status}`).slice(0,1000),userId,reference]);
      return res.status(502).json({success:false,error:String(intent?.error||'ZakaPro ne peut pas créer la demande de paiement.')});
    }

    const walletResponse=await fetch(`${base}/api/apps/${encodeURIComponent(appKey)}/plans?appKey=${encodeURIComponent(appKey)}`,{headers:{Accept:'application/json'}});
    const walletPayload=await walletResponse.json().catch(()=>({}));
    const merchantWallet=walletPayload?.app?.wallets || null;
    return res.status(201).json({success:true,deposit:{reference,amount,currency:'HTG',paymentMethod:method,status:'PENDING'},intent:intent.intent||null,payment:intent.payment||{currency:'HTG',methods:['moncash','natcash']},merchantWallet,provider:'ZakaPro'});
  } catch(error) {
    console.error('ZakaPro deposit API error:',error instanceof Error?error.message:'unknown');
    return res.status(502).json({success:false,error:'Impossible de joindre ZakaPro pour préparer le dépôt.'});
  } finally { client.release(); }
}
