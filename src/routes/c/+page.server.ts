import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_BASE_URL } from '$env/static/private';

function normalize(url: string) {
	return url.replace(/\/+$/, '');
}

export const load: PageServerLoad = async (event) => {
	/* ---------------------------------- */
	/* 1. Get user from hooks             */
	/* ---------------------------------- */
	const user = event.locals.user;
	const userId = user?.id ?? null;

	console.log('✅ USER ID (from hooks):', userId);

	/* ---------------------------------- */
	/* 2. Call backend                    */
	/* ---------------------------------- */
	const url = `${normalize(BACKEND_BASE_URL)}/api/session`;

	const payload = {
		user_id: userId,
		session_type: 'chat',
		module_id: 'default'
	};

	const res = await event.fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			accept: 'application/json'
		},
		body: JSON.stringify(payload)
	});

	const data = await res.json().catch(() => null);

	if (!res.ok || !data?.session_id) {
		console.error('❌ Backend error:', {
			status: res.status,
			payload,
			response: data
		});
		throw error(500, 'Backend session creation failed');
	}

	const sessionId = data.session_id;

	/* ---------------------------------- */
	/* 3. Insert mapping (ONLY if user)   */
	/* ---------------------------------- */
	if (userId) {
		const { error: insertError } = await event.locals.supabase
			.from('chat_sessions')
			.insert({
				user_id: userId,
				session_id: sessionId
			});

		if (insertError) {
			console.warn('⚠️ Supabase insert failed:', insertError.message);
		}
	}

	/* ---------------------------------- */
	/* 4. Redirect                        */
	/* ---------------------------------- */
	throw redirect(303, `/c/${encodeURIComponent(sessionId)}`);
};