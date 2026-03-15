import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OTP_HMAC_SECRET } from '$env/static/private';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function hashOtp(email: string, otp: string) {
	return crypto.createHmac('sha256', OTP_HMAC_SECRET).update(`${email}:${otp}`).digest('hex');
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		const email = body.email?.trim().toLowerCase();
		const otp = body.otp?.trim();

		if (!email || !otp) {
			return json({ ok: false, error: 'Missing fields' }, { status: 400 });
		}

		const { data, error } = await supabase
			.from('otps')
			.select('*')
			.eq('email', email)
			.order('created_at', { ascending: false })
			.limit(1)
			.single();

		if (error || !data) {
			return json({ ok: false, error: 'OTP not found' });
		}

		if (new Date(data.expires_at) < new Date()) {
			return json({ ok: false, error: 'OTP expired' });
		}

		const hashed = hashOtp(email, otp);

		const match = crypto.timingSafeEqual(Buffer.from(hashed), Buffer.from(data.hashed_otp));

		if (!match) {
			return json({ ok: false, error: 'Invalid OTP' });
		}

		await supabase.from('otps').delete().eq('id', data.id);

		return json({ ok: true });
	} catch (err) {
		console.error(err);
		return json({ ok: false, error: 'Server error' });
	}
};
