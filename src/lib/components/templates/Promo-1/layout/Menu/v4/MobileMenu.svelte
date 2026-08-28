<script lang="ts">
	// Мобильная половина версии 1.М.1.4 — см. ./Menu.svelte и ../Mobile.svelte
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { uiStore } from '$lib/stores/ui.svelte';
	import { cityStore } from '$lib/stores/city.svelte';
	import { createMenuMotion } from '../motion.svelte';
	import { iconPath } from '../icons';
	import type { CatalogItem } from '../../catalogItems';
	import type { ServiceItem } from '../../serviceItems';
	import type { BannerLink } from '../../bannerLinks';
	import { createClientAccount } from '$lib/stores/client-account.svelte';
	import { sitePhoneHref } from '$lib/utils/site-phone';
	import '../../../theme.css';

	// Вариант 4 мобильного меню — полка каталога, как и на десктопе.
	//
	// Решение варианта в том, что каталог не прячется в колонку, а лежит
	// решёткой на виду, — поэтому гармошки здесь нет: разделы раскрыты сразу,
	// рубрики идут в две колонки, услуги — строками. Иконка рубрики несущая,
	// а не декоративная: в решётке она работает якорем ячейки.
	//
	// Решётка играет линией зазор `gap-px`: контейнер залит цветом разделителя,
	// ячейки — подложкой оверлея. Приём тот же, что у десктопной половины, и
	// описан в theme.css как осознанное исключение из «линия — это граница»:
	// на одну и на две колонки он работает одинаково и не оставляет лишних
	// кромок по краю полки.
	// Телефон, почта, «Контакты» и вход приходят в лист с 25.08.2026: строка
	// шапки переехала из баннера в хэдер, и в ней остались только значки, чей
	// смысл читается без подписи. Здесь блоки стоят общими (`p1-*`, роли темы
	// приютившего `<nav>`) — под идиому этой версии они ещё не подогнаны:
	// эталоном разобран `1.М.1.1`, остальные три идут за ним.
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
		isEditable?: boolean;
		onToggleRubric: (href: string, currentEnabled: boolean, e: Event) => void;
		onToggleService: (href: string, currentEnabled: boolean, e: Event) => void;
	} = $props();

	type ToggleHandler = (href: string, currentEnabled: boolean, e: Event) => void;

	const motion = createMenuMotion();
	const account = createClientAccount();
	const phoneHref = $derived(sitePhoneHref(sitePhone));

	const isLinkActive = (href: string) => $page.url.pathname === href;
</script>

{#snippet icon(name: string, size = 'h-6 w-6')}
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

<!-- Заголовок полки: метка раздела и счётчик, отдельной ячейкой решётки. -->
{#snippet shelfHeader(label: string, count: number)}
	<div class="p1-overlay flex items-center justify-between px-5 py-3">
		<span class="p1-label p1-muted">{label}</span>
		<span class="p1-numeric p1-muted text-xs">{count}</span>
	</div>
{/snippet}

<!-- Ячейка решётки: иконка-якорь, под ней лестница «рубрика → пояснение». -->
{#snippet shelfCell(item: CatalogItem, idx: number)}
	{@const isComingSoon = item.comingSoon === true}
	{@const isEnabled = !isComingSoon && !disabledRubrics.includes(item.href)}
	<div
		class="p1-overlay flex items-start justify-between gap-2 px-4 py-4"
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
				uiStore.closeMenu();
			}}
			tabindex={isComingSoon ? -1 : undefined}
			aria-disabled={isComingSoon}
			aria-current={isLinkActive(item.href) ? 'page' : undefined}
			class="p1-title flex flex-1 flex-col gap-1.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {isComingSoon
				? 'pointer-events-none'
				: 'p1-accent-hover'} {isLinkActive(item.href) ? 'p1-accent' : ''}"
			class:pointer-events-none={!isComingSoon && isEditable && !isEnabled}
		>
			{@render icon(item.icon, 'h-6 w-6')}
			<span class="mt-1 text-sm font-semibold">{item.label}</span>
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

<!-- Услуги: строкой, иконка слева — узкая колонка десктопной половины. -->
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
				uiStore.closeMenu();
			}}
			tabindex={isComingSoon ? -1 : undefined}
			aria-disabled={isComingSoon}
			aria-current={isLinkActive(service.href) ? 'page' : undefined}
			class="p1-title flex flex-1 items-start gap-3 px-5 py-3 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {isComingSoon
				? 'pointer-events-none'
				: 'p1-accent-hover'} {isLinkActive(service.href) ? 'p1-accent' : ''}"
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

<!--
	Тема объявлена на корне полки, а не на ячейках: роли `p1-*` берут значения из
	ближайшего `[data-p1-theme]`, и без него `color: var(--p1-body)` становится
	невалидным и наследуется от родителя. Значение зашито в `light` — меню стоит
	на `--ds-surface-raised`, светлом во всех пяти системах; входа под тему у
	layout-компонентов нет, подробнее — в ./Menu.svelte.
-->

<!--
	Учётная запись и контакты как ячейки полки.

	Разделителей своих у блоков нет и быть не должно: полка набрана `gap-px` по
	залитому контейнеру, и любая собственная граница дала бы вторую линию рядом
	с зазором. Поэтому каждая строка — ячейка `p1-overlay` с тем же полем
	`px-5 py-3`, что у услуг, а надзаголовок повторяет `shelfHeader`: метка
	слева, счётчик справа. Ровно по этой причине блоки нельзя было оставить
	общими — там борта были свои.

	Кнопки входа берут чеканку чипов города: `rounded-md`, 12px, выбранный —
	заливкой акцента. Высота поднята до 44: чип города её не держит, но чип —
	переключатель в ряду, а это главное действие блока.
