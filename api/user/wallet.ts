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
      SELECT u.id AS user_id, u.email, u.full_name,
             w.id AS wallet_id, COALESCE(w.balance, 0) AS balance,
             COALESCE(w.available_balance, 0) AS available_balance,
             COALESCE(w.total_deposits, 0) AS total_deposits,
             COALESCE(w.total_withdrawals, 0) AS total_withdrawals,
             COALESCE(w.total_winnings, 0) AS total_winnings,
             COALESCE(w.reserved_amount, 0) AS reserved_amount
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN wallets w ON w.user_id = u.id
      WHERE s.token = ${token} AND s.is_active = TRUE AND s.expires_at > NOW()
        AND u.is_active = TRUE AND u.is_suspended = FALSE AND u.email_verified = TRUE
      LIMIT 1
    `;
    if (!rows[0]) return res.status(401).json({ success: false, error: 'Session invalide. Veuillez vous reconnecter.' });
    const row = rows[0];
    if (!row.wallet_id) {
      const created = await sql`
        INSERT INTO wallets (user_id) VALUES (${String(row.user_id)}::uuid)
        ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
        RETURNING id, balance, available_balance, total_deposits, total_withdrawals, total_winnings, reserved_amount
      `;
      Object.assign(row, {
        wallet_id: created[0].id, balance: created[0].balance,
        available_balance: created[0].available_balance, total_deposits: created[0].total_deposits,
        total_withdrawals: created[0].total_withdrawals, total_winnings: created[0].total_winnings,
        reserved_amount: created[0].reserved_amount,
      });
    }
    const transactions = await sql`
      SELECT id, type, amount, currency, description, status, created_at
      FROM transactions
      WHERE (debit_account = ${'user-' + String(row.user_id)} OR credit_account = ${'user-' + String(row.user_id)}
         OR debit_account = ${'user-' + String(row.user_id) + '-wallet'} OR credit_account = ${'user-' + String(row.user_id) + '-wallet'})
      ORDER BY created_at DESC LIMIT 100
    `;
    return res.status(200).json({
      success: true,
      user: { id: row.user_id, email: row.email, fullName: row.full_name },
      wallet: {
        balance: Number(row.balance), availableBalance: Number(row.available_balance),
        totalDeposits: Number(row.total_deposits), totalWithdrawals: Number(row.total_withdrawals),
        totalWinnings: Number(row.total_winnings), reservedAmount: Number(row.reserved_amount),
        currency: 'HTG',
      },
      transactions: transactions.map((tx: any) => ({
        id: String(tx.id), type: tx.type, amount: Number(tx.amount), currency: tx.currency,
        description: tx.description || tx.type, status: tx.status, createdAt: tx.created_at,
      })),
    });
  } catch (error) {
    console.error('Wallet API error:', error instanceof Error ? error.message : 'unknown error');
    return res.status(500).json({ success: false, error: 'Impossible de charger le portefeuille. Vérifiez que le schéma Neon est installé.' });
  }
}
