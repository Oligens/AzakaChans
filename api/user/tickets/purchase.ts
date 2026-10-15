import { Pool } from '@neondatabase/serverless';

type Req = { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> };
type Res = { setHeader(name: string, value: string): void; status(code: number): Res; json(body: unknown): void };

let pool: Pool | null = null;
function getPool(databaseUrl: string) { return pool ??= new Pool({ connectionString: databaseUrl, max: 1 }); }
function cookieValue(req: Req, name: string): string | null {
  const header = req.headers.cookie; const raw = Array.isArray(header) ? header[0] : header;
  const entry = raw?.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  if (!entry) return null; try { return decodeURIComponent(entry.slice(name.length + 1)); } catch { return null; }
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: false, error: 'Méthode non autorisée.' }); }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return res.status(503).json({ success: false, error: 'Base de données non configurée.' });
  const token = cookieValue(req, 'azaka_session');
  if (!token) return res.status(401).json({ success: false, error: 'Session expirée. Veuillez vous reconnecter.' });
  const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};
  const price = Number(body.price); const quantity = Number(body.quantity ?? 1);
  if (!Number.isInteger(price) || price <= 0) return res.status(400).json({ success: false, error: 'Prix du ticket invalide.' });
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ success: false, error: 'Quantité invalide. Choisissez entre 1 et 20 tickets.' });

  const db = getPool(databaseUrl); const client = await db.connect();
  try {
    await client.query('BEGIN');
    const session = await client.query(`SELECT u.id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=$1 AND s.is_active=TRUE AND s.expires_at>NOW() AND u.is_active=TRUE AND u.is_suspended=FALSE AND u.email_verified=TRUE LIMIT 1`, [token]);
    if (!session.rowCount) { await client.query('ROLLBACK'); return res.status(401).json({ success: false, error: 'Session invalide. Veuillez vous reconnecter.' }); }
    const userId = String(session.rows[0].id);
    const wallet = await client.query(`SELECT id,balance,reserved_amount,(balance-reserved_amount) AS available_balance FROM wallets WHERE user_id=$1 FOR UPDATE`, [userId]);
    if (!wallet.rowCount) { await client.query('ROLLBACK'); return res.status(409).json({ success: false, error: 'Portefeuille introuvable.' }); }
    const total = price * quantity;
    if (Number(wallet.rows[0].available_balance) < total) { await client.query('ROLLBACK'); return res.status(422).json({ success: false, error: `Solde insuffisant. Il faut ${total.toLocaleString('fr-FR')} HTG.` }); }

    const purchased: any[] = [];
    for (let i = 0; i < quantity; i += 1) {
      const available = await client.query(`SELECT t.id,t.public_id,t.type,t.price,t.prize_amount,t.prize_tier FROM tickets t JOIN ticket_batches b ON b.id=t.batch_id WHERE t.status='CREATED' AND t.owner_id IS NULL AND t.price=$1 AND b.status='PUBLISHED' AND (b.sales_start_at IS NULL OR b.sales_start_at<=NOW()) AND (b.sales_end_at IS NULL OR b.sales_end_at>=NOW()) ORDER BY t.created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1`, [price]);
      if (!available.rowCount) { await client.query('ROLLBACK'); return res.status(409).json({ success: false, error: `Stock insuffisant pour les tickets à ${price.toLocaleString('fr-FR')} HTG.` }); }
      const t = available.rows[0];
      await client.query(`UPDATE tickets SET status='SOLD',owner_id=$1,purchased_at=NOW() WHERE id=$2`, [userId, t.id]);
      await client.query(`UPDATE wallets SET balance=balance-$1,updated_at=NOW() WHERE id=$2`, [price, wallet.rows[0].id]);
      const key = `ticket-purchase:${t.id}`;
      await client.query(`INSERT INTO transactions(type,debit_account,credit_account,amount,currency,reference,description,status,idempotency_key,metadata,completed_at) VALUES('TICKET_PURCHASE',$1,'platform:tickets',$2,'HTG',$3,$4,'COMPLETED',$5,$6::jsonb,NOW()) ON CONFLICT(idempotency_key) DO NOTHING`, [`user-${userId}-wallet`, price, String(t.public_id), `Achat du ticket ${t.public_id}`, key, JSON.stringify({ ticketId: t.id, userId, price })]);
      purchased.push({ id: String(t.id), publicId: t.public_id, type: t.type, status: 'SOLD', price: Number(t.price), prizeAmount: Number(t.prize_amount), prizeTier: t.prize_tier === null ? null : Number(t.prize_tier) });
    }
    const finalWallet = await client.query(`SELECT balance,(balance-reserved_amount) AS available_balance FROM wallets WHERE id=$1`, [wallet.rows[0].id]);
    await client.query('COMMIT');
    return res.status(201).json({ success: true, tickets: purchased, wallet: { balance: Number(finalWallet.rows[0].balance), availableBalance: Number(finalWallet.rows[0].available_balance), currency: 'HTG' } });
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Ticket purchase API error:', error instanceof Error ? error.message : 'unknown');
    return res.status(500).json({ success: false, error: 'Impossible de finaliser l’achat du ticket.' });
  } finally { client.release(); }
}
