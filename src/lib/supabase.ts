// src/lib/supabase.ts
/**
 * Central supabase helper for a SvelteKit app.
 * - Browser client uses PUBLIC_* env vars and is safe to use in the client.
 * - Server client uses the SERVICE_ROLE key and must ONLY be used on the server.
 *
 * Usage:
 *  - Client-side: import { browserSupabase, signUp, signIn } from '$lib/supabase'
 *  - Server-side: import { getServerSupabase, serverInsert } from '$lib/supabase'
 *
 * NOTE: never send SUPABASE_SERVICE_ROLE_KEY to the browser.
 */

import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

/* ---------- Clients ---------- */

/** Browser / public client (safe to import in components) */
export const browserSupabase: SupabaseClient = createClient(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
	{
		// Optional: configure global options here
		auth: {
			// SvelteKit handles storage; leave default or configure if you use custom storage
			persistSession: true
		}
	}
);

/** Server client factory (for server-only operations that require elevated perms) */
export function getServerSupabase(): SupabaseClient {
	if (!SUPABASE_SERVICE_ROLE_KEY) {
		throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in server environment');
	}
	// Use the service-role key so server code can perform admin-level operations (careful).
	return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false } // server clients typically don't persist sessions
	});
}

/* ---------- Auth helpers (client-focused) ---------- */

/** Sign up a new user (email + password). Returns { data, error } */
export async function signUp(email: string, password: string) {
	const res = await browserSupabase.auth.signUp({ email, password });
	return { data: res.data, error: res.error };
}

/** Sign in with email + password. Returns { data, error } */
export async function signIn(email: string, password: string) {
	// new method: signInWithPassword
	const res = await browserSupabase.auth.signInWithPassword({ email, password });
	return { data: res.data, error: res.error };
}

/** Sign out current user (client) */
export async function signOut() {
	const res = await browserSupabase.auth.signOut();
	return { error: res.error || null };
}

/** Get session / user (client) */
export async function getSession() {
	const res = await browserSupabase.auth.getSession();
	return { data: res.data, error: res.error };
}

/* ---------- Generic CRUD helpers ---------- */
/* Notes:
   - For actions tied to an authenticated user (i.e., row ownership), call these from the client or server with the user's session.
   - For admin operations (mass deletes, privileged inserts, migrations), call getServerSupabase() and use the returned client.
*/

/** Insert a row (client or server client) */
export async function insertRow<T = any>(
	table: string,
	payload: T,
	opts?: { count?: 'exact' | 'planned' | 'estimated' }
) {
	try {
		// Supabase v2: payload must be an array, and only 'count' is allowed in options
		const arrPayload = Array.isArray(payload) ? payload : [payload];
		const res = await browserSupabase.from(table).insert(arrPayload, opts);
		return { data: res.data, error: res.error };
	} catch (err) {
		return { data: null, error: err as PostgrestError };
	}
}

/** Server insert using service role (for server-only elevated writes) */
export async function serverInsert<T = any>(table: string, payload: T) {
	try {
		const sb = getServerSupabase();
		const res = await sb.from(table).insert(payload);
		return { data: res.data, error: res.error };
	} catch (err) {
		return { data: null, error: err as PostgrestError };
	}
}

/** Select rows with optional filter object (e.g. { id: 1 }) */
export async function selectRows<T = any>(table: string, eq?: Record<string, unknown>) {
	try {
		let q = browserSupabase.from<T>(table).select('*');
		if (eq && Object.keys(eq).length) {
			for (const [k, v] of Object.entries(eq)) q = q.eq(k, v as any);
		}
		const res = await q;
		return { data: res.data, error: res.error };
	} catch (err) {
		return { data: null, error: err as PostgrestError };
	}
}

/** Update rows: eq is the filter to locate rows (e.g. { id: 123 }) */
export async function updateRows<T = any>(
	table: string,
	eq: Record<string, unknown>,
	payload: Partial<T>
) {
	try {
		let q = browserSupabase.from(table).update(payload);
		for (const [k, v] of Object.entries(eq)) q = q.eq(k, v as any);
		const res = await q;
		return { data: res.data, error: res.error };
	} catch (err) {
		return { data: null, error: err as PostgrestError };
	}
}

/** Delete rows: eq is the filter to locate rows (e.g. { id: 123 }) */
export async function deleteRows(table: string, eq: Record<string, unknown>) {
	try {
		let q = browserSupabase.from(table).delete();
		for (const [k, v] of Object.entries(eq)) q = q.eq(k, v as any);
		const res = await q;
		return { data: res.data, error: res.error };
	} catch (err) {
		return { data: null, error: err as PostgrestError };
	}
}

/* ---------- Utility: server-side user lookup by email (example) ---------- */
/** Find a user via Admin API (server only). Requires service role key. */
export async function serverGetUserByEmail(email: string) {
	try {
		const sb = getServerSupabase();
		const res = await sb.auth.admin.getUserByEmail(email);
		// NOTE: getUserByEmail returns { data, error } in newer supabase-js
		return { data: res.data, error: res.error };
	} catch (err) {
		return { data: null, error: err as any };
	}
}

/* ---------- Exports for convenience ---------- */
export default {
	browserSupabase,
	getServerSupabase,
	/* auth helpers */
	signUp,
	signIn,
	signOut,
	getSession,
	/* CRUD */
	insertRow,
	serverInsert,
	selectRows,
	updateRows,
	deleteRows,
	serverGetUserByEmail
};
