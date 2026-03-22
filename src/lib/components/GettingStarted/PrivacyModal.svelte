<script lang="ts">
	let {
		showCheckbox = $bindable(),
		agreeChecked = $bindable(),
		onAgree,
		closeModal
	} = $props();

	let policyRef: HTMLElement | null = null;

	function handleScroll() {
		if (!policyRef) return;

		const bottom =
			policyRef.scrollTop + policyRef.clientHeight >=
			policyRef.scrollHeight - 2;

		if (bottom) showCheckbox = true;
	}
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
	<div class="w-11/12 max-w-2xl bg-white rounded-2xl shadow-xl p-6">

		<!-- HEADER -->
		<div class="flex justify-between items-center">
			<h2 class="text-2xl font-bold text-gray-800">
				Privacy Policy
			</h2>
			<button
				class="text-gray-400 hover:text-gray-600 text-xl"
				on:click={() => closeModal?.()}
			>
				✕
			</button>
		</div>

		<!-- CONTENT -->
		<div
			class="mt-4 border rounded-lg p-4 h-64 overflow-auto bg-gray-50 text-sm text-gray-700"
			bind:this={policyRef}
			on:scroll={handleScroll}
		>
			<p>
				This Privacy Policy explains how we collect, use, and protect your data...
			</p>

			<div style="height:500px"></div>

			<p>End of policy.</p>
		</div>

		<!-- CHECKBOX -->
		{#if showCheckbox}
			<label class="flex items-center gap-3 mt-4 text-sm text-gray-700">
				<input
					type="checkbox"
					bind:checked={agreeChecked}
					class="w-4 h-4"
				/>
				I agree to the privacy policy
			</label>
		{/if}

		<!-- ACTION -->
		<button
			class="mt-6 w-full py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60"
			on:click={() => onAgree?.()}
			disabled={!agreeChecked}
		>
			Agree & Continue
		</button>
	</div>
</div>