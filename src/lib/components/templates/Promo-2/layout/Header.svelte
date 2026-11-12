<script lang="ts">
	// Артикул: 2.М.1.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import RequestModal from '../forms/RequestModal.svelte';
	import { openPromo2Form, promo2Request } from '../forms/request';
	import { auth } from '$lib/stores/auth';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import HeaderSettings from './HeaderSettings.svelte';
	import type { EditContext } from '$lib/utils/page-edit';
	import { sitePhoneHref } from '$lib/utils/site-phone';
	import FavoritesLink from '../favorites/FavoritesLink.svelte';
	import TopBar from './TopBar/index.svelte';
	import { topBarPhone, topBarEmail, topBarLinks } from './top-bar';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const siteName = $derived(typeof data?.siteName === 'string' ? data.siteName : 'Фабрика');
	const showLogo = $derived(data?.logoMode !== 'text' && Boolean(data?.logoUrl));
	const phone = $derived(topBarPhone(data));
	const email = $derived(topBarEmail(data));
	const topLinks = $derived(topBarLinks(data));

	const mainNav = $derived(
		Array.isArray(data?.links)
			? (data.links as { href: string; label: string }[])
			: [
					{ href: '/', label: 'Главная' },
					{ href: '/kitchens', label: 'Кухни' },
					{ href: '/wardrobes', label: 'Шкафы' },
					{ href: '/actions', label: 'Акции' },
					{ href: '/showrooms', label: 'Салоны' }
				]
	);

	const ctaText = $derived(typeof data?.ctaText === 'string' ? data.ctaText : 'Записаться в салон');

	let scrolled = $state(false);
	let showTopBar = $state(true);
	let lastScrollY = $state(0);
	let mobileMenuOpen = $state(false);
	let menuButton: HTMLButtonElement;
	let showLoginModal = $state(false);
	let topBarHeight = $state(40);

	const HIDE_THRESHOLD = 60;
	const SHOW_THRESHOLD = 40;

	function handleScroll() {
		const currentScrollY = Math.max(0, window.scrollY);
		scrolled = currentScrollY > 50;

		if (currentScrollY <= 50) {
			showTopBar = true;
		} else if (currentScrollY > lastScrollY + HIDE_THRESHOLD) {
			showTopBar = false;
			lastScrollY = currentScrollY;
		} else if (currentScrollY < lastScrollY - SHOW_THRESHOLD) {
			showTopBar = true;
			lastScrollY = currentScrollY;
		}
	}

	function toggleMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
		}
	}

	function closeMenu() {
		mobileMenuOpen = false;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	}

	function handleAuthClick() {
		if ($auth.isAuthenticated) {
			auth.logout();
		} else {
			showLoginModal = true;
		}
	}
</script>

<svelte:window onscroll={handleScroll} />

<div
	class="promo2-header sticky top-0 z-50 flex w-full flex-col transition-transform duration-500"
	style="--top-bar-offset: {showTopBar || isEditable ? 0 : -topBarHeight}px;"
>
	<TopBar bind:data bind:height={topBarHeight} {editContext} {isEditable} />

	<!-- Main Header -->
	<header
		class="relative w-full transition-all duration-500 {scrolled
			? 'bg-white/95 shadow-soft backdrop-blur-lg'
			: 'border-b border-border-light bg-white'}"
	>
		<div class="absolute top-3 right-16 z-[100] lg:right-3">
			<HeaderSettings bind:data {editContext} {isEditable} />
		</div>
		<div
			class="p2-container mx-auto flex min-h-16 items-center justify-between gap-3 py-2 lg:grid lg:min-h-20 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6"
		>
			<!-- Logo -->
			<a href="/" class="group flex min-w-0 flex-1 items-center gap-3" onclick={closeMenu}>
				{#if showLogo}
					<ImageFallback
						imageRole="preview"
						class="h-12 w-auto max-w-44 object-contain object-left transition-transform duration-300 group-hover:scale-105 lg:h-16 lg:max-w-52"
						src={String(data.logoUrl ?? '')}
						alt="Логотип {siteName}"
					/>
				{:else}
					<span
						class="min-w-0 text-3xl leading-tight font-medium tracking-[0.2em] wrap-anywhere text-primary transition-colors duration-300 group-hover:text-secondary lg:max-w-xs lg:text-4xl"
						title={siteName}
						style="font-family: var(--font-heading);"
					>
						{siteName}
					</span>
				{/if}
			</a>

			<!-- Desktop Nav -->
			<nav class="hidden shrink-0 items-center gap-1 lg:flex">
				{#each mainNav as item}
					<a
						href={item.href}
						class="group relative rounded-sm px-3 py-2.5 text-lg tracking-wide text-primary transition-colors duration-300 hover:text-secondary xl:px-5"
						style="font-family: var(--font-heading);"
					>
						{item.label}
						<span
							class="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-secondary transition-all duration-500 group-hover:w-3/4"
						></span>
					</a>
				{/each}
			</nav>

			<!-- Header actions -->
			<div class="ml-auto flex shrink-0 items-center gap-3 lg:ml-0 lg:gap-4 lg:justify-self-end">
				<FavoritesLink onclick={closeMenu} />
				<button
					class="cta-btn group relative hidden items-center gap-2 overflow-hidden rounded-lg px-5 py-2.5 text-sm font-medium tracking-wide text-white shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98] lg:flex"
					type="button"
					data-metrika-goal="layout_header_showroom_open_1"
					data-goal-action="open"
					onclick={() => {
						closeMenu();
						if (!isEditable) openPromo2Form('showroom');
					}}
				>
					<span class="cta-shimmer"></span>
					<span class="relative z-10">{ctaText}</span>
					<svg
						class="relative z-10 h-3.5 w-3.5 shrink-0 opacity-70 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
						/>
					</svg>
				</button>
			</div>

			<!-- Mobile Burger -->
			<button
				class="relative z-50 flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 lg:hidden"
				bind:this={menuButton}
				onclick={toggleMenu}
				aria-label="Меню"
			>
				<span
					class="h-px w-6 bg-primary transition-all duration-300 {mobileMenuOpen
						? 'translate-y-[3.5px] rotate-45'
						: ''}"
				></span>
				<span
					class="h-px w-6 bg-primary transition-all duration-300 {mobileMenuOpen
						? 'opacity-0'
						: ''}"
				></span>
				<span
					class="h-px w-6 bg-primary transition-all duration-300 {mobileMenuOpen
						? '-translate-y-[3.5px] -rotate-45'
						: ''}"
				></span>
			</button>
		</div>
	</header>
