import { Pool } from '@neondatabase/serverless';

type Req={method?:string;body?:unknown;headers:Record<string,string|string[]|undefined>;query?:Record<string,string|string[]|undefined>};
type Res={setHeader(name:string,value:string):void;status(code:number):Res;json(body:unknown):void};
let pool:Pool|null=null; function getPool(url:string){return pool??=new Pool({connectionString:url,max:1});}
function cookieValue(req:Req,name:string){const h=req.headers.cookie;const raw=Array.isArray(h)?h[0]:h;const e=raw?.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));if(!e)return null;try{return decodeURIComponent(e.slice(name.length+1));}catch{return null;}}
function clean(v:unknown,max:number){return (Array.isArray(v)?String(v[0]??''):String(v??'')).trim().replace(/\s+/g,' ').slice(0,max);}
async function admin(client:any,req:Req){const token=cookieValue(req,'azaka_session');if(!token)return null;const r=await client.query(`SELECT u.id,u.email,u.full_name,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=$1 AND s.is_active=TRUE AND s.expires_at>NOW() AND u.is_active=TRUE AND u.is_suspended=FALSE AND u.email_verified=TRUE LIMIT 1`,[token]);const u=r.rows[0];if(!u)return null;const role=String(u.role||'').toUpperCase();return ['ADMIN','SUPER_ADMIN','ADMINISTRATOR'].includes(role)?u:null;}

