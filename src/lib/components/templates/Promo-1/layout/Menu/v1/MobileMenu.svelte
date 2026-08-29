<script lang="ts">
	// Мобильная половина версии 1.М.1.1 — см. ./Menu.svelte и ../Mobile.svelte
	import { page } from '$app/stores';
	import { fly, slide } from 'svelte/transition';
	import { uiStore } from '$lib/stores/ui.svelte';
	import { cityStore } from '$lib/stores/city.svelte';
	import { createClientAccount } from '$lib/stores/client-account.svelte';
	import { sitePhoneHref } from '$lib/utils/site-phone';
	import { createMenuMotion } from '../motion.svelte';
	import type { CatalogItem } from '../../catalogItems';
	import type { ServiceItem } from '../../serviceItems';
	import type { BannerLink } from '../../bannerLinks';
	import '../../../theme.css';

	// Вариант 1 мобильного меню — тихая навигация, та же, что на десктопе.
	//
	// Форма. Декора нет: ни плиток-иконок, ни шевронов у обычных пунктов. Пункт
	// несёт типографическая лестница «рубрика → пояснение», состояние —
	// волосяной рельс слева и акцент на заголовке. Панель стоит на роли
	// `p1-overlay`, а не на абсолютном `bg-surface-raised`.
	//
	// Лист, а не выпадашка (с 25.08.2026). До разбора мобильной шапки это была
	// панель на `max-h-[70dvh]` с собственной прокруткой: при открытом каталоге
	// её содержимое (6 рубрик с пояснениями, 5 услуг, 6 городов) заведомо не
	// помещалось, и прокруток становилось две — одна внутри другой. Теперь
	// поверхность идёт от нижней кромки строки шапки до низа экрана, прокрутка
	// одна, а страница под листом заблокирована (см. Header.svelte). Затемнять
	// нечего: лист занимает всё, что ниже строки, и сама строка остаётся видна
	// вместе с крестиком.
	//
	// `top` приходит переменной `--p1-sheet-top`, которую публикует хэдер:
	// строка стоит то на высоте полосы акций, то в нуле, и `fixed` этой разницы
	// сам не знает. Дефолт 3.5rem — высота строки, то есть положение прилипшей
	// шапки: если переменная не доехала, лист садится ровно под неё.
	//
	// Раскрытие рубрик, услуг и городов — гармошкой: на узком экране панели
	// некуда всплывать. Открытым стартует раздел, внутри которого стоит текущий
	// адрес, — иначе с любой страницы каталога меню открывается схлопнутым и
	// путь до соседней рубрики становится в два касания длиннее. Город в этот
	// расчёт не входит: он настройка, а не маршрут, и до 25.08.2026 стоял
	// шестью всегда развёрнутыми строками в конце листа.
	let {
		links = [],
		visibleCatalogItems = [],
		visibleServiceItems = [],
		disabledRubrics = [],
		disabledServices = [],
		cities = [],
		sitePhone = '',
		email = '',
		contactsLink = null,
		informationLinks = [],
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
		sitePhone: string;
		email: string;
		contactsLink: BannerLink | null;
		informationLinks: BannerLink[];
		isEditable?: boolean;
		onToggleRubric: (href: string, currentEnabled: boolean, e: Event) => void;
		onToggleService: (href: string, currentEnabled: boolean, e: Event) => void;
	} = $props();

	type MenuKind = 'catalog' | 'services' | 'city' | 'information';
	type ToggleHandler = (href: string, currentEnabled: boolean, e: Event) => void;

	const motion = createMenuMotion();
	const account = createClientAccount();
	const phoneHref = $derived(sitePhoneHref(sitePhone));

	const initialSection = (): MenuKind | null => {
		const path = $page.url.pathname;
		if (visibleCatalogItems.some((item) => path.startsWith(item.href))) return 'catalog';
		if (visibleServiceItems.some((item) => path === item.href)) return 'services';
		if (informationLinks.some((item) => path === item.href)) return 'information';
		return null;
	};

	let openSection = $state<MenuKind | null>(initialSection());

	function toggleSection(kind: MenuKind) {
		openSection = openSection === kind ? null : kind;
	}

	const isLinkActive = (href: string) => $page.url.pathname === href;
	const isSectionActive = (kind: MenuKind) => {
		if (kind === 'catalog') {
			return visibleCatalogItems.some((item) => $page.url.pathname.startsWith(item.href));
		}
		if (kind === 'services') {
			return visibleServiceItems.some((item) => $page.url.pathname === item.href);
		}
		if (kind === 'information') {
			return informationLinks.some((item) => $page.url.pathname === item.href);
		}
		return false;
	};

	const projectsLink = $derived(
		links.find((link) => link.label === 'Проекты') ?? { href: '/projects', label: 'Проекты' }
	);
	const actionsLink = { href: '/actions', label: 'Акции' };
	const resolvedInformationLinks = $derived(
		informationLinks.length > 0 ? informationLinks : contactsLink ? [contactsLink] : []
	);
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
			class="p1-title flex flex-1 flex-col gap-0.5 border-l-2 py-3 pr-4 pl-8 transition-[color,border-color] focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {isComingSoon
				? 'pointer-events-none'
				: 'p1-accent-hover p1-accent-border-hover'} {isLinkActive(item.href)
				? 'p1-accent border-[var(--p1-accent)]'
				: 'p1-line'}"
			class:pointer-events-none={!isComingSoon && isEditable && !isEnabled}
		>
			<span class="text-sm font-semibold">
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
		<!--
			Пункт набран не меткой, а 18px.

			До разбора верхний уровень стоял на `p1-label` — 12px прописными, —
			и оказывался легче своей же рубрики (15px): родитель мельче ребёнка,
			лестница читалась снизу вверх. Метка при этом никуда не делась, она
			ушла на надзаголовок группы («Навигация», «Город», «Контакты»), где
			она и есть подпись группы, а не пункт. Ровно та развилка, которую
			DESIGN.md оставил открытой словами «если система захочет развести
			метку и пункт меню, это и будет момент их разделить».
		-->
		<button
			type="button"
			onclick={() => toggleSection(kind)}
			class="p1-title-sub flex w-full items-center justify-between border-l-2 py-4 pr-4 pl-4 text-left text-lg transition-[color,border-color] focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {active
				? 'p1-accent border-[var(--p1-accent)]'
				: 'p1-title p1-line'}"
			aria-expanded={openSection === kind}
			aria-controls="mobile-menu-{kind}"
		>
			<span>{label}</span>
			<svg
				class="size-4 [stroke-width:var(--ds-icon-stroke-bold)] transition-transform {openSection ===
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

