<script lang="ts">
	// Мобильная половина версии 1.М.1.1 — см. ./Menu.svelte и ../Mobile.svelte
	import { page } from '$app/stores';
	import { fly, slide } from 'svelte/transition';
	import { uiStore } from '$lib/stores/ui.svelte';
	import { cityStore } from '$lib/stores/city.svelte';
	import { createMenuMotion } from '../motion.svelte';
	import type { CatalogItem } from '../../catalogItems';
	import type { ServiceItem } from '../../serviceItems';
	import '../../../theme.css';

	// Вариант 1 мобильного меню — тихая навигация, та же, что на десктопе.
	//
	// Форма. Декора нет: ни плиток-иконок, ни шевронов у обычных пунктов. Пункт
	// несёт типографическая лестница «рубрика → пояснение», состояние —
	// волосяной рельс слева и акцент на заголовке. Панель стоит на роли
	// `p1-overlay`, а не на абсолютном `bg-surface-raised`: до выноса мобильное
	// меню было единственной частью хэдера вовсе вне темы шаблона.
	//
	// Раскрытие рубрик и услуг — гармошкой, а не выпадающей панелью: на узком
	// экране панели некуда всплывать. Открытым стартует раздел, внутри которого
	// стоит текущий адрес, — иначе с любой страницы каталога меню открывается
	// схлопнутым и путь до соседней рубрики становится в два касания длиннее.
	let {
		links = [],
		visibleCatalogItems = [],
		visibleServiceItems = [],
		disabledRubrics = [],
		disabledServices = [],
		cities = [],
		isEditable = false,
		onToggleRubric,
		onToggleService
	}: {
		links: { href: string; label: string }[];
		visibleCatalogItems: CatalogItem[];
		visibleServiceItems: ServiceItem[];
		disabledRubrics: string[];
		disabledServices: string[];
		cities: { label: string }[];
		isEditable?: boolean;
		onToggleRubric: (href: string, currentEnabled: boolean, e: Event) => void;
		onToggleService: (href: string, currentEnabled: boolean, e: Event) => void;
	} = $props();

	type MenuKind = 'catalog' | 'services';
	type ToggleHandler = (href: string, currentEnabled: boolean, e: Event) => void;

	const motion = createMenuMotion();

	const initialSection = (): MenuKind | null => {
		const path = $page.url.pathname;
		if (visibleCatalogItems.some((item) => path.startsWith(item.href))) return 'catalog';
		if (visibleServiceItems.some((item) => path === item.href)) return 'services';
		return null;
	};

	let openSection = $state<MenuKind | null>(initialSection());

	function toggleSection(kind: MenuKind) {
		openSection = openSection === kind ? null : kind;
	}

	const isLinkActive = (href: string) => $page.url.pathname === href;
	const isSectionActive = (kind: MenuKind) =>
		kind === 'catalog'
			? visibleCatalogItems.some((item) => $page.url.pathname.startsWith(item.href))
			: visibleServiceItems.some((item) => $page.url.pathname === item.href);
</script>

