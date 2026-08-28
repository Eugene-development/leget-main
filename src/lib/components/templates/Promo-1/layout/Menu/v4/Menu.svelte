<script lang="ts">
	// Артикул: 1.М.1.4 — см. docs/architecture/component-articles-map.md
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { createMenuMotion } from '../motion.svelte';
	import { iconPath } from '../icons';
	import type { CatalogItem } from '../../catalogItems';
	import type { ServiceItem } from '../../serviceItems';
	import '../../../theme.css';

	// Вариант 4 меню (хэдер Promo-1) — полка каталога.
	//
	// Решение другое, а не отделка v1: каталог перестаёт быть колонкой в 320px
	// и разворачивается полкой во всю меру контента — рубрики идут решёткой,
	// полка начинается ровно под липким хромом и тянется через всю страницу.
	// «Услуги» остаются узкой колонкой: их шесть, и в решётку они не просятся.
	// Иконка рубрики здесь несущая, а не декоративная — в решётке она работает
	// якорем строки, тогда как v1 сознательно снимает её ради лестницы текста.
	//
	// API идентичен v1…v3: данные и переключатели видимости приходят из
	// Header.svelte пропсами, контракт данных общий.
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

	type MenuKind = 'catalog' | 'services';
	type ToggleHandler = (href: string, currentEnabled: boolean, e: Event) => void;

	let openMenu = $state<MenuKind | null>(null);
	let openedBy = $state<'hover' | 'intent' | null>(null);
	// Курсор, оставшийся на пункте после закрытия, не должен открывать меню
	// заново: иначе ни Escape, ни повторный клик не закрывают ничего.
	let hoverSuppressed = $state(false);
	let hoveredItem = $state<string | null>(null);
	// Длительность и шаг каскада принадлежат токенному слою, а `transition:fly`
	// берёт их числом из JS — мост общий для всех вариантов меню.
	const motion = createMenuMotion();
	let rootEl = $state<HTMLElement | null>(null);
	let catalogGroupEl = $state<HTMLElement | null>(null);
	const triggerEls: Partial<Record<MenuKind, HTMLButtonElement>> = {};

	/**
	 * Верх полки и высота моста от низа пункта до низа шапки.
	 *
	 * Привязать полку к низу липкого хрома у шаблона нечем, и обе очевидные
	 * попытки промахиваются мимо места — обе из-за содержащего блока:
	 *
	 *   · `fixed` + `top: <низ шапки в координатах окна>` — мимо на 46px
	 *     (высоту баннера). У шапки стоит `backdrop-blur`, а `backdrop-filter`
	 *     создаёт содержащий блок для потомков с `position: fixed`, то есть
	 *     `fixed` здесь отсчитывается от шапки, а не от окна;
	 *   · `absolute top-full` — мимо на 32px. `top: 100%` берётся от ближайшего
	 *     ПОЗИЦИОНИРОВАННОГО предка, а это не шапка: внутри неё есть своя
	 *     `relative`-обёртка, и сотня процентов считается от её высоты.
	 *
	 * Поэтому смещение считается от фактического `offsetParent` полки — он и
	 * есть тот самый содержащий блок, каким бы он ни оказался. Обе величины —
	 * РАЗНИЦЫ прямоугольников в координатах окна, и от выбора содержащего блока
	 * не зависят. Это находка прогона, а не решение блока: роли «поверхность,
	 * привязанная к низу липкого хрома» у шаблона нет.
	 */
	let shelfTop = $state(0);
	let bridgeH = $state(0);

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

	/**
	 * Действие на самой полке, а не `$effect` рядом с ней.
	 *
	 * Эффект здесь не работал: он читает элемент, который сам же и позиционирует,
	 * и на монтировании панели успевал отработать до того, как `bind:this`
	 * присвоит узел, — замер не запускался ни разу, `top` оставался нулём.
	 * Действие получает узел параметром, то есть от порядка присваивания
	 * не зависит вовсе.
	 */
	function shelfAnchor(node: HTMLElement) {
		const header = rootEl?.closest('header') ?? null;
		const anchor = node.offsetParent as HTMLElement | null;

		const measure = () => {
			if (!header) return;
			const headerBottom = header.getBoundingClientRect().bottom;
			if (anchor) shelfTop = Math.round(headerBottom - anchor.getBoundingClientRect().top);
			if (catalogGroupEl) {
				bridgeH = Math.max(
					0,
					Math.round(headerBottom - catalogGroupEl.getBoundingClientRect().bottom)
				);
			}
		};

		// Первый замер — синхронно. На подписку ResizeObserver зовёт колбэк
		// не сразу, а следующим кадром, и полагаться на это нельзя: там, где
		// кадры дросселируются, полка так и осталась бы с `top: 0`.
		measure();

		const ro = new ResizeObserver(measure);
		if (header) ro.observe(header);
		if (anchor) ro.observe(anchor);
		window.addEventListener('scroll', measure, { passive: true });

		return {
			destroy() {
				ro.disconnect();
				window.removeEventListener('scroll', measure);
			}
		};
	}

	function toggle(kind: MenuKind) {
		if (openMenu === kind && openedBy === 'intent') {
			close();
			return;
		}
		openMenu = kind;
		openedBy = 'intent';
	}

	function openByHover(kind: MenuKind) {
		if (openedBy === 'intent' || hoverSuppressed) return;
		openMenu = kind;
		openedBy = 'hover';
		hoveredItem = kind;
	}

	function closeByHover() {
		hoverSuppressed = false;
		if (openedBy === 'intent') return;
		openMenu = null;
		openedBy = null;
		hoveredItem = null;
	}

	function close(refocus: MenuKind | null = null) {
		openMenu = null;
		openedBy = null;
		hoveredItem = null;
		hoverSuppressed = true;
		if (refocus) triggerEls[refocus]?.focus();
	}

	function onTriggerKeydown(e: KeyboardEvent, kind: MenuKind) {
		if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openMenu = kind;
			openedBy = 'intent';
		} else if (e.key === 'Escape') {
			close(kind);
		}
	}

	$effect(() => {
		if (!openMenu) return;
		const opened = openMenu;
		const onPointerDown = (e: PointerEvent) => {
			if (rootEl && !rootEl.contains(e.target as Node)) close();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close(opened);
		};
		window.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('keydown', onKey);
		return () => {
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

{#snippet icon(name: string, size: string)}
	<svg
		class="{size} shrink-0 [stroke-width:var(--ds-icon-stroke)]"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		aria-hidden="true"
	>
		<path stroke-linecap="round" stroke-linejoin="round" d={iconPath(name)} />
	</svg>
{/snippet}

{#snippet visibilityToggle(
	href: string,
	isEnabled: boolean,
	onToggle: ToggleHandler,
	unitLabel: string
)}
	<button
		type="button"
		onclick={(e) => onToggle(href, isEnabled, e)}
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
{/snippet}

<!-- Ячейка решётки: иконка-якорь, под ней лестница «рубрика → пояснение». -->
{#snippet shelfCell(item: CatalogItem, idx: number)}
	{@const isComingSoon = item.comingSoon === true}
	{@const isEnabled = !isComingSoon && !disabledRubrics.includes(item.href)}
	<div
		class="p1-overlay flex items-start justify-between gap-3 px-5 py-5"
		class:opacity-50={isComingSoon || (isEditable && !isEnabled)}
		title={isComingSoon ? 'В разработке' : undefined}
		in:fly={{ y: -5, duration: motion.enterDuration, delay: motion.enterDelay(idx) }}
	>
		<a
			href={item.href}
			onclick={(e) => {
				if (isComingSoon) {
					e.preventDefault();
					return;
				}
				close();
			}}
			tabindex={isComingSoon ? -1 : undefined}
			aria-disabled={isComingSoon}
			class="p1-title flex flex-1 flex-col gap-1.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {isComingSoon
				? 'pointer-events-none'
				: 'p1-accent-hover'}"
			class:pointer-events-none={!isComingSoon && isEditable && !isEnabled}
		>
			{@render icon(item.icon, 'h-6 w-6')}
			<span class="mt-1 text-base font-semibold">{item.label}</span>
			{#if item.desc}
				<span class="p1-note p1-muted">{item.desc}</span>
			{/if}
			{#if isComingSoon}
				<span class="p1-label p1-muted mt-1">скоро</span>
			{:else if isEditable && !isEnabled}
				<span class="p1-label p1-muted mt-1">откл</span>
			{/if}
		</a>
		{#if isEditable && !isComingSoon}
			{@render visibilityToggle(item.href, isEnabled, onToggleRubric, 'рубрика')}
		{/if}
	</div>
{/snippet}

<!-- Узкая колонка услуг: строкой, иконка слева. -->
{#snippet serviceRow(service: ServiceItem, idx: number)}
	{@const isComingSoon = service.comingSoon === true}
	{@const isEnabled = !isComingSoon && !disabledServices.includes(service.href)}
	<div
		class="p1-overlay flex w-full items-stretch justify-between"
		class:opacity-50={isComingSoon || (isEditable && !isEnabled)}
		title={isComingSoon ? 'В разработке' : undefined}
		in:fly={{ y: -5, duration: motion.enterDuration, delay: motion.enterDelay(idx) }}
	>
		<a
			href={service.href}
			onclick={(e) => {
				if (isComingSoon) {
					e.preventDefault();
					return;
				}
				close();
			}}
			tabindex={isComingSoon ? -1 : undefined}
			aria-disabled={isComingSoon}
			class="p1-title flex flex-1 items-start gap-3 px-5 py-3 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {isComingSoon
				? 'pointer-events-none'
				: 'p1-accent-hover'}"
			class:pointer-events-none={!isComingSoon && isEditable && !isEnabled}
		>
			<span class="mt-0.5">{@render icon(service.icon, 'h-5 w-5')}</span>
			<span class="flex flex-col gap-0.5">
				<span class="text-sm font-semibold">{service.label}</span>
				{#if service.desc}
					<span class="p1-note p1-muted">{service.desc}</span>
				{/if}
			</span>
		</a>
		{#if isEditable}
			<div class="flex items-center pr-4">
				{#if isComingSoon}
					<span class="p1-label p1-muted">скоро</span>
				{:else}
					{@render visibilityToggle(service.href, isEnabled, onToggleService, 'услуга')}
				{/if}
			</div>
		{/if}
	</div>
{/snippet}

{#snippet trigger(label: string, kind: MenuKind, active: boolean)}
	<button
		bind:this={triggerEls[kind]}
		type="button"
		onclick={() => toggle(kind)}
		onkeydown={(e) => onTriggerKeydown(e, kind)}
		class="p1-label p1-accent-hover group relative flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {active
			? 'p1-accent'
			: 'p1-body'}"
		aria-expanded={openMenu === kind}
		aria-controls="menu-panel-{kind}"
		aria-haspopup="true"
	>
		<span>{label}</span>
		<svg
			class="h-3 w-3 [stroke-width:var(--ds-icon-stroke-bold)] transition-transform {openMenu ===
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
		<span
			class="p1-accent-bg absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform"
			class:scale-x-100={active}
		></span>
	</button>
{/snippet}

<!--
	Тема объявлена на корне навигации, а не на панелях: роли `p1-*` берут значения
	из ближайшего `[data-p1-theme]`, и без него `color: var(--p1-body)` становится
	невалидным и наследуется от родителя. Значение зашито в `light` — шапка стоит
	на `--ds-surface-raised`, светлом во всех пяти системах. У layout-компонентов
	входа под тему нет; подробнее — в DESIGN.md → Components → Navigation.
-->
<nav bind:this={rootEl} data-p1-theme="light" class="hidden items-center gap-7 lg:flex">
	{#each links as link}
		{#if link.label === 'Услуги'}
			<div
				role="group"
				class="relative flex h-full items-center"
				onmouseenter={() => openByHover('services')}
				onmouseleave={closeByHover}
			>
				{@render trigger(link.label, 'services', isServicesActive)}
				{#if openMenu === 'services'}
					<div class="absolute top-full left-1/2 h-4 w-full -translate-x-1/2"></div>
					<div
						id="menu-panel-services"
						transition:fly={{ y: -6, duration: motion.enterDuration }}
						class="p1-border absolute top-full left-1/2 z-50 mt-4 grid w-88 -translate-x-1/2 grid-cols-1 gap-px overflow-hidden rounded-2xl border bg-[var(--p1-line)]"
					>
						{#each visibleServiceItems as service, idx (service.href)}
							{@render serviceRow(service, idx)}
						{/each}
					</div>
				{/if}
			</div>
		{:else if link.label === 'Каталог'}
			<div
				bind:this={catalogGroupEl}
				role="group"
				class="flex h-full items-center"
				onmouseenter={() => openByHover('catalog')}
				onmouseleave={closeByHover}
			>
				<div class="relative flex h-full items-center">
					{@render trigger(link.label, 'catalog', isCatalogActive)}
					{#if openMenu === 'catalog'}
						<!-- Мост от низа пункта до низа шапки: без него курсор, идущий
						     к полке, покидает группу и меню закрывается. -->
						<div
							class="absolute top-full left-1/2 z-40 w-screen -translate-x-1/2"
							style="height: {bridgeH}px"
						></div>
					{/if}
				</div>
				{#if openMenu === 'catalog'}
					<div
						use:shelfAnchor
						id="menu-panel-catalog"
						transition:fly={{ y: -8, duration: motion.enterDuration }}
						style="top: {shelfTop}px"
						class="p1-border absolute left-1/2 z-50 w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-b-2xl border border-t-0 bg-[var(--p1-line)]"
					>
						<!--
							Решётка играет линией зазор `gap-px`: контейнер залит цветом
							разделителя, ячейки — подложкой оверлея. Приём взят у `Brands/v1`
							и описан в theme.css как осознанное исключение из «линия — это
							граница»: на одну, две и три колонки он работает одинаково,
							а лишних кромок по краю полки не оставляет.
						-->
						<div class="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
							{#each visibleCatalogItems as item, idx (item.href)}
								{@render shelfCell(item, idx)}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<a
				href={link.href}
				class="p1-label p1-accent-hover group relative rounded-md px-2 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {isLinkActive(
					link.href
				)
					? 'p1-accent'
					: 'p1-body'}"
				onmouseenter={() => (hoveredItem = link.href)}
				onmouseleave={() => (hoveredItem = null)}
			>
				<span>{link.label}</span>
				<span
					class="p1-accent-bg absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform"
					class:scale-x-100={isLinkActive(link.href)}
				></span>
			</a>
		{/if}
	{/each}
</nav>
