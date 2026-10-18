import { neon } from '@neondatabase/serverless';

type Req = { method?: string; body?: any; headers: Record<string, string | string[] | undefined> };
type Res = { setHeader(name: string, value: string | string[]): void; status(code: number): Res; json(body: unknown): void };

type Row = Record<string, any>;

function cookieValue(req: Req, name: string): string | null {
  const header = req.headers.cookie;
  const raw = Array.isArray(header) ? header[0] : header;
  const entry = raw?.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  if (!entry) return null;
  try { return decodeURIComponent(entry.slice(name.length + 1)); } catch { return null; }
}

function error(res: Res, status: number, message: string) {
  return res.status(status).json({ success: false, error: message });
}

async function authenticateAdmin(sql: ReturnType<typeof neon>, req: Req) {
  const token = cookieValue(req, 'azaka_session');
  if (!token) return null;
  const rows = (await sql`
    SELECT u.id, u.email, u.full_name, u.role, u.email_verified, u.is_active, u.is_suspended
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token}
      AND s.is_active = TRUE
      AND s.expires_at > NOW()
      AND u.is_active = TRUE
      AND u.is_suspended = FALSE
    LIMIT 1
  `) as Row[];
  const user = rows[0];
  if (!user) return null;
  const role = String(user.role || '').toUpperCase();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return null;
  return user;
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!['GET', 'POST'].includes(req.method || '')) {
    res.setHeader('Allow', 'GET, POST');
    return error(res, 405, 'Méthode non autorisée.');
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return error(res, 503, 'Base de données non configurée.');

  try {
    const sql = neon(databaseUrl);
    const admin = await authenticateAdmin(sql, req);
    if (!admin) return error(res, 403, 'Accès administrateur requis.');

    if (req.method === 'POST') {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const requestedUserId = typeof body.userId === 'string' ? body.userId.trim() : '';
      const where = requestedUserId ? sql`WHERE id = ${requestedUserId}::uuid` : sql`WHERE is_active = TRUE`;
      const users = (await sql`SELECT id FROM users ${where}`) as Row[];
      for (const user of users) {
        await sql`INSERT INTO user_profiles (user_id) VALUES (${String(user.id)}::uuid) ON CONFLICT (user_id) DO NOTHING`;
        await sql`INSERT INTO wallets (user_id) VALUES (${String(user.id)}::uuid) ON CONFLICT (user_id) DO NOTHING`;
      }
      return res.status(200).json({ success: true, repaired: users.length });
    }

    const users = (await sql`
      SELECT
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.role,
        u.email_verified,
        u.is_active,
        u.is_suspended,
        u.created_at,
        u.last_login_at,
        (p.id IS NOT NULL) AS has_profile,
        (w.id IS NOT NULL) AS has_wallet,
        COALESCE(w.balance, 0) AS balance,
        COALESCE(w.available_balance, 0) AS available_balance,
        (SELECT COUNT(*) FROM tickets t WHERE t.owner_id = u.id) AS ticket_count,
        (SELECT COUNT(*) FROM sessions s2 WHERE s2.user_id = u.id AND s2.is_active = TRUE AND s2.expires_at > NOW()) AS active_sessions
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      LEFT JOIN wallets w ON w.user_id = u.id
      ORDER BY u.created_at DESC
      LIMIT 500
    `) as Row[];

    return res.status(200).json({
      success: true,
      users: users.map(user => ({
        id: String(user.id), email: user.email, fullName: user.full_name || '', phone: user.phone || '',
        role: user.role, emailVerified: Boolean(user.email_verified), active: Boolean(user.is_active),
        suspended: Boolean(user.is_suspended), createdAt: user.created_at, lastLoginAt: user.last_login_at,
        hasProfile: Boolean(user.has_profile), hasWallet: Boolean(user.has_wallet), balance: Number(user.balance),
        availableBalance: Number(user.available_balance), ticketCount: Number(user.ticket_count), activeSessions: Number(user.active_sessions),
      })),
    });
  } catch (err) {
    console.error('Admin users API error:', err instanceof Error ? err.message : 'unknown error');
    return error(res, 500, 'Impossible de charger la gestion des utilisateurs.');
  }
}
