import { neon } from '@neondatabase/serverless';

type Req = { method?: string; headers: Record<string, string | string[] | undefined> };
type Res = { setHeader(name: string, value: string): void; status(code: number): Res; json(body: unknown): void };

function cookieValue(req: Req, name: string): string | null {
  const header = req.headers.cookie;
  const raw = Array.isArray(header) ? header[0] : header;
  const entry = raw?.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  if (!entry) return null;
  try { return decodeURIComponent(entry.slice(name.length + 1)); } catch { return null; }
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Méthode non autorisée.' });
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return res.status(503).json({ success: false, error: 'Base de données non configurée.' });
  const token = cookieValue(req, 'azaka_session');
  if (!token) return res.status(401).json({ success: false, error: 'Session expirée. Veuillez vous reconnecter.' });

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT u.id AS user_id
      FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ${token} AND s.is_active = TRUE AND s.expires_at > NOW()
        AND u.is_active = TRUE AND u.is_suspended = FALSE AND u.email_verified = TRUE
      LIMIT 1
    `;
    if (!rows[0]) return res.status(401).json({ success: false, error: 'Session invalide. Veuillez vous reconnecter.' });
    const userId = String(rows[0].user_id);
    const tickets = await sql`
      SELECT t.id, t.public_id, t.type, t.status, t.price, t.prize_amount, t.prize_tier,
             t.purchased_at, t.revealed_at, t.redeemed_at,
             tb.name AS batch_name
      FROM tickets t
      JOIN ticket_batches tb ON tb.id = t.batch_id
      WHERE t.owner_id = ${userId}::uuid
      ORDER BY t.purchased_at DESC NULLS LAST, t.created_at DESC
    `;
    return res.status(200).json({
      success: true,
      tickets: tickets.map((t: any) => ({
        id: String(t.id), publicId: t.public_id, type: t.type, status: t.status,
        price: Number(t.price), prizeAmount: t.prize_amount === null ? null : Number(t.prize_amount),
        prizeTier: t.prize_tier === null ? null : Number(t.prize_tier),
        purchasedAt: t.purchased_at, revealedAt: t.revealed_at, redeemedAt: t.redeemed_at,
        batchName: t.batch_name,
      })),
    });
  } catch (error) {
    console.error('Tickets API error:', error instanceof Error ? error.message : 'unknown error');
    return res.status(500).json({ success: false, error: 'Impossible de charger vos tickets.' });
  }
}
