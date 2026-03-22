<script lang="ts">
	const p = $props();
	const openModal = p.openModal as () => void;
</script>

<div class="min-h-screen bg-gray-100 flex justify-center items-center">
	<div class="max-w-screen-xl bg-white shadow sm:rounded-lg flex w-full">

		<!-- LEFT -->
		<div class="flex-1 hidden lg:flex bg-indigo-100">
			<div
				class="m-12 w-full bg-contain bg-center bg-no-repeat"
				style="background-image: url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg');"
			></div>
		</div>

		<!-- RIGHT -->
		<div class="lg:w-1/2 xl:w-5/12 p-10 flex flex-col justify-center items-center text-center">
			<img
				src="https://storage.googleapis.com/devitary-image-host.appspot.com/15846435184459982716-LogoMakr_7POjrN.png"
				class="w-32 mb-6"
			/>

			<h1 class="text-3xl font-extrabold text-gray-800">
				Welcome to ChatGuide
			</h1>

			<p class="mt-4 text-gray-600">
				A guided onboarding experience to help you get started quickly with intelligent chat systems.
			</p>

			<div class="mt-8 w-full max-w-xs">
				<button
					class="w-full py-4 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
					on:click={() => openModal?.()}
				>
					Get Started
				</button>
			</div>

			<div class="mt-8 text-sm text-gray-500 space-y-2">
				<p>✔ Learn the basics</p>
				<p>✔ Privacy-first signup</p>
				<p>✔ Start chatting instantly</p>
			</div>
		</div>

	</div>
</div>