<script lang="ts">
	let email = $state('');
	let otp = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	let step = $state<'email' | 'otp' | 'password' | 'done'>('email');

	let loading = $state(false);
	let message = $state('');

	const showEmail = $derived(step === 'email');
	const showOtp = $derived(step === 'otp');
	const showPassword = $derived(step === 'password');
	const showDone = $derived(step === 'done');

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
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email })
			});

			const data = await res.json();
			console.log('SEND OTP:', data);

			if (data.ok) {
				step = 'otp';
				message = 'OTP sent';
			} else {
				message = data.error ?? 'Failed to send OTP';
			}
		} catch (e) {
			console.error(e);
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
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, otp })
			});

			const data = await res.json();
			console.log('VERIFY OTP:', data);

			if (data.ok) {
				step = 'password';
				message = 'OTP verified';
			} else {
				message = data.error ?? 'Invalid OTP';
			}
		} catch (e) {
			console.error(e);
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
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			const data = await res.json();
			console.log('SIGNUP:', data);

			if (data.ok) {
				step = 'done';
				message = 'Account created successfully';
			} else {
				message = data.error ?? 'Signup failed';
			}
		} catch (e) {
			console.error(e);
			message = 'Network error';
		}

		loading = false;
	}
</script>

<div class="container">
	<h2>Create Account</h2>

	{#if showEmail}
		<input type="email" placeholder="Enter email" bind:value={email} />

		<button onclick={sendOtp} disabled={loading}> Send OTP </button>
	{/if}

	{#if showOtp}
		<input type="text" placeholder="Enter OTP" bind:value={otp} />

		<button onclick={verifyOtp} disabled={loading}> Verify OTP </button>
	{/if}

	{#if showPassword}
		<input type="password" placeholder="Create password" bind:value={password} />

		<input type="password" placeholder="Confirm password" bind:value={confirmPassword} />

		<button onclick={createAccount} disabled={loading}> Create Account </button>
	{/if}

	{#if showDone}
		<p>Account created successfully.</p>
	{/if}

	<p>{message}</p>
</div>

<style>
	.container {
		width: 420px;
		margin: 80px auto;
		font-family: Arial;
	}

	input {
		width: 100%;
		padding: 10px;
		margin: 10px 0;
	}

	button {
		width: 100%;
		padding: 10px;
		background: #2563eb;
		color: white;
		border: none;
		cursor: pointer;
	}

	button:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}
</style>
