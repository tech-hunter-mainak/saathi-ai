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

<div class="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
	<div class="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">

		<!-- LEFT PANEL -->
		<div class="flex-1 bg-indigo-100 text-center hidden lg:flex">
			<div
				class="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
				style="background-image: url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg');"
			></div>
		</div>

		<!-- RIGHT PANEL -->
		<div class="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
			
			<!-- LOGO -->
			<div>
				<img
					src="https://storage.googleapis.com/devitary-image-host.appspot.com/15846435184459982716-LogoMakr_7POjrN.png"
					class="w-32 mx-auto"
				/>
			</div>

			<div class="mt-12 flex flex-col items-center">
				<h1 class="text-2xl xl:text-3xl font-extrabold">
					Login
				</h1>

				<div class="w-full flex-1 mt-8">

					<!-- SOCIAL (UI ONLY) -->
					<div class="flex flex-col items-center">
						<button
							class="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center hover:shadow transition"
						>
							<div class="bg-white p-2 rounded-full">
								<svg class="w-4" viewBox="0 0 533.5 544.3">
									<path fill="#4285f4"
										d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"/>
								</svg>
							</div>
							<span class="ml-4">Login with Google</span>
						</button>
					</div>

					<div class="my-10 border-b text-center">
						<div class="inline-block text-sm text-gray-600 bg-white px-2 translate-y-1/2">
							Or login with email
						</div>
					</div>

					<!-- FORM -->
					<div class="mx-auto max-w-xs">

						<input
							type="email"
							placeholder="Email"
							bind:value={email}
							class="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:bg-white"
						/>

						<input
							type="password"
							placeholder="Password"
							bind:value={password}
							class="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 text-sm mt-5 focus:outline-none focus:bg-white"
						/>

						<button
							on:click={login}
							disabled={loading}
							class="mt-5 w-full py-4 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
						>
							{loading ? 'Logging in...' : 'Login'}
						</button>

						<!-- ERROR -->
						{#if error}
							<p class="mt-4 text-sm text-red-500 text-center">
								{error}
							</p>
						{/if}

						<p class="mt-6 text-xs text-gray-600 text-center">
							Don't have an account? 
							<span class="text-indigo-600 font-medium">Sign up</span>
						</p>

					</div>
				</div>
			</div>
		</div>
	</div>
</div>