// Standalone Vercel endpoint for GET /api/auth/session.
// Keep this route independent from the dynamic [action] module so a module-load
// failure in the shared auth handler cannot break the session health check.
type Req = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};
type Res = {
  setHeader(name: string, value: string | string[]): void;
  status(code: number): Res;
  json(body: unknown): void;
};

const COOKIE = 'azaka_session';

function readSessionCookie(req: Req): string | null {
  const header = req.headers.cookie;
  const raw = Array.isArray(header) ? header[0] : header;
  if (!raw) return null;
  const entry = raw.split(';').map((part) => part.trim()).find((part) => part.startsWith(COOKIE + '='));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(COOKIE.length + 1)) || null;
  } catch {
    return null;
  }
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Méthode non autorisée.' });
  }

  const token = readSessionCookie(req);
  // Important: unauthenticated visits must work even if Neon is down or unset.
  if (!token) return res.status(200).json({ success: true, user: null });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Session API: DATABASE_URL is missing for a request with a session cookie.');
    return res.status(503).json({ success: false, error: 'Le serveur de base de données n’est pas configuré.' });
  }

  try {
    // Lazy-load Neon after the no-cookie path to isolate cold-start/module failures.
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT u.id, u.email, u.email_verified, u.role, u.created_at, u.last_login_at, u.full_name
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ${token}
        AND s.is_active = TRUE
        AND s.expires_at > NOW()
        AND u.is_active = TRUE
        AND u.is_suspended = FALSE
      LIMIT 1
    `;

    if (!rows[0]) {
      res.setHeader('Set-Cookie', COOKIE + '=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
      return res.status(200).json({ success: true, user: null });
    }

    const row = rows[0];
    const userId = String(row.id);

    // Repair optional profile/wallet records without invalidating a valid session.
    try {
      await sql`INSERT INTO user_profiles (user_id) VALUES (${userId}::uuid) ON CONFLICT (user_id) DO NOTHING`;
      await sql`INSERT INTO wallets (user_id) VALUES (${userId}::uuid) ON CONFLICT (user_id) DO NOTHING`;
      await sql`UPDATE sessions SET last_activity_at = NOW() WHERE token = ${token}`;
    } catch (repairError) {
      const error = repairError as { code?: string; message?: string };
      console.error('Session profile/wallet repair failed:', {
        code: error.code ?? null,
        message: error.message ?? 'unknown error',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: row.id,
        email: row.email,
        emailVerified: Boolean(row.email_verified),
        role: row.role,
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at ?? null,
        fullName: row.full_name ?? null,
      },
    });
  } catch (caught) {
    const error = caught as { code?: string; message?: string; stack?: string };
    console.error('Session API failure:', {
      code: error.code ?? null,
      message: error.message ?? 'unknown error',
      stack: error.stack ?? null,
    });
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur pendant la restauration de session.',
    });
  }
}
