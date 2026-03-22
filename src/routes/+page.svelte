<script lang="ts">
	let messages = $state([
		{
			role: 'user',
			content:
				'Hey, can you explain how the model determines token usage and tracks interactions?'
		},
		{
			role: 'assistant',
			content:
				'Our model counts tokens in both input and output, including spaces and special characters.'
		}
	]);

	let input = $state('');
	let loading = $state(false);

	let chatContainer: HTMLDivElement;

	function sendMessage() {
		if (!input.trim()) return;

		const userMsg = { role: 'user', content: input };
		messages = [...messages, userMsg];

		const prompt = input;
		input = '';
		loading = true;

		// 🔁 Replace with API later
		setTimeout(() => {
			messages = [
				...messages,
				{
					role: 'assistant',
					content: `Response for: "${prompt}"`
				}
			];
			loading = false;
			scrollToBottom();
		}, 800);

		scrollToBottom();
	}

	function scrollToBottom() {
		setTimeout(() => {
			chatContainer?.scrollTo({
				top: chatContainer.scrollHeight,
				behavior: 'smooth'
			});
		}, 50);
	}
</script>

<div class="flex h-screen bg-white dark:bg-gray-900">

	<!-- SIDEBAR -->
	<aside class="w-72 bg-gray-50 dark:bg-gray-800 p-4 hidden md:block border-r border-gray-200 dark:border-gray-700">
		
		<div class="flex items-center gap-2 mb-8">
			<div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
				⚡
			</div>
			<h1 class="text-xl font-bold dark:text-white">ARK</h1>
		</div>

		<input
			placeholder="Search chats..."
			class="w-full px-4 py-2 mb-6 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 dark:text-white"
		/>

		<button class="w-full mb-4 py-2 bg-primary text-white rounded-lg">
			+ New Chat
		</button>

		<div class="space-y-2">
			<div class="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 cursor-pointer">
				General Chat
			</div>
		</div>
	</aside>

	<!-- MAIN -->
	<main class="flex-1 flex flex-col">

		<!-- HEADER -->
		<header class="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
			<h2 class="text-lg font-semibold dark:text-white">Chat</h2>
		</header>

		<!-- CHAT AREA -->
		<div
			bind:this={chatContainer}
			class="flex-1 overflow-auto px-4 py-6 space-y-6"
		>
			{#each messages as msg}
				<div class="flex gap-4 max-w-3xl mx-auto">

					<!-- AVATAR -->
					<div
						class={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center
						${msg.role === 'assistant'
							? 'bg-primary text-white'
							: 'bg-gray-200 dark:bg-gray-700'}`}
					>
						{msg.role === 'assistant' ? '⚡' : ''}
					</div>

					<!-- CONTENT -->
					<div class="flex-1">
						<div class="text-sm font-medium mb-1 dark:text-white">
							{msg.role === 'assistant' ? 'ARK' : 'You'}
						</div>

						<div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:text-gray-200">
							{msg.content}
						</div>
					</div>
				</div>
			{/each}

			{#if loading}
				<div class="flex gap-4 max-w-3xl mx-auto">
					<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
						⚡
					</div>
					<div class="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm">
						Typing...
					</div>
				</div>
			{/if}
		</div>

		<!-- INPUT -->
		<div class="border-t border-gray-200 dark:border-gray-700 p-4">
			<div class="max-w-3xl mx-auto">

				<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">

					<textarea
						rows="2"
						placeholder="Type your message..."
						bind:value={input}
						on:keydown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
						class="w-full p-4 bg-transparent outline-none resize-none dark:text-white"
					></textarea>

					<div class="flex justify-end p-2">
						<button
							on:click={sendMessage}
							disabled={loading}
							class="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
						>
							Send
						</button>
					</div>

				</div>

			</div>
		</div>

	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui;
	}

	:root {
		--primary: #6d28d9;
	}

	.bg-primary {
		background-color: var(--primary);
	}
</style>