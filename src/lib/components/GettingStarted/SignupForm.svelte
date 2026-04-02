<script lang="ts">
	let {
		email = $bindable(),
		otp = $bindable(),
		password = $bindable(),
		confirmPassword = $bindable(),

		showEmail,
		showOtp,
		showPassword,
		showDone,

		sendOtp,
		verifyOtp,
		createAccount,

		loading,
		message
	} = $props();
</script>

<div class="flex min-h-screen justify-center bg-gray-100 text-gray-900">
	<div class="m-0 flex max-w-screen-xl flex-1 justify-center bg-white shadow sm:m-10 sm:rounded-lg">
		<!-- LEFT PANEL -->
		<div class="p-6 sm:p-12 lg:w-1/2 xl:w-5/12">
			<div>
				<img
					src="https://storage.googleapis.com/devitary-image-host.appspot.com/15846435184459982716-LogoMakr_7POjrN.png"
					class="mx-auto w-32"
				/>
			</div>

			<div class="mt-12 flex flex-col items-center">
				<h1 class="text-2xl font-extrabold xl:text-3xl">Create Account</h1>

				<div class="mt-8 w-full flex-1">
					<!-- Social buttons (UI only) -->
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
							<span class="ml-4">Sign Up with Google</span>
						</button>
					</div>

					<div class="my-10 border-b text-center">
						<div class="inline-block translate-y-1/2 bg-white px-2 text-sm text-gray-600">
							Or continue with email
						</div>
					</div>

					<!-- FORM -->
					<div class="mx-auto max-w-xs">
						{#if showEmail}
							<input
								type="email"
								placeholder="Email"
								bind:value={email}
								class="w-full rounded-lg border border-gray-200 bg-gray-100 px-8 py-4 text-sm focus:bg-white focus:outline-none"
							/>

							<button
								on:click={sendOtp}
								disabled={loading}
								class="mt-5 w-full rounded-lg bg-indigo-500 py-4 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
							>
								Send OTP
							</button>
						{/if}

						{#if showOtp}
							<input
								type="text"
								placeholder="Enter OTP"
								bind:value={otp}
								class="mt-5 w-full rounded-lg border border-gray-200 bg-gray-100 px-8 py-4 text-sm"
							/>

							<button
								on:click={verifyOtp}
								disabled={loading}
								class="mt-5 w-full rounded-lg bg-indigo-500 py-4 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
							>
								Verify OTP
							</button>
						{/if}

						{#if showPassword}
							<input
								type="password"
								placeholder="Create password"
								bind:value={password}
								class="mt-5 w-full rounded-lg border border-gray-200 bg-gray-100 px-8 py-4 text-sm"
							/>

							<input
								type="password"
								placeholder="Confirm password"
								bind:value={confirmPassword}
								class="mt-5 w-full rounded-lg border border-gray-200 bg-gray-100 px-8 py-4 text-sm"
							/>

							<button
								on:click={createAccount}
								disabled={loading}
								class="mt-5 w-full rounded-lg bg-indigo-500 py-4 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
							>
								Create Account
							</button>
						{/if}

						{#if showDone}
							<p class="mt-5 text-center font-semibold text-green-600">
								Account created successfully
							</p>
						{/if}

						<!-- MESSAGE -->
						<p class="mt-4 text-center text-sm text-gray-600">
							{message}
						</p>

						<!-- TERMS -->
						<p class="mt-6 text-center text-xs text-gray-600">
							I agree to the Terms and Privacy Policy
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- RIGHT PANEL -->
		<div class="hidden flex-1 bg-indigo-100 text-center lg:flex">
			<div
				class="m-12 w-full bg-contain bg-center bg-no-repeat xl:m-16"
				style="background-image: url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg');"
			></div>
		</div>
	</div>
</div>
