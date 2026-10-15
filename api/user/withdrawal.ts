import { Pool } from '@neondatabase/serverless';

type Req = { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined>; query?: Record<string, string | string[] | undefined> };
type Res = { setHeader(name: string, value: string): void; status(code: number): Res; json(body: unknown): void };
let pool: Pool | null = null;
function getPool(url: string) { return pool ??= new Pool({ connectionString: url, max: 1 }); }
function cookieValue(req: Req, name: string) { const h=req.headers.cookie; const raw=Array.isArray(h)?h[0]:h; const e=raw?.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'=')); if(!e)return null; try{return decodeURIComponent(e.slice(name.length+1));}catch{return null;} }
function value(v: unknown) { return Array.isArray(v) ? String(v[0] ?? '') : String(v ?? ''); }
function clean(v: unknown, max: number) { return value(v).trim().replace(/\s+/g,' ').slice(0,max); }
function phone(v: unknown) { const d=clean(v,40).replace(/\D/g,''); if(d.length===8)return `+509${d}`; if(d.length===11&&d.startsWith('509'))return `+${d}`; return ''; }

async function currentUser(client: any, req: Req) {
  const token=cookieValue(req,'azaka_session'); if(!token)return null;
  const r=await client.query(`SELECT u.id,u.email,u.full_name,u.moncash_phone,u.natcash_phone,u.bank_name,u.bank_account_number,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=$1 AND s.is_active=TRUE AND s.expires_at>NOW() AND u.is_active=TRUE AND u.is_suspended=FALSE AND u.email_verified=TRUE LIMIT 1`,[token]);
  return r.rows[0]||null;
}

export default async function handler(req: Req,res: Res) {
  res.setHeader('Cache-Control','no-store, max-age=0'); res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method!=='GET'&&req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({success:false,error:'Méthode non autorisée.'});}
  const url=process.env.DATABASE_URL; if(!url)return res.status(503).json({success:false,error:'Base de données non configurée.'});
  const db=getPool(url); const client=await db.connect();
  try {
    const user=await currentUser(client,req); if(!user)return res.status(401).json({success:false,error:'Session invalide. Veuillez vous reconnecter.'});
    const userId=String(user.id);
    if(req.method==='GET'){
      const rows=await client.query(`SELECT id,amount,currency,method,beneficiary_name,destination_phone,bank_name,bank_account_number,status,requested_at,validated_at,rejected_at,paid_at,rejection_reason,admin_notes,payment_reference,updated_at FROM withdrawal_requests WHERE user_id=$1::uuid ORDER BY requested_at DESC LIMIT 50`,[userId]);
      const wallet=await client.query(`SELECT balance,reserved_amount,(balance-reserved_amount) AS available_balance FROM wallets WHERE user_id=$1::uuid`,[userId]);
      return res.status(200).json({success:true,withdrawals:rows.rows.map((r:any)=>({...r,id:String(r.id),amount:Number(r.amount)})),wallet:wallet.rows[0]?{balance:Number(wallet.rows[0].balance),reservedAmount:Number(wallet.rows[0].reserved_amount),availableBalance:Number(wallet.rows[0].available_balance),currency:'HTG'}:null});
    }
    const body=req.body&&typeof req.body==='object'?req.body as Record<string,unknown>:{};
    const amount=Number(body.amount); const method=clean(body.method,16).toUpperCase(); const idempotencyKey=clean(body.idempotencyKey,160)||`withdrawal:${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    if(!Number.isFinite(amount)||amount<=0)return res.status(400).json({success:false,error:'Montant de retrait invalide.'});
    if(method!=='MONCASH'&&method!=='NATCASH'&&method!=='BANK')return res.status(400).json({success:false,error:'Méthode de retrait invalide.'});
    await client.query('BEGIN');
    const existing=await client.query(`SELECT id,status,amount FROM withdrawal_requests WHERE idempotency_key=$1 LIMIT 1`,[idempotencyKey]);
    if(existing.rowCount){await client.query('ROLLBACK');return res.status(200).json({success:true,idempotent:true,withdrawal:{id:String(existing.rows[0].id),status:existing.rows[0].status,amount:Number(existing.rows[0].amount)}});}
    const locked=await client.query(`SELECT id,balance,reserved_amount,(balance-reserved_amount) AS available_balance FROM wallets WHERE user_id=$1::uuid FOR UPDATE`,[userId]);
    if(!locked.rowCount){await client.query('ROLLBACK');return res.status(409).json({success:false,error:'Portefeuille introuvable.'});}
    const wallet=locked.rows[0];
    if(Number(wallet.available_balance)<amount){await client.query('ROLLBACK');return res.status(422).json({success:false,error:`Solde disponible insuffisant. Disponible: ${Number(wallet.available_balance).toLocaleString('fr-FR')} HTG.`});}

    let destinationPhone:string|null=null, bankName:string|null=null, bankAccountNumber:string|null=null;
    if(method==='MONCASH'){destinationPhone=phone(user.moncash_phone); if(!destinationPhone){await client.query('ROLLBACK');return res.status(422).json({success:false,error:'Votre numéro MonCash n’est pas configuré dans votre profil.'});}}
    if(method==='NATCASH'){destinationPhone=phone(user.natcash_phone); if(!destinationPhone){await client.query('ROLLBACK');return res.status(422).json({success:false,error:'Votre numéro NatCash n’est pas configuré dans votre profil.'});}}
    if(method==='BANK'){bankName=clean(user.bank_name,120); bankAccountNumber=clean(user.bank_account_number,120); if(!bankName||!bankAccountNumber){await client.query('ROLLBACK');return res.status(422).json({success:false,error:'Votre compte bancaire n’est pas configuré dans votre profil.'});}}

    const beneficiaryName=clean(user.full_name||user.email,120); if(beneficiaryName.length<2){await client.query('ROLLBACK');return res.status(422).json({success:false,error:'Votre nom complet doit être configuré dans votre profil.'});}
    const inserted=await client.query(`INSERT INTO withdrawal_requests(user_id,wallet_id,amount,currency,method,beneficiary_name,destination_phone,bank_name,bank_account_number,status,idempotency_key) VALUES($1::uuid,$2::uuid,$3,'HTG',$4,$5,$6,$7,$8,'PENDING',$9) RETURNING id,amount,currency,method,beneficiary_name,destination_phone,bank_name,bank_account_number,status,requested_at`,[userId,wallet.id,amount,method,beneficiaryName,destinationPhone,bankName,bankAccountNumber,idempotencyKey]);
    const withdrawal=inserted.rows[0];
    await client.query(`UPDATE wallets SET reserved_amount=reserved_amount+$1,updated_at=NOW() WHERE id=$2::uuid`,[amount,wallet.id]);
    await client.query(`INSERT INTO withdrawal_audit_log(withdrawal_id,actor_user_id,action,from_status,to_status,amount,notes,metadata) VALUES($1,$2,'REQUESTED',NULL,'PENDING',$3,'Retrait demandé par le titulaire du compte.',$4::jsonb)`,[withdrawal.id,userId,amount,JSON.stringify({method})]);
    await client.query('COMMIT');
    return res.status(201).json({success:true,withdrawal:{...withdrawal,id:String(withdrawal.id),amount:Number(withdrawal.amount)}});
  } catch(error){try{await client.query('ROLLBACK');}catch{}; console.error('Withdrawal API error:',error instanceof Error?error.message:'unknown'); return res.status(500).json({success:false,error:'Impossible de créer la demande de retrait.'});}
  finally{client.release();}
}
