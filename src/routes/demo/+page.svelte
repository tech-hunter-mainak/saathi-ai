<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		User,
		Settings,
		LogOut,
		ChevronDown,
		ChevronRight,
		Folder,
		Clock3,
		Plus,
		Search,
		MessageSquareText
	} from 'lucide-svelte';

	let messages = $state([
		{
			role: 'user',
			content: 'Hey, can you explain how the model determines token usage and tracks interactions?'
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
	let textareaRef: HTMLTextAreaElement;

	let goalsOpen = $state(false);
	let historyOpen = $state(true);

	function resizeTextarea() {
		if (!textareaRef) return;
		textareaRef.style.height = 'auto';
		textareaRef.style.height = Math.min(textareaRef.scrollHeight, 160) + 'px';
	}

	function sendMessage() {
		if (!input.trim() || loading) return;

		const userMsg = { role: 'user', content: input };
		messages = [...messages, userMsg];

		const prompt = input;
		input = '';
		loading = true;

		if (textareaRef) {
			textareaRef.style.height = 'auto';
		}

		// Replace with API later
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
	<aside
		class="hidden w-72 flex-col border-r border-gray-200 bg-gray-50 p-4 md:flex dark:border-gray-700 dark:bg-gray-800"
	>
		<!-- LOGO -->
		<div class="mb-6 flex items-center gap-3">
			<div
				class="bg-primary flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
			>
				<MessageSquareText size={18} strokeWidth={2.25} />
			</div>
			<div>
				<h1 class="text-xl font-semibold tracking-tight dark:text-white">ARK</h1>
				<p class="text-xs text-gray-500 dark:text-gray-400">Assistant workspace</p>
			</div>
		</div>

		<!-- PROFILE -->
		<button
			onclick={() => goto('/profile')}
			class="mb-4 flex w-full items-center gap-3 rounded-lg bg-gray-200 px-3 py-2 text-left transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
		>
			<User size={18} strokeWidth={2.25} />
			<span>Profile</span>
		</button>

		<!-- SEARCH -->
		<div class="relative mb-4">
			<Search
				size={16}
				strokeWidth={2.25}
				class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
			/>
			<input
				placeholder="Search chats..."
				class="focus:ring-primary/20 w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
			/>
		</div>

		<!-- NEW CHAT -->
		<button
			class="bg-primary mb-4 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-white shadow-sm transition hover:opacity-90"
		>
			<Plus size={18} strokeWidth={2.25} />
			New Chat
		</button>

		<!-- GOALS -->
		<div class="mb-3">
			<button
				onclick={() => (goalsOpen = !goalsOpen)}
				class="flex w-full items-center justify-between rounded-lg bg-gray-200 px-3 py-2 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
			>
				<div class="flex items-center gap-2">
					<Folder size={18} strokeWidth={2.25} />
					<span>Goals</span>
				</div>
				{#if goalsOpen}
					<ChevronDown size={16} strokeWidth={2.25} />
				{:else}
					<ChevronRight size={16} strokeWidth={2.25} />
				{/if}
			</button>

			{#if goalsOpen}
				<div class="mt-2 ml-6 space-y-1 text-sm dark:text-gray-300">
					<div class="cursor-pointer rounded px-2 py-1 hover:bg-gray-300 dark:hover:bg-gray-600">
						My Goals
					</div>
				</div>
			{/if}
		</div>

		<!-- HISTORY -->
		<div class="mb-3">
			<button
				onclick={() => (historyOpen = !historyOpen)}
				class="flex w-full items-center justify-between rounded-lg bg-gray-200 px-3 py-2 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
			>
				<div class="flex items-center gap-2">
					<Clock3 size={18} strokeWidth={2.25} />
					<span>History</span>
				</div>
				{#if historyOpen}
					<ChevronDown size={16} strokeWidth={2.25} />
				{:else}
					<ChevronRight size={16} strokeWidth={2.25} />
				{/if}
			</button>

			{#if historyOpen}
				<div class="mt-2 ml-6 space-y-1 text-sm dark:text-gray-300">
					<div class="cursor-pointer rounded px-2 py-1 hover:bg-gray-300 dark:hover:bg-gray-600">
						General Chat
					</div>
				</div>
			{/if}
		</div>

		<!-- SPACER -->
		<div class="flex-1"></div>

		<!-- SETTINGS -->
		<button
			class="mb-3 flex w-full items-center gap-3 rounded-lg bg-gray-200 px-3 py-2 text-left transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
		>
			<Settings size={18} strokeWidth={2.25} />
			<span>Settings</span>
		</button>

		<!-- LOGOUT -->
		<button
			class="flex w-full items-center gap-3 rounded-lg bg-red-500 px-3 py-2 text-left text-white transition hover:opacity-90"
		>
			<LogOut size={18} strokeWidth={2.25} />
			<span>Logout</span>
		</button>
	</aside>

	<!-- MAIN -->
	<main class="flex flex-1 flex-col">
		<!-- HEADER -->
		<header
			class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700"
		>
			<h2 class="text-lg font-semibold dark:text-white">Chat</h2>
		</header>

		<!-- CHAT AREA -->
		<div bind:this={chatContainer} class="flex-1 space-y-6 overflow-auto px-4 py-6">
			{#each messages as msg}
				<div class="mx-auto flex max-w-3xl gap-4">
					<!-- AVATAR -->
					<div
						class={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
							msg.role === 'assistant'
								? 'bg-primary border-transparent text-white'
								: 'border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
						}`}
					>
						{#if msg.role === 'assistant'}
							<MessageSquareText size={16} strokeWidth={2.25} />
						{:else}
							<User size={16} strokeWidth={2.25} />
						{/if}
					</div>

					<!-- CONTENT -->
					<div class="flex-1">
						<div class="mb-1 text-sm font-medium dark:text-white">
							{msg.role === 'assistant' ? 'ARK' : 'You'}
						</div>

						<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 dark:text-gray-200">
							{msg.content}
						</div>
					</div>
				</div>
			{/each}

			{#if loading}
				<div class="mx-auto flex max-w-3xl gap-4">
					<div class="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-white">
						<MessageSquareText size={16} strokeWidth={2.25} />
					</div>
					<div class="rounded-lg bg-gray-200 px-4 py-2 text-sm dark:bg-gray-700">Typing...</div>
				</div>
			{/if}
		</div>

		<!-- INPUT -->
		<div class="border-t p-4">
			<div class="mx-auto max-w-3xl">
				<div
					class="flex items-end gap-2 rounded-2xl bg-gray-100 px-3 py-2 shadow-sm dark:bg-gray-700"
				>
					<textarea
						bind:this={textareaRef}
						rows="1"
						placeholder="Message ARK..."
						bind:value={input}
						oninput={resizeTextarea}
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								sendMessage();
							}
						}}
						class="max-h-40 flex-1 resize-none overflow-auto bg-transparent px-2 py-2 text-sm leading-6 dark:text-white"
					></textarea>

					<button
						onclick={sendMessage}
						disabled={!input.trim() || loading}
						class="bg-primary shrink-0 rounded-xl px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
					>
						Send
					</button>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui;
		outline: 0;
		border: 0;
	}

	:root {
		--primary: #6d28d9;
	}

	.bg-primary {
		background-color: var(--primary);
	}
</style>
