<script lang="ts">
	let { showCheckbox = $bindable(), agreeChecked = $bindable(), onAgree, closeModal } = $props();

	let policyRef: HTMLElement | null = null;

	function handleScroll() {
		if (!policyRef) return;

		const bottom = policyRef.scrollTop + policyRef.clientHeight >= policyRef.scrollHeight - 2;

		if (bottom) showCheckbox = true;
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
	<div class="w-11/12 max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
		<!-- HEADER -->
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold text-gray-800">Privacy Policy</h2>
			<button class="text-xl text-gray-400 hover:text-gray-600" on:click={() => closeModal?.()}>
				✕
			</button>
		</div>

		<!-- CONTENT -->
		<div
			class="mt-4 h-64 overflow-auto rounded-lg border bg-gray-50 p-4 text-sm text-gray-700"
			bind:this={policyRef}
			on:scroll={handleScroll}
		>
			<p>This Privacy Policy explains how we collect, use, and protect your data...</p>

			<div style="height:500px"></div>

			<p>End of policy.</p>
		</div>

		<!-- CHECKBOX -->
		{#if showCheckbox}
			<label class="mt-4 flex items-center gap-3 text-sm text-gray-700">
				<input type="checkbox" bind:checked={agreeChecked} class="h-4 w-4" />
				I agree to the privacy policy
			</label>
		{/if}

		<!-- ACTION -->
		<button
			class="mt-6 w-full rounded-lg bg-indigo-500 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
			on:click={() => onAgree?.()}
			disabled={!agreeChecked}
		>
			Agree & Continue
		</button>
	</div>
</div>
