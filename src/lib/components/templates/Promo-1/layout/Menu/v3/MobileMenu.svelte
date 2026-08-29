<script lang="ts">
	// Мобильная половина версии 1.М.1.3 — см. ./Menu.svelte и ../Mobile.svelte
	import { page } from '$app/stores';
	import { fly, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { uiStore } from '$lib/stores/ui.svelte';
	import { cityStore } from '$lib/stores/city.svelte';
	import type { CatalogItem } from '../../catalogItems';
	import type { ServiceItem } from '../../serviceItems';
	import type { BannerLink } from '../../bannerLinks';
	import { createClientAccount } from '$lib/stores/client-account.svelte';
	import { sitePhoneHref } from '$lib/utils/site-phone';
	import '../../../theme.css';

	type MenuItem = CatalogItem | ServiceItem;
	type MenuKind = 'catalog' | 'services';
	type ToggleHandler = (href: string, currentEnabled: boolean, event: Event) => void;

	// Вариант 3 мобильного меню — тот же светлый floating island, что на десктопе:
	// остров в двойной оправе, воздушный editorial-список, монограмма вместо
	// иконки, круглая стрелка у строки.
	//
	// Тёмная колонка десктопной мега-панели («от идеи до монтажа», «смотреть всё»)
	// на узком экране становится шапкой острова и меняет содержимое вместе с
	// открытым разделом: колонке негде стоять сбоку, но именно она несёт
	// editorial-характер варианта, поэтому выкидывать её нельзя. Двух тёмных
	// поверхностей при этом не появляется — она всегда одна.
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
		onToggleRubric: ToggleHandler;
		onToggleService: ToggleHandler;
	} = $props();

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

	// Шапка острова: та же пара «надзаголовок → название → пояснение», что в
	// тёмной колонке десктопной панели. Значения совпадают дословно.
	const heading = $derived(
		openSection === 'services'
			? {
					eyebrow: 'От идеи до монтажа',
					title: 'Услуги',
					description:
						'Сопровождаем проект на каждом этапе — спокойно, точно и с вниманием к деталям.',
					rootHref: links.find((link) => link.label === 'Услуги')?.href ?? '/services',
					count: visibleServiceItems.length
				}
			: openSection === 'catalog'
				? {
						eyebrow: 'Материалы и предметы',
						title: 'Каталог',
						description: 'Мебель, поверхности и детали, из которых складывается цельный интерьер.',
						rootHref: links.find((link) => link.label === 'Каталог')?.href ?? '/catalog',
						count: visibleCatalogItems.length
					}
				: {
						eyebrow: 'Навигация',
						title: 'Меню',
						description: 'Все разделы сайта — в одном списке.',
						rootHref: null,
						count: links.length
					}
	);
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

