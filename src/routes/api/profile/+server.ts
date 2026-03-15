// src/routes/api/profile/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/*
  Expects `event.locals.user` and `event.locals.supabase` to be set by hooks.server.ts.
  Table schema expected (snake_case):
    profiles (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references auth.users(id) on delete cascade,
      email text unique,
      fullname text,
      age int,
      gender text,
      state text,
      city text,
      profession text,
      profile_completed boolean default false,
      created_at timestamp default now()
    )
*/

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = locals.user;
		const supabase = locals.supabase;

		if (!user) {
			return json({ ok: false, error: 'Unauthorized' }, { status: 401 });
		}

		// Try to read profile by user_id
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('user_id', user.id)
			.maybeSingle();

		if (error) {
			console.error('profiles select error:', error);
			return json({ ok: false, error: 'Database error' }, { status: 500 });
		}

		// If no profile exists, create a minimal profile row so the client always receives a profile object
		if (!data) {
			const { data: inserted, error: insertErr } = await supabase
				.from('profiles')
				.insert({
					user_id: user.id,
					email: user.email
				})
				.select('*')
				.maybeSingle();

			if (insertErr) {
				console.error('profiles insert error:', insertErr);
				return json({ ok: false, error: 'Database error' }, { status: 500 });
			}

			return json({ ok: true, profile: inserted ?? null });
		}

		return json({ ok: true, profile: data });
	} catch (err) {
		console.error('GET /api/profile error:', err);
		return json({ ok: false, error: 'Server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const user = locals.user;
		const supabase = locals.supabase;

		if (!user) {
			return json({ ok: false, error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();

		const { fullname, age, gender, country, state, city, profession } = body ?? {};

		// Basic validation — adjust as needed
		if (!fullname || !gender || !country || !state || !city || !profession) {
			return json({ ok: false, error: 'Missing required fields' }, { status: 400 });
		}

		const ageValue = age === null || age === undefined || age === '' ? null : Number(age);

		const { error } = await supabase
			.from('profiles')
			.update({
				fullname,
				age: ageValue,
				gender,
				country,
				state,
				city,
				profession,
				profilecompleted: true
			})
			.eq('user_id', user.id);

		if (error) {
			console.error('profiles update error:', error);
			return json({ ok: false, error: 'Database error' }, { status: 500 });
		}

		return json({ ok: true });
	} catch (err) {
		console.error('POST /api/profile error:', err);
		return json({ ok: false, error: 'Server error' }, { status: 500 });
	}
};
