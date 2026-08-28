<script lang="ts">
	// Мобильная половина версии 1.М.1.2 — см. ./Menu.svelte и ../Mobile.svelte
	import { page } from '$app/stores';
	import { fly, slide } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import { uiStore } from '$lib/stores/ui.svelte';
	import { cityStore } from '$lib/stores/city.svelte';
	import { iconPath } from '../icons';
	import type { CatalogItem } from '../../catalogItems';
	import type { ServiceItem } from '../../serviceItems';
	import type { BannerLink } from '../../bannerLinks';
	import { createClientAccount } from '$lib/stores/client-account.svelte';
	import { sitePhoneHref } from '$lib/utils/site-phone';

	// Вариант 2 мобильного меню — премиальная навигация, продолжение десктопной:
	// пилюли-ссылки с мягким hover'ом, «двойная оправа» (doppelrand) вокруг всего
	// листа, рассеянные тени, каскадное появление пунктов и плавная моторика на
	// кривой `expoOut`. Мега-панель десктопа на узком экране разворачивается
	// гармошкой внутри той же оправы: всплывать ей некуда, а оправа остаётся —
	// именно она несёт характер варианта.
	//
	// API совпадает с остальными мобильными вариантами; данные и переключатели
	// видимости приходят из Header.svelte пропсами.
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

	type MenuKind = 'catalog' | 'services';
	type ToggleHandler = (href: string, currentEnabled: boolean, e: Event) => void;

	const account = createClientAccount();
	const phoneHref = $derived(sitePhoneHref(sitePhone));

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
		openSection === kind ||
		(kind === 'catalog'
			? visibleCatalogItems.some((item) => $page.url.pathname.startsWith(item.href))
			: visibleServiceItems.some((item) => $page.url.pathname === item.href));
</script>

