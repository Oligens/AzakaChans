import { Pool } from '@neondatabase/serverless';

type Req = { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> };
type Res = { setHeader(name: string, value: string): void; status(code: number): Res; json(body: unknown): void };
let pool: Pool | null = null;
function getPool(url: string) { return pool ??= new Pool({ connectionString: url, max: 1 }); }
function cookieValue(req: Req, name: string) {
  const h = req.headers.cookie; const raw = Array.isArray(h) ? h[0] : h;
  const entry = raw?.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  if (!entry) return null;
  try { return decodeURIComponent(entry.slice(name.length + 1)); } catch { return null; }
}
function cleanNumber(value: unknown) {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}
async function getAdmin(client: any, req: Req) {
  const token = cookieValue(req, 'azaka_session'); if (!token) return null;
  const result = await client.query(`SELECT u.id,u.email,u.full_name,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=$1 AND s.is_active=TRUE AND s.expires_at>NOW() AND u.is_active=TRUE AND u.is_suspended=FALSE AND u.email_verified=TRUE LIMIT 1`, [token]);
  const user = result.rows[0]; if (!user) return null;
  return ['ADMIN','SUPER_ADMIN','ADMINISTRATOR'].includes(String(user.role || '').toUpperCase()) ? user : null;
}
async function ensureSchema(client: any) {
  await client.query(`CREATE TABLE IF NOT EXISTS jackpot_config (id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id=1), amount NUMERIC(18,2) NOT NULL DEFAULT 100000, currency VARCHAR(3) NOT NULL DEFAULT 'HTG', version BIGINT NOT NULL DEFAULT 1, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_by UUID NULL REFERENCES users(id))`);
  await client.query(`CREATE TABLE IF NOT EXISTS jackpot_config_audit (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), jackpot_id SMALLINT NOT NULL DEFAULT 1, actor_user_id UUID NULL REFERENCES users(id), old_amount NUMERIC(18,2), new_amount NUMERIC(18,2) NOT NULL, reserve_available NUMERIC(18,2) NOT NULL DEFAULT 0, coverage_ok BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  await client.query(`ALTER TABLE jackpot_config_audit ADD COLUMN IF NOT EXISTS reserve_available NUMERIC(18,2) NOT NULL DEFAULT 0`);
  await client.query(`ALTER TABLE jackpot_config_audit ADD COLUMN IF NOT EXISTS coverage_ok BOOLEAN NOT NULL DEFAULT FALSE`);
  await client.query(`INSERT INTO jackpot_config(id,amount,currency) VALUES(1,100000,'HTG') ON CONFLICT(id) DO NOTHING`);
}
async function financialReserve(client: any) {
  const r = await client.query(`SELECT
    COALESCE(SUM(amount) FILTER (WHERE type='TICKET_PURCHASE' AND status='COMPLETED'),0) AS ticket_sales,
    COALESCE(SUM(amount) FILTER (WHERE type='WIN_CREDIT' AND status='COMPLETED'),0) AS prizes_paid,
    COALESCE(SUM(amount) FILTER (WHERE type='WITHDRAWAL_REQUEST' AND status='COMPLETED'),0) AS withdrawals_paid
    FROM transactions`);
  const row = r.rows[0];
  const ticketSales = Number(row.ticket_sales || 0);
  const prizesPaid = Number(row.prizes_paid || 0);
  const withdrawalsPaid = Number(row.withdrawals_paid || 0);
  return { ticketSales, prizesPaid, withdrawalsPaid, availableReserve: Math.max(0, ticketSales - prizesPaid - withdrawalsPaid) };
}
export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate'); res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const url = process.env.DATABASE_URL; if (!url) return res.status(503).json({ success:false, error:'Base de données non configurée.' });
  if (req.method !== 'GET' && req.method !== 'PATCH') return res.status(405).json({ success:false, error:'Méthode non autorisée.' });
  const db = getPool(url); const client = await db.connect();
  try {
    await ensureSchema(client);
    const reserve = await financialReserve(client);
    if (req.method === 'GET') {
      const result = await client.query(`SELECT amount,currency,version,updated_at FROM jackpot_config WHERE id=1`);
      const row = result.rows[0]; const amount = Number(row.amount); const coverage = reserve.availableReserve >= amount;
      return res.status(200).json({ success:true, jackpot:{ amount, currency:row.currency, version:Number(row.version), updatedAt:row.updated_at, coverageOk:coverage, reserveAvailable:reserve.availableReserve, reserveRequired:amount, coverageRatio:amount>0?Math.round((reserve.availableReserve/amount)*10000)/100:100 } });
    }
    const admin = await getAdmin(client, req); if (!admin) return res.status(403).json({ success:false, error:'Accès administrateur requis.' });
    const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};
    const amount = cleanNumber(body.amount);
    if (!Number.isFinite(amount) || amount < 1 || amount > 999999999999) return res.status(400).json({ success:false, error:'Montant du jackpot invalide.' });
    if (amount > reserve.availableReserve) return res.status(409).json({ success:false, error:`Jackpot non couvert. Réserve disponible: ${reserve.availableReserve.toLocaleString('fr-FR')} HTG; montant demandé: ${amount.toLocaleString('fr-FR')} HTG.`, coverageOk:false, reserveAvailable:reserve.availableReserve, reserveRequired:amount });
    await client.query('BEGIN');
    const current = await client.query(`SELECT amount FROM jackpot_config WHERE id=1 FOR UPDATE`);
    const oldAmount = Number(current.rows[0]?.amount ?? 100000);
    await client.query(`UPDATE jackpot_config SET amount=$1,currency='HTG',version=version+1,updated_at=NOW(),updated_by=$2::uuid WHERE id=1`, [amount, admin.id]);
    await client.query(`INSERT INTO jackpot_config_audit(jackpot_id,actor_user_id,old_amount,new_amount,reserve_available,coverage_ok) VALUES(1,$1::uuid,$2,$3,$4,TRUE)`, [admin.id, oldAmount, amount, reserve.availableReserve]);
    await client.query('COMMIT');
    return res.status(200).json({ success:true, jackpot:{ amount, currency:'HTG', coverageOk:true, reserveAvailable:reserve.availableReserve }, previousAmount:oldAmount, message:'Jackpot couvert financièrement et mis à jour.' });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Jackpot API error:', error instanceof Error ? error.message : error);
    return res.status(500).json({ success:false, error:'Impossible de gérer le jackpot.' });
  } finally { client.release(); }
}
