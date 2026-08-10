<script lang="ts">
	// Артикул: 1.М.1.3 — см. docs/architecture/component-articles-map.md
	import { page } from '$app/stores';
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import type { CatalogItem } from '../../catalogItems';
	import type { ServiceItem } from '../../serviceItems';

	type MenuItem = CatalogItem | ServiceItem;
	type MenuKind = 'catalog' | 'services';
	type ToggleHandler = (href: string, currentEnabled: boolean, event: Event) => void;

	// Вариант 3 меню (хэдер Promo-1) — светлый floating island с воздушным
	// editorial mega-menu. API совпадает с v1/v2: пункты, рубрики, услуги и
	// настройки их видимости по-прежнему приходят из Header.svelte.
	let {
		links = [],
		visibleCatalogItems = [],
		visibleServiceItems = [],
		disabledRubrics = [],
		disabledServices = [],
		isEditable = false,
		onToggleRubric,
		onToggleService
	}: {
		links: { href: string; label: string }[];
		visibleCatalogItems: CatalogItem[];
		visibleServiceItems: ServiceItem[];
		disabledRubrics: string[];
		disabledServices: string[];
		isEditable?: boolean;
		onToggleRubric: ToggleHandler;
		onToggleService: ToggleHandler;
	} = $props();

	let openMenu = $state<MenuKind | null>(null);
	let hoveredItem = $state<string | null>(null);

	const isCatalogActive = $derived(
		hoveredItem === 'catalog' ||
			(hoveredItem === null &&
				(openMenu === 'catalog' ||
					visibleCatalogItems.some((item) => $page.url.pathname.startsWith(item.href))))
	);

	const isServicesActive = $derived(
		hoveredItem === 'services' ||
			(hoveredItem === null &&
				(openMenu === 'services' ||
					visibleServiceItems.some((item) => $page.url.pathname === item.href)))
	);

	function isLinkActive(href: string) {
		return hoveredItem === href || (hoveredItem === null && $page.url.pathname === href);
	}

	function showMenu(kind: MenuKind) {
		openMenu = kind;
		hoveredItem = kind;
	}

	function hoverLink(href: string) {
		openMenu = null;
		hoveredItem = href;
	}

	function closeMenu() {
		openMenu = null;
		hoveredItem = null;
	}

	function handleFocusOut(event: FocusEvent) {
		const current = event.currentTarget;
		const next = event.relatedTarget;
		if (current instanceof HTMLElement && (!(next instanceof Node) || !current.contains(next))) {
			closeMenu();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeMenu();
		}
	}
</script>

{#snippet arrowIcon(className = 'h-4 w-4')}
	<svg
		class={className}
		fill="none"
		viewBox="0 0 20 20"
		stroke="currentColor"
		stroke-width="1.5"
		aria-hidden="true"
	>
		<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10h11m-4-4 4 4-4 4" />
	</svg>
{/snippet}

{#snippet dropdownTrigger(label: string, active: boolean, kind: MenuKind)}
	<button
		type="button"
		class="group relative flex items-center gap-1 rounded-full px-2 py-2 text-[10px] font-medium tracking-[-0.01em] transition-[color,background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] lg:gap-1.5 lg:px-3 lg:text-xs xl:px-4 xl:text-[13px] {active
			? 'bg-surface-raised text-alt-petrol-950 shadow-[0_8px_24px_-16px] shadow-alt-petrol-950/55'
			: 'text-alt-petrol-800 hover:bg-surface-raised/65 hover:text-alt-petrol-950'}"
		aria-expanded={openMenu === kind}
		aria-haspopup="true"
		onmouseenter={() => showMenu(kind)}
		onfocus={() => showMenu(kind)}
		onclick={() => (openMenu === kind ? closeMenu() : showMenu(kind))}
		onkeydown={handleKeydown}
	>
		<span>{label}</span>
		<span
			class="flex h-5 w-5 items-center justify-center rounded-full transition-[background-color,color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:h-6 lg:w-6 {active
				? 'bg-alt-petrol-accent-600/12 text-alt-petrol-accent-600'
				: 'bg-alt-petrol-950/5 text-alt-petrol-600 group-hover:bg-alt-petrol-accent-600/10 group-hover:text-alt-petrol-accent-600'}"
		>
			<svg
				class="h-3 w-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] {openMenu ===
				kind
					? 'rotate-180'
					: ''}"
				fill="none"
				viewBox="0 0 16 16"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m4 6 4 4 4-4" />
			</svg>
		</span>
	</button>
{/snippet}

