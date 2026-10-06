<script lang="ts">
	// Мобильная половина версии 1.М.1.3 — см. ./Menu.svelte и ../Mobile.svelte
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
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
	type MenuKind = 'catalog' | 'services' | 'information';
	type MenuModal = MenuKind | 'city';
	type ToggleHandler = (href: string, currentEnabled: boolean, event: Event) => void;

	// Вариант 3 мобильного меню — светлый остров с компактными прямоугольными
	// пунктами. Каталог, услуги, информация и города открываются в отдельных модальных окнах.
	//
	// Тёмная колонка остаётся шапкой основного листа; разделы получают собственные
	// заголовки внутри модальных окон.
	// Телефон, почта и вход приходят в лист с 25.08.2026: строка
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
		informationLinks: BannerLink[];
		isEditable?: boolean;
		onToggleRubric: ToggleHandler;
		onToggleService: ToggleHandler;
	} = $props();

	const account = createClientAccount();
	const phoneHref = $derived(sitePhoneHref(sitePhone));
	const informationHrefs = new Set([
		'/about',
		'/partnership',
		'/testimonials',
		'/installment',
		'/guarantees',
		'/contacts'
	]);
	const visibleInformationLinks = $derived(
		informationLinks.filter((link) => informationHrefs.has(link.href))
	);
	let catalogDialog = $state<HTMLDialogElement>();
	let servicesDialog = $state<HTMLDialogElement>();
	let informationDialog = $state<HTMLDialogElement>();
	let cityDialog = $state<HTMLDialogElement>();
	let activeModal = $state<MenuModal | null>(null);
	const closingDialogs = new WeakSet<HTMLDialogElement>();

	function dialogFor(kind: MenuModal) {
		return kind === 'catalog'
			? catalogDialog
			: kind === 'services'
				? servicesDialog
				: kind === 'information'
					? informationDialog
					: cityDialog;
	}

	function openModal(kind: MenuModal) {
		const dialog = dialogFor(kind);
		if (!dialog || dialog.open) return;
		activeModal = kind;
		dialog.showModal();
	}

	async function closeModal(kind: MenuModal) {
		const dialog = dialogFor(kind);
		if (!dialog?.open || closingDialogs.has(dialog)) return;
		closingDialogs.add(dialog);
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const duration = reducedMotion ? 120 : 220;
		dialog.style.setProperty('--menu-modal-exit-duration', `${duration}ms`);
		dialog.classList.add('is-closing');
		const animation = dialog.animate(
			reducedMotion
				? [{ opacity: 1 }, { opacity: 0 }]
				: [
						{ opacity: 1, transform: 'translateY(0) scale(1)' },
						{ opacity: 0, transform: 'translateY(8px) scale(0.99)' }
					],
			{ duration, easing: 'ease-in', fill: 'forwards' }
		);
		try {
			await animation.finished;
		} catch {
			// Размонтирование меню может отменить анимацию.
		} finally {
			if (dialog.open && dialog.isConnected) dialog.close();
			animation.cancel();
			dialog.classList.remove('is-closing');
			dialog.style.removeProperty('--menu-modal-exit-duration');
			if (activeModal === kind && dialogFor(kind) === dialog) activeModal = null;
			closingDialogs.delete(dialog);
		}
	}

	function closeActiveModal() {
		if (activeModal) {
			const kind = activeModal;
			activeModal = null;
			void closeModal(kind);
		}
	}

	function keepEscapeInModal(event: KeyboardEvent) {
		if (event.key === 'Escape') event.stopPropagation();
	}

	function cancelModal(kind: MenuModal, event: Event) {
		event.preventDefault();
		event.stopPropagation();
		void closeModal(kind);
	}

	const isLinkActive = (href: string) => $page.url.pathname === href;
	const isSectionActive = (kind: MenuKind) =>
		activeModal === kind ||
		(kind === 'catalog'
			? visibleCatalogItems.some((item) => $page.url.pathname.startsWith(item.href))
			: kind === 'services'
				? visibleServiceItems.some((item) => $page.url.pathname === item.href)
				: visibleInformationLinks.some((item) => $page.url.pathname === item.href));
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