export default async function handler(req:Req,res:Res){
 res.setHeader('Cache-Control','no-store, max-age=0');res.setHeader('Content-Type','application/json; charset=utf-8');
 if(req.method!=='GET'&&req.method!=='PATCH'){res.setHeader('Allow','GET, PATCH');return res.status(405).json({success:false,error:'Méthode non autorisée.'});}
 const url=process.env.DATABASE_URL;if(!url)return res.status(503).json({success:false,error:'Base de données non configurée.'});
 const db=getPool(url),client=await db.connect();
 try{
  const actor=await admin(client,req);if(!actor)return res.status(403).json({success:false,error:'Accès administrateur requis.'});
  if(req.method==='GET'){
   const action=clean(req.query?.action,24).toLowerCase();
   if(action==='overview'){
    const metrics=await client.query(`SELECT COALESCE(SUM(amount) FILTER (WHERE type='TICKET_PURCHASE' AND status='COMPLETED'),0) AS ticket_sales,COALESCE(SUM(amount) FILTER (WHERE type='WIN_CREDIT' AND status='COMPLETED'),0) AS prizes_paid,COUNT(*) FILTER (WHERE type='TICKET_PURCHASE' AND status='COMPLETED') AS purchase_transactions FROM transactions`);
    const inventory=await client.query(`SELECT COUNT(*) FILTER (WHERE t.status IN ('SOLD','REVEALED')) AS sold_tickets,COUNT(*) AS published_tickets FROM tickets t JOIN ticket_batches b ON b.id=t.batch_id WHERE b.status='PUBLISHED'`);
    const withdrawals=await client.query(`SELECT COUNT(*) FILTER (WHERE status='PENDING') AS pending_count,COALESCE(SUM(amount) FILTER (WHERE status='PAID'),0) AS withdrawals_paid FROM withdrawal_requests`);
    const users=await client.query(`SELECT COUNT(*) FILTER (WHERE is_active=TRUE AND is_suspended=FALSE) AS active_users FROM users`);
    const sales=Number(metrics.rows[0].ticket_sales||0);const prizes=Number(metrics.rows[0].prizes_paid||0);const published=Number(inventory.rows[0].published_tickets||0);const sold=Number(inventory.rows[0].sold_tickets||0);
    return res.status(200).json({success:true,metrics:{netRevenue:sales-prizes,ticketSales:sales,prizesPaid:prizes,coverage:published>0?Math.round((sold/published)*100):0,soldTickets:sold,publishedTickets:published,purchaseTransactions:Number(metrics.rows[0].purchase_transactions||0),pendingWithdrawals:Number(withdrawals.rows[0].pending_count||0),withdrawalsPaid:Number(withdrawals.rows[0].withdrawals_paid||0),activeUsers:Number(users.rows[0].active_users||0),currency:'HTG',generatedAt:new Date().toISOString()}});
   }
   const status=clean(req.query?.status,16).toUpperCase();const params:any[]=[];let where='';if(['PENDING','VALIDATED','REJECTED','PAID'].includes(status)){params.push(status);where='WHERE r.status=$1';}
   const rows=await client.query(`SELECT r.id,r.user_id,r.wallet_id,r.amount,r.currency,r.method,r.beneficiary_name,r.destination_phone,r.bank_name,r.bank_account_number,r.status,r.requested_at,r.validated_at,r.rejected_at,r.paid_at,r.processed_by,r.rejection_reason,r.admin_notes,r.payment_reference,r.updated_at,u.email,u.full_name FROM withdrawal_requests r JOIN users u ON u.id=r.user_id ${where} ORDER BY r.requested_at DESC LIMIT 200`,params);
   return res.status(200).json({success:true,withdrawals:rows.rows.map((r:any)=>({...r,id:String(r.id),userId:String(r.user_id),walletId:String(r.wallet_id),amount:Number(r.amount),processedBy:r.processed_by?String(r.processed_by):null}))});
  }
  const body=req.body&&typeof req.body==='object'?req.body as Record<string,unknown>:{};const id=clean(body.id,80);const action=clean(body.action,24).toUpperCase();if(!id||!['VALIDATE','REJECT','MARK_PAID'].includes(action))return res.status(400).json({success:false,error:'Action de retrait invalide.'});
  await client.query('BEGIN');
  const lock=await client.query(`SELECT r.*,u.email,u.full_name FROM withdrawal_requests r JOIN users u ON u.id=r.user_id WHERE r.id=$1::uuid FOR UPDATE`,[id]);if(!lock.rowCount){await client.query('ROLLBACK');return res.status(404).json({success:false,error:'Demande de retrait introuvable.'});}
  const r=lock.rows[0];const from=String(r.status);const notes=clean(body.notes,2000);const paymentReference=clean(body.paymentReference,160);
  if(action==='VALIDATE'){
   if(from!=='PENDING'){await client.query('ROLLBACK');return res.status(409).json({success:false,error:'Seules les demandes PENDING peuvent être validées.'});}
   await client.query(`UPDATE withdrawal_requests SET status='VALIDATED',validated_at=NOW(),processed_by=$1::uuid,admin_notes=COALESCE(NULLIF($2,''),admin_notes),updated_at=NOW() WHERE id=$3::uuid`,[actor.id,notes,id]);
   await client.query(`INSERT INTO withdrawal_audit_log(withdrawal_id,actor_user_id,action,from_status,to_status,amount,notes) VALUES($1,$2,'VALIDATED',$3,'VALIDATED',$4,$5)`,[id,actor.id,from,r.amount,notes||'Demande validée par l’administrateur.']);
  } else if(action==='REJECT'){
   if(from!=='PENDING'&&from!=='VALIDATED'){await client.query('ROLLBACK');return res.status(409).json({success:false,error:'Cette demande ne peut plus être refusée.'});}
   await client.query(`UPDATE withdrawal_requests SET status='REJECTED',rejected_at=NOW(),processed_by=$1::uuid,rejection_reason=$2,admin_notes=COALESCE(NULLIF($3,''),admin_notes),updated_at=NOW() WHERE id=$4::uuid`,[actor.id,notes||'Demande refusée par l’administrateur.',notes,id]);
   await client.query(`UPDATE wallets SET reserved_amount=GREATEST(0,reserved_amount-$1),updated_at=NOW() WHERE id=$2::uuid`,[r.amount,r.wallet_id]);
   await client.query(`INSERT INTO withdrawal_audit_log(withdrawal_id,actor_user_id,action,from_status,to_status,amount,notes) VALUES($1,$2,'REJECTED',$3,'REJECTED',$4,$5)`,[id,actor.id,from,r.amount,notes||'Demande refusée par l’administrateur.']);
  } else {
   if(from!=='VALIDATED'){await client.query('ROLLBACK');return res.status(409).json({success:false,error:'Seules les demandes VALIDATED peuvent être marquées comme payées.'});}
   if(!paymentReference){await client.query('ROLLBACK');return res.status(400).json({success:false,error:'La référence de paiement est obligatoire.'});}
   const wallet=await client.query(`SELECT id,balance,reserved_amount FROM wallets WHERE id=$1::uuid FOR UPDATE`,[r.wallet_id]);if(!wallet.rowCount){await client.query('ROLLBACK');return res.status(409).json({success:false,error:'Portefeuille introuvable.'});}
   if(Number(wallet.rows[0].balance)<Number(r.amount)){await client.query('ROLLBACK');return res.status(409).json({success:false,error:'Solde insuffisant pour finaliser ce retrait.'});}
   await client.query(`UPDATE wallets SET balance=balance-$1,reserved_amount=GREATEST(0,reserved_amount-$1),updated_at=NOW() WHERE id=$2::uuid`,[r.amount,r.wallet_id]);
   const ledgerKey=`withdrawal-paid:${id}`;
   await client.query(`INSERT INTO transactions(type,debit_account,credit_account,amount,currency,reference,description,status,idempotency_key,metadata,completed_at) VALUES('WITHDRAWAL_REQUEST',$1,$2,$3,'HTG',$4,$5,'COMPLETED',$6,$7::jsonb,NOW()) ON CONFLICT(idempotency_key) DO NOTHING`,[`user-${r.user_id}-wallet`,'platform:withdrawals',r.amount,paymentReference,`Retrait payé ${id}`,ledgerKey,JSON.stringify({withdrawalId:id,userId:String(r.user_id),method:r.method,paymentReference})]);
   await client.query(`UPDATE withdrawal_requests SET status='PAID',paid_at=NOW(),processed_by=$1::uuid,payment_reference=$2,admin_notes=COALESCE(NULLIF($3,''),admin_notes),updated_at=NOW() WHERE id=$4::uuid`,[actor.id,paymentReference,notes,id]);
   await client.query(`INSERT INTO withdrawal_audit_log(withdrawal_id,actor_user_id,action,from_status,to_status,amount,notes,metadata) VALUES($1,$2,'MARK_PAID',$3,'PAID',$4,$5,$6::jsonb)`,[id,actor.id,from,r.amount,notes||'Retrait marqué comme payé.',JSON.stringify({paymentReference})]);
  }
  await client.query('COMMIT');return res.status(200).json({success:true,message:'Demande de retrait mise à jour.',status:action==='VALIDATE'?'VALIDATED':action==='REJECT'?'REJECTED':'PAID'});
 }catch(error){try{await client.query('ROLLBACK');}catch{};console.error('Admin withdrawals API error:',error instanceof Error?error.message:'unknown');return res.status(500).json({success:false,error:'Impossible de traiter la demande.'});}finally{client.release();}
}
