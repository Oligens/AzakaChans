import nodemailer from 'nodemailer';

type ApiRequest = { method?: string; body?: unknown };
type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: Record<string, unknown>): void;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[char] ?? char);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const { email, code } = body as { email?: unknown; code?: unknown };

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Adresse email invalide' });
    }

    if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Code de vérification invalide' });
    }

    const smtpHost = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT?.trim() || '465');
    if (![465, 587].includes(smtpPort)) {
      return res.status(500).json({ error: 'Configuration SMTP invalide' });
    }

    const smtpUser = requiredEnv('SMTP_USER');
    const smtpPass = requiredEnv('SMTP_PASS');
    const smtpFrom = process.env.SMTP_FROM?.trim() || smtpUser;
    const smtpSecure = process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE.trim().toLowerCase() === 'true'
      : smtpPort === 465;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000
    });

    const safeEmail = escapeHtml(email);

    await transporter.sendMail({
      from: `AZAKA CHANS <${smtpFrom}>`,
      to: email,
      subject: 'Votre code de vérification — AZAKA CHANS',
      text: `Votre code de vérification AZAKA CHANS est : ${code}. Il est valable pendant 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
      html: `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#07162E;color:#F5F0E6;padding:32px"><div style="max-width:600px;margin:auto"><h1 style="color:#D4AF37;text-align:center">AZAKA CHANS</h1><h2>Vérification de votre adresse email</h2><p>Bonjour,</p><p>Votre code de vérification est :</p><div style="background:rgba(212,175,55,.1);border:2px solid #D4AF37;border-radius:12px;padding:20px;text-align:center;margin:30px 0"><span style="font-size:32px;font-weight:bold;color:#D4AF37;letter-spacing:8px">${code}</span></div><p>Ce code est valable pendant <strong>10 minutes</strong>.</p><p style="color:#AAB7C9;font-size:13px">Demande destinée à : ${safeEmail}</p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p><hr style="border:1px solid rgba(212,175,55,.2);margin:30px 0"><p style="text-align:center;color:#AAB7C9;font-size:14px"><strong>AZAKA CHANS</strong><br>Rasin nou. Chans nou.</p></div></body></html>`
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Verification email delivery failed:', error instanceof Error ? error.message : 'unknown error');
    return res.status(500).json({ error: 'Impossible d’envoyer l’email de vérification' });
  }
}
