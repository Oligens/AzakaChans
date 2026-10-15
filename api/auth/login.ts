import { neon } from '@neondatabase/serverless';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
type Req = {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
};
type Res = {
  setHeader(name: string, value: string | string[]): void;
  status(code: number): Res;
  json(body: unknown): void;
};

function headerValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function jsonError(res: Res, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

function publicUser(row: Record<string, unknown>) {
  return {
    id: row.id,
    email: row.email,
    emailVerified: Boolean(row.email_verified),
    role: row.role,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at ?? null,
    fullName: row.full_name ?? null,
  };
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return jsonError(res, 405, 'Méthode non autorisée.');
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Auth login configuration error: DATABASE_URL is missing.');
    return jsonError(res, 503, 'Le serveur de base de données n’est pas configuré.');
  }

  const body = req.body && typeof req.body === 'object'
    ? req.body as Record<string, unknown>
    : {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return jsonError(res, 400, 'Adresse email et mot de passe requis.');
  }

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`
      SELECT id, email, email_verified, role, created_at, last_login_at,
             full_name, password_hash, password_salt, is_active, is_suspended
      FROM users
      WHERE email_normalized = ${email}
      LIMIT 1
    `;
    const user = rows[0] as Record<string, unknown> | undefined;

    if (!user || user.is_active !== true || user.is_suspended === true) {
      return jsonError(res, 401, 'Email ou mot de passe incorrect.');
    }
    if (user.email_verified !== true) {
      return jsonError(res, 403, 'Veuillez vérifier votre adresse email avant de vous connecter.');
    }

    if (typeof user.password_salt !== 'string' || typeof user.password_hash !== 'string') {
      console.error('Auth login data error: stored password credentials are malformed.');
      return jsonError(res, 500, 'Les informations de sécurité du compte sont invalides. Contactez le support.');
    }

    const derived = await scrypt(password, user.password_salt, 64) as Buffer;
    const expected = Buffer.from(user.password_hash, 'hex');
    if (expected.length !== derived.length || !timingSafeEqual(expected, derived)) {
      return jsonError(res, 401, 'Email ou mot de passe incorrect.');
    }

    const token = randomBytes(32).toString('base64url');
    const sessionMs = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + sessionMs).toISOString();
    const userId = String(user.id);

    await sql`
      INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent, is_active)
      VALUES (
        ${userId}::uuid,
        ${token},
        ${expiresAt}::timestamptz,
        NULL,
        ${headerValue(req.headers['user-agent']).slice(0, 500)},
        TRUE
      )
    `;
    await sql`UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = ${userId}::uuid`;

    // Profile/wallet creation is best-effort for legacy accounts. It must not
    // invalidate successful credentials if a compatibility migration is pending.
    try {
      await sql`INSERT INTO user_profiles (user_id) VALUES (${userId}::uuid) ON CONFLICT (user_id) DO NOTHING`;
      await sql`INSERT INTO wallets (user_id) VALUES (${userId}::uuid) ON CONFLICT (user_id) DO NOTHING`;
    } catch (repairError) {
      const err = repairError as { code?: string; message?: string };
      console.error('Auth login profile/wallet repair failed:', {
        code: err?.code ?? null,
        message: err?.message ?? 'unknown error',
      });
    }

    res.setHeader(
      'Set-Cookie',
      `azaka_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor(sessionMs / 1000)}`
    );
    return res.status(200).json({
      success: true,
      user: publicUser({ ...user, last_login_at: new Date().toISOString() }),
    });
  } catch (error) {
    const err = error as { code?: string; message?: string; stack?: string };
    console.error('Auth login API error:', {
      code: err?.code ?? null,
      message: err?.message ?? 'unknown error',
      stack: err?.stack ?? null,
    });
    return jsonError(res, 500, 'Erreur serveur pendant la connexion. Vérifiez la configuration Neon et les migrations.');
  }
}
