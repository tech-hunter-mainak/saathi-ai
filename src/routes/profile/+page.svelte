<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	// ✅ Icons
	import {
		User,
		Calendar,
		VenusAndMars,
		Globe,
		MapPin,
		Building2,
		Briefcase
	} from 'lucide-svelte';

	let fullname = $state('');
	let age = $state('');
	let gender = $state('');
	let country = $state('');
	let stateField = $state('');
	let city = $state('');
	let profession = $state('');

	let loading = $state(true);
	let saving = $state(false);
	let message = $state('');
	let error = $state('');

	let redirectTo = $state('/');

	onMount(async () => {
		try {
			const url = new URL(window.location.href);
			redirectTo = url.searchParams.get('redirectTo') ?? '/';

			const res = await fetch('/api/profile', { credentials: 'include' });

			if (res.status === 401) {
				const next = encodeURIComponent(window.location.pathname + window.location.search || '/');
				goto(`/login?redirectTo=${next}`);
				return;
			}

			const data = await res.json().catch(() => ({}));

			if (!res.ok || !data.ok) {
				loading = false;
				return;
			}

			const p = data.profile ?? {};

			if (p.profile_completed) {
				goto(redirectTo);
				return;
			}

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
			setTimeout(() => goto(redirectTo), 700);
		} catch (err) {
			console.error('saveProfile error', err);
			error = 'Network error';
		} finally {
			saving = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center px-4">
	<div class="w-full max-w-4xl bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-10">

		<h1 class="text-3xl font-extrabold text-center text-gray-800">
			Complete Your Profile
		</h1>

		<p class="text-center text-gray-500 mt-2 text-sm">
			Just a few details to personalize your experience
		</p>

		{#if loading}
			<p class="text-center text-gray-500 mt-6">Loading profile...</p>
		{:else}

			{#if error}
				<div class="mt-6 text-sm text-red-500 text-center">{error}</div>
			{/if}

			{#if message}
				<div class="mt-6 text-sm text-green-600 text-center">{message}</div>
			{/if}

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">

				<!-- INPUT COMPONENT STYLE -->
				<div class="input-group">
					<User class="icon" />
					<input placeholder="Full name" bind:value={fullname} />
				</div>

				<div class="input-group">
					<Calendar class="icon" />
					<input type="number" placeholder="Age" bind:value={age} />
				</div>

				<div class="input-group">
					<VenusAndMars class="icon" />
					<select bind:value={gender}>
						<option value="">Select gender</option>
						<option value="male">Male</option>
						<option value="female">Female</option>
						<option value="other">Other</option>
						<option value="prefer_not">Prefer not to say</option>
					</select>
				</div>

				<div class="input-group">
					<Globe class="icon" />
					<input placeholder="Country" bind:value={country} />
				</div>

				<div class="input-group">
					<MapPin class="icon" />
					<input placeholder="State" bind:value={stateField} />
				</div>

				<div class="input-group">
					<Building2 class="icon" />
					<input placeholder="City" bind:value={city} />
				</div>

				<div class="input-group sm:col-span-2">
					<Briefcase class="icon" />
					<input placeholder="Profession" bind:value={profession} />
				</div>
			</div>

			<button
				on:click={saveProfile}
				disabled={saving}
				class="mt-8 w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold 
				hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60"
			>
				{saving ? 'Saving...' : 'Save Profile'}
			</button>

		{/if}
	</div>
</div>

<style>
	.input-group {
		position: relative;
		display: flex;
		align-items: center;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 0 12px;
		transition: all 0.2s ease;
	}

	.input-group:hover {
		border-color: #c7d2fe;
		background: #fff;
	}

	.input-group:focus-within {
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
		background: #fff;
	}

	.input-group input,
	.input-group select {
		width: 100%;
		padding: 12px 10px;
		background: transparent;
		border: none;
		outline: none;
		font-size: 14px;
	}

	.icon {
		width: 18px;
		height: 18px;
		color: #9ca3af;
	}
</style>