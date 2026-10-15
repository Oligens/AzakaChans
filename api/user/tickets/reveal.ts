import { Pool } from '@neondatabase/serverless';

type Req = { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> };
type Res = { setHeader(name: string, value: string): void; status(code: number): Res; json(body: unknown): void };
let pool: Pool | null = null;
function getPool(url: string) { return pool ??= new Pool({ connectionString: url, max: 1 }); }
function cookieValue(req: Req, name: string): string | null { const h=req.headers.cookie; const raw=Array.isArray(h)?h[0]:h; const e=raw?.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'=')); if(!e)return null; try{return decodeURIComponent(e.slice(name.length+1));}catch{return null;} }

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control','no-store, max-age=0'); res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({success:false,error:'Méthode non autorisée.'});}
  const url=process.env.DATABASE_URL; if(!url)return res.status(503).json({success:false,error:'Base de données non configurée.'});
  const token=cookieValue(req,'azaka_session'); if(!token)return res.status(401).json({success:false,error:'Session expirée. Veuillez vous reconnecter.'});
  const body=req.body&&typeof req.body==='object'?req.body as Record<string,unknown>:{}; const ticketId=typeof body.ticketId==='string'?body.ticketId.trim():'';
  if(!ticketId)return res.status(400).json({success:false,error:'Identifiant du ticket requis.'});
  const db=getPool(url); const client=await db.connect();
  try{
    await client.query('BEGIN');
    const session=await client.query(`SELECT u.id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=$1 AND s.is_active=TRUE AND s.expires_at>NOW() AND u.is_active=TRUE AND u.is_suspended=FALSE AND u.email_verified=TRUE LIMIT 1`,[token]);
    if(!session.rowCount){await client.query('ROLLBACK');return res.status(401).json({success:false,error:'Session invalide. Veuillez vous reconnecter.'});}
    const userId=String(session.rows[0].id);
    const found=await client.query(`SELECT id,public_id,type,status,price,prize_amount,prize_tier FROM tickets WHERE id=$1::uuid AND owner_id=$2::uuid FOR UPDATE`,[ticketId,userId]);
    if(!found.rowCount){await client.query('ROLLBACK');return res.status(404).json({success:false,error:'Ticket introuvable ou non associé à votre compte.'});}
    const ticket=found.rows[0];
    if(ticket.status!=='SOLD'){await client.query('ROLLBACK');return res.status(409).json({success:false,error:'Ce ticket a déjà été révélé.'});}
    const prize=Number(ticket.prize_amount||0);
    await client.query(`UPDATE tickets SET status='REVEALED',revealed_at=NOW() WHERE id=$1`,[ticket.id]);
    let balance:number|null=null;
    if(prize>0){
      const wallet=await client.query(`SELECT id FROM wallets WHERE user_id=$1::uuid FOR UPDATE`,[userId]);
      if(!wallet.rowCount){await client.query('ROLLBACK');return res.status(409).json({success:false,error:'Portefeuille introuvable.'});}
      await client.query(`UPDATE wallets SET balance=balance+$1,total_winnings=total_winnings+$1,updated_at=NOW() WHERE id=$2`,[prize,wallet.rows[0].id]);
      const key=`win-credit:${ticket.id}`;
      await client.query(`INSERT INTO transactions(type,debit_account,credit_account,amount,currency,reference,description,status,idempotency_key,metadata,completed_at) VALUES('WIN_CREDIT','platform:prizes',$1,$2,'HTG',$3,$4,'COMPLETED',$5,$6::jsonb,NOW()) ON CONFLICT(idempotency_key) DO NOTHING`,[`user-${userId}-wallet`,prize,String(ticket.public_id),`Gain du ticket ${ticket.public_id}`,key,JSON.stringify({ticketId:ticket.id,userId,prize})]);
      const w=await client.query(`SELECT balance,(balance-reserved_amount) AS available_balance FROM wallets WHERE id=$1`,[wallet.rows[0].id]); balance=Number(w.rows[0].balance);
    }
    await client.query('COMMIT');
    return res.status(200).json({success:true,ticket:{id:String(ticket.id),publicId:ticket.public_id,type:ticket.type,status:'REVEALED',price:Number(ticket.price),prizeAmount:prize,prizeTier:ticket.prize_tier===null?null:Number(ticket.prize_tier)},prizeAmount:prize,walletBalance:balance});
  }catch(error){try{await client.query('ROLLBACK');}catch{} console.error('Ticket reveal API error:',error instanceof Error?error.message:'unknown'); return res.status(500).json({success:false,error:'Impossible de révéler le ticket.'});}finally{client.release();}
}
