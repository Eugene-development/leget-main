<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import LoginModal from '$lib/components/LoginModal.svelte';

	let { data }: { data: Record<string, unknown> } = $props();

	const siteName = $derived(typeof data?.siteName === 'string' ? data.siteName : 'Компания');
	const links = $derived(Array.isArray(data?.links) ? (data.links as { href: string; label: string }[]) : [
		{ href: '/',        label: 'Главная' },
		{ href: '/about',   label: 'О нас'   },
		{ href: '/contact', label: 'Контакты' },
	]);

	let showLoginModal = $state(false);
	let menuOpen = $state(false);

	function handleAuthClick() {
		if ($auth.isAuthenticated) {
			auth.logout();
		} else {
			showLoginModal = true;
		}
	}
</script>

<header class="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
		<a href="/" class="text-xl font-bold text-slate-900">{siteName}</a>

		<!-- Desktop nav -->
		<nav class="hidden items-center gap-8 sm:flex">
			{#each links as link}
				<a
					href={link.href}
					class="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="flex items-center gap-3">
			<button
				type="button"
				onclick={handleAuthClick}
				class="hidden rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 sm:block"
			>
				{$auth.isAuthenticated ? 'Выйти' : 'Войти'}
			</button>

			<!-- Mobile menu toggle -->
			<button
				type="button"
				onclick={() => (menuOpen = !menuOpen)}
				class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:hidden"
				aria-label="Меню"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{#if menuOpen}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>
	</div>

	<!-- Mobile nav -->
	{#if menuOpen}
		<nav class="border-t border-slate-100 px-6 py-4 sm:hidden">
			{#each links as link}
				<a
					href={link.href}
					onclick={() => (menuOpen = false)}
					class="block py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
				>
					{link.label}
				</a>
			{/each}
			<button
				type="button"
				onclick={handleAuthClick}
				class="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
			>
				{$auth.isAuthenticated ? 'Выйти' : 'Войти'}
			</button>
		</nav>
	{/if}
</header>

{#if showLoginModal}
	<LoginModal onClose={() => (showLoginModal = false)} />
{/if}