<!-- Строка раздела: название, пояснение и стрелка. -->
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
				class="flex min-w-0 cursor-not-allowed items-center px-4 py-4"
				role="link"
				aria-disabled="true"
			>
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-lg font-semibold tracking-[-0.015em] text-alt-petrol-950"
							>{item.label}</span
						>
						<span
							class="rounded-full bg-alt-petrol-950/6 px-2 py-1 text-xs font-semibold tracking-[0.14em] text-alt-petrol-600 uppercase"
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
				onclick={() => {
					closeActiveModal();
					uiStore.closeMenu();
				}}
				data-goal-ignore="Закрытие модального меню при переходе к разделу"
				aria-current={isLinkActive(item.href) ? 'page' : undefined}
			>
				<div class="min-w-0 flex-1">
					<span
						class="text-lg font-semibold tracking-[-0.015em] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] {isLinkActive(
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
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-surface-raised text-alt-petrol-700 shadow-[0_6px_18px_-12px] ring-1 shadow-alt-petrol-950/65 ring-alt-petrol-950/8"
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
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm transition-[background-color,color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 {isEnabled
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
		onclick={() => openModal(kind)}
		data-goal-ignore="Открывает модальное окно навигации без формы"
		class="group relative flex min-h-11 w-full items-center justify-between rounded-sm px-4 py-2 text-left text-sm font-medium tracking-[-0.01em] transition-[color,background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] {isSectionActive(
			kind
		)
			? 'bg-alt-petrol-950 text-on-dark shadow-[0_8px_24px_-16px] shadow-alt-petrol-950/55'
			: 'bg-surface-raised text-alt-petrol-800'}"
		aria-haspopup="dialog"
		aria-expanded={activeModal === kind}
		aria-controls="mobile-menu-{kind}-dialog"
	>
		<span>{label}</span>
		<span
			class="flex h-6 w-6 items-center justify-center rounded-sm transition-[background-color,color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] {activeModal ===
			kind
				? 'rotate-180'
				: ''} {isSectionActive(kind)
				? 'bg-on-dark/15 text-on-dark'
				: 'bg-alt-petrol-950/5 text-alt-petrol-600'}"
			aria-hidden="true"
		>
			<svg class="h-3 w-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="m4 6 4 4 4-4" />
			</svg>
		</span>
	</button>
{/snippet}

{#snippet modalHeader(kind: MenuModal, title: string)}
	<header
		class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-alt-petrol-950/8 bg-surface-raised px-4 py-3"
	>
		<h2 id="mobile-menu-{kind}-title" class="p1-title-sub text-lg text-alt-petrol-950">{title}</h2>
		<button
			type="button"
			onclick={() => void closeModal(kind)}
			data-goal-ignore="Закрывает модальное окно навигации без формы"
			class="flex size-11 shrink-0 items-center justify-center rounded-sm bg-alt-petrol-950/5 focus-visible:outline-2 {kind ===
			'city'
				? 'text-alt-petrol-700 focus-visible:outline-alt-petrol-accent-600'
				: 'text-brand-600 focus-visible:outline-brand-600'}"
			aria-label="Закрыть окно: {title}"
		>
			<svg
				class="size-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="1.8"
				aria-hidden="true"
			>
				<path stroke-linecap="round" d="m6 6 12 12M18 6 6 18" />
			</svg>
		</button>
	</header>
{/snippet}

<!--
	Контакты и учётная запись завершают мобильный лист. Их строки и кнопки
	используют ту же компактную прямоугольную форму, что основная навигация.
	Телефон остаётся акцентным действием; цели входа и регистрации сохранены.