-->
{#snippet blockHeader(label: string, count: number)}
	<div class="p1-overlay flex items-center justify-between px-5 py-3">
		<span class="p1-label p1-muted">{label}</span>
		<span class="p1-numeric p1-muted text-xs">{count}</span>
	</div>
{/snippet}

{#snippet contactCell(href: string, label: string, path: string, onclick?: () => void)}
	<a
		{href}
		{onclick}
		class="p1-overlay p1-title p1-accent-hover flex items-center gap-3 px-5 py-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none"
	>
		<svg
			class="p1-muted size-5 shrink-0 [stroke-width:var(--ds-icon-stroke)]"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d={path} />
		</svg>
		<span class="min-w-0 flex-1 truncate">{label}</span>
	</a>
{/snippet}

{#snippet accountBlock()}
	{#if account.client}
		{@render blockHeader('Кабинет', 1)}
		<div class="p1-overlay flex items-center gap-3 px-5 py-3">
			<svg
				class="p1-accent size-5 shrink-0 [stroke-width:var(--ds-icon-stroke)]"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" />
			</svg>
			<a href={account.cabinet} onclick={() => uiStore.closeMenu()} class="min-w-0 flex-1">
				<span class="p1-title block text-sm font-semibold">Личный кабинет</span>
				<span class="p1-note p1-muted block truncate">{account.client.email}</span>
			</a>
			<button
				type="button"
				onclick={account.logout}
				disabled={account.isLoggingOut}
				class="p1-line p1-body shrink-0 cursor-pointer rounded-md border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors disabled:cursor-default disabled:opacity-60"
			>
				Выйти
			</button>
		</div>
	{:else}
		<div class="p1-overlay flex gap-2 px-5 py-4">
			<button
				type="button"
				onclick={account.openLogin}
				class="p1-accent-bg h-11 flex-1 cursor-pointer rounded-md text-xs font-semibold text-on-accent transition-colors"
			>
				Войти
			</button>
			<button
				type="button"
				onclick={account.openRegister}
				class="p1-line p1-body h-11 flex-1 cursor-pointer rounded-md border text-xs font-semibold transition-colors"
			>
				Регистрация
			</button>
		</div>
	{/if}
{/snippet}

{#snippet contactsBlock()}
	{#if sitePhone || email || contactsLink}
		{@render blockHeader('Контакты', [sitePhone, email, contactsLink].filter(Boolean).length)}
		{#if sitePhone}
			{@render contactCell(
				phoneHref,
				sitePhone,
				'M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
			)}
		{/if}
		{#if email}
			{@render contactCell(
				`mailto:${email}`,
				email,
				'M3 8l7.89 4.26a2 2 0 001.94 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
			)}
		{/if}
		{#if contactsLink}
			{@render contactCell(contactsLink.href, contactsLink.label, 'M5 12h14M13 6l6 6-6 6', () =>
				uiStore.closeMenu()
			)}
		{/if}
	{/if}
{/snippet}

{#if uiStore.menuOpen}
	<nav
		data-p1-theme="light"
		class="p1-border grid max-h-[74dvh] grid-cols-1 gap-px overflow-y-auto border-t bg-[var(--p1-line)] lg:hidden"
		aria-label="Мобильная навигация"
	>
		{@render accountBlock()}

		{#each links as link}
			{#if link.label === 'Услуги'}
				{@render shelfHeader(link.label, visibleServiceItems.length)}
				<div class="grid grid-cols-1 gap-px">
					{#each visibleServiceItems as service, idx (service.href)}
						{@render serviceRow(service, idx)}
					{/each}
				</div>
			{:else if link.label === 'Каталог'}
				{@render shelfHeader(link.label, visibleCatalogItems.length)}
				<div class="grid grid-cols-2 gap-px">
					{#each visibleCatalogItems as item, idx (item.href)}
						{@render shelfCell(item, idx)}
					{/each}
				</div>
			{:else}
				<a
					href={link.href}
					onclick={() => uiStore.closeMenu()}
					aria-current={isLinkActive(link.href) ? 'page' : undefined}
					class="p1-overlay p1-label p1-accent-hover block px-5 py-3.5 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none {isLinkActive(
						link.href
					)
						? 'p1-accent'
						: 'p1-body'}"
				>
					{link.label}
				</a>
			{/if}
		{/each}

		<div class="p1-overlay px-5 py-4">
			<span class="p1-label p1-muted">Город</span>
			<div class="mt-3 flex flex-wrap gap-2">
				{#each cities as city}
					<!--
						Чип города — цель 44, а не 31.

						Форма и палитра варианта не тронуты: тот же радиус, та же
						заливка выбранного, та же пластика. Выросла только высота —
						`min-h-11` вместо `py-1.5`, — и вместе с ней кегль поднят до
						меры строки этого же листа: на 44px подпись в 12px висела бы
						в пустой пилюле. Ряд от этого прибавляет около 40px на все
						шесть городов: они по-прежнему укладываются в три ряда.
					-->
					<button
						type="button"
						onclick={() => cityStore.set(city.label)}
						aria-pressed={cityStore.city === city.label}
						class="flex min-h-11 items-center rounded-md px-4 text-sm font-semibold whitespace-nowrap transition-colors {cityStore.city ===
						city.label
							? 'p1-accent-bg text-on-accent'
							: 'p1-line p1-body border'}"
					>
						{city.label}
					</button>
				{/each}
			</div>
		</div>
		{@render contactsBlock()}
	</nav>
{/if}
