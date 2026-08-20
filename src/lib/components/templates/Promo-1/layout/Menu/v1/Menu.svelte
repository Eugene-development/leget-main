<script lang="ts">
	// Артикул: 1.М.1.1 — см. docs/architecture/component-articles-map.md
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { createMenuMotion } from '../motion.svelte';
	import type { CatalogItem } from '../../catalogItems';
	import type { ServiceItem } from '../../serviceItems';
	import '../../../theme.css';

	// Вариант 1 меню (хэдер Promo-1) — тихая навигация.
	//
	// Форма. Декора нет: ни плиток-иконок, ни шевронов. Пункт несёт
	// типографическая лестница «рубрика → пояснение», наведение проявляется
	// волосяным рельсом слева и акцентом на заголовке. Панель стоит на роли
	// `p1-overlay`, а не на абсолютном `bg-surface-raised`, поэтому впервые
	// участвует в теме шаблона — до этого весь хэдер был вне темы, при том
	// что подвал в ней участвует (73 обращения к ролям в Footer/v1).
	//
	// Роль оверлея, а не карточки: карточка вправе быть полупрозрачной
	// подмывкой, потому что под ней поверхность секции, — у всплывающей
	// панели такой поверхности нет. Разбор и замер — в Promo-1/theme.css.
	//
	// Поведение. Меню открывается наведением, кликом и с клавиатуры. Клавиатура
	// здесь не улучшение, а починка: до этого панель висела только на
	// `onmouseenter`, `aria-expanded` стоял, а обработчика не было — то есть
	// каталог и услуги с клавиатуры не открывались вовсе.
	//
	// Длительностей в разметке нет ни одной. `--default-transition-duration`
	// в layout.css уже равен `--ds-motion-duration-ui`, поэтому голый
	// `transition-colors` и есть системная длительность; 20 литеральных
	// `duration-*`, стоявших здесь раньше, дословно повторяли значение токена
	// и при этом отвязывали блок от него.
	//
	// Контракт данных не тронут: те же пропсы, те же обработчики, те же ключи.
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
	// Чем меню открыто. Наведение вправе закрыть его уходом курсора, клик и
	// клавиатура — нет: иначе меню, открытое кликом, схлопывается, стоит
	// курсору соскользнуть с пункта.
	let openedBy = $state<'hover' | 'intent' | null>(null);
	// Курсор, оставшийся на пункте после закрытия, не должен открывать меню
	// заново. Без этого ни Escape, ни повторный клик не закрывают ничего:
	// меню схлопывается и тут же открывается наведением, с которого его и
	// открыли. Снимается уходом курсора из группы.
	let hoverSuppressed = $state(false);
	let hoveredItem = $state<string | null>(null);
	let rootEl = $state<HTMLElement | null>(null);
	const triggerEls: Partial<Record<MenuKind, HTMLButtonElement>> = {};

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
	 * Длительность и шаг каскада — из токенного слоя.
	 *
	 * Оба значения живут в CSS (`--ds-motion-duration-ui`,
	 * `--ds-motion-stagger-step`), а `transition:fly` принимает их числом из JS.
	 * Мост между слоями общий для всех вариантов меню — `../motion.svelte.ts`.
	 */
	const motion = createMenuMotion();

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
		// Уход курсора снимает запрет всегда — даже когда меню держит намерение:
		// вернувшись, курсор снова вправе его открыть.
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

	// Клик мимо и Escape закрывают меню. Без этого открытое кликом меню закрыть
	// было бы нечем: наведение его больше не держит.
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

<!--
	Пункт панели. Одна разметка на рубрики и услуги: до разбора обе ветки стояли
	дословными копиями по ~180 строк каждая.
-->
{#snippet panelItem(
	item: CatalogItem | ServiceItem,
	idx: number,
	disabled: string[],
	onToggle: ToggleHandler,
	unitLabel: string
)}
	{@const isComingSoon = item.comingSoon === true}
	{@const isEnabled = !isComingSoon && !disabled.includes(item.href)}
	<div
		class="flex w-full items-stretch justify-between {idx === 0 ? '' : 'p1-line border-t'}"
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
			class="p1-title p1-line flex flex-1 flex-col gap-0.5 border-l-2 py-3 pr-3 pl-5 transition-[color,border-color] focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {isComingSoon
				? 'pointer-events-none'
				: 'p1-accent-hover p1-accent-border-hover'}"
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

{#snippet panel(
	kind: MenuKind,
	items: (CatalogItem | ServiceItem)[],
	disabled: string[],
	onToggle: ToggleHandler,
	unitLabel: string
)}
	<!-- Распорка: перекрывает зазор между пунктом и панелью, иначе курсор,
	     идущий к панели, покидает группу и меню закрывается. -->
	<div class="absolute top-full left-1/2 h-4 w-full -translate-x-1/2"></div>
	<div
		id="menu-panel-{kind}"
		transition:fly={{ y: -6, duration: motion.enterDuration }}
		class="p1-overlay p1-border absolute top-full left-1/2 z-50 mt-4 w-88 -translate-x-1/2 overflow-hidden rounded-2xl border"
	>
		{#each items as item, idx (item.href)}
			{@render panelItem(item, idx, disabled, onToggle, unitLabel)}
		{/each}
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
	Тема объявлена на корне навигации, а не на панели: роли `p1-*` берут значения
	из ближайшего `[data-p1-theme]`, и без него `color: var(--p1-body)` не
	«падает на дефолт», а становится невалидным и наследуется от родителя.
	Замер на «Охре» (тёмная система, светлый текст): пункты меню шли кремовым
	по светлой шапке — контраст 1.38 против 8.7 у исходной абсолютной шкалы.

	Значение зашито в `light`, и сегодня это верно: `--ds-surface-raised`, на
	котором стоит шапка, светлый во всех пяти системах, включая «Охру»
	(#fffaf1). Но зашито оно вынужденно — у layout-компонентов нет входа под
	тему. Подвал свою получает из данных (`isLight`), у шапки такого поля нет
	вовсе. Это находка прогона, а не решение блока.
-->
<nav bind:this={rootEl} data-p1-theme="light" class="hidden items-center gap-7 sm:flex">
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
					{@render panel(
						'services',
						visibleServiceItems,
						disabledServices,
						onToggleService,
						'услуга'
					)}
				{/if}
			</div>
		{:else if link.label === 'Каталог'}
			<div
				role="group"
				class="relative flex h-full items-center"
				onmouseenter={() => openByHover('catalog')}
				onmouseleave={closeByHover}
			>
				{@render trigger(link.label, 'catalog', isCatalogActive)}
				{#if openMenu === 'catalog'}
					{@render panel(
						'catalog',
						visibleCatalogItems,
						disabledRubrics,
						onToggleRubric,
						'рубрика'
					)}
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
