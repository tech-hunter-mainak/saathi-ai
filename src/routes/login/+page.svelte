<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let email = $state('');
	let password = $state('');

	let loading = $state(false);
	let error = $state('');

	async function login() {
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: email.trim().toLowerCase(),
					password
				}),
				credentials: 'include'
			});

			const data = await res.json();

			if (!res.ok || !data.ok) {
				error = data.error || 'Login failed';
				loading = false;
				return;
			}

			/* ---------- REDIRECT LOGIC ---------- */

			const redirectTo = page.url.searchParams.get('redirectTo');

			if (redirectTo) {
				await goto(redirectTo);
			} else {
				await goto('/');
			}
		} catch (err) {
			console.error(err);
			error = 'Network error';
		} finally {
			loading = false;
		}
	}
</script>

<div class="container">
	<h2>Login</h2>

	<input type="email" placeholder="Email" bind:value={email} />

	<input type="password" placeholder="Password" bind:value={password} />

	<button on:click={login} disabled={loading}>
		{loading ? 'Logging in...' : 'Login'}
	</button>

	{#if error}
		<div class="error">{error}</div>
	{/if}
</div>

<style>
	.container {
		max-width: 420px;
		margin: 80px auto;
		padding: 30px;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		font-family: system-ui;
	}

	input {
		width: 100%;
		padding: 10px;
		margin-top: 10px;
		border-radius: 8px;
		border: 1px solid #d1d5db;
	}

	button {
		width: 100%;
		margin-top: 20px;
		padding: 12px;
		border-radius: 8px;
		border: none;
		background: #0ea5e9;
		color: white;
		font-weight: 600;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.6;
	}

	.error {
		color: red;
		margin-top: 10px;
		font-size: 14px;
	}
</style>