{#snippet accountBlock()}
	{#if account.client}
		<div class="p1-surface-alt mx-4 mt-5 mb-6 flex items-center gap-3 rounded-lg p-3">
			<span
				class="p1-card p1-border p1-accent flex size-10 shrink-0 items-center justify-center rounded-full border"
			>
				<svg
					class="size-5 [stroke-width:var(--ds-icon-stroke-bold)]"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
					/>
				</svg>
			</span>

			<a
				href={account.cabinet}
				onclick={() => uiStore.closeMenu()}
				class="flex min-w-0 flex-1 flex-col gap-0.5 focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none"
			>
				<span class="p1-title p1-title-sub text-sm">Личный кабинет</span>
				<span class="p1-note p1-muted truncate">{account.client.email}</span>
			</a>

			<button
				type="button"
				onclick={account.logout}
				disabled={account.isLoggingOut}
				class="p1-body p1-accent-hover flex min-h-11 shrink-0 cursor-pointer items-center px-3 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none disabled:cursor-default disabled:opacity-60"
			>
				Выйти
			</button>
		</div>
	{:else}
		<div class="flex gap-2 px-4 pt-5 pb-6">
			<button
				type="button"
				onclick={account.openLogin}
				class="p1-accent flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--p1-accent)] text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none"
			>
				<svg
					class="size-4.5 [stroke-width:var(--ds-icon-stroke-bold)]"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-6 0l3-3m0 0l-3-3m3 3H3.75"
					/>
				</svg>
				Войти
			</button>

			<button
				type="button"
				onclick={account.openRegister}
				class="p1-title p1-border p1-card-hover flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none"
			>
				<svg
					class="p1-muted size-4.5 [stroke-width:var(--ds-icon-stroke-bold)]"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M13.5 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM2.25 20.25a7.5 7.5 0 0115 0M18.75 8.25v6m3-3h-6"
					/>
				</svg>
				Регистрация
			</button>
		</div>
	{/if}
{/snippet}

{#snippet groupLabel(text: string)}
	<div class="px-4 pt-7 pb-2">
		<span class="p1-label p1-muted">{text}</span>
	</div>
{/snippet}

{#snippet contactIcon(path: string, accent: boolean)}
	<svg
		class="{accent
			? 'p1-accent'
			: 'p1-muted'} size-4.5 shrink-0 [stroke-width:var(--ds-icon-stroke-bold)]"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d={path} />
	</svg>
{/snippet}

<!--
	Контакты в языке варианта 1: те же волосяные линии и тот же прозрачный рельс
	слева, что у пунктов, — ни плиток, ни бейджей. Номер набран цифровой ролью
	и на ступень крупнее почты: звонок с телефона остаётся главным действием
	блока.
-->
{#snippet contactsBlock()}
	{#if sitePhone || email || contactsLink}
		<div class="p1-line border-t">
			{@render groupLabel('Контакты')}

			{#if sitePhone}
				<a
					href={phoneHref}
					class="p1-line p1-accent-hover p1-accent-border-hover flex items-center gap-2.5 border-t border-l-2 border-l-transparent py-4 pr-4 pl-4 transition-[color,border-color] focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none"
				>
					{@render contactIcon(
						'M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
						true
					)}
					<span class="p1-title p1-numeric text-lg">{sitePhone}</span>
				</a>
			{/if}

			{#if email}
				<a
					href="mailto:{email}"
					class="p1-line p1-accent-hover p1-accent-border-hover flex items-center gap-2.5 border-t border-l-2 border-l-transparent py-4 pr-4 pl-4 transition-[color,border-color] focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none"
				>
					{@render contactIcon(
						'M3 8l7.89 4.26a2 2 0 001.94 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
						false
					)}
					<span class="p1-body text-sm">{email}</span>
				</a>
			{/if}

			{#if contactsLink}
				<a
					href={contactsLink.href}
					onclick={() => uiStore.closeMenu()}
					class="p1-line p1-accent-hover p1-accent-border-hover flex items-center justify-between border-t border-b border-l-2 border-l-transparent py-4 pr-4 pl-4 transition-[color,border-color] focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none"
				>
					<span class="p1-body text-sm">{contactsLink.label}</span>
					{@render contactIcon('M5 12h14M13 6l6 6-6 6', false)}
				</a>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet disclosureTile(label: string, kind: MenuKind)}
	{@const active = openSection === kind || isSectionActive(kind)}
	<button
		type="button"
		onclick={() => toggleSection(kind)}
		class="p1-surface-alt p1-line p1-title-sub flex min-h-18 w-full items-center rounded-xl border px-4 py-3 text-left transition-[color,border-color,background-color] focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {active
			? 'p1-accent border-[var(--p1-accent)]'
			: 'p1-title p1-accent-wash-hover'}"
		aria-expanded={openSection === kind}
		aria-controls="mobile-menu-{kind}"
	>
		<span class="flex w-full items-center justify-between gap-3 text-base">
			<span>{label}</span>
			<svg
				class="size-4 shrink-0 [stroke-width:var(--ds-icon-stroke-bold)] transition-transform {openSection ===
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
		</span>
	</button>
{/snippet}

{#snippet linkTile(link: { href: string; label: string })}
	<a
		href={link.href}
		onclick={() => uiStore.closeMenu()}
		aria-current={isLinkActive(link.href) ? 'page' : undefined}
		class="p1-surface-alt p1-line p1-title-sub flex min-h-18 items-center rounded-xl border px-4 py-3 text-base transition-[color,border-color,background-color] focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {isLinkActive(
			link.href
		)
			? 'p1-accent border-[var(--p1-accent)]'
			: 'p1-title'}"
	>
		{link.label}
	</a>
{/snippet}

{#snippet disclosurePanel(kind: 'catalog' | 'services')}
	{@const items = kind === 'catalog' ? visibleCatalogItems : visibleServiceItems}
	{@const disabled = kind === 'catalog' ? disabledRubrics : disabledServices}
	{@const onToggle = kind === 'catalog' ? onToggleRubric : onToggleService}
	{@const unitLabel = kind === 'catalog' ? 'рубрика' : 'услуга'}
	<div
		id="mobile-menu-{kind}"
		class="p1-line col-span-2 overflow-hidden rounded-xl border"
		transition:slide={{ duration: motion.enterDuration }}
	>
		{#each items as item, idx (item.href)}
			{@render sectionItem(item, idx, disabled, onToggle, unitLabel)}
		{/each}
	</div>
{/snippet}

{#snippet contactButton(href: string, label: string, path: string, accent = false)}
	<a
		{href}
		class="p1-card p1-line p1-accent-hover flex min-h-12 min-w-0 items-center gap-2 rounded-xl border px-3 py-3 transition-[color,border-color,background-color] focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none"
	>
		{@render contactIcon(path, accent)}
		<span class="p1-title min-w-0 truncate text-xs">{label}</span>
	</a>
{/snippet}

<!--
	Тема объявлена на корне меню, а не на строках: роли `p1-*` берут значения из
	ближайшего `[data-p1-theme]`, и без него `color: var(--p1-body)` не «падает на
	дефолт», а становится невалидным и наследуется от родителя. Значение зашито
	в `light` по той же причине и с той же оговоркой, что у десктопной половины:
	меню стоит на `--ds-surface-raised`, светлом во всех пяти системах, а входа
	под тему у layout-компонентов нет.

	Полоса прокрутки у листа скрыта. Лист — единственный скроллер, пока он открыт
	(страница под ним заблокирована), и его содержимое меняется в высоте прямо на
	глазах: раскрыли «Услуги» — прокрутка появилась, свернули — исчезла. Классическая
	полоса занимает ширину, поэтому каждое такое раскрытие сжимало плитки по
	горизонтали и дёргало всю сетку. На телефоне полосы и так наложенные, ширины они
	не отнимают, — прячем её и в узком окне десктопа, чтобы поведение совпало.
	`scrollbar-gutter: stable` тут не подходит: он убирает дёрганье, но держит
	пустой жёлоб постоянно и саму полосу оставляет.
-->
{#if uiStore.menuOpen}
	<nav
		id="p1-mobile-menu"
		data-p1-theme="light"
		class="p1-overlay fixed inset-x-0 bottom-0 z-0 overflow-y-auto overscroll-contain [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
		style="top: var(--p1-sheet-top, 3.5rem);"
		aria-label="Мобильная навигация"
		transition:fly={{ y: -8, duration: motion.enterDuration }}
	>
		<div
			class="flex min-h-full flex-col"
			style="padding-bottom: calc(2.5rem + env(safe-area-inset-bottom, 0px));"
		>
			{@render groupLabel('Навигация')}

			<!--
				Межстрочный отступ сетки набран полями плиток, а не `gap-y`. Раскрытая
				панель занимает в сетке собственную строку, и `row-gap` вокруг неё —
				величина, которой нет в `transition:slide`: он ведёт высоту, поля и
				толщину рамок, но не зазор сетки. Из-за этого свёртывание шло в два шага —
				плавно до нуля высоты, короткая пауза до размонтирования, затем рывок на
				оставшиеся 12px зазора. Поле `mt-3` на каждом ребёнке — та же величина,
				но уже внутри элемента: `slide` уводит его вместе с высотой, и к моменту
				удаления панель не занимает ничего. `-mt-3` на сетке гасит поле первой
				строки, чтобы верхняя кромка осталась там же, где была.
			-->
			<div class="-mt-3 grid grid-cols-2 gap-x-3 px-4 [&>*]:mt-3">
				{@render disclosureTile('Каталог', 'catalog')}
				{@render disclosureTile('Услуги', 'services')}

				{#if openSection === 'catalog'}{@render disclosurePanel('catalog')}{/if}
				{#if openSection === 'services'}{@render disclosurePanel('services')}{/if}

				{@render linkTile(actionsLink)}
				{@render linkTile(projectsLink)}

				{@render disclosureTile(cityStore.city, 'city')}
				{@render disclosureTile('Информация', 'information')}

				{#if openSection === 'city'}
					<div
						id="mobile-menu-city"
						class="p1-line col-span-2 overflow-hidden rounded-xl border"
						transition:slide={{ duration: motion.enterDuration }}
					>
						{#each cities as city, idx (city.label)}
							<button
								type="button"
								onclick={() => cityStore.set(city.label)}
								aria-pressed={cityStore.city === city.label}
								class="p1-line p1-accent-hover flex min-h-12 w-full items-center justify-between border-t px-4 text-left text-sm transition-colors first:border-t-0 focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {cityStore.city ===
								city.label
									? 'p1-accent'
									: 'p1-body'}"
								in:fly={{ y: -4, duration: motion.enterDuration, delay: motion.enterDelay(idx) }}
							>
								<span>{city.label}</span>
								{#if cityStore.city === city.label}
									<span class="p1-accent-bg h-px w-6" aria-hidden="true"></span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}

				{#if openSection === 'information'}
					<div
						id="mobile-menu-information"
						class="p1-line col-span-2 grid overflow-hidden rounded-xl border"
						transition:slide={{ duration: motion.enterDuration }}
					>
						{#each resolvedInformationLinks as link}
							<a
								href={link.href}
								onclick={() => uiStore.closeMenu()}
								aria-current={isLinkActive(link.href) ? 'page' : undefined}
								class="p1-line p1-accent-hover flex min-h-12 items-center border-t px-4 text-sm transition-colors first:border-t-0 focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {isLinkActive(
									link.href
								)
									? 'p1-accent'
									: 'p1-body'}"
							>
								{link.label}
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<div class="mt-5 border-t border-[var(--p1-line)] pt-5">
				{@render accountBlock()}
			</div>

			{#if sitePhone || email}
				<div class="mt-auto grid grid-cols-2 gap-3 border-t border-[var(--p1-line)] px-4 pt-5">
					{#if email}
						{@render contactButton(
							`mailto:${email}`,
							email,
							'M3 8l7.89 4.26a2 2 0 001.94 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
						)}
					{/if}
					{#if sitePhone}
						{@render contactButton(
							phoneHref,
							sitePhone,
							'M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
							true
						)}
					{/if}
				</div>
			{/if}
		</div>
	</nav>
{/if}