<!-- Строка раздела: монограмма, лестница «раздел → пояснение», круглая стрелка. -->
{#snippet sectionItem(
	item: MenuItem,
	index: number,
	disabledPaths: string[],
	onToggle: ToggleHandler,
	hideTitle: string,
	showTitle: string
)}
	{@const isComingSoon = item.comingSoon === true}
	{@const isEnabled = !isComingSoon && !disabledPaths.includes(item.href)}
	<div
		in:fly={{ y: 12, duration: 460, delay: 70 + index * 35, easing: quintOut }}
		class="group/item relative grid grid-cols-[1fr_auto] items-center border-b border-alt-petrol-950/8 transition-[background-color,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] last:border-b-0 {isEnabled
			? ''
			: 'opacity-48'}"
	>
		{#if isComingSoon}
			<div
				class="flex min-w-0 cursor-not-allowed items-center gap-3 px-4 py-4"
				aria-disabled="true"
			>
				<span
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-alt-petrol-950/5 text-xs font-semibold text-alt-petrol-600"
					aria-hidden="true"
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
				class="flex min-w-0 items-center gap-3 px-4 py-4 outline-none"
				onclick={() => uiStore.closeMenu()}
				aria-current={isLinkActive(item.href) ? 'page' : undefined}
			>
				<span
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] text-xs font-semibold transition-[background-color,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] {isLinkActive(
						item.href
					)
						? 'bg-alt-petrol-accent-600/11 text-alt-petrol-accent-600'
						: 'bg-alt-petrol-950/5 text-alt-petrol-700'}"
					aria-hidden="true"
				>
					{item.label.slice(0, 1)}
				</span>
				<div class="min-w-0 flex-1">
					<span
						class="text-sm font-semibold tracking-[-0.015em] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] {isLinkActive(
							item.href
						)
							? 'text-alt-petrol-accent-600'
							: 'text-alt-petrol-950'}"
					>
						{item.label}
					</span>
					{#if item.desc}
						<p class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-alt-petrol-500">
							{item.desc}
						</p>
					{/if}
				</div>
				{#if !isEditable}
					<span
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-alt-petrol-700 shadow-[0_6px_18px_-12px] ring-1 shadow-alt-petrol-950/65 ring-alt-petrol-950/8"
						aria-hidden="true"
					>
						{@render arrowIcon('h-3.5 w-3.5')}
					</span>
				{/if}
			</a>
		{/if}

		{#if isEditable && !isComingSoon}
			<div class="pr-3">
				<button
					type="button"
					onclick={(event) => onToggle(item.href, isEnabled, event)}
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-[background-color,color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 {isEnabled
						? 'bg-alt-petrol-accent-600/10 text-alt-petrol-accent-600 ring-1 ring-alt-petrol-accent-600/20'
						: 'bg-alt-petrol-950/5 text-alt-petrol-400 ring-1 ring-alt-petrol-950/10'}"
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

{#snippet trigger(label: string, kind: MenuKind)}
	<button
		type="button"
		onclick={() => toggleSection(kind)}
		class="group relative flex w-full items-center justify-between rounded-full px-4 py-2 text-left text-[13px] font-medium tracking-[-0.01em] transition-[color,background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] {isSectionActive(
			kind
		)
			? 'bg-surface-raised text-alt-petrol-950 shadow-[0_8px_24px_-16px] shadow-alt-petrol-950/55'
			: 'bg-alt-petrol-accent-600/8 text-alt-petrol-800'}"
		aria-expanded={openSection === kind}
		aria-controls="mobile-menu-{kind}"
	>
		<span>{label}</span>
		<span
			class="flex h-6 w-6 items-center justify-center rounded-full transition-[background-color,color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] {openSection ===
			kind
				? 'rotate-180 bg-alt-petrol-accent-600/12 text-alt-petrol-accent-600'
				: 'bg-alt-petrol-950/5 text-alt-petrol-600'}"
			aria-hidden="true"
		>
			<svg class="h-3 w-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="m4 6 4 4 4-4" />
			</svg>
		</span>
	</button>
{/snippet}

<!--
	Учётная запись и контакты в языке варианта 3.

	Остров набран пилюлями и круглыми бейджами на шкале `alt-petrol`, поэтому
	и эти два блока — пилюли: строка контакта повторяет анатомию пункта
	навигации (бейдж 7×7 слева, подпись 13px с отрицательным трекингом), а
	«Войти» берёт тон тёмной колонки — в острове это самая сильная поверхность,
	и главное действие законно её носит. Разделены блоки тем же волосяным
	`border-t border-alt-petrol-950/8`, что каталог и город, и надзаголовок у
	них тот же 9px вразрядку.

	Телефон помечен акцентным бейджем `alt-petrol-accent` — единственным
	хроматическим пятном варианта; им же остров метит раскрытый раздел.
-->
{#snippet groupHead(label: string)}
	<p class="text-[9px] font-semibold tracking-[0.18em] text-alt-petrol-400 uppercase">{label}</p>
{/snippet}

{#snippet badge(accent: boolean, path: string)}
	<span
		class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full {accent
			? 'bg-alt-petrol-accent-600/12 text-alt-petrol-accent-600'
			: 'bg-alt-petrol-950/5 text-alt-petrol-600'}"
		aria-hidden="true"
	>
		<svg
			class="h-3.5 w-3.5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="1.5"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d={path} />
		</svg>
	</span>
{/snippet}

{#snippet contactRow(
	href: string,
	label: string,
	path: string,
	accent: boolean,
	onclick?: () => void
)}
	<a
		{href}
		{onclick}
		class="flex items-center gap-3 rounded-full px-3 py-2 text-[13px] font-medium tracking-[-0.01em] text-alt-petrol-800 transition-[color,background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none active:scale-[0.98] active:bg-alt-petrol-950/5"
	>
		{@render badge(accent, path)}
		<span class="min-w-0 flex-1 truncate">{label}</span>
	</a>
{/snippet}

{#snippet accountBlock()}
	<div class="border-b border-alt-petrol-950/8 px-4 py-4">
		{@render groupHead('Учётная запись')}
		{#if account.client}
			<div class="mt-3 flex items-center gap-3">
				{@render badge(
					true,
					'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0'
				)}
				<a href={account.cabinet} onclick={() => uiStore.closeMenu()} class="min-w-0 flex-1">
					<span class="block text-[13px] font-medium tracking-[-0.01em] text-alt-petrol-950"
						>Личный кабинет</span
					>
					<span class="mt-0.5 block truncate text-[11px] text-alt-petrol-500"
						>{account.client.email}</span
					>
				</a>
				<button
					type="button"
					onclick={account.logout}
					disabled={account.isLoggingOut}
					class="shrink-0 cursor-pointer rounded-full bg-alt-petrol-950/5 px-3.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-alt-petrol-700 transition-[color,background-color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] disabled:cursor-default disabled:opacity-60"
				>
					Выйти
				</button>
			</div>
		{:else}
			<div class="mt-3 flex gap-2">
				<button
					type="button"
					onclick={account.openLogin}
					class="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full bg-alt-petrol-950 px-4 text-[13px] font-medium tracking-[-0.01em] text-on-dark shadow-[0_10px_28px_-18px] shadow-alt-petrol-950/70 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
				>
					Войти
				</button>
				<button
					type="button"
					onclick={account.openRegister}
					class="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full bg-alt-petrol-950/5 px-4 text-[13px] font-medium tracking-[-0.01em] text-alt-petrol-700 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
				>
					Регистрация
				</button>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet contactsBlock()}
	{#if sitePhone || email || contactsLink}
		<div class="border-t border-alt-petrol-950/8 px-4 py-4">
			{@render groupHead('Контакты')}
			<div class="mt-2 flex flex-col gap-0.5">
				{#if sitePhone}
					{@render contactRow(
						phoneHref,
						sitePhone,
						'M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
						true
					)}
				{/if}
				{#if email}
					{@render contactRow(
						`mailto:${email}`,
						email,
						'M3 8l7.89 4.26a2 2 0 001.94 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
						false
					)}
				{/if}
				{#if contactsLink}
					{@render contactRow(
						contactsLink.href,
						contactsLink.label,
						'M5 12h14M13 6l6 6-6 6',
						false,
						() => uiStore.closeMenu()
					)}
				{/if}
			</div>
		</div>
	{/if}
{/snippet}

{#if uiStore.menuOpen}
	<div
		class="px-3 pt-1 pb-4 lg:hidden"
		transition:fly={{ y: -14, duration: 440, easing: quintOut }}
	>
		<div
			class="rounded-[2.15rem] bg-alt-petrol-200/85 p-1.5 shadow-[0_32px_90px_-38px] ring-1 shadow-alt-petrol-950/55 ring-alt-petrol-950/8 backdrop-blur-2xl"
		>
			<nav
				class="max-h-[74dvh] overflow-y-auto rounded-[calc(2.15rem-0.375rem)] bg-surface-raised shadow-[inset_0_1px_0] shadow-on-dark/95 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				aria-label="Мобильная навигация"
			>
				<!-- Шапка острова = тёмная колонка десктопной панели, положенная сверху. -->
				<div class="relative overflow-hidden bg-alt-petrol-950 px-5 py-6 text-on-dark">
					<div
						class="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full border border-on-dark/8"
					></div>
					<div
						class="pointer-events-none absolute -right-6 -bottom-8 h-28 w-28 rounded-full border border-alt-petrol-accent-400/25"
					></div>
					<div
						class="pointer-events-none absolute right-8 bottom-6 h-2 w-2 rounded-full bg-alt-petrol-accent-400"
					></div>

					<div class="relative">
						<div class="flex items-start justify-between gap-4">
							<p
								class="text-[8px] font-semibold tracking-[0.24em] text-alt-petrol-accent-300 uppercase"
							>
								{heading.eyebrow}
							</p>
							<span
								class="flex h-7 min-w-7 items-center justify-center rounded-full bg-on-dark/9 px-2 text-[10px] font-semibold text-on-dark/80"
								aria-label="Количество разделов"
							>
								{heading.count}
							</span>
						</div>
						<p class="p1-title-display mt-3 text-[1.75rem]">
							{heading.title}
						</p>
						<p class="mt-3 max-w-[18rem] text-[11px] leading-relaxed text-on-dark/55">
							{heading.description}
						</p>

						{#if heading.rootHref}
							<a
								href={heading.rootHref}
								onclick={() => uiStore.closeMenu()}
								class="group/all mt-5 flex items-center justify-between gap-3 border-t border-on-dark/12 pt-4 text-[10px] font-medium tracking-[0.04em] text-on-dark/75 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
							>
								<span>Смотреть всё</span>
								<span
									class="flex h-7 w-7 items-center justify-center rounded-full bg-on-dark/9 text-on-dark"
									aria-hidden="true"
								>
									{@render arrowIcon('h-3.5 w-3.5')}
								</span>
							</a>
						{/if}
					</div>
				</div>

				{@render accountBlock()}

				<!--
					Полоса навигации в двойной оправе — та же, что на десктопе, но столбцом.
					
					Пилюли покоя подмыты акцентом варианта (8% `alt-petrol-accent-600`) —
					28.08.2026, вслед за 1.М.1.1: до этого пункт в покое был прозрачен и
					вся полоса читалась пустой оправой. Выбранный пункт не тронут: он
					по-прежнему белая приподнятая пилюля, то есть остаётся сильнее
					подмывки, а не спорит с ней.
					
					Поле пилюли — `py-2`: 37px у ссылки и 40px у раздела (там держит
					кружок шеврона). Это ниже цели касания 44 — шаг сделан осознанно,
					ради более плотной полосы; пилюля идёт во всю ширину оправы, и
					промахнуться по ней сложнее, чем по чипу той же высоты.
				-->
				<div class="p-3">
					<div
						class="rounded-[1.45rem] bg-alt-petrol-100/80 p-1 shadow-[0_16px_46px_-30px] ring-1 shadow-alt-petrol-950/48 ring-alt-petrol-950/7"
					>
						<div
							class="flex flex-col gap-0.5 rounded-[calc(1.45rem-0.25rem)] bg-alt-petrol-50/92 p-0.5 shadow-[inset_0_1px_0] shadow-on-dark/95"
						>
							{#each links as link}
								{#if link.label === 'Услуги'}
									{@render trigger(link.label, 'services')}
								{:else if link.label === 'Каталог'}
									{@render trigger(link.label, 'catalog')}
								{:else}
									<a
										href={link.href}
										onclick={() => uiStore.closeMenu()}
										aria-current={isLinkActive(link.href) ? 'page' : undefined}
										class="flex items-center rounded-full px-4 py-2 text-[13px] font-medium tracking-[-0.01em] transition-[color,background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none active:scale-[0.98] {isLinkActive(
											link.href
										)
											? 'bg-surface-raised text-alt-petrol-950 shadow-[0_8px_24px_-16px] shadow-alt-petrol-950/55'
											: 'bg-alt-petrol-accent-600/8 text-alt-petrol-800'}"
									>
										{link.label}
									</a>
								{/if}
							{/each}
						</div>
					</div>
				</div>

				{#if openSection === 'services'}
					<div
						id="mobile-menu-services"
						transition:slide={{ duration: 360, easing: quintOut }}
						class="border-t border-alt-petrol-950/8"
					>
						{#each visibleServiceItems as service, index (service.href)}
							{@render sectionItem(
								service,
								index,
								disabledServices,
								onToggleService,
								'Скрыть услугу',
								'Показать услугу'
							)}
						{/each}
					</div>
				{:else if openSection === 'catalog'}
					<div
						id="mobile-menu-catalog"
						transition:slide={{ duration: 360, easing: quintOut }}
						class="border-t border-alt-petrol-950/8"
					>
						{#each visibleCatalogItems as item, index (item.href)}
							{@render sectionItem(
								item,
								index,
								disabledRubrics,
								onToggleRubric,
								'Скрыть рубрику',
								'Показать рубрику'
							)}
						{/each}
					</div>
				{/if}

				<div class="border-t border-alt-petrol-950/8 px-4 py-4">
					<p class="text-[9px] font-semibold tracking-[0.18em] text-alt-petrol-400 uppercase">
						Город
					</p>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each cities as city}
							<button
								type="button"
								onclick={() => cityStore.set(city.label)}
								aria-pressed={cityStore.city === city.label}
								class="flex min-h-11 items-center rounded-full px-4 text-[13px] font-medium tracking-[-0.01em] whitespace-nowrap transition-[color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] {cityStore.city ===
								city.label
									? 'bg-surface-raised text-alt-petrol-950 shadow-[0_8px_24px_-16px] ring-1 shadow-alt-petrol-950/55 ring-alt-petrol-950/8'
									: 'bg-alt-petrol-950/5 text-alt-petrol-700'}"
							>
								{city.label}
							</button>
						{/each}
					</div>
				</div>
				{@render contactsBlock()}
			</nav>
		</div>
	</div>
{/if}