<!-- Строка раздела: та же лестница «рубрика → пояснение», что в панели десктопа. -->
{#snippet sectionItem(
	item: CatalogItem | ServiceItem,
	idx: number,
	disabled: string[],
	onToggle: ToggleHandler,
	unitLabel: string
)}
	{@const isComingSoon = item.comingSoon === true}
	{@const isEnabled = !isComingSoon && !disabled.includes(item.href)}
	<div
		class="p1-line flex w-full items-stretch justify-between border-t"
		class:opacity-50={isComingSoon || (isEditable && !isEnabled)}
		title={isComingSoon ? 'В разработке' : undefined}
		in:fly={{ y: -4, duration: motion.enterDuration, delay: motion.enterDelay(idx) }}
	>
		<a
			href={item.href}
			onclick={(e) => {
				if (isComingSoon) {
					e.preventDefault();
					return;
				}
				uiStore.closeMenu();
			}}
			tabindex={isComingSoon ? -1 : undefined}
			aria-disabled={isComingSoon}
			aria-current={isLinkActive(item.href) ? 'page' : undefined}
			class="p1-title flex flex-1 flex-col gap-0.5 border-l-2 py-3 pr-3 pl-5 transition-[color,border-color] focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {isComingSoon
				? 'pointer-events-none'
				: 'p1-accent-hover p1-accent-border-hover'} {isLinkActive(item.href)
				? 'p1-accent border-[var(--p1-accent)]'
				: 'p1-line'}"
			class:pointer-events-none={!isComingSoon && isEditable && !isEnabled}
		>
			<span class="text-[0.9375rem] font-semibold">
				{item.label}
				{#if isEditable && !isEnabled && !isComingSoon}
					<span class="p1-label p1-muted ml-1.5 align-middle">откл</span>
				{/if}
			</span>
			{#if item.desc}
				<span class="p1-note p1-muted">{item.desc}</span>
			{/if}
		</a>

		{#if isEditable}
			<div class="flex items-center pr-4">
				{#if isComingSoon}
					<span class="p1-label p1-muted">скоро</span>
				{:else}
					<button
						type="button"
						onclick={(e) => onToggle(item.href, isEnabled, e)}
						class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:ring-offset-2 focus-visible:outline-none {isEnabled
							? 'p1-accent-bg'
							: 'bg-[var(--p1-line)]'}"
						title={isEnabled ? `Скрыть: ${unitLabel}` : `Показать: ${unitLabel}`}
					>
						<span
							class="p1-surface pointer-events-none relative inline-block h-4 w-4 rounded-full shadow-sm transition-transform {isEnabled
								? 'translate-x-4'
								: 'translate-x-0'}"
						></span>
					</button>
				{/if}
			</div>
		{/if}
	</div>
{/snippet}

{#snippet section(
	label: string,
	kind: MenuKind,
	items: (CatalogItem | ServiceItem)[],
	disabled: string[],
	onToggle: ToggleHandler,
	unitLabel: string
)}
	{@const active = openSection === kind || isSectionActive(kind)}
	<div class="p1-line border-t">
		<button
			type="button"
			onclick={() => toggleSection(kind)}
			class="p1-label flex w-full items-center justify-between border-l-2 py-3.5 pr-4 pl-5 text-left transition-[color,border-color] focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {active
				? 'p1-accent border-[var(--p1-accent)]'
				: 'p1-body p1-line'}"
			aria-expanded={openSection === kind}
			aria-controls="mobile-menu-{kind}"
		>
			<span>{label}</span>
			<svg
				class="h-3 w-3 [stroke-width:var(--ds-icon-stroke-bold)] transition-transform {openSection ===
				kind
					? 'rotate-180'
					: ''}"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if openSection === kind}
			<div id="mobile-menu-{kind}" transition:slide={{ duration: motion.enterDuration }}>
				{#each items as item, idx (item.href)}
					{@render sectionItem(item, idx, disabled, onToggle, unitLabel)}
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

<!--
	Тема объявлена на корне меню, а не на строках: роли `p1-*` берут значения из
	ближайшего `[data-p1-theme]`, и без него `color: var(--p1-body)` не «падает на
	дефолт», а становится невалидным и наследуется от родителя. Значение зашито
	в `light` по той же причине и с той же оговоркой, что у десктопной половины:
	меню стоит на `--ds-surface-raised`, светлом во всех пяти системах, а входа
	под тему у layout-компонентов нет.
-->
{#if uiStore.menuOpen}
	<nav
		data-p1-theme="light"
		class="p1-overlay p1-line max-h-[70dvh] overflow-y-auto border-t sm:hidden"
		aria-label="Мобильная навигация"
	>
		{#each links as link}
			{#if link.label === 'Услуги'}
				{@render section(
					link.label,
					'services',
					visibleServiceItems,
					disabledServices,
					onToggleService,
					'услуга'
				)}
			{:else if link.label === 'Каталог'}
				{@render section(
					link.label,
					'catalog',
					visibleCatalogItems,
					disabledRubrics,
					onToggleRubric,
					'рубрика'
				)}
			{:else}
				<a
					href={link.href}
					onclick={() => uiStore.closeMenu()}
					aria-current={isLinkActive(link.href) ? 'page' : undefined}
					class="p1-label p1-accent-hover p1-accent-border-hover p1-line block border-t border-l-2 py-3.5 pr-4 pl-5 transition-[color,border-color] focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {isLinkActive(
						link.href
					)
						? 'p1-accent border-l-[var(--p1-accent)]'
						: 'p1-body'}"
				>
					{link.label}
				</a>
			{/if}
		{/each}

		<!-- Город: тем же способом, что пункты, — строкой, а не чипами. -->
		<div class="p1-line border-t px-5 py-4">
			<span class="p1-label p1-muted">Город</span>
			<div class="mt-2 flex flex-col">
				{#each cities as city}
					<button
						type="button"
						onclick={() => cityStore.set(city.label)}
						class="p1-accent-hover flex items-center justify-between py-1.5 text-left text-[0.9375rem] transition-colors {cityStore.city ===
						city.label
							? 'p1-accent'
							: 'p1-body'}"
						aria-pressed={cityStore.city === city.label}
					>
						<span>{city.label}</span>
						{#if cityStore.city === city.label}
							<span class="p1-accent-bg h-px w-6" aria-hidden="true"></span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</nav>
{/if}
