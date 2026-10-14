import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

type HeaderValue = string | string[] | undefined;
type WebhookRequest = AsyncIterable<Uint8Array | string> & {
  method?: string;
  headers: Record<string, HeaderValue>;
};
type WebhookResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): WebhookResponse;
  json(body: Record<string, unknown>): void;
};

export const config = { api: { bodyParser: false } };

function getHeader(value: HeaderValue): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

async function readRawBody(req: WebhookRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > 1024 * 1024) throw new Error('PAYLOAD_TOO_LARGE');
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

function isValidSignature(rawBody: Buffer, received: string, secret: string): boolean {
  if (!received.startsWith('sha256=')) return false;
  const suppliedHex = received.slice('sha256='.length);
  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return false;

  const expectedHex = createHmac('sha256', secret).update(rawBody).digest('hex');
  const supplied = Buffer.from(suppliedHex, 'hex');
  const expected = Buffer.from(expectedHex, 'hex');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function stringField(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 255);
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

export default async function handler(req: WebhookRequest, res: WebhookResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const secret = process.env.ZAKAPRO_APP_SECRET;
  const databaseUrl = process.env.DATABASE_URL;
  if (!secret || !databaseUrl) {
    return res.status(503).json({
      ok: false,
      error: 'Webhook server configuration is incomplete',
    });
  }

  let rawBody: Buffer;
  try {
    rawBody = await readRawBody(req);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE';
    return res.status(tooLarge ? 413 : 400).json({
      ok: false,
      error: tooLarge ? 'Payload too large' : 'Could not read request body',
    });
  }

  const signature = getHeader(req.headers['x-zakapro-signature']);
  if (!isValidSignature(rawBody, signature, secret)) {
    return res.status(401).json({ ok: false, error: 'Invalid webhook signature' });
  }

  let event: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(rawBody.toString('utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid event');
    event = parsed as Record<string, unknown>;
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON payload' });
  }

  const eventType = stringField(event.event);
  if (!eventType) {
    return res.status(400).json({ ok: false, error: 'Missing event type' });
  }

  const data = event.data && typeof event.data === 'object'
    ? event.data as Record<string, unknown>
    : {};
  const reference = stringField(event.reference) ?? stringField(data.reference);
  const providerEventId = stringField(event.id) ?? stringField(data.id);
  const eventKey = providerEventId ?? createHash('sha256').update(rawBody).digest('hex');
  const amountValue = event.amount ?? data.amount;
  const amount = typeof amountValue === 'number' || typeof amountValue === 'string'
    ? String(amountValue)
    : null;
  const currency = stringField(event.currency) ?? stringField(data.currency);
  const method = stringField(event.method) ?? stringField(event.payment_method) ??
    stringField(data.method) ?? stringField(data.payment_method);
  const status = stringField(event.status) ?? stringField(data.status);
  const sql = neon(databaseUrl);

  try {
    await sql`
      INSERT INTO zakapro_webhook_events
        (event_key, provider_event_id, event_type, payment_reference, amount, currency, payment_method, payment_status, payload_sha256)
      VALUES
        (${eventKey}, ${providerEventId}, ${eventType}, ${reference}, ${amount}, ${currency}, ${method}, ${status},
         ${createHash('sha256').update(rawBody).digest('hex')})
      ON CONFLICT (event_key) DO NOTHING
    `;
  } catch {
    return res.status(503).json({
      ok: false,
      error: 'Webhook event could not be stored',
    });
  }

  // Deliberately do not credit wallets yet: ZakaPro's exact successful-payment
  // payload and its reference-to-pending-deposit contract must be confirmed first.
  // A signed notification alone is not enough to infer the account or credit amount.
  return res.status(200).json({
    received: true,
    event: eventType,
    recorded: true,
    walletCredited: false,
    message: 'Payment event recorded; wallet credit awaits verified deposit mapping',
  });
}
