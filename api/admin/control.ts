import { Pool } from '@neondatabase/serverless';

type Req={method?:string;body?:unknown;headers:Record<string,string|string[]|undefined>;query?:Record<string,string|string[]|undefined>};
type Res={setHeader(name:string,value:string):void;status(code:number):Res;json(body:unknown):void};
let pool:Pool|null=null;
function getPool(url:string){return pool??=new Pool({connectionString:url,max:1});}
function cookieValue(req:Req,name:string){const h=req.headers.cookie;const raw=Array.isArray(h)?h[0]:h;const e=raw?.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));if(!e)return null;try{return decodeURIComponent(e.slice(name.length+1));}catch{return null;}}
function clean(v:unknown,max=120){return (Array.isArray(v)?String(v[0]??''):String(v??'')).trim().replace(/\s+/g,' ').slice(0,max);}
function json(v:unknown){return JSON.stringify(v).replace(/\\/g,'\\\\').replace(/'/g,"''");}
async function admin(client:any,req:Req){const token=cookieValue(req,'azaka_session');if(!token)return null;const r=await client.query(`SELECT u.id,u.email,u.full_name,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=$1 AND s.is_active=TRUE AND s.expires_at>NOW() AND u.is_active=TRUE AND u.is_suspended=FALSE AND u.email_verified=TRUE LIMIT 1`,[token]);const u=r.rows[0];if(!u)return null;const role=String(u.role||'').toUpperCase();return ['ADMIN','SUPER_ADMIN','ADMINISTRATOR'].includes(role)?u:null;}
async function ensureConfig(client:any){
 await client.query(`CREATE TABLE IF NOT EXISTS azaka_claims(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),user_id UUID NULL REFERENCES users(id),subject VARCHAR(180) NOT NULL,description TEXT NOT NULL,status VARCHAR(24) NOT NULL DEFAULT 'OPEN',priority VARCHAR(16) NOT NULL DEFAULT 'NORMAL',admin_notes TEXT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),resolved_at TIMESTAMPTZ NULL)`);
 await client.query(`CREATE TABLE IF NOT EXISTS azaka_cycles(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),name VARCHAR(120) NOT NULL,start_at TIMESTAMPTZ NOT NULL,end_at TIMESTAMPTZ NOT NULL,status VARCHAR(24) NOT NULL DEFAULT 'SCHEDULED',created_by UUID NULL REFERENCES users(id),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
}
async function moduleData(client:any,module:string){
 if(module==='platform'){
  const [u,t,w,p]=await Promise.all([
   client.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE is_active AND NOT is_suspended)::int active,COUNT(*) FILTER(WHERE is_suspended)::int suspended FROM users`),
   client.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE status IN ('SOLD','REVEALED'))::int sold FROM tickets`),
   client.query(`SELECT COUNT(*)::int wallets,COALESCE(SUM(balance),0)::numeric balance,COALESCE(SUM(reserved_amount),0)::numeric reserved FROM wallets`),
   client.query(`SELECT COUNT(*)::int pending FROM withdrawal_requests WHERE status='PENDING'`)
  ]);return {users:u.rows[0],tickets:t.rows[0],wallets:{...w.rows[0],balance:Number(w.rows[0].balance),reserved:Number(w.rows[0].reserved)},withdrawals:p.rows[0],serverTime:new Date().toISOString(),database:'ONLINE'};
 }
 if(module==='series'){
  const r=await client.query(`SELECT b.id,b.status,b.ticket_price,b.total_tickets,b.created_at,b.published_at,COUNT(t.id)::int ticket_count,COUNT(t.id) FILTER(WHERE t.status IN ('SOLD','REVEALED'))::int sold_count FROM ticket_batches b LEFT JOIN tickets t ON t.batch_id=b.id GROUP BY b.id ORDER BY b.created_at DESC LIMIT 200`);return {batches:r.rows.map((x:any)=>({...x,id:String(x.id),ticket_price:Number(x.ticket_price||0),total_tickets:Number(x.total_tickets||0),ticket_count:Number(x.ticket_count||0),sold_count:Number(x.sold_count||0)}))};
 }
 if(module==='financial'){
  const r=await client.query(`SELECT type,status,currency,COUNT(*)::int count,COALESCE(SUM(amount),0)::numeric amount FROM transactions GROUP BY type,status,currency ORDER BY amount DESC`);return {summary:r.rows.map((x:any)=>({...x,count:Number(x.count),amount:Number(x.amount)}))};
 }
 if(module==='ledger'){
  const r=await client.query(`SELECT id,type,amount,currency,reference,description,status,idempotency_key,created_at,completed_at FROM transactions ORDER BY created_at DESC LIMIT 300`);return {entries:r.rows.map((x:any)=>({...x,id:String(x.id),amount:Number(x.amount)}))};
 }
 if(module==='claims'){
  await ensureConfig(client);const r=await client.query(`SELECT c.*,u.email,u.full_name FROM azaka_claims c LEFT JOIN users u ON u.id=c.user_id ORDER BY c.created_at DESC LIMIT 300`);return {claims:r.rows};
 }
 if(module==='cycles'){
  await ensureConfig(client);const r=await client.query(`SELECT c.*,u.email AS created_by_email FROM azaka_cycles c LEFT JOIN users u ON u.id=c.created_by ORDER BY c.start_at DESC LIMIT 200`);return {cycles:r.rows};
 }
 if(module==='audit'){
  const r=await client.query(`SELECT a.id,a.withdrawal_id,a.action,a.from_status,a.to_status,a.amount,a.notes,a.metadata,a.created_at,u.email,u.full_name FROM withdrawal_audit_log a LEFT JOIN users u ON u.id=a.actor_user_id ORDER BY a.created_at DESC LIMIT 300`);return {events:r.rows};
 }
 if(module==='reports'){
  const [daily,users,withdrawals]=await Promise.all([
   client.query(`SELECT DATE_TRUNC('day',created_at)::date day,COUNT(*)::int transactions,COALESCE(SUM(amount),0)::numeric volume FROM transactions GROUP BY 1 ORDER BY 1 DESC LIMIT 31`),
   client.query(`SELECT DATE_TRUNC('day',created_at)::date day,COUNT(*)::int registrations FROM users GROUP BY 1 ORDER BY 1 DESC LIMIT 31`),
   client.query(`SELECT status,COUNT(*)::int count,COALESCE(SUM(amount),0)::numeric amount FROM withdrawal_requests GROUP BY status ORDER BY status`)
  ]);return {daily:daily.rows.map((x:any)=>({...x,volume:Number(x.volume)})),users:users.rows,withdrawals:withdrawals.rows.map((x:any)=>({...x,count:Number(x.count),amount:Number(x.amount)}))};
 }
 if(module==='tests'){
  const checks:[string,()=>Promise<any>][]=[
   ['Database connection',()=>client.query('SELECT 1 AS ok')],
   ['Users table',()=>client.query('SELECT COUNT(*) FROM users')],
   ['Wallets integrity',()=>client.query(`SELECT COUNT(*) FROM wallets WHERE balance<0 OR reserved_amount<0 OR reserved_amount>balance`)],
   ['Transactions integrity',()=>client.query(`SELECT COUNT(*) FROM transactions WHERE amount<0`)],
   ['Withdrawals integrity',()=>client.query(`SELECT COUNT(*) FROM withdrawal_requests WHERE amount<=0`)],
   ['Ticket inventory',()=>client.query(`SELECT COUNT(*) FROM tickets`)]
  ];const results=[];for(const [name,fn] of checks){const started=Date.now();try{const r=await fn();const bad=Number(r.rows[0]?.count||0);results.push({name,status:bad===0?'PASS':'WARN',detail:bad===0?'OK':`${bad} anomalie(s)`,durationMs:Date.now()-started});}catch(e){results.push({name,status:'FAIL',detail:e instanceof Error?e.message:'Erreur',durationMs:Date.now()-started});}}return {results,ranAt:new Date().toISOString()};
 }
 return null;
}
export default async function handler(req:Req,res:Res){
 res.setHeader('Cache-Control','no-store, max-age=0');res.setHeader('Content-Type','application/json; charset=utf-8');
 if(!['GET','POST','PATCH'].includes(req.method||'')){res.setHeader('Allow','GET, POST, PATCH');return res.status(405).json({success:false,error:'Méthode non autorisée.'});}
 const url=process.env.DATABASE_URL;if(!url)return res.status(503).json({success:false,error:'Base de données non configurée.'});
 const db=getPool(url),client=await db.connect();
 try{
  const actor=await admin(client,req);if(!actor)return res.status(403).json({success:false,error:'Accès administrateur requis.'});
  const module=clean(req.query?.module,32).toLowerCase();
  if(req.method==='GET'){const data=await moduleData(client,module);if(!data)return res.status(404).json({success:false,error:'Module administratif inconnu.'});return res.status(200).json({success:true,module,data,generatedAt:new Date().toISOString()});}
  const body=req.body&&typeof req.body==='object'?req.body as Record<string,unknown>:{};
  if(module==='claims'){
   await ensureConfig(client);const action=clean(body.action,20).toUpperCase();
   if(action==='CREATE'){const subject=clean(body.subject,180),description=clean(body.description,4000),priority=clean(body.priority,16).toUpperCase()||'NORMAL';if(!subject||!description)return res.status(400).json({success:false,error:'Sujet et description obligatoires.'});await client.query(`INSERT INTO azaka_claims(user_id,subject,description,priority) VALUES($1::uuid,$2,$3,$4)`,[clean(body.userId,80)||null,subject,description,priority]);return res.status(201).json({success:true});}
   if(action==='UPDATE'){const id=clean(body.id,80),status=clean(body.status,24).toUpperCase(),notes=clean(body.adminNotes,4000);if(!id)return res.status(400).json({success:false,error:'Réclamation invalide.'});await client.query(`UPDATE azaka_claims SET status=COALESCE(NULLIF($1,''),status),admin_notes=COALESCE(NULLIF($2,''),admin_notes),updated_at=NOW(),resolved_at=CASE WHEN $1 IN ('RESOLVED','CLOSED') THEN NOW() ELSE resolved_at END WHERE id=$3::uuid`,[status,notes,id]);return res.status(200).json({success:true});}
  }
  if(module==='cycles'){
   await ensureConfig(client);const action=clean(body.action,20).toUpperCase();
   if(action==='CREATE'){const name=clean(body.name,120),start=clean(body.startAt,40),end=clean(body.endAt,40);if(!name||!start||!end)return res.status(400).json({success:false,error:'Nom, début et fin obligatoires.'});await client.query(`INSERT INTO azaka_cycles(name,start_at,end_at,status,created_by) VALUES($1,$2::timestamptz,$3::timestamptz,'SCHEDULED',$4::uuid)`,[name,start,end,actor.id]);return res.status(201).json({success:true});}
   if(action==='UPDATE'){const id=clean(body.id,80),status=clean(body.status,24).toUpperCase();if(!id||!['SCHEDULED','OPEN','CLOSED','CANCELLED'].includes(status))return res.status(400).json({success:false,error:'Cycle ou statut invalide.'});await client.query(`UPDATE azaka_cycles SET status=$1,updated_at=NOW() WHERE id=$2::uuid`,[status,id]);return res.status(200).json({success:true});}
  }
  return res.status(400).json({success:false,error:'Action administrative non supportée.'});
 }catch(error){console.error('Admin control API error:',error instanceof Error?error.message:'unknown');return res.status(500).json({success:false,error:'Impossible de charger ou modifier ce module.'});}finally{client.release();}
}
