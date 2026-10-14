import { neon } from '@neondatabase/serverless';

type ApiRequest = {
  method?: string;
};

type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: Record<string, unknown>): void;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(503).json({
      ok: false,
      service: 'neon-postgres',
      error: 'DATABASE_URL is not configured',
    });
  }

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`SELECT current_database() AS database_name, NOW() AS checked_at`;
    return res.status(200).json({
      ok: true,
      service: 'neon-postgres',
      database: rows[0]?.database_name ?? 'connected',
      checkedAt: rows[0]?.checked_at ?? null,
    });
  } catch {
    // Do not expose database URLs, credentials, SQL, or provider internals.
    return res.status(503).json({
      ok: false,
      service: 'neon-postgres',
      error: 'Database connection failed',
    });
  }
}
