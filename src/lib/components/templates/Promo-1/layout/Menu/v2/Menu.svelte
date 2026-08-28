<script lang="ts">
	// Артикул: 1.М.1.2 — см. docs/architecture/component-articles-map.md
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import type { CatalogItem } from '../../catalogItems';
	import type { ServiceItem } from '../../serviceItems';

	// Вариант 2 меню (хэдер Promo-1) — премиальная навигация: пилюли-ссылки с мягким
	// hover'ом, mega-menu в «двойной оправе» (doppelrand), рассеянные тени, каскадное
	// появление пунктов и плавная моторика на кастомных кривых. API идентичен v1 —
	// данные и переключатели видимости приходят из Header.svelte пропсами.
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
		onToggleRubric: (href: string, currentEnabled: boolean, e: Event) => void;
		onToggleService: (href: string, currentEnabled: boolean, e: Event) => void;
	} = $props();

	let visibleServicesMenu = $state(false);
	let visibleCatalogMenu = $state(false);
	let hoveredItem = $state<string | null>(null);

	const isCatalogActive = $derived(
		hoveredItem === 'catalog' ||
			(hoveredItem === null &&
				(visibleCatalogMenu ||
					visibleCatalogItems.some((item) => $page.url.pathname.startsWith(item.href))))
	);

	const isServicesActive = $derived(
		hoveredItem === 'services' ||
			(hoveredItem === null &&
				(visibleServicesMenu ||
					visibleServiceItems.some((item) => $page.url.pathname === item.href)))
	);

	function isLinkActive(href: string) {
		return hoveredItem === href || (hoveredItem === null && $page.url.pathname === href);
	}
</script>

