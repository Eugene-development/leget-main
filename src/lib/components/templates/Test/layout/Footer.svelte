<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import LoginModal from '$lib/components/LoginModal.svelte';

	let { data }: { data: Record<string, unknown> } = $props();

	// Cast data fields
	const siteName = $derived(typeof data?.siteName === 'string' ? data.siteName : null);
	const links = $derived(
		Array.isArray(data?.links) ? (data.links as { href: string; label: string }[]) : []
	);
	const copyright = $derived(typeof data?.copyright === 'string' ? data.copyright : null);

	let showLoginModal = $state(false);

	function handleAuthClick() {
		if ($auth.isAuthenticated) {
			auth.logout();
		} else {
			showLoginModal = true;
		}
	}
</script>

<footer class="w-full border-t border-gray-200 bg-gray-50">
	<div
		class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row"
	>
		{#if siteName}
			<span class="text-sm text-gray-500">{siteName}</span>
		{/if}

		{#if links.length}
			<nav class="flex flex-wrap items-center gap-4">
				{#each links as link}
					<a href={link.href} class="text-sm text-gray-500 transition-colors hover:text-gray-900">
						{link.label}
					</a>
				{/each}
			</nav>
		{/if}

		<div class="flex items-center gap-4">
			{#if copyright}
				<span class="text-sm text-gray-400">{copyright}</span>
			{/if}

			<button
				type="button"
				onclick={handleAuthClick}
				class="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
			>
				{$auth.isAuthenticated ? 'Выйти' : 'Войти'}
			</button>
		</div>
	</div>
</footer>

{#if showLoginModal}
	<LoginModal onClose={() => (showLoginModal = false)} />
{/if}