{#snippet menuItem(
	item: MenuItem,
	index: number,
	isEnabled: boolean,
	isComingSoon: boolean,
	onToggle: ToggleHandler,
	hideTitle: string,
	showTitle: string
)}
	<div
		in:fly={{ y: 12, duration: 460, delay: 70 + index * 35, easing: quintOut }}
		class="group/item relative grid min-h-[88px] grid-cols-[1fr_auto] items-center border-b border-alt-petrol-950/8 transition-[background-color,opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] last:border-b-0 hover:bg-alt-petrol-50 {isEnabled
			? ''
			: 'opacity-48'}"
	>
		{#if isComingSoon}
			<div
				class="flex min-w-0 cursor-not-allowed items-center gap-3 px-4 py-4 lg:px-5"
				aria-disabled="true"
			>
				<span
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-alt-petrol-950/5 text-xs font-semibold text-alt-petrol-600"
				>
					{item.label.slice(0, 1)}
				</span>
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-sm font-semibold tracking-[-0.015em] text-alt-petrol-950"
							>{item.label}</span
						>
						<span
							class="rounded-full bg-alt-petrol-950/6 px-2 py-1 text-[8px] font-semibold tracking-[0.14em] text-alt-petrol-600 uppercase"
						>
							Скоро
						</span>
					</div>
					{#if item.desc}
						<p class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-alt-petrol-500">
							{item.desc}
						</p>
					{/if}
				</div>
			</div>
		{:else}
			<a
				href={item.href}
				class="flex min-w-0 items-center gap-3 px-4 py-4 outline-none lg:px-5"
				onclick={closeMenu}
				onkeydown={handleKeydown}
			>
				<span
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-alt-petrol-950/5 text-xs font-semibold text-alt-petrol-700 transition-[background-color,color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:scale-105 group-hover/item:bg-alt-petrol-accent-600/11 group-hover/item:text-alt-petrol-accent-600"
				>
					{item.label.slice(0, 1)}
				</span>
				<div class="min-w-0 flex-1">
					<span
						class="text-sm font-semibold tracking-[-0.015em] text-alt-petrol-950 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:text-alt-petrol-accent-600"
					>
						{item.label}
					</span>
					{#if item.desc}
						<p class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-alt-petrol-500">
							{item.desc}
						</p>
					{/if}
				</div>
				<span
					class="item:shadow-alt-petrol-accent-600/70 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-alt-petrol-700 shadow-[0_6px_18px_-12px] ring-1 shadow-alt-petrol-950/65 ring-alt-petrol-950/8 transition-[color,transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:translate-x-1 group-hover/item:text-alt-petrol-accent-600 group-hover/item:shadow-[0_10px_24px_-14px]"
				>
					{@render arrowIcon('h-3.5 w-3.5')}
				</span>
			</a>
		{/if}

		{#if isEditable && !isComingSoon}
			<div class="pr-3">
				<button
					type="button"
					onclick={(event) => onToggle(item.href, isEnabled, event)}
					onkeydown={handleKeydown}
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-[background-color,color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 {isEnabled
						? 'bg-alt-petrol-accent-600/10 text-alt-petrol-accent-600 ring-1 ring-alt-petrol-accent-600/20 hover:bg-alt-petrol-accent-600/16'
						: 'bg-alt-petrol-950/5 text-alt-petrol-400 ring-1 ring-alt-petrol-950/10 hover:bg-alt-petrol-950/9'}"
					title={isEnabled ? hideTitle : showTitle}
					aria-label={isEnabled ? hideTitle : showTitle}
				>
					<svg
						class="h-3.5 w-3.5"
						fill="none"
						viewBox="0 0 16 16"
						stroke="currentColor"
						stroke-width="1.5"
						aria-hidden="true"
					>
						{#if isEnabled}
							<path stroke-linecap="round" stroke-linejoin="round" d="m3 8 3 3 7-7" />
						{:else}
							<path stroke-linecap="round" d="M3 8h10" />
						{/if}
					</svg>
				</button>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet menuPanel(
	title: string,
	eyebrow: string,
	description: string,
	rootHref: string,
	items: MenuItem[],
	disabledPaths: string[],
	onToggle: ToggleHandler,
	hideTitle: string,
	showTitle: string
)}
	<div
		transition:fly={{ y: 14, duration: 440, easing: quintOut }}
		class="absolute top-full left-1/2 z-50 mt-4 w-[min(64.5rem,calc(100vw-2rem))] -translate-x-1/2 rounded-[2.15rem] bg-alt-petrol-200/85 p-1.5 shadow-[0_32px_90px_-38px] ring-1 shadow-alt-petrol-950/55 ring-alt-petrol-950/8 backdrop-blur-2xl"
		role="region"
		aria-label="{title} — разделы"
	>
		<div
			class="max-h-[min(34rem,calc(100dvh-7rem))] overflow-y-auto rounded-[calc(2.15rem-0.375rem)] bg-surface-raised shadow-[inset_0_1px_0] shadow-on-dark/95"
		>
			<div class="grid min-h-[22rem] grid-cols-[10.5rem_1fr] lg:grid-cols-[15rem_1fr]">
				<aside
					class="relative flex min-h-full flex-col justify-between overflow-hidden bg-alt-petrol-950 p-5 text-on-dark lg:p-7"
				>
					<div
						class="pointer-events-none absolute -right-20 -bottom-24 h-64 w-64 rounded-full border border-on-dark/8"
					></div>
					<div
						class="pointer-events-none absolute -right-8 -bottom-10 h-36 w-36 rounded-full border border-alt-petrol-accent-400/25"
					></div>
					<div
						class="pointer-events-none absolute right-10 bottom-8 h-2.5 w-2.5 rounded-full bg-alt-petrol-accent-400"
					></div>

					<div class="relative">
						<p
							class="text-[8px] font-semibold tracking-[0.24em] text-alt-petrol-accent-300 uppercase"
						>
							{eyebrow}
						</p>
						<h3
							class="p1-title-sub mt-5 text-[2rem] lg:text-[2.7rem]"
							style="font-family: 'Playfair Display', serif;"
						>
							{title}
						</h3>
						<p
							class="mt-5 max-w-[12rem] text-[10px] leading-relaxed text-on-dark/55 lg:text-[11px]"
						>
							{description}
						</p>
					</div>

					<a
						href={rootHref}
						class="group/all relative mt-10 flex items-center justify-between gap-3 border-t border-on-dark/12 pt-4 text-[10px] font-medium tracking-[0.04em] text-on-dark/75 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-on-dark"
						onclick={closeMenu}
						onkeydown={handleKeydown}
					>
						<span>Смотреть всё</span>
						<span
							class="flex h-7 w-7 items-center justify-center rounded-full bg-on-dark/9 text-on-dark transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/all:translate-x-1 group-hover/all:bg-on-dark/15"
						>
							{@render arrowIcon('h-3.5 w-3.5')}
						</span>
					</a>
				</aside>

				<section class="min-w-0 px-3 py-3 lg:px-5 lg:py-4">
					<header class="flex items-center justify-between gap-4 px-4 py-3 lg:px-5">
						<div>
							<p class="text-[9px] font-semibold tracking-[0.18em] text-alt-petrol-400 uppercase">
								Выберите направление
							</p>
							<p class="mt-1 text-xs text-alt-petrol-300">Все разделы в одном месте</p>
						</div>
						<span
							class="flex h-8 min-w-8 items-center justify-center rounded-full bg-alt-petrol-950/5 px-2 text-[10px] font-semibold text-alt-petrol-600"
							aria-label="Количество разделов"
						>
							{items.length}
						</span>
					</header>

					{#if items.length > 0}
						<div class="grid grid-cols-1 px-1 md:grid-cols-2 md:gap-x-3">
							{#each items as item, index}
								{@const isComingSoon = item.comingSoon === true}
								{@const isEnabled = !isComingSoon && !disabledPaths.includes(item.href)}
								{@render menuItem(
									item,
									index,
									isEnabled,
									isComingSoon,
									onToggle,
									hideTitle,
									showTitle
								)}
							{/each}
						</div>
					{:else}
						<div class="mx-4 mt-4 rounded-[1.5rem] bg-alt-petrol-50 px-6 py-10 text-center">
							<p class="text-sm font-semibold text-alt-petrol-900">Разделы пока не добавлены</p>
							<p class="mt-2 text-xs text-alt-petrol-400">Они появятся здесь после публикации.</p>
						</div>
					{/if}
				</section>
			</div>
		</div>
	</div>
{/snippet}

<div
	class="relative hidden sm:block"
	style="font-family: 'Outfit', sans-serif;"
	role="group"
	aria-label="Навигация с выпадающими разделами"
	onmouseleave={closeMenu}
	onfocusout={handleFocusOut}
>
	<div
		class="rounded-[1.45rem] bg-alt-petrol-100/80 p-1 shadow-[0_16px_46px_-30px] ring-1 shadow-alt-petrol-950/48 ring-alt-petrol-950/7 backdrop-blur-xl"
	>
		<nav
			class="flex items-center rounded-[calc(1.45rem-0.25rem)] bg-alt-petrol-50/92 p-0.5 shadow-[inset_0_1px_0] shadow-on-dark/95"
			aria-label="Основная навигация"
		>
			{#each links as link}
				{#if link.label === 'Услуги'}
					<div role="group" class="relative" onmouseenter={() => showMenu('services')}>
						{@render dropdownTrigger(link.label, isServicesActive, 'services')}
					</div>
				{:else if link.label === 'Каталог'}
					<div role="group" class="relative" onmouseenter={() => showMenu('catalog')}>
						{@render dropdownTrigger(link.label, isCatalogActive, 'catalog')}
					</div>
				{:else}
					<a
						href={link.href}
						class="relative flex items-center rounded-full px-2 py-2.5 text-[10px] font-medium tracking-[-0.01em] text-alt-petrol-800 transition-[color,background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none hover:bg-surface-raised/65 hover:text-alt-petrol-950 active:scale-[0.98] lg:px-3 lg:text-xs xl:px-4 xl:text-[13px] {isLinkActive(
							link.href
						)
							? 'bg-surface-raised text-alt-petrol-950 shadow-[0_8px_24px_-16px] shadow-alt-petrol-950/55'
							: ''}"
						onmouseenter={() => hoverLink(link.href)}
						onfocus={() => hoverLink(link.href)}
						onkeydown={handleKeydown}
						aria-current={isLinkActive(link.href) ? 'page' : undefined}
					>
						{link.label}
					</a>
				{/if}
			{/each}
		</nav>
	</div>

	{#if openMenu === 'services'}
		<div class="absolute top-full left-1/2 h-4 w-full -translate-x-1/2"></div>
		{@const servicesRoot = links.find((link) => link.label === 'Услуги')?.href ?? '/services'}
		{@render menuPanel(
			'Услуги',
			'От идеи до монтажа',
			'Сопровождаем проект на каждом этапе — спокойно, точно и с вниманием к деталям.',
			servicesRoot,
			visibleServiceItems,
			disabledServices,
			onToggleService,
			'Скрыть услугу',
			'Показать услугу'
		)}
	{:else if openMenu === 'catalog'}
		<div class="absolute top-full left-1/2 h-4 w-full -translate-x-1/2"></div>
		{@const catalogRoot = links.find((link) => link.label === 'Каталог')?.href ?? '/catalog'}
		{@render menuPanel(
			'Каталог',
			'Материалы и предметы',
			'Мебель, поверхности и детали, из которых складывается цельный интерьер.',
			catalogRoot,
			visibleCatalogItems,
			disabledRubrics,
			onToggleRubric,
			'Скрыть рубрику',
			'Показать рубрику'
		)}
	{/if}
</div>
