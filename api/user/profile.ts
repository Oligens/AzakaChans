import { neon } from '@neondatabase/serverless';

type Req = { method?: string; body?: any; headers: Record<string, string | string[] | undefined> };
type Res = { setHeader(name: string, value: string): void; status(code: number): Res; json(body: unknown): void };

function cookieValue(req: Req, name: string): string | null {
  const header = req.headers.cookie;
  const raw = Array.isArray(header) ? header[0] : header;
  const entry = raw?.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  if (!entry) return null;
  try { return decodeURIComponent(entry.slice(name.length + 1)); } catch { return null; }
}

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

function normalizePhone(value: unknown) {
  const digits = clean(value, 40).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('509') && digits.length === 11) return `+${digits}`;
  if (digits.length === 8) return `+509${digits}`;
  return '';
}

function publicProfile(row: any) {
  return {
    id: String(row.id),
    email: row.email,
    fullName: row.full_name ?? '',
    avatarUrl: row.avatar_url ?? '',
    phone: row.profile_phone ?? '',
    moncashPhone: row.moncash_phone ?? '',
    natcashPhone: row.natcash_phone ?? '',
    bankName: row.bank_name ?? '',
    bankAccountNumber: row.bank_account_number ?? '',
    createdAt: row.created_at,
    updatedAt: row.profile_updated_at ?? row.updated_at ?? null,
  };
}

async function authenticatedUser(sql: ReturnType<typeof neon>, req: Req) {
  const token = cookieValue(req, 'azaka_session');
  if (!token) return null;
  const rows = await sql`
    SELECT u.id, u.email, u.full_name, u.avatar_url, u.profile_phone,
           u.moncash_phone, u.natcash_phone, u.bank_name, u.bank_account_number,
           u.created_at, u.updated_at, u.profile_updated_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token}
      AND s.is_active = TRUE AND s.expires_at > NOW()
      AND u.is_active = TRUE AND u.is_suspended = FALSE
      AND u.email_verified = TRUE
    LIMIT 1
  `;
  return rows[0] || null;
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!['GET', 'PATCH'].includes(req.method || '')) {
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ success: false, error: 'Méthode non autorisée.' });
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return res.status(503).json({ success: false, error: 'Base de données non configurée.' });

  try {
    const sql = neon(databaseUrl);
    const current = await authenticatedUser(sql, req);
    if (!current) return res.status(401).json({ success: false, error: 'Session invalide. Veuillez vous reconnecter.' });

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, profile: publicProfile(current) });
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const fullName = clean(body.fullName, 120);
    const avatarUrl = clean(body.avatarUrl, 1000);
    const phone = normalizePhone(body.phone);
    const moncashPhone = normalizePhone(body.moncashPhone);
    const natcashPhone = normalizePhone(body.natcashPhone);
    const bankName = clean(body.bankName, 120);
    const bankAccountNumber = clean(body.bankAccountNumber, 120);

    if (fullName.length < 2) return res.status(400).json({ success: false, error: 'Veuillez renseigner votre nom complet.' });
    for (const [label, value] of [['Téléphone', phone], ['MonCash', moncashPhone], ['NatCash', natcashPhone]] as const) {
      if (value && !/^\+509\d{8}$/.test(value)) return res.status(400).json({ success: false, error: `${label}: numéro haïtien invalide.` });
    }
    if (avatarUrl && !/^https?:\/\//i.test(avatarUrl)) return res.status(400).json({ success: false, error: 'La photo de profil doit être une URL HTTPS/HTTP valide.' });
    if (bankAccountNumber && bankName.length < 2) return res.status(400).json({ success: false, error: 'Indiquez le nom de la banque avec le numéro de compte.' });

    const rows = await sql`
      UPDATE users
      SET full_name = ${fullName},
          avatar_url = ${avatarUrl || null},
          profile_phone = ${phone || null},
          moncash_phone = ${moncashPhone || null},
          natcash_phone = ${natcashPhone || null},
          bank_name = ${bankName || null},
          bank_account_number = ${bankAccountNumber || null},
          profile_updated_at = NOW(),
          updated_at = NOW()
      WHERE id = ${String(current.id)}::uuid
      RETURNING id, email, full_name, avatar_url, profile_phone, moncash_phone,
                natcash_phone, bank_name, bank_account_number, created_at,
                updated_at, profile_updated_at
    `;
    return res.status(200).json({ success: true, profile: publicProfile(rows[0]) });
  } catch (error) {
    console.error('Profile API error:', error instanceof Error ? error.message : 'unknown error');
    return res.status(500).json({ success: false, error: 'Impossible d’enregistrer le profil. Vérifiez que la migration du profil est installée.' });
  }
}
