// src/routes/api/sendotp/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import {
	SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY,
	SMTP_HOST,
	SMTP_PORT,
	SMTP_USER,
	SMTP_PASS,
	SENDER_EMAIL,
	OTP_HMAC_SECRET
} from '$env/static/private';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server env.');
}
if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SENDER_EMAIL) {
	throw new Error('Missing SMTP config in server env.');
}
if (!OTP_HMAC_SECRET) {
	throw new Error('Missing OTP_HMAC_SECRET in server env.');
}

/** Supabase server client (service role) — server-only */
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/** Create nodemailer transport (server-only) */
const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports (e.g. 587)
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASS
	}
});

/** Utility: generate numeric 6-digit OTP as string */
function generateOtp(): string {
	// cryptographically secure
	const n = crypto.randomInt(0, 1_000_000);
	return n.toString().padStart(6, '0');
}

/** Utility: HMAC-SHA256 of otp + email (prevents reuse across emails), returns hex */
function hashOtp(email: string, otp: string): string {
	return crypto.createHmac('sha256', OTP_HMAC_SECRET).update(`${email}|${otp}`).digest('hex');
}

/** Build a nice HTML email for OTP (customizable) */
function buildOtpEmailHtml({ otp, email }: { otp: string; email: string }) {
	const expiresInMinutes = 5;
	return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Your verification code</title>
  </head>
  <body style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111; margin:0; padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px;">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #eaeaea; border-radius:8px; overflow:hidden;">
            <tr>
              <td style="background:#0f172a; color:white; padding:20px 24px; text-align:left;">
                <h1 style="margin:0; font-size:20px;">Saathi — Verify your email</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px 0;">Hi,</p>
                <p style="margin:0 0 24px 0;">We received a request to sign up using <strong>${email}</strong>. Use the verification code below. It expires in <strong>${expiresInMinutes} minutes</strong>.</p>

                <div style="display:flex; justify-content:center; margin:16px 0;">
                  <div style="background:#f7f7fb; border:1px dashed #d1d5db; padding:18px 28px; border-radius:8px; font-size:28px; letter-spacing:6px; font-weight:700;">
                    ${otp}
                  </div>
                </div>

                <p style="margin:16px 0 0 0; color:#6b7280; font-size:13px;">
                  If you didn't request this, you can ignore this email — the code will expire automatically.
                </p>

                <hr style="border:none; border-top:1px solid #eef2f7; margin:24px 0;" />

                <p style="margin:0; color:#6b7280; font-size:13px;">Thanks,<br/>Saathi team</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc; padding:12px 20px; font-size:12px; color:#9ca3af;">If you have trouble, reply to this email or contact support.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

/** Request handler: send otp */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const email = (body?.email || '').toString().trim().toLowerCase();

		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return json({ error: 'Invalid email' }, { status: 400 });
		}

		// Rate limiting suggestion: you should add per-email/send rate limits here in production

		// Generate OTP & hash
		const otp = generateOtp();
		const hashed = hashOtp(email, otp);

		// expiry 5 minutes from now
		const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

		// Save to supabase table 'otps' (server client)
		const { error: insertError } = await supabase.from('otps').insert({
			email,
			hashed_otp: hashed,
			expires_at: expiresAt
		});

		if (insertError) {
			console.error('Supabase insert error (sendotp):', insertError);
			return json({ error: 'Internal server error' }, { status: 500 });
		}

		// Send email via nodemailer
		const mailOptions = {
			from: SENDER_EMAIL,
			to: email,
			subject: 'Your Saathi verification code',
			html: buildOtpEmailHtml({ otp, email })
		};

		await transporter.sendMail(mailOptions);

		return json({ ok: true, message: 'OTP sent' }, { status: 200 });
	} catch (err) {
		console.error('sendotp error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
