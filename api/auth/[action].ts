import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
type Req = { method?: string; body?: any; headers: Record<string, string | string[] | undefined>; url?: string };
type Res = { setHeader(name: string, value: string | string[]): void; status(code: number): Res; json(body: any): void; end(): void };
type Sql = NeonQueryFunction<false, false>;
type Row = Record<string, any>;

const COOKIE = 'azaka_session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function jsonError(res: Res, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}
function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}
function hashCode(code: string) {
  return createHash('sha256').update(code).digest('hex');
}
async function hashPassword(password: string, salt: string) {
  return (await scrypt(password, salt, 64)) as Buffer;
}
function getCookie(req: Req, name: string): string | null {
  const header = req.headers.cookie;
  const raw = Array.isArray(header) ? header[0] : header;
  if (!raw) return null;
  const entry = raw.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  if (!entry) return null;
  try { return decodeURIComponent(entry.slice(name.length + 1)); }
  catch { return null; }
}
function setSessionCookie(res: Res, token: string, maxAge: number) {
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`);
}
function clearSessionCookie(res: Res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}
function publicUser(row: Row) {
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
async function ensureProfileAndWallet(sql: Sql, userId: string) {
  await sql`INSERT INTO user_profiles (user_id) VALUES (${userId}::uuid) ON CONFLICT (user_id) DO NOTHING`;
  await sql`INSERT INTO wallets (user_id) VALUES (${userId}::uuid) ON CONFLICT (user_id) DO NOTHING`;
}
async function getSessionUser(sql: Sql, token: string) {
  const rows = (await sql`
    SELECT u.id, u.email, u.email_verified, u.role, u.created_at, u.last_login_at, u.full_name
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.is_active = TRUE AND s.expires_at > NOW()
      AND u.is_active = TRUE AND u.is_suspended = FALSE
    LIMIT 1
  `) as Row[];
  if (!rows[0]) return null;
  const userId = String(rows[0].id);

  // Heal older accounts created before profile/wallet initialization was reliable.
  // These are idempotent operations; failures are logged but must not turn a valid
  // session into a 500 and force the user back to the login page.
  try {
    await ensureProfileAndWallet(sql, userId);
    await sql`UPDATE sessions SET last_activity_at = NOW() WHERE token = ${token}`;
  } catch (error) {
    const err = error as { message?: string; code?: string };
    console.error('Session profile/wallet repair failed:', {
      code: err?.code ?? null,
      message: err?.message ?? 'unknown error',
    });
  }
  return publicUser(rows[0]);
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const action = (req.url || '').split('?')[0].split('/').filter(Boolean).pop() || '';
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const email = normalizeEmail(body.email);

  // A visitor without a session is simply logged out; do not make the initial
  // session check depend on Neon being configured or reachable.
  if (action === 'session' && req.method === 'GET' && !getCookie(req, COOKIE)) {
    return res.status(200).json({ success: true, user: null });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return jsonError(res, 503, 'Le serveur de base de données n’est pas configuré.');

  try {
    const sql: Sql = neon(databaseUrl);
    if (action === 'session' || action === '[action]') {
      if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return jsonError(res, 405, 'Méthode non autorisée.'); }
      const token = getCookie(req, COOKIE);
      if (!token) return res.status(200).json({ success: true, user: null });
      const user = await getSessionUser(sql, token);
      if (!user) { clearSessionCookie(res); return res.status(200).json({ success: true, user: null }); }
      return res.status(200).json({ success: true, user });
    }

    if (action === 'logout') {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return jsonError(res, 405, 'Méthode non autorisée.'); }
      const token = getCookie(req, COOKIE);
      if (token) await sql`UPDATE sessions SET is_active = FALSE WHERE token = ${token}`;
      clearSessionCookie(res);
      return res.status(200).json({ success: true });
    }

    if (action === 'register') {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return jsonError(res, 405, 'Méthode non autorisée.'); }
      const password = typeof body.password === 'string' ? body.password : '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError(res, 400, 'Adresse email invalide.');
      if (password.length < 8 || password.length > 256) return jsonError(res, 400, 'Le mot de passe doit contenir entre 8 et 256 caractères.');
      const existing = (await sql`SELECT id, email_verified FROM users WHERE email_normalized = ${email} LIMIT 1`) as Row[];
      if (existing.length) return jsonError(res, 409, existing[0].email_verified ? 'Cette adresse email est déjà associée à un compte.' : 'Un compte est déjà en attente de vérification. Utilisez « Renvoyer le code ».');
      const salt = randomBytes(16).toString('hex');
      const passwordHash = (await hashPassword(password, salt)).toString('hex');
      const code = randomBytes(4).readUInt32BE(0) % 900000 + 100000;
      const verificationCode = String(code);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const inserted = (await sql`
        INSERT INTO users (email, email_normalized, password_hash, password_salt, role, email_verified)
        VALUES (${email}, ${email}, ${passwordHash}, ${salt}, 'USER', FALSE)
        RETURNING id, email
      `) as Row[];
      const userId = String(inserted[0].id);
      await ensureProfileAndWallet(sql, userId);
      await sql`UPDATE email_verifications SET status = 'EXPIRED', invalidated_at = NOW() WHERE user_id = ${userId}::uuid AND status = 'PENDING'`;
      await sql`
        INSERT INTO email_verifications (user_id, verification_code, code_hash, status, expires_at)
        VALUES (${userId}::uuid, ${verificationCode}, ${hashCode(verificationCode)}, 'PENDING', ${expiresAt}::timestamptz)
      `;
      const host = Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host;
      const protocol = (Array.isArray(req.headers['x-forwarded-proto']) ? req.headers['x-forwarded-proto'][0] : req.headers['x-forwarded-proto']) || 'https';
      const mailResponse = await fetch(`${protocol}://${host}/api/auth/send-verification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      }).catch(() => null);
      if (!mailResponse?.ok) {
        await sql`DELETE FROM users WHERE id = ${userId}::uuid AND email_verified = FALSE`;
        return jsonError(res, 502, 'Impossible d’envoyer le code de vérification. Vérifiez la configuration SMTP du serveur.');
      }
      return res.status(201).json({ success: true, userId, email });
    }

    if (action === 'verify') {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return jsonError(res, 405, 'Méthode non autorisée.'); }
      const code = typeof body.code === 'string' ? body.code.trim() : '';
      if (!email || !/^\d{6}$/.test(code)) return jsonError(res, 400, 'Email et code à 6 chiffres requis.');
      const rows = (await sql`
        SELECT ev.id AS verification_id, ev.user_id, ev.attempts, ev.max_attempts, ev.expires_at, ev.code_hash, ev.verification_code
        FROM email_verifications ev JOIN users u ON u.id = ev.user_id
        WHERE u.email_normalized = ${email} AND ev.status = 'PENDING'
        ORDER BY ev.created_at DESC LIMIT 1
      `) as Row[];
      const verification = rows[0];
      if (!verification) return jsonError(res, 404, 'Aucune vérification active pour cette adresse. Réinscrivez-vous ou demandez un nouveau code.');
      if (new Date(String(verification.expires_at)).getTime() < Date.now()) {
        await sql`UPDATE email_verifications SET status = 'EXPIRED' WHERE id = ${verification.verification_id}::uuid`;
        return jsonError(res, 400, 'Code expiré. Demandez un nouveau code.');
      }
      if (Number(verification.attempts) >= Number(verification.max_attempts)) return jsonError(res, 429, 'Trop de tentatives. Demandez un nouveau code.');
      if (hashCode(code) !== String(verification.code_hash)) {
        await sql`UPDATE email_verifications SET attempts = attempts + 1 WHERE id = ${verification.verification_id}::uuid`;
        return jsonError(res, 400, 'Code incorrect.');
      }
      await sql`UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = ${verification.user_id}::uuid`;
      await sql`UPDATE email_verifications SET status = 'VERIFIED', verified_at = NOW() WHERE id = ${verification.verification_id}::uuid`;
      await ensureProfileAndWallet(sql, String(verification.user_id));
      return res.status(200).json({ success: true });
    }

    if (action === 'resend') {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return jsonError(res, 405, 'Méthode non autorisée.'); }
      const users = (await sql`SELECT id, email_verified FROM users WHERE email_normalized = ${email} LIMIT 1`) as Row[];
      if (!users[0]) return jsonError(res, 404, 'Utilisateur non trouvé. Inscrivez-vous à nouveau.');
      if (users[0].email_verified) return jsonError(res, 409, 'Cette adresse email est déjà vérifiée.');
      const userId = String(users[0].id);
      const code = String(randomBytes(4).readUInt32BE(0) % 900000 + 100000);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await sql`UPDATE email_verifications SET status = 'EXPIRED', invalidated_at = NOW() WHERE user_id = ${userId}::uuid AND status = 'PENDING'`;
      await sql`INSERT INTO email_verifications (user_id, verification_code, code_hash, status, expires_at) VALUES (${userId}::uuid, ${code}, ${hashCode(code)}, 'PENDING', ${expiresAt}::timestamptz)`;
      const host = Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host;
      const protocol = (Array.isArray(req.headers['x-forwarded-proto']) ? req.headers['x-forwarded-proto'][0] : req.headers['x-forwarded-proto']) || 'https';
      const mailResponse = await fetch(`${protocol}://${host}/api/auth/send-verification-email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) }).catch(() => null);
      if (!mailResponse?.ok) return jsonError(res, 502, 'Impossible d’envoyer le nouveau code. Vérifiez la configuration SMTP.');
      return res.status(200).json({ success: true });
    }

    if (action === 'login') {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return jsonError(res, 405, 'Méthode non autorisée.'); }
      const password = typeof body.password === 'string' ? body.password : '';
      if (!email || !password) return jsonError(res, 400, 'Adresse email et mot de passe requis.');
      const rows = (await sql`SELECT id, email, email_verified, role, created_at, last_login_at, full_name, password_hash, password_salt, is_active, is_suspended FROM users WHERE email_normalized = ${email} LIMIT 1`) as Row[];
      const user = rows[0];
      if (!user || !user.is_active || user.is_suspended) return jsonError(res, 401, 'Email ou mot de passe incorrect.');
      if (!user.email_verified) return jsonError(res, 403, 'Veuillez vérifier votre adresse email avant de vous connecter.');
      const derived = await hashPassword(password, String(user.password_salt));
      const expected = Buffer.from(String(user.password_hash), 'hex');
      if (expected.length !== derived.length || !timingSafeEqual(expected, derived)) return jsonError(res, 401, 'Email ou mot de passe incorrect.');
      const token = randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + SESSION_MS).toISOString();
      await sql`INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent, is_active) VALUES (${String(user.id)}::uuid, ${token}, ${expiresAt}::timestamptz, NULL, ${String(req.headers['user-agent'] || '').slice(0, 500)}, TRUE)`;
      await sql`UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = ${String(user.id)}::uuid`;
      await ensureProfileAndWallet(sql, String(user.id));
      setSessionCookie(res, token, SESSION_MS / 1000);
      return res.status(200).json({ success: true, user: publicUser({ ...user, last_login_at: new Date().toISOString() }) });
    }

    return jsonError(res, 404, 'Route d’authentification inconnue.');
  } catch (error) {
    // Log diagnostic details for Vercel without returning internals to the browser.
    const err = error as { message?: string; code?: string; stack?: string };
    console.error('Auth API error:', {
      action,
      code: err?.code ?? null,
      message: err?.message ?? 'unknown error',
      stack: err?.stack ?? null,
    });
    return jsonError(res, 500, 'Erreur serveur pendant l’authentification. Vérifiez la configuration Neon et les migrations.');
  }
}