</div>

<!-- Mobile Menu Overlay -->
{#if mobileMenuOpen}
	<div
		class="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
		onclick={closeMenu}
		role="presentation"
	></div>
{/if}

<!-- Mobile Menu Panel -->
<div
	class="fixed top-0 right-0 z-40 flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto bg-white pt-20 shadow-elevated transition-transform duration-500 lg:hidden {mobileMenuOpen
		? 'translate-x-0'
		: 'translate-x-full'}"
>
	<nav class="flex flex-col px-8 py-6">
		{#each mainNav as item}
			<a
				href={item.href}
				class="border-b border-border-light py-4 text-xl tracking-wide text-primary transition-colors duration-300 hover:text-secondary"
				style="font-family: var(--font-heading);"
				onclick={closeMenu}
			>
				{item.label}
			</a>
		{/each}
	</nav>

	<div class="mt-4 flex flex-col gap-3 px-8">
		{#each topLinks as link}
			<a
				href={link.href}
				class="text-sm text-secondary transition-colors duration-300 hover:text-primary"
				onclick={closeMenu}
			>
				{link.label}
			</a>
		{/each}
	</div>

	<div class="mt-auto px-8 pt-6 pb-4">
		<button
			class="cta-btn group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-lg px-5 py-3.5 text-sm font-medium tracking-wide text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
			type="button"
			data-metrika-goal="layout_header_showroom_open_2"
			data-goal-action="open"
			onclick={() => {
				closeMenu();
				menuButton.focus({ preventScroll: true });
				if (!isEditable) openPromo2Form('showroom');
			}}
		>
			<span class="cta-shimmer"></span>
			<span class="relative z-10">{ctaText}</span>
			<svg
				class="relative z-10 h-3.5 w-3.5 shrink-0 opacity-70 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
				/>
			</svg>
		</button>
	</div>

	<div class="border-t border-border-light px-8 py-6">
		<div class="flex flex-col gap-3">
			{#if phone}
				<a href={sitePhoneHref(phone)} class="flex items-center gap-2 text-sm text-secondary">
					<svg
						class="h-4 w-4 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
						/>
					</svg>
					{phone}
				</a>
			{/if}
			{#if email}
				<a href="mailto:{email}" class="flex items-center gap-2 text-sm text-secondary">
					<svg
						class="h-4 w-4 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
						/>
					</svg>
					{email}
				</a>
			{/if}
			<button
				data-metrika-goal="layout_header_open_2"
				data-goal-action="open"
				type="button"
				onclick={() => {
					handleAuthClick();
					closeMenu();
				}}
				class="flex items-center gap-2 text-sm text-secondary transition-colors duration-300 hover:text-primary"
			>
				{$auth.isAuthenticated ? 'Выйти' : 'Войти'}
			</button>
		</div>
	</div>
</div>

{#if showLoginModal}
	<LoginModal onClose={() => (showLoginModal = false)} />
{/if}

{#if $promo2Request && !isEditable}
	{#key $promo2Request}
		<RequestModal request={$promo2Request} />
	{/key}
{/if}

<style>
	@media (min-width: 1024px) {
		.promo2-header {
			transform: translateY(var(--top-bar-offset));
		}
	}

	.cta-btn {
		background: linear-gradient(135deg, #b8860b 0%, #8b6508 45%, #c9950c 100%);
		position: relative;
		box-shadow: 0 4px 15px rgba(184, 134, 11, 0.35);
	}

	.cta-btn:hover {
		background: linear-gradient(135deg, #c9950c 0%, #9a720a 45%, #daa520 100%);
		box-shadow: 0 6px 20px rgba(184, 134, 11, 0.5);
	}

	.cta-shimmer {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			105deg,
			transparent 30%,
			rgba(255, 255, 255, 0.25) 50%,
			transparent 70%
		);
		transform: translateX(-100%);
		transition: transform 0s;
		z-index: 1;
		pointer-events: none;
	}

	.cta-btn:hover .cta-shimmer {
		transform: translateX(100%);
		transition: transform 0.6s ease;
	}
</style>
