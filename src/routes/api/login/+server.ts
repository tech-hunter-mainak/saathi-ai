import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { createClient } from '@supabase/supabase-js';

import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { email, password } = await request.json();

	const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	if (error) {
		return json({ ok: false, error: error.message }, { status: 401 });
	}

	/* ---------- STORE SESSION COOKIES ---------- */

	const session = data.session;

	cookies.set('sb-access-token', session.access_token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax'
	});

	cookies.set('sb-refresh-token', session.refresh_token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax'
	});

	return json({
		ok: true,
		user: data.user
	});
};
