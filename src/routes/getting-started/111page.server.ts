// src/routes/getting-started/+page.server.ts
import type { Actions } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server env.');
}

/**
 * The action expects a JSON POST with { email, password }.
 * It creates a Supabase auth user using the service-role key and sets email_confirm:true
 * so Supabase does not send a confirmation email.
 */
export const actions: Actions = {
	default: async ({ request }) => {
		try {
			const body = await request.json();
			const email = (body?.email || '').toString().trim().toLowerCase();
			const password = (body?.password || '').toString();

			// basic validation
			if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
				return json({ ok: false, error: 'Invalid email' }, { status: 400 });
			}
			if (!password || password.length < 8) {
				return json(
					{ ok: false, error: 'Password must be at least 8 characters' },
					{ status: 400 }
				);
			}

			// Create server (admin) supabase client
			const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

			// Create the user via admin API.
			// email_confirm: true attempts to avoid sending confirmation emails and mark the email as confirmed.
			const { data, error } = await supabaseAdmin.auth.admin.createUser({
				email,
				password,
				email_confirm: true
			});

			if (error) {
				// Known Supabase errors may include email already registered, etc.
				console.error('supabase.admin.createUser error:', error);
				const message =
					error.message || 'Failed to create account. Please try again or contact support.';
				return json({ ok: false, error: message }, { status: 400 });
			}

			// Success
			return json({ ok: true, data: { user: data } }, { status: 200 });
		} catch (err) {
			console.error('signup action error:', err);
			return json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}
	}
};
