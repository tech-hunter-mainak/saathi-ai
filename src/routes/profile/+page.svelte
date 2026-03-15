<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	// Svelte 5 runes: use $state for reactive variables
	let fullname = $state('');
	let age = $state('');
	let gender = $state('');
	let country = $state('');
	let stateField = $state(''); // avoid `state` name clash
	let city = $state('');
	let profession = $state('');

	let loading = $state(true);
	let saving = $state(false);
	let message = $state('');
	let error = $state('');

	// redirectTo param; default to '/'
	let redirectTo = $state('/');

	onMount(async () => {
		try {
			// read redirectTo from URL query
			const url = new URL(window.location.href);
			redirectTo = url.searchParams.get('redirectTo') ?? '/';

			// fetch profile
			const res = await fetch('/api/profile', { credentials: 'include' });
			// if user not authenticated, redirect to login with next page
			if (res.status === 401) {
				const next = encodeURIComponent(window.location.pathname + window.location.search || '/');
				goto(`/login?redirectTo=${next}`);
				return;
			}

			const data = await res.json().catch(() => ({}));

			if (!res.ok || !data.ok) {
				// If profile fetch failed, show the blank form for completion
				console.warn('profile fetch failed', data);
				loading = false;
				return;
			}

			const p = data.profile ?? {};

			// If profile already completed, redirect immediately
			if (p.profile_completed) {
				goto(redirectTo);
				return;
			}

			// populate form fields
			fullname = p.fullname ?? '';
			age = p.age != null ? String(p.age) : '';
			gender = p.gender ?? '';
			country = p.country ?? '';
			stateField = p.state ?? '';
			city = p.city ?? '';
			profession = p.profession ?? '';
		} catch (err) {
			console.error('profile page load error', err);
			error = 'Network error';
		} finally {
			loading = false;
		}
	});

	async function saveProfile() {
		error = '';
		message = '';
		if (!fullname || !gender || !stateField || !city || !profession) {
			error = 'Please fill all required fields';
			return;
		}

		saving = true;

		try {
			const payload = {
				fullname,
				age: age === '' ? null : Number(age),
				gender,
				country,
				state: stateField,
				city,
				profession
			};

			const res = await fetch('/api/profile', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload)
			});

			const data = await res.json().catch(() => ({}));

			if (!res.ok || !data.ok) {
				error = data.error || 'Failed to save profile';
				return;
			}

			message = 'Profile saved — redirecting...';

			// navigate to intended destination
			setTimeout(() => goto(redirectTo), 700);
		} catch (err) {
			console.error('saveProfile error', err);
			error = 'Network error';
		} finally {
			saving = false;
		}
	}
</script>

<div class="container" role="main">
	<h2>Complete your profile</h2>

	{#if loading}
		<p class="muted">Loading profile...</p>
	{:else}
		{#if error}
			<div class="error">{error}</div>
		{/if}
		{#if message}
			<div class="info">{message}</div>
		{/if}

		<label for="fullname">Full name</label>
		<input id="fullname" placeholder="Your full name" bind:value={fullname} />

		<label for="age">Age</label>
		<input id="age" type="number" min="0" placeholder="e.g., 28" bind:value={age} />

		<label for="gender">Gender</label>
		<select id="gender" bind:value={gender}>
			<option value="">Select</option>
			<option value="male">Male</option>
			<option value="female">Female</option>
			<option value="other">Other</option>
			<option value="prefer_not">Prefer not to say</option>
		</select>

		<label for="country">Country</label>
		<input id="country" placeholder="Country" bind:value={country} />

		<label for="state">State</label>
		<input id="state" placeholder="State" bind:value={stateField} />

		<label for="city">City</label>
		<input id="city" placeholder="City" bind:value={city} />

		<label for="profession">Profession</label>
		<input id="profession" placeholder="Profession" bind:value={profession} />

		<button on:click={saveProfile} disabled={saving}>
			{saving ? 'Saving...' : 'Save profile'}
		</button>
	{/if}
</div>

<style>
	.container {
		max-width: 720px;
		margin: 48px auto;
		padding: 20px;
		border-radius: 10px;
		background: #fff;
	}
	label {
		display: block;
		margin-top: 12px;
		font-weight: 600;
		color: #111827;
	}
	input,
	select {
		width: 100%;
		padding: 10px;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
		margin-top: 6px;
	}
	button {
		margin-top: 18px;
		padding: 10px 14px;
		background: #10b981;
		color: white;
		border-radius: 8px;
		border: 0;
		cursor: pointer;
	}
	.muted {
		color: #6b7280;
		font-size: 14px;
		margin-top: 10px;
	}
	.error {
		background: #fee2e2;
		color: #991b1b;
		padding: 10px;
		border-radius: 8px;
	}
	.info {
		background: #ecfeff;
		color: #064e3b;
		padding: 10px;
		border-radius: 8px;
	}
</style>
