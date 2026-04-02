<script lang="ts">
	const p = $props();
	const openModal = p.openModal as () => void;
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<div class="flex w-full max-w-screen-xl bg-white shadow sm:rounded-lg">
		<!-- LEFT -->
		<div class="hidden flex-1 bg-indigo-100 lg:flex">
			<div
				class="m-12 w-full bg-contain bg-center bg-no-repeat"
				style="background-image: url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg');"
			></div>
		</div>

		<!-- RIGHT -->
		<div class="flex flex-col items-center justify-center p-10 text-center lg:w-1/2 xl:w-5/12">
			<img
				src="https://storage.googleapis.com/devitary-image-host.appspot.com/15846435184459982716-LogoMakr_7POjrN.png"
				class="mb-6 w-32"
			/>

			<h1 class="text-3xl font-extrabold text-gray-800">Welcome to ChatGuide</h1>

			<p class="mt-4 text-gray-600">
				A guided onboarding experience to help you get started quickly with intelligent chat
				systems.
			</p>

			<div class="mt-8 w-full max-w-xs">
				<button
					class="w-full rounded-lg bg-indigo-500 py-4 font-semibold text-white transition hover:bg-indigo-700"
					on:click={() => openModal?.()}
				>
					Get Started
				</button>
			</div>

			<div class="mt-8 space-y-2 text-sm text-gray-500">
				<p>✔ Learn the basics</p>
				<p>✔ Privacy-first signup</p>
				<p>✔ Start chatting instantly</p>
			</div>
		</div>
	</div>
</div>
