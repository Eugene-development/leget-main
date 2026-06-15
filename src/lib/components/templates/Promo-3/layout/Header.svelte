<script lang="ts">
	import { browser } from '$app/environment';
	import { auth } from '$lib/stores/auth';
	import LoginModal from '$lib/components/LoginModal.svelte';

	let { data }: { data: Record<string, unknown> } = $props();

	const siteName    = $derived(typeof data?.siteName    === 'string' ? data.siteName    : 'PLITKA');
	const siteTagline = $derived(typeof data?.siteTagline === 'string' ? data.siteTagline : 'Интерьер & Дизайн');
	const phone       = $derived(typeof data?.phone       === 'string' ? data.phone       : '');

	const navLinks = $derived(
		Array.isArray(data?.links)
			? (data.links as { href: string; label: string }[])
			: [
				{ href: '/materials',   label: 'Материалы'  },
				{ href: '/collections', label: 'Коллекции'  },
				{ href: '/brands',      label: 'Бренды'     },
				{ href: '/services',    label: 'Услуги'     },
				{ href: '/contacts',    label: 'Контакты'   },
			]
	);

	let scrolled       = $state(false);
	let mobileMenuOpen = $state(false);
	let showLoginModal = $state(false);

	// localStorage counters
	let favoritesCount = $state(0);
	let compareCount   = $state(0);
	let cartCount      = $state(0);

	function updateCounts() {
		if (!browser) return;
		try { favoritesCount = JSON.parse(localStorage.getItem('plitka_favorites') ?? '[]').length; } catch { favoritesCount = 0; }
		try { compareCount   = JSON.parse(localStorage.getItem('plitka_compare')   ?? '[]').length; } catch { compareCount   = 0; }
		try {
			const ca = localStorage.getItem('plitka_cart');
			cartCount = ca ? (JSON.parse(ca) as { qty?: number }[]).reduce((s, i) => s + (i.qty ?? 1), 0) : 0;
		} catch { cartCount = 0; }
	}

	$effect(() => {
		updateCounts();
		if (browser) {
			window.addEventListener('plitka-storage-update', updateCounts);
			window.addEventListener('storage', updateCounts);
			return () => {
				window.removeEventListener('plitka-storage-update', updateCounts);
				window.removeEventListener('storage', updateCounts);
			};
		}
	});

	function handleScroll() { scrolled = window.scrollY > 50; }

	function toggleMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		if (browser) document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
	}

	function closeMenu() {
		mobileMenuOpen = false;
		if (browser) document.body.style.overflow = '';
	}

	function handleAuthClick() {
		if ($auth.isAuthenticated) { auth.logout(); } else { showLoginModal = true; }
	}
</script>

<svelte:window onscroll={handleScroll} />

<header
	class="fixed top-0 left-0 z-50 w-full transition-all duration-500 ease-out {scrolled
		? 'bg-surface-900/95 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl'
		: 'bg-transparent py-6'}"
