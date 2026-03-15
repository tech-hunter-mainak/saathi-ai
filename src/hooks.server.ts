// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

function isValidHttpUrl(value?: string) {
	if (!value) return false;
	try {
		const u = new URL(value);
		return u.protocol === 'http:' || u.protocol === 'https:';
	} catch {
		return false;
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	/* ---------- env validation ---------- */
	const urlValid = isValidHttpUrl(PUBLIC_SUPABASE_URL);
	const keyValid =
		typeof PUBLIC_SUPABASE_ANON_KEY === 'string' && PUBLIC_SUPABASE_ANON_KEY.length > 0;

	if (!urlValid || !keyValid) {
		const devMsg = [
			'Supabase environment variables are not configured correctly.',
			'',
			'Required:',
			'PUBLIC_SUPABASE_URL=https://<project>.supabase.co',
			'PUBLIC_SUPABASE_ANON_KEY=<anon-key>',
			'',
			`Current URL: ${String(PUBLIC_SUPABASE_URL)}`
		].join('\n');

		if (process.env.NODE_ENV === 'development') {
			return new Response(devMsg, { status: 500, headers: { 'content-type': 'text/plain' } });
		}

		throw new Error('Supabase environment misconfiguration.');
	}

	/* ---------- create supabase server client (anon key) ---------- */
	// We use the anon key here for read-only auth/user calls; service-role actions
	// (if any) should use getServerSupabase / service role in your other server endpoints.
	const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (name) => event.cookies.get(name),
			set: (name, value, options) =>
				event.cookies.set(name, value, {
					path: '/',
					...options
				}),
			remove: (name, options) =>
				event.cookies.delete(name, {
					path: '/',
					...options
				})
		}
	});

	event.locals.supabase = supabase;

	/* ---------- reconstruct user/session from cookies ---------- */
	const accessToken = event.cookies.get('sb-access-token') ?? null;
	const refreshToken = event.cookies.get('sb-refresh-token') ?? null;

	let user = null;
	let session = null;

	if (accessToken) {
		try {
			// getUser accepts an access token to validate and return the user
			const { data, error } = await supabase.auth.getUser(accessToken);
			if (!error && data?.user) {
				user = data.user;
				session = {
					access_token: accessToken,
					refresh_token: refreshToken,
					user
				};
			} else {
				// token invalid or expired - clear cookies (optional)
				// event.cookies.delete('sb-access-token'); event.cookies.delete('sb-refresh-token');
				user = null;
				session = null;
			}
		} catch (err) {
			console.error('supabase.auth.getUser error:', err);
			user = null;
			session = null;
		}
	}

	event.locals.user = user;
	event.locals.session = session;

	const pathname = event.url.pathname;

	/* ---------- helper: build redirectTo param ---------- */
	const buildRedirect = () => encodeURIComponent(event.url.pathname + event.url.search);

	/* ---------- slug validation for /c/:slug ---------- */
	if (pathname.startsWith('/c/')) {
		const slug = pathname.slice(3);
		const ok = /^[A-Za-z0-9_-]{8,128}$/.test(slug);
		if (!ok) {
			return new Response('Not found', { status: 404 });
		}
	}

	/* ---------- redirect logged-in users away from /login ---------- */
	if (pathname === '/login' && user) {
		const redirectTo = event.url.searchParams.get('redirectTo');
		if (redirectTo) throw redirect(303, redirectTo);
		throw redirect(303, '/');
	}

	/* ---------- require authentication for /profile and /c routes ---------- */
	const needsLogin = pathname === '/profile' || pathname === '/c' || pathname.startsWith('/c/');
	if (needsLogin && !user) {
		// not authenticated: send to login
		throw redirect(303, `/login?redirectTo=${buildRedirect()}`);
	}

	if (pathname === '/' && !user) {
		// if you want to allow unauthenticated users to access /profile (e.g. show a generic profile page or prompt to log in), you can skip this redirect and let the page handle it.
		throw redirect(303, `/getting-started?redirectTo=${buildRedirect()}`);
	}

	/* ---------- if user is logged in, enforce profile completion for '/', '/c', '/c/*' ---------- */
	// Only perform profile-completion check if user exists and is trying to access one of the guarded routes.
	const profileGuardRoutes = pathname === '/' || pathname === '/c' || pathname.startsWith('/c/');
	if (user && profileGuardRoutes) {
		try {
			// read profile from profiles table by user_id
			const { data: profileData, error: profileError } = await supabase
				.from('profiles')
				.select('profilecompleted')
				.eq('user_id', user.id)
				.maybeSingle();

			// treat any DB error or missing profile as incomplete (force profile completion)
			const completed = !!(profileData && profileData.profilecompleted === true);

			if (!completed) {
				// if already on /profile then allow (so user can complete it)
				if (pathname !== '/profile') {
					throw redirect(303, `/profile?redirectTo=${buildRedirect()}`);
				}
			}
		} catch (err) {
			// if redirect thrown above, rethrow it
			if (err && typeof (err as any).status === 'number' && (err as any).status === 303) throw err;
			// other errors: log and treat as incomplete -> force profile page
			console.error('Error checking profile_completed:', err);
			if (pathname !== '/profile') throw redirect(303, `/profile?redirectTo=${buildRedirect()}`);
		}
	}

	/* ---------- allow /profile for logged out users? ---------- */
	// If you want /profile to be only reachable by logged in users, we already enforced needsLogin above.
	// Continue to resolve the request.
	return resolve(event);
};