-->
{#snippet groupHead(label: string)}
	<p class="p1-label text-alt-petrol-400">{label}</p>
{/snippet}

{#snippet badge(accent: boolean, path: string)}
	<span
		class="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm {accent
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
		class="flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium tracking-[-0.01em] text-alt-petrol-800 transition-[color,background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none active:scale-[0.98] active:bg-alt-petrol-950/5"
	>
		{@render badge(accent, path)}
		<span class="min-w-0 flex-1 truncate">{label}</span>
	</a>
{/snippet}

{#snippet accountBlock()}
	<div class="border-t border-alt-petrol-950/8 px-4 py-4">
		{@render groupHead('Учётная запись')}
		{#if account.client}
			<div class="mt-3 flex items-center gap-3">
				{@render badge(
					true,
					'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0'
				)}
				<a href={account.cabinet} onclick={() => uiStore.closeMenu()} class="min-w-0 flex-1">
					<span class="block text-sm font-medium tracking-[-0.01em] text-alt-petrol-950"
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
					class="shrink-0 cursor-pointer rounded-sm bg-alt-petrol-950/5 px-3.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-alt-petrol-700 transition-[color,background-color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] disabled:cursor-default disabled:opacity-60"
				>
					Выйти
				</button>
			</div>
		{:else}
			<div class="mt-3 flex gap-2">
				<button
					data-metrika-goal="layout_menu_v3_mobilemenu_open_1"
					data-goal-action="open"
					type="button"
					onclick={account.openLogin}
					class="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-sm bg-alt-petrol-950 px-4 text-sm font-medium tracking-[-0.01em] text-on-dark shadow-[0_10px_28px_-18px] shadow-alt-petrol-950/70 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
				>
					Войти
				</button>
				<button
					data-metrika-goal="layout_menu_v3_mobilemenu_open_2"
					data-goal-action="open"
					type="button"
					onclick={account.openRegister}
					class="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-sm bg-alt-petrol-950/5 px-4 text-sm font-medium tracking-[-0.01em] text-alt-petrol-700 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
				>
					Регистрация
				</button>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet contactsBlock()}
	{#if sitePhone || email}
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
			class="rounded-sm bg-alt-petrol-200/85 p-1.5 shadow-[0_32px_90px_-38px] ring-1 shadow-alt-petrol-950/55 ring-alt-petrol-950/8 backdrop-blur-2xl"
		>
			<nav
				class="max-h-[74dvh] overflow-y-auto rounded-sm bg-surface-raised shadow-[inset_0_1px_0] shadow-on-dark/95 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				aria-label="Мобильная навигация"
			>
				<!-- Шапка острова = тёмная колонка десктопной панели, положенная сверху. -->
				<div class="relative overflow-hidden bg-alt-petrol-950 px-5 py-4 text-on-dark">
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
						<p class="p1-title-display text-2xl">Меню</p>
					</div>
				</div>

				<!-- Разделы открывают отдельные модальные окна. -->
				<div class="p-3">
					<div class="rounded-sm bg-linear-to-r from-ink-100/20 to-ink-50/80 p-1 backdrop-blur-xl">
						<div class="flex flex-col gap-0.5 rounded-sm bg-transparent p-0.5">
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
										class="flex min-h-11 items-center rounded-sm px-4 py-2 text-sm font-medium tracking-[-0.01em] transition-[color,background-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none active:scale-[0.98] {isLinkActive(
											link.href
										)
											? 'bg-alt-petrol-950 text-on-dark shadow-[0_8px_24px_-16px] shadow-alt-petrol-950/55'
											: 'bg-surface-raised text-alt-petrol-800'}"
									>
										{link.label}
									</a>
								{/if}
							{/each}
						</div>
					</div>
				</div>

				{#if visibleInformationLinks.length > 0}
					<div class="border-t border-alt-petrol-950/8 px-4 py-2.5">
						{@render trigger('Информация', 'information')}
					</div>
				{/if}

				<div class="border-t border-alt-petrol-950/8 px-4 py-2.5">
					<button
						type="button"
						onclick={() => openModal('city')}
						data-goal-ignore="Открывает модальное окно выбора города без формы"
						aria-haspopup="dialog"
						aria-expanded={activeModal === 'city'}
						aria-controls="mobile-menu-city-dialog"
						class="flex min-h-11 w-full items-center justify-between gap-3 rounded-sm px-4 py-2 text-left text-sm font-medium {activeModal ===
						'city'
							? 'bg-alt-petrol-950 text-on-dark shadow-[0_8px_24px_-16px] shadow-alt-petrol-950/55'
							: 'bg-surface-raised text-alt-petrol-800'}"
					>
						<span class="min-w-0 truncate">Город: {cityStore.city}</span>
						<span
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm transition-transform duration-500 {activeModal ===
							'city'
								? 'rotate-180 bg-on-dark/15 text-on-dark'
								: 'bg-alt-petrol-950/5 text-alt-petrol-600'}"
							aria-hidden="true"
						>
							<svg
								class="h-3 w-3"
								fill="none"
								viewBox="0 0 16 16"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="m4 6 4 4 4-4" />
							</svg>
						</span>
					</button>
				</div>
				{@render contactsBlock()}
				{@render accountBlock()}
			</nav>
		</div>
	</div>

	<dialog
		bind:this={catalogDialog}
		id="mobile-menu-catalog-dialog"
		aria-labelledby="mobile-menu-catalog-title"
		onclose={() => {
			if (activeModal === 'catalog') activeModal = null;
		}}
		oncancel={(event) => cancelModal('catalog', event)}
		onkeydown={keepEscapeInModal}
		class="menu-modal fixed inset-0 m-auto max-h-[min(82dvh,44rem)] w-[calc(100vw-2rem)] max-w-xl overflow-y-auto rounded-sm border border-alt-petrol-950/10 bg-surface-raised p-0 text-alt-petrol-950 shadow-[0_32px_90px_-38px] shadow-alt-petrol-950/55 backdrop:bg-scrim/60"
	>
		{@render modalHeader('catalog', 'Каталог')}
		<div class="p-2">
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
	</dialog>

	<dialog
		bind:this={servicesDialog}
		id="mobile-menu-services-dialog"
		aria-labelledby="mobile-menu-services-title"
		onclose={() => {
			if (activeModal === 'services') activeModal = null;
		}}
		oncancel={(event) => cancelModal('services', event)}
		onkeydown={keepEscapeInModal}
		class="menu-modal fixed inset-0 m-auto max-h-[min(82dvh,44rem)] w-[calc(100vw-2rem)] max-w-xl overflow-y-auto rounded-sm border border-alt-petrol-950/10 bg-surface-raised p-0 text-alt-petrol-950 shadow-[0_32px_90px_-38px] shadow-alt-petrol-950/55 backdrop:bg-scrim/60"
	>
		{@render modalHeader('services', 'Услуги')}
		<div class="p-2">
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
	</dialog>

	<dialog
		bind:this={informationDialog}
		id="mobile-menu-information-dialog"
		aria-labelledby="mobile-menu-information-title"
		onclose={() => {
			if (activeModal === 'information') activeModal = null;
		}}
		oncancel={(event) => cancelModal('information', event)}
		onkeydown={keepEscapeInModal}
		class="menu-modal fixed inset-0 m-auto max-h-[min(82dvh,44rem)] w-[calc(100vw-2rem)] max-w-xl overflow-y-auto rounded-sm border border-alt-petrol-950/10 bg-surface-raised p-0 text-alt-petrol-950 shadow-[0_32px_90px_-38px] shadow-alt-petrol-950/55 backdrop:bg-scrim/60"
	>
		{@render modalHeader('information', 'Информация')}
		<div class="flex flex-col gap-1 p-2">
			{#each visibleInformationLinks as link (link.href)}
				<a
					href={link.href}
					onclick={() => {
						closeActiveModal();
						uiStore.closeMenu();
					}}
					data-goal-ignore="Закрытие информационного окна при переходе по ссылке"
					aria-current={isLinkActive(link.href) ? 'page' : undefined}
					class="flex min-h-11 items-center rounded-sm px-4 py-2 text-sm font-medium transition-[background-color,color] {isLinkActive(
						link.href
					)
						? 'bg-alt-petrol-950 text-on-dark'
						: 'bg-surface-raised text-alt-petrol-800'}"
				>
					{link.label}
				</a>
			{/each}
		</div>
	</dialog>

	<dialog
		bind:this={cityDialog}
		id="mobile-menu-city-dialog"
		aria-labelledby="mobile-menu-city-title"
		onclose={() => {
			if (activeModal === 'city') activeModal = null;
		}}
		oncancel={(event) => cancelModal('city', event)}
		onkeydown={keepEscapeInModal}
		class="menu-modal fixed inset-0 m-auto max-h-[min(82dvh,44rem)] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-sm border border-alt-petrol-950/10 bg-surface-raised p-0 text-alt-petrol-950 shadow-[0_32px_90px_-38px] shadow-alt-petrol-950/55 backdrop:bg-scrim/60"
	>
		{@render modalHeader('city', 'Выберите город')}
		<div class="flex flex-col gap-1 p-2">
			{#each cities as city}
				<button
					type="button"
					onclick={() => {
						cityStore.set(city.label);
						void closeModal('city');
					}}
					data-goal-ignore="Выбор города не открывает форму"
					aria-pressed={cityStore.city === city.label}
					class="flex min-h-11 w-full items-center rounded-sm px-4 text-left text-sm font-medium tracking-[-0.01em] transition-[color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] {cityStore.city ===
					city.label
						? 'bg-alt-petrol-accent-600/12 text-alt-petrol-950 ring-1 ring-alt-petrol-accent-600/25'
						: 'bg-alt-petrol-950/5 text-alt-petrol-700'}"
				>
					{city.label}
				</button>
			{/each}
		</div>
	</dialog>
{/if}

<style>
	.menu-modal[open]:not(.is-closing) {
		animation: menu-modal-enter var(--ds-motion-duration-ui) var(--ds-motion-ease) both;
	}

	.menu-modal[open]:not(.is-closing)::backdrop {
		animation: menu-backdrop-enter var(--ds-motion-duration-ui) ease-out both;
	}

	.menu-modal.is-closing::backdrop {
		animation: menu-backdrop-exit var(--menu-modal-exit-duration) ease-in both;
	}

	@keyframes menu-modal-enter {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.985);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes menu-backdrop-enter {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes menu-backdrop-exit {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.menu-modal[open]:not(.is-closing),
		.menu-modal[open]:not(.is-closing)::backdrop {
			animation: menu-backdrop-enter 120ms ease-out both;
		}
	}
</style>
