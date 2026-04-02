<script lang="ts">
	// ===== ORIGINAL STATE (UNCHANGED) =====
	let email = $state('');
	let otp = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	let step = $state<'email' | 'otp' | 'password' | 'done'>('email');

	let loading = $state(false);
	let message = $state('');

	// ✅ CRITICAL: keep EXACT same derived logic
	const showEmail = $derived(step === 'email');
	const showOtp = $derived(step === 'otp');
	const showPassword = $derived(step === 'password');
	const showDone = $derived(step === 'done');

	// ===== ORIGINAL FUNCTIONS (UNCHANGED) =====
	async function sendOtp() {
		if (!email) {
			message = 'Enter email';
			return;
		}

		loading = true;
		message = '';

		try {
			const res = await fetch('/api/sendotp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const data = await res.json();

			if (data.ok) {
				step = 'otp';
				message = 'OTP sent';
			} else {
				message = data.error ?? 'Failed to send OTP';
			}
		} catch {
			message = 'Network error';
		}

		loading = false;
	}

	async function verifyOtp() {
		if (!otp) {
			message = 'Enter OTP';
			return;
		}

		loading = true;
		message = '';

		try {
			const res = await fetch('/api/verifyotp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, otp })
			});

			const data = await res.json();

			if (data.ok) {
				step = 'password';
				message = 'OTP verified';
			} else {
				message = data.error ?? 'Invalid OTP';
			}
		} catch {
			message = 'Network error';
		}

		loading = false;
	}

	async function createAccount() {
		if (!password || !confirmPassword) {
			message = 'Enter password';
			return;
		}

		if (password !== confirmPassword) {
			message = 'Passwords do not match';
			return;
		}

		loading = true;
		message = '';

		try {
			const res = await fetch('/api/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await res.json();

			if (data.ok) {
				step = 'done';
				message = 'Account created successfully';
			} else {
				message = data.error ?? 'Signup failed';
			}
		} catch {
			message = 'Network error';
		}

		loading = false;
	}

	// ===== NEW FLOW STATE =====
	let showIntro = $state(true);
	let showModal = $state(false);
	let showForm = $state(false);

	let agreeChecked = $state(false);
	let showCheckbox = $state(false);

	function openModal() {
		showIntro = false;
		showModal = true;
	}

	function onModalClose() {
		showModal = false;
		showIntro = true;
		agreeChecked = false;
		showCheckbox = false;
	}

	function onAgree() {
		// parent-level guard depends on parent's agreeChecked
		if (!agreeChecked) return;
		showModal = false;
		showForm = true;
		// important: step remains 'email' → flow preserved
	}

	// Components (kept in /src/GettingStarted/)
	import Intro from '$lib/components/GettingStarted/Intro.svelte';
	import PrivacyModal from '$lib/components/GettingStarted/PrivacyModal.svelte';
	import SignupForm from '$lib/components/GettingStarted/SignupForm.svelte';
</script>

{#if showIntro}
	<Intro {openModal} />
{/if}

{#if showModal}
	<!-- bind so child updates reflect in parent -->
	<PrivacyModal bind:showCheckbox bind:agreeChecked {onAgree} closeModal={onModalClose} />
{/if}

{#if showForm}
	<SignupForm
		bind:email
		bind:otp
		bind:password
		bind:confirmPassword
		{showEmail}
		{showOtp}
		{showPassword}
		{showDone}
		{sendOtp}
		{verifyOtp}
		{createAccount}
		{loading}
		{message}
	/>
{/if}

<style>
	:global(body) {
		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			'Helvetica Neue',
			Arial;
	}
</style>
