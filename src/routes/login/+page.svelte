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

<div class="flex min-h-screen justify-center bg-gray-100 text-gray-900">
	<div class="m-0 flex max-w-screen-xl flex-1 justify-center bg-white shadow sm:m-10 sm:rounded-lg">
		<!-- LEFT PANEL -->
		<div class="hidden flex-1 bg-indigo-100 text-center lg:flex">
			<div
				class="m-12 w-full bg-contain bg-center bg-no-repeat xl:m-16"
				style="background-image: url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg');"
			></div>
		</div>

		<!-- RIGHT PANEL -->
		<div class="p-6 sm:p-12 lg:w-1/2 xl:w-5/12">
			<!-- LOGO -->
			<div>
				<img
					src="https://storage.googleapis.com/devitary-image-host.appspot.com/15846435184459982716-LogoMakr_7POjrN.png"
					class="mx-auto w-32"
				/>
			</div>

			<div class="mt-12 flex flex-col items-center">
				<h1 class="text-2xl font-extrabold xl:text-3xl">Login</h1>

				<div class="mt-8 w-full flex-1">
					<!-- SOCIAL (UI ONLY) -->
					<div class="flex flex-col items-center">
						<button
							class="flex w-full max-w-xs items-center justify-center rounded-lg bg-indigo-100 py-3 font-bold text-gray-800 shadow-sm transition hover:shadow"
						>
							<div class="rounded-full bg-white p-2">
								<svg class="w-4" viewBox="0 0 533.5 544.3">
									<path
										fill="#4285f4"
										d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
									/>
								</svg>
							</div>
							<span class="ml-4">Login with Google</span>
						</button>
					</div>

					<div class="my-10 border-b text-center">
						<div class="inline-block translate-y-1/2 bg-white px-2 text-sm text-gray-600">
							Or login with email
						</div>
					</div>

					<!-- FORM -->
					<div class="mx-auto max-w-xs">
						<input
							type="email"
							placeholder="Email"
							bind:value={email}
							class="w-full rounded-lg border border-gray-200 bg-gray-100 px-8 py-4 text-sm focus:bg-white focus:outline-none"
						/>

						<input
							type="password"
							placeholder="Password"
							bind:value={password}
							class="mt-5 w-full rounded-lg border border-gray-200 bg-gray-100 px-8 py-4 text-sm focus:bg-white focus:outline-none"
						/>

						<button
							on:click={login}
							disabled={loading}
							class="mt-5 w-full rounded-lg bg-indigo-500 py-4 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
						>
							{loading ? 'Logging in...' : 'Login'}
						</button>

						<!-- ERROR -->
						{#if error}
							<p class="mt-4 text-center text-sm text-red-500">
								{error}
							</p>
						{/if}

						<p class="mt-6 text-center text-xs text-gray-600">
							Don't have an account?
							<span class="font-medium text-indigo-600">Sign up</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