{#snippet renderIcon(name: string)}
	{#if name === 'chat'}
		<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
			/>
		</svg>
	{:else if name === 'design'}
		<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
			/>
		</svg>
	{:else if name === 'ruler'}
		<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
			/>
		</svg>
	{:else if name === 'project'}
		<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
			/>
		</svg>
	{:else if name === 'sofa'}
		<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M20 12V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4M4 12v6a2 2 0 002 2h2m10-8V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0v6a2 2 0 01-2 2h-2M4 12h16m-16 0v-2a2 2 0 012-2h12a2 2 0 012 2v2"
			/>
		</svg>
	{:else if name === 'surface'}
		<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M3 10h18M3 14h18m-9-4v8m-3-8v8m6-8v8M3 6h18a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z"
			/>
		</svg>
	{:else if name === 'fridge'}
		<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h4m-4 4h4"
			/>
		</svg>
	{:else if name === 'faucet'}
		<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
			/>
		</svg>
	{:else if name === 'hinge'}
		<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m12 12a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
			/>
		</svg>
	{:else if name === 'tiles'}
		<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
			/>
		</svg>
	{:else}
		<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
			/>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
		</svg>
	{/if}
{/snippet}

{#snippet megaItem(
	item: CatalogItem | ServiceItem,
	idx: number,
	isEnabled: boolean,
	isComingSoon: boolean,
	closeMenu: () => void,
	onToggle: (href: string, enabled: boolean, e: Event) => void,
	toggleTitleOn: string,
	toggleTitleOff: string
)}
	<div
		class="group/item relative flex items-center justify-between rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] {isComingSoon
			? 'cursor-not-allowed opacity-60'
			: 'hover:bg-ink-50'}"
		class:opacity-60={!isComingSoon && isEditable && !isEnabled}
		title={isComingSoon ? 'В разработке' : undefined}
		transition:fly={{ y: 12, duration: 420, delay: idx * 55, easing: expoOut }}
	>
		<a
			onclick={(e) => {
				if (isComingSoon) {
					e.preventDefault();
					return;
				}
				closeMenu();
			}}
			href={item.href}
			tabindex={isComingSoon ? -1 : undefined}
			aria-disabled={isComingSoon}
			class="flex flex-1 items-center gap-3.5 p-3 {isComingSoon ? 'pointer-events-none' : ''}"
			class:pointer-events-none={!isComingSoon && isEditable && !isEnabled}
		>
			<!-- Иконка в «двойной оправе» -->
			<span
				class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink-100/80 ring-1 ring-ink-900/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/item:bg-linear-to-br group-hover/item:from-link-500 group-hover/item:to-cat-4-500 group-hover/item:shadow-lg group-hover/item:shadow-link-500/25"
			>
				<span class="text-ink-500 transition-colors duration-500 group-hover/item:text-on-dark">
					{@render renderIcon(item.icon)}
				</span>
			</span>
			<span class="min-w-0 flex-1">
				<span class="flex items-center gap-2">
					<span
						class="text-[13px] font-semibold tracking-tight text-ink-900 transition-colors duration-300 group-hover/item:text-link-600"
					>
						{item.label}
					</span>
					{#if isEditable && !isEnabled && !isComingSoon}
						<span
							class="rounded bg-ink-200 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-ink-600 uppercase"
							>Откл.</span
						>
					{/if}
				</span>
				<span class="mt-0.5 block text-[11px] leading-snug text-ink-400">{item.desc}</span>
			</span>
			{#if !isEditable && !isComingSoon}
				<span
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-100/0 text-ink-300 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/item:translate-x-0.5 group-hover/item:bg-link-50 group-hover/item:text-link-500"
				>
					<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</span>
			{/if}
		</a>
		{#if isEditable}
			{#if isComingSoon}
				<div class="flex shrink-0 items-center pr-3" title="В разработке">
					<span
						class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cat-1-50 text-cat-1-600 ring-1 ring-cat-1-200/80"
						aria-hidden="true"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-2.791 2.697A6.98 6.98 0 0112 13.02a6.98 6.98 0 01-3.02-1.046m2.791 2.697L9.75 21"
							/>
						</svg>
					</span>
				</div>
			{:else}
				<div class="flex items-center pr-3">
					<button
						type="button"
						onclick={(e) => onToggle(item.href, isEnabled, e)}
						class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-link-500 focus:ring-offset-2 focus:outline-none {isEnabled
							? 'bg-link-500'
							: 'bg-ink-300'}"
						title={isEnabled ? toggleTitleOn : toggleTitleOff}
					>
						<span
							class="pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-surface-raised shadow-sm ring-0 transition duration-200 ease-in-out {isEnabled
								? 'translate-x-4'
								: 'translate-x-0'}"
						></span>
					</button>
				</div>
			{/if}
		{/if}
	</div>
{/snippet}

{#snippet dropdownTrigger(label: string, active: boolean, open: boolean)}
	<button
		type="button"
		class="group relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold tracking-wide transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] {active
			? 'bg-link-50 text-link-600'
			: 'text-ink-600 hover:bg-ink-900/4 hover:text-ink-900'}"
		aria-expanded={open}
	>
		<span>{label}</span>
		<svg
			class="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] {open
				? 'rotate-180 text-link-500'
				: 'text-ink-400'}"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>
{/snippet}

<nav class="hidden items-center gap-1 lg:flex">
	{#each links as link}
		{#if link.label === 'Услуги'}
			<div
				role="group"
				class="relative flex h-full items-center"
				onmouseenter={() => {
					visibleServicesMenu = true;
					hoveredItem = 'services';
				}}
				onmouseleave={() => {
					visibleServicesMenu = false;
					hoveredItem = null;
				}}
			>
				{@render dropdownTrigger(link.label, isServicesActive, visibleServicesMenu)}

				{#if visibleServicesMenu}
					<div class="absolute top-full left-1/2 h-4 w-full -translate-x-1/2"></div>
					<!-- Двойная оправа: внешняя «алюминиевая» подложка + внутренняя белая карта -->
					<div
						transition:fly={{ y: 14, duration: 460, easing: expoOut }}
						class="absolute top-full left-1/2 z-50 mt-4 w-88 -translate-x-1/2 rounded-[1.75rem] bg-ink-100/70 p-1.5 shadow-[0_28px_70px_-24px] ring-1 shadow-ink-900/45 ring-ink-900/5 backdrop-blur-2xl"
					>
						<div
							class="rounded-[calc(1.75rem-0.375rem)] bg-surface-raised/95 p-2 shadow-[inset_0_1px_1px] ring-1 shadow-on-dark/60 ring-ink-900/3"
						>
							<div class="mb-1 flex items-center justify-between px-3 pt-2 pb-1">
								<span class="text-[10px] font-bold tracking-[0.22em] text-ink-400 uppercase"
									>Услуги</span
								>
								<span class="ml-3 h-px flex-1 bg-linear-to-r from-ink-200 to-transparent"></span>
							</div>
							{#each visibleServiceItems as service, idx}
								{@const isComingSoon = service.comingSoon === true}
								{@const isEnabled = !isComingSoon && !disabledServices.includes(service.href)}
								{@render megaItem(
									service,
									idx,
									isEnabled,
									isComingSoon,
									() => (visibleServicesMenu = false),
									onToggleService,
									'Скрыть услугу',
									'Показать услугу'
								)}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{:else if link.label === 'Каталог'}
			<div
				role="group"
				class="relative flex h-full items-center"
				onmouseenter={() => {
					visibleCatalogMenu = true;
					hoveredItem = 'catalog';
				}}
				onmouseleave={() => {
					visibleCatalogMenu = false;
					hoveredItem = null;
				}}
			>
				{@render dropdownTrigger(link.label, isCatalogActive, visibleCatalogMenu)}

				{#if visibleCatalogMenu}
					<div class="absolute top-full left-1/2 h-4 w-full -translate-x-1/2"></div>
					<div
						transition:fly={{ y: 14, duration: 460, easing: expoOut }}
						class="absolute top-full left-1/2 z-50 mt-4 w-88 -translate-x-1/2 rounded-[1.75rem] bg-ink-100/70 p-1.5 shadow-[0_28px_70px_-24px] ring-1 shadow-ink-900/45 ring-ink-900/5 backdrop-blur-2xl"
					>
						<div
							class="rounded-[calc(1.75rem-0.375rem)] bg-surface-raised/95 p-2 shadow-[inset_0_1px_1px] ring-1 shadow-on-dark/60 ring-ink-900/3"
						>
							<div class="mb-1 flex items-center justify-between px-3 pt-2 pb-1">
								<span class="text-[10px] font-bold tracking-[0.22em] text-ink-400 uppercase"
									>Каталог</span
								>
								<span class="ml-3 h-px flex-1 bg-linear-to-r from-ink-200 to-transparent"></span>
							</div>
							{#each visibleCatalogItems as item, idx}
								{@const isComingSoon = item.comingSoon === true}
								{@const isEnabled = !isComingSoon && !disabledRubrics.includes(item.href)}
								{@render megaItem(
									item,
									idx,
									isEnabled,
									isComingSoon,
									() => (visibleCatalogMenu = false),
									onToggleRubric,
									'Скрыть рубрику',
									'Показать рубрику'
								)}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<a
				href={link.href}
				class="relative rounded-full px-4 py-2 text-[13px] font-semibold tracking-wide transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] {isLinkActive(
					link.href
				)
					? 'bg-link-50 text-link-600'
					: 'text-ink-600 hover:bg-ink-900/4 hover:text-ink-900'}"
				onmouseenter={() => (hoveredItem = link.href)}
				onmouseleave={() => (hoveredItem = null)}
			>
				{link.label}
			</a>
		{/if}
	{/each}
</nav>