>
	<div class="flex items-center justify-between px-10 lg:px-24 xl:px-32">
		<!-- Logo -->
		<a href="/" class="group flex items-center gap-3" onclick={closeMenu}>
			{#if data?.logoUrl}
				<img
					class="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
					src={String(data.logoUrl)}
					alt="Логотип {siteName}"
				/>
			{:else}
				<div
					class="flex size-10 items-center justify-center rounded-lg border border-accent-500/30 bg-accent-500/10 transition-all duration-300 group-hover:border-accent-500 group-hover:bg-accent-500/20"
				>
					<svg viewBox="0 0 24 24" class="size-5 fill-none stroke-accent-500 stroke-2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="3" width="8" height="8" rx="1" />
						<rect x="13" y="3" width="8" height="8" rx="1" />
						<rect x="3" y="13" width="8" height="8" rx="1" />
						<rect x="13" y="13" width="8" height="8" rx="1" />
					</svg>
				</div>
				<div>
					<span class="font-display text-xl font-bold tracking-wider text-surface-50 uppercase transition-colors group-hover:text-accent-500">
						{siteName}
					</span>
					<span class="block text-[10px] font-medium tracking-[0.3em] text-surface-300 uppercase">
						{siteTagline}
					</span>
				</div>
			{/if}
		</a>

		<!-- Desktop Nav -->
		<nav class="hidden items-center gap-1 lg:flex">
			{#each navLinks as link}
				<a
					href={link.href}
					class="group relative px-4 py-2 text-sm font-medium tracking-wide text-surface-300 transition-colors hover:text-surface-50"
				>
					{link.label}
					<span class="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-accent-500 transition-all duration-300 group-hover:w-3/4"></span>
				</a>
			{/each}
		</nav>

		<!-- Right actions -->
		<div class="hidden items-center gap-4 lg:flex">
			{#if phone}
				<a
					href="tel:{phone}"
					class="group flex items-center gap-2 rounded-lg border border-surface-600/50 bg-surface-800/40 px-4 py-2 text-sm font-medium tracking-wide text-surface-200 backdrop-blur-sm transition-all duration-300 hover:border-accent-500/50 hover:bg-surface-800/60 hover:text-white"
				>
					<svg viewBox="0 0 24 24" class="size-4 fill-none stroke-current stroke-2 transition-transform duration-300 group-hover:scale-110" stroke-linecap="round" stroke-linejoin="round">
						<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
					</svg>
					{phone}
				</a>
			{/if}

			<!-- Compare -->
			<a href="/compare" aria-label="Сравнение" class="group relative flex size-9 items-center justify-center rounded-lg border border-surface-600 bg-surface-800/60 text-surface-300 transition-all duration-300 hover:border-sky-500/40 hover:bg-sky-500/5 hover:text-sky-400">
				{#if compareCount > 0}
					<span class="absolute -top-1.5 -right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-sky-500 px-1 text-[9px] leading-none font-bold text-white shadow-sm ring-2 ring-surface-900">{compareCount}</span>
				{/if}
				<svg viewBox="0 0 24 24" class="size-4 fill-none stroke-current stroke-2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="18" rx="1" />
				</svg>
			</a>

			<!-- Favorites -->
			<a href="/favorites" aria-label="Избранное" class="group relative flex size-9 items-center justify-center rounded-lg border border-surface-600 bg-surface-800/60 text-surface-300 transition-all duration-300 hover:border-rose-500/40 hover:bg-rose-500/5 hover:text-rose-400">
				{#if favoritesCount > 0}
					<span class="absolute -top-1.5 -right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] leading-none font-bold text-white shadow-sm ring-2 ring-surface-900">{favoritesCount}</span>
				{/if}
				<svg viewBox="0 0 24 24" class="size-4 fill-none stroke-current stroke-2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
				</svg>
			</a>

			<!-- Cart -->
			<a href="/cart" aria-label="Корзина" class="group relative flex size-9 items-center justify-center rounded-lg border border-surface-600 bg-surface-800/60 text-surface-300 transition-all duration-300 hover:border-accent-500/50 hover:bg-accent-500/5 hover:text-accent-400">
				{#if cartCount > 0}
					<span class="absolute -top-1.5 -right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] leading-none font-bold text-surface-900 shadow-sm ring-2 ring-surface-900">{cartCount}</span>
				{/if}
				<svg viewBox="0 0 24 24" class="size-4 fill-none stroke-current stroke-2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
				</svg>
			</a>

			<!-- Auth -->
			<button
				type="button"
				onclick={handleAuthClick}
				class="text-xs tracking-wide text-surface-300 transition-colors hover:text-surface-50"
			>
				{$auth.isAuthenticated ? 'Выйти' : 'Войти'}
			</button>
		</div>

		<!-- Mobile burger -->
		<button
			onclick={toggleMenu}
			class="relative z-50 flex size-10 cursor-pointer flex-col items-center justify-center gap-1.5 border-none bg-transparent lg:hidden"
			aria-label="Меню"
		>
			<span class="block h-0.5 w-6 bg-surface-100 transition-all duration-300 {mobileMenuOpen ? 'translate-y-2 rotate-45' : ''}"></span>
			<span class="block h-0.5 w-6 bg-surface-100 transition-all duration-300 {mobileMenuOpen ? 'scale-x-0 opacity-0' : ''}"></span>
			<span class="block h-0.5 w-6 bg-surface-100 transition-all duration-300 {mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''}"></span>
		</button>
	</div>

	<!-- Mobile Menu Overlay -->
	{#if mobileMenuOpen}
		<div class="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-surface-900/98 backdrop-blur-2xl lg:hidden">
			{#each navLinks as link}
				<a
					href={link.href}
					onclick={closeMenu}
					class="font-display text-3xl font-bold tracking-wide text-surface-200 transition-colors hover:text-accent-500"
				>
					{link.label}
				</a>
			{/each}
			<div class="flex items-center gap-4">
				<a href="/compare" onclick={closeMenu} aria-label="Сравнение" class="group relative flex size-12 items-center justify-center rounded-xl border border-surface-600 bg-surface-800/60 text-surface-300 transition-all duration-300 hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-400">
					{#if compareCount > 0}<span class="absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-sky-500 px-1.5 text-[10px] leading-none font-bold text-white shadow-sm ring-2 ring-surface-900">{compareCount}</span>{/if}
					<svg viewBox="0 0 24 24" class="size-6 fill-none stroke-current stroke-2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="18" rx="1" /></svg>
				</a>
				<a href="/favorites" onclick={closeMenu} aria-label="Избранное" class="group relative flex size-12 items-center justify-center rounded-xl border border-surface-600 bg-surface-800/60 text-surface-300 transition-all duration-300 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400">
					{#if favoritesCount > 0}<span class="absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] leading-none font-bold text-white shadow-sm ring-2 ring-surface-900">{favoritesCount}</span>{/if}
					<svg viewBox="0 0 24 24" class="size-6 fill-none stroke-current stroke-2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
				</a>
				<a href="/cart" onclick={closeMenu} aria-label="Корзина" class="group relative flex size-12 items-center justify-center rounded-xl border border-surface-600 bg-surface-800/60 text-surface-300 transition-all duration-300 hover:border-accent-500/50 hover:bg-accent-500/10 hover:text-accent-400">
					{#if cartCount > 0}<span class="absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent-500 px-1.5 text-[10px] leading-none font-bold text-surface-900 shadow-sm ring-2 ring-surface-900">{cartCount}</span>{/if}
					<svg viewBox="0 0 24 24" class="size-6 fill-none stroke-current stroke-2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
				</a>
			</div>
			{#if phone}
				<a href="tel:{phone}" class="flex items-center gap-3 rounded-xl border border-surface-700/50 bg-black/20 px-6 py-3 text-lg font-medium text-surface-100 backdrop-blur-xl transition-all hover:bg-black/30 hover:text-accent-400">
					<svg viewBox="0 0 24 24" class="size-5 fill-none stroke-accent-500 stroke-2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
					</svg>
					{phone}
				</a>
			{/if}
			<button type="button" onclick={() => { handleAuthClick(); closeMenu(); }} class="text-sm text-surface-300 transition-colors hover:text-surface-50">
				{$auth.isAuthenticated ? 'Выйти' : 'Войти'}
			</button>
		</div>
	{/if}
</header>

{#if showLoginModal}
	<LoginModal onClose={() => (showLoginModal = false)} />
{/if}