{#snippet icon(name: string)}
	<svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={iconPath(name)} />
	</svg>
{/snippet}

<!-- Строка раздела: та же карточка с иконкой в «двойной оправе», что в мега-панели. -->
{#snippet sectionItem(
	item: CatalogItem | ServiceItem,
	idx: number,
	disabled: string[],
	onToggle: ToggleHandler,
	toggleTitleOn: string,
	toggleTitleOff: string
)}
	{@const isComingSoon = item.comingSoon === true}
	{@const isEnabled = !isComingSoon && !disabled.includes(item.href)}
	<div
		class="group/item relative flex items-center justify-between rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] {isComingSoon
			? 'cursor-not-allowed opacity-60'
			: 'active:bg-ink-50'} {isLinkActive(item.href) ? 'bg-link-50' : ''}"
		class:opacity-60={!isComingSoon && isEditable && !isEnabled}
		title={isComingSoon ? 'В разработке' : undefined}
		in:fly={{ y: 12, duration: 420, delay: idx * 55, easing: expoOut }}
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
			class="flex flex-1 items-center gap-3.5 p-3 {isComingSoon ? 'pointer-events-none' : ''}"
			class:pointer-events-none={!isComingSoon && isEditable && !isEnabled}
		>
			<span
				class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ring-ink-900/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] {isLinkActive(
					item.href
				)
					? 'bg-linear-to-br from-link-500 to-cat-4-500 shadow-lg shadow-link-500/25'
					: 'bg-ink-100/80'}"
			>
				<span
					class="transition-colors duration-500 {isLinkActive(item.href)
						? 'text-on-dark'
						: 'text-ink-500'}"
				>
					{@render icon(item.icon)}
				</span>
			</span>
			<span class="min-w-0 flex-1">
				<span class="flex items-center gap-2">
					<span
						class="text-[13px] font-semibold tracking-tight transition-colors duration-300 {isLinkActive(
							item.href
						)
							? 'text-link-600'
							: 'text-ink-900'}"
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
				{#if item.desc}
					<span class="mt-0.5 block text-[11px] leading-snug text-ink-400">{item.desc}</span>
				{/if}
			</span>
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

{#snippet section(
	label: string,
	kind: MenuKind,
	items: (CatalogItem | ServiceItem)[],
	disabled: string[],
	onToggle: ToggleHandler,
	toggleTitleOn: string,
	toggleTitleOff: string
)}
	<button
		type="button"
		onclick={() => toggleSection(kind)}
		class="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-[13px] font-semibold tracking-wide transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] {isSectionActive(
			kind
		)
			? 'bg-link-50 text-link-600'
			: 'text-ink-600 active:bg-ink-900/4'}"
		aria-expanded={openSection === kind}
		aria-controls="mobile-menu-{kind}"
	>
		<span>{label}</span>
		<svg
			class="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] {openSection ===
			kind
				? 'rotate-180 text-link-500'
				: 'text-ink-400'}"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if openSection === kind}
		<div id="mobile-menu-{kind}" transition:slide={{ duration: 320, easing: expoOut }}>
			<div class="mb-1 flex items-center justify-between px-3 pt-2 pb-1">
				<span class="text-[10px] font-bold tracking-[0.22em] text-ink-400 uppercase">{label}</span>
				<span class="ml-3 h-px flex-1 bg-linear-to-r from-ink-200 to-transparent"></span>
			</div>
			{#each items as item, idx (item.href)}
				{@render sectionItem(item, idx, disabled, onToggle, toggleTitleOn, toggleTitleOff)}
			{/each}
		</div>
	{/if}
{/snippet}

<!--
	Учётная запись и контакты в языке варианта 2.

	Форма взята у собственных строк листа, а не приложена сбоку: плитка-иконка
	11×11 в `rounded-2xl` с кольцом, подпись 13px, пояснение 11px — та же
	анатомия, что у `sectionItem`, и та же пластика `duration-500` на кривой
	варианта. Надзаголовок группы повторяет «Город»: метка вразрядку и
	гаснущая вправо линия.

	Плитка вошедшего залита градиентом `link → cat-4` — тем же, которым вариант
	метит активную рубрику: в листе это единственное «вы здесь», и учётная
	запись — законный его носитель.
-->
{#snippet groupHead(label: string)}
	<div class="mb-2 flex items-center justify-between">
		<span class="text-[10px] font-bold tracking-[0.22em] text-ink-400 uppercase">{label}</span>
		<span class="ml-3 h-px flex-1 bg-linear-to-r from-ink-200 to-transparent"></span>
	</div>
{/snippet}

{#snippet contactRow(href: string, label: string, path: string, onclick?: () => void)}
	<a
		{href}
		{onclick}
		class="group/item flex items-center gap-3.5 rounded-2xl p-3 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:bg-ink-50"
	>
		<span
			class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink-100/80 text-ink-500 ring-1 ring-ink-900/5"
		>
			<svg
				class="h-4.5 w-4.5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={path} />
			</svg>
		</span>
		<span class="min-w-0 flex-1 text-[13px] font-semibold tracking-tight text-ink-900">{label}</span
		>
	</a>
{/snippet}

{#snippet accountBlock()}
	<div class="mt-2 border-t border-ink-100 px-3 pt-3 pb-1">
		{@render groupHead('Учётная запись')}
		{#if account.client}
			<div class="flex items-center gap-3.5 rounded-2xl p-3">
				<span
					class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-link-500 to-cat-4-500 shadow-lg ring-1 shadow-link-500/25 ring-ink-900/5"
				>
					<svg
						class="h-4.5 w-4.5 text-on-dark"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
						/>
					</svg>
				</span>
				<a href={account.cabinet} onclick={() => uiStore.closeMenu()} class="min-w-0 flex-1">
					<span class="block text-[13px] font-semibold tracking-tight text-ink-900"
						>Личный кабинет</span
					>
					<span class="mt-0.5 block truncate text-[11px] leading-snug text-ink-400"
						>{account.client.email}</span
					>
				</a>
				<button
					type="button"
					onclick={account.logout}
					disabled={account.isLoggingOut}
					class="shrink-0 cursor-pointer rounded-full bg-ink-100/70 px-3.5 py-1.5 text-[12px] font-semibold whitespace-nowrap text-ink-600 ring-1 ring-ink-900/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:cursor-default disabled:opacity-60"
				>
					Выйти
				</button>
			</div>
		{:else}
			<div class="flex gap-2 px-3 pb-2">
				<button
					type="button"
					onclick={account.openLogin}
					class="h-12 flex-1 cursor-pointer rounded-2xl bg-link-50 text-[13px] font-semibold tracking-wide text-link-600 ring-1 ring-link-200 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
				>
					Войти
				</button>
				<button
					type="button"
					onclick={account.openRegister}
					class="h-12 flex-1 cursor-pointer rounded-2xl bg-ink-100/70 text-[13px] font-semibold tracking-wide text-ink-600 ring-1 ring-ink-900/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
				>
					Регистрация
				</button>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet contactsBlock()}
	{#if sitePhone || email || contactsLink}
		<div class="mt-2 border-t border-ink-100 px-3 pt-3 pb-1">
			{@render groupHead('Контакты')}
			{#if sitePhone}
				{@render contactRow(
					phoneHref,
					sitePhone,
					'M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
				)}
			{/if}
			{#if email}
				{@render contactRow(
					`mailto:${email}`,
					email,
					'M3 8l7.89 4.26a2 2 0 001.94 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
				)}
			{/if}
			{#if contactsLink}
				{@render contactRow(contactsLink.href, contactsLink.label, 'M5 12h14M13 6l6 6-6 6', () =>
					uiStore.closeMenu()
				)}
			{/if}
		</div>
	{/if}
{/snippet}

{#if uiStore.menuOpen}
	<div class="px-3 pt-1 pb-4 lg:hidden" transition:fly={{ y: -14, duration: 460, easing: expoOut }}>
		<!-- Двойная оправа: внешняя «алюминиевая» подложка + внутренняя белая карта -->
		<nav
			class="rounded-[1.75rem] bg-ink-100/70 p-1.5 shadow-[0_28px_70px_-24px] ring-1 shadow-ink-900/45 ring-ink-900/5 backdrop-blur-2xl"
			aria-label="Мобильная навигация"
		>
			<div
				class="max-h-[70dvh] overflow-y-auto rounded-[calc(1.75rem-0.375rem)] bg-surface-raised/95 p-2 shadow-[inset_0_1px_1px] ring-1 shadow-on-dark/60 ring-ink-900/3"
			>
				{@render accountBlock()}

				{#each links as link}
					{#if link.label === 'Услуги'}
						{@render section(
							link.label,
							'services',
							visibleServiceItems,
							disabledServices,
							onToggleService,
							'Скрыть услугу',
							'Показать услугу'
						)}
					{:else if link.label === 'Каталог'}
						{@render section(
							link.label,
							'catalog',
							visibleCatalogItems,
							disabledRubrics,
							onToggleRubric,
							'Скрыть рубрику',
							'Показать рубрику'
						)}
					{:else}
						<a
							href={link.href}
							onclick={() => uiStore.closeMenu()}
							aria-current={isLinkActive(link.href) ? 'page' : undefined}
							class="block rounded-2xl px-4 py-3 text-[13px] font-semibold tracking-wide transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] {isLinkActive(
								link.href
							)
								? 'bg-link-50 text-link-600'
								: 'text-ink-600 active:bg-ink-900/4'}"
						>
							{link.label}
						</a>
					{/if}
				{/each}

				<div class="mt-2 border-t border-ink-100 px-3 pt-3 pb-1">
					<div class="mb-2 flex items-center justify-between">
						<span class="text-[10px] font-bold tracking-[0.22em] text-ink-400 uppercase">Город</span
						>
						<span class="ml-3 h-px flex-1 bg-linear-to-r from-ink-200 to-transparent"></span>
					</div>
					<div class="flex flex-wrap gap-2">
						{#each cities as city}
							<button
								type="button"
								onclick={() => cityStore.set(city.label)}
								aria-pressed={cityStore.city === city.label}
								class="flex min-h-11 items-center rounded-full px-4 text-[13px] font-semibold whitespace-nowrap ring-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] {cityStore.city ===
								city.label
									? 'bg-link-50 text-link-600 ring-link-200'
									: 'bg-ink-100/70 text-ink-600 ring-ink-900/5'}"
							>
								{city.label}
							</button>
						{/each}
					</div>
				</div>

				{@render contactsBlock()}
			</div>
		</nav>
	</div>
{/if}
