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

/*
  Expected .env keys (server-only):
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  SMTP_HOST
  SMTP_PORT
  SMTP_USER
  SMTP_PASS
  SENDER_EMAIL
  OTP_HMAC_SECRET
*/

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server env.');
}
if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SENDER_EMAIL) {
	throw new Error('Missing SMTP configuration in server env.');
}
if (!OTP_HMAC_SECRET) {
	throw new Error('Missing OTP_HMAC_SECRET in server env.');
}

/* ----------------- supabase server client (service role) ----------------- */
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/* ----------------- nodemailer transporter ----------------- */
const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	secure: Number(SMTP_PORT) === 465,
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASS
	}
});

/* ----------------- helpers ----------------- */
function generateOtp(): string {
	const n = crypto.randomInt(0, 1_000_000);
	return n.toString().padStart(6, '0');
}

/** Use the exact same hash format as verify endpoint: `${email}:${otp}` */
function hashOtp(email: string, otp: string): string {
	return crypto.createHmac('sha256', OTP_HMAC_SECRET).update(`${email}:${otp}`).digest('hex');
}

function buildOtpEmailHtml({ otp, email }: { otp: string; email: string }) {
	const expiresInMinutes = 5;
	return `<!doctype html>
  <html>
  <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
  <body style="font-family: Inter, system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial; color:#111; margin:0;">
    <div style="max-width:600px;margin:24px auto;border:1px solid #e6eef6;border-radius:10px;overflow:hidden;">
      <div style="background:#0f172a;color:white;padding:18px 22px;">
        <strong>Saathi — Email verification</strong>
      </div>
      <div style="padding:22px;">
        <p style="margin:0 0 12px 0;">We received a request to verify <strong>${email}</strong>.</p>
        <p style="margin:0 0 18px 0;">Use the code below (expires in <strong>${expiresInMinutes} minutes</strong>):</p>
        <div style="text-align:center;margin:18px 0;">
          <div style="display:inline-block;padding:14px 22px;border-radius:8px;background:#f3f7fb;border:1px dashed #dbeafe;font-weight:700;font-size:28px;letter-spacing:6px;">
            ${otp}
          </div>
        </div>
        <p style="color:#6b7280;font-size:13px;margin:12px 0 0 0;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eef2f7;margin:20px 0;" />
        <p style="font-size:12px;color:#9ca3af;margin:0;">&copy; Saathi</p>
      </div>
    </div>
  </body>
  </html>`;
}

/* ----------------- Request handler ----------------- */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const rawEmail = body?.email;
		const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return json({ ok: false, error: 'Invalid email' }, { status: 400 });
		}

		// ---------- 1) Check if email already exists in profiles ----------
		// If a profile exists for this email, do not send OTP (user already registered).
		const { data: existingProfile, error: profileCheckError } = await supabase
			.from('profiles')
			.select('id')
			.eq('email', email)
			.maybeSingle();

		if (profileCheckError) {
			console.error('profiles check error:', profileCheckError);
			return json({ ok: false, error: 'Database error' }, { status: 500 });
		}

		if (existingProfile) {
			// 409 Conflict: user already exists
			return json({ ok: false, error: 'User already registered with this email' }, { status: 409 });
		}

		// ---------- 2) Generate OTP, hash it, and persist ----------
		const otp = generateOtp();
		const hashed = hashOtp(email, otp);
		const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

		// Remove any previous OTPs for this email (ensure single active OTP)
		const { error: deleteErr } = await supabase.from('otps').delete().eq('email', email);
		if (deleteErr) {
			// non-fatal - log and continue (we'll still insert)
			console.warn('Failed to delete old otps for', email, deleteErr);
		}

		const { error: insertError } = await supabase.from('otps').insert({
			email,
			hashed_otp: hashed,
			expires_at: expiresAt,
			created_at: new Date().toISOString()
		});

		if (insertError) {
			console.error('Supabase OTP insert error:', insertError);
			return json({ ok: false, error: 'Database error' }, { status: 500 });
		}

		// ---------- 3) Send OTP email ----------
		try {
			await transporter.sendMail({
				from: SENDER_EMAIL,
				to: email,
				subject: 'Your Saathi verification code',
				html: buildOtpEmailHtml({ otp, email })
			});
		} catch (mailErr) {
			console.error('Failed to send OTP email:', mailErr);
			// remove the inserted otp if email send fails
			await supabase.from('otps').delete().eq('email', email);
			return json({ ok: false, error: 'Failed to send email' }, { status: 500 });
		}

		// Success
		return json({ ok: true, message: 'OTP sent' }, { status: 200 });
	} catch (err) {
		console.error('sendotp error:', err);
		return json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
};
