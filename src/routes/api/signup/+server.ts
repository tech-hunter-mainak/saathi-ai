import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { getServerSupabase } from '$lib/supabase';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return json({ ok: false, error: 'Missing fields' }, { status: 400 });
		}

		const supabase = getServerSupabase();

		/* ---------- CREATE AUTH USER ---------- */

		const { data, error } = await supabase.auth.admin.createUser({
			email,
			password,
			email_confirm: true
		});

		if (error || !data.user) {
			console.error(error);
			return json({ ok: false, error: error?.message || 'User creation failed' }, { status: 500 });
		}

		const userId = data.user.id;

		/* ---------- INSERT PROFILE ---------- */

		const { error: profileError } = await supabase.from('profiles').insert({
			user_id: userId,
			email: email,
			fullname: null,
			age: null,
			gender: null,
			state: null,
			city: null,
			profession: null,
			profilecompleted: false
		});

		if (profileError) {
			console.error(profileError);

			return json({ ok: false, error: 'Profile creation failed' }, { status: 500 });
		}

		return json({
			ok: true,
			user_id: userId
		});
	} catch (err) {
		console.error(err);

		return json({ ok: false, error: 'Server error' }, { status: 500 });
	}
};
