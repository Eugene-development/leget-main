<script lang="ts">
	// Артикул: 1.М.1.1 — см. docs/architecture/component-articles-map.md
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { cityStore } from '$lib/stores/city.svelte';
	import { uiStore } from '$lib/stores/ui.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { editStore } from '$lib/stores/edit.svelte';
	import { saveLayoutData, type EditContext } from '$lib/utils/page-edit';
	import { catalogItems } from './catalogItems';
	import { serviceItems } from './serviceItems';
	import Menu from './Menu/index.svelte';

	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
	} = $props();

	const siteName = $derived(typeof data?.siteName === 'string' ? data.siteName : 'Логотип');
	const links = $derived(
		Array.isArray(data?.links) && (data.links as unknown[]).length > 0
			? (data.links as { href: string; label: string }[])
			: [
					{ href: '/', label: 'Главная' },
					{ href: '/actions', label: 'Акции' },
					{ href: '/catalog', label: 'Каталог' },
					{ href: '/services', label: 'Услуги' },
					{ href: '/contacts', label: 'Контакты' }
				]
	);

	// Локальное состояние списков отключённых рубрик/услуг.
	//
	// data — bindable-пропс, но ComponentResolver передаёт его БЕЗ bind:, поэтому
	// присваивание `data = updatedData` не гарантирует ре-рендер зависимых $derived.
	// Чтобы переключатели реагировали мгновенно, храним списки в явном $state
	// и синхронизируем их с data через $effect (на случай external-обновления data,
	// например после invalidateAll). UI читает именно эти переменные.
	let disabledRubrics = $state<string[]>([]);
	let disabledServices = $state<string[]>([]);

	$effect(() => {
		const r = Array.isArray(data?.disabledRubrics) ? (data.disabledRubrics as string[]) : [];
		const next = [...r].sort();
		const cur = [...disabledRubrics].sort();
		if (next.join('\u0001') !== cur.join('\u0001')) {
			disabledRubrics = [...r];
		}
	});
	$effect(() => {
		const s = Array.isArray(data?.disabledServices) ? (data.disabledServices as string[]) : [];
		const next = [...s].sort();
		const cur = [...disabledServices].sort();
		if (next.join('\u0001') !== cur.join('\u0001')) {
			disabledServices = [...s];
		}
	});

	const visibleCatalogItems = $derived(
		catalogItems.filter(
			(item) =>
				item.comingSoon === true ||
				isEditable ||
				!disabledRubrics.includes(item.href)
		)
	);

	const visibleServiceItems = $derived(
		serviceItems.filter(
			(item) =>
				item.comingSoon === true ||
				isEditable ||
				!disabledServices.includes(item.href)
		)
	);

	async function handleToggleRubric(href: string, currentEnabled: boolean, e: Event) {
		e.preventDefault();
		e.stopPropagation();

		// Мгновенный отклик UI: обновляем локальный $state синхронно.
		disabledRubrics = currentEnabled
			? [...disabledRubrics, href]
			: disabledRubrics.filter((h) => h !== href);

		if (!editContext) return;
		const updatedData = { ...data, disabledRubrics };
		data = updatedData;
		try {
			await saveLayoutData(editContext, 'Header', updatedData);
		} catch (err: any) {
			// Откатываем локальное состояние при ошибке сохранения.
			disabledRubrics = currentEnabled
				? disabledRubrics.filter((h) => h !== href)
				: [...disabledRubrics, href];
			data = { ...data, disabledRubrics };
			console.error('Failed to toggle rubric:', err);
			alert('Не удалось сохранить настройки каталога: ' + (err.message || 'ошибка'));
		}
	}

	// Переключатель видимости услуги. Симметричен handleToggleRubric, но пишет
	// в disabledServices — отдельный список, чтобы каталог и услуги управлялись независимо.
	async function handleToggleService(href: string, currentEnabled: boolean, e: Event) {
		e.preventDefault();
		e.stopPropagation();

		// Мгновенный отклик UI: обновляем локальный $state синхронно.
		disabledServices = currentEnabled
			? [...disabledServices, href]
			: disabledServices.filter((h) => h !== href);

		if (!editContext) return;
		const updatedData = { ...data, disabledServices };
		data = updatedData;
		try {
			await saveLayoutData(editContext, 'Header', updatedData);
		} catch (err: any) {
			// Откатываем локальное состояние при ошибке сохранения.
			disabledServices = currentEnabled
				? disabledServices.filter((h) => h !== href)
				: [...disabledServices, href];
			data = { ...data, disabledServices };
			console.error('Failed to toggle service:', err);
			alert('Не удалось сохранить настройки услуг: ' + (err.message || 'ошибка'));
		}
	}

	let headerEl: HTMLElement;
	let visibleCityMenu = $state(false);

	// Публикуем реальную высоту хедера как CSS-переменную --header-h на :root.
	// Hero-компоненты используют её для вычисления calc(100dvh - var(--header-h)).
	$effect(() => {
		if (!headerEl) return;
		const update = () =>
			document.documentElement.style.setProperty('--header-h', headerEl.offsetHeight + 'px');
		update();
		const ro = new ResizeObserver(update);
		ro.observe(headerEl);
		return () => ro.disconnect();
	});
	// Активность пункта мобильного меню — по текущему пути (hover в мобильном меню нет).
	// Десктопная навигация вынесена в компонент Menu (v1/v2) со своим hover-состоянием.
	function isLinkActive(href: string) {
		return $page.url.pathname === href;
	}


	const defaultCities = [
		'Москва и МО',
		'Санкт-Петербург',
		'Новосибирск',
		'Екатеринбург',
		'Казань',
		'Нижний Новгород'
	];

	const citiesRaw = $derived(
		typeof data?.cities === 'string' ? data.cities : defaultCities.join('\n')
	);
	const cities = $derived(
		citiesRaw
			.split('\n')
			.filter(Boolean)
			.map((c) => ({ label: c.trim() }))
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveLayoutData(editContext, 'Header', updated);
		data = updated;
	}
</script>

<!--
	Google Fonts for the entire Promo-1 template loaded ONCE here.
	Previously each v2/v3/v4 component had its own <link>/<style>@import,
	causing redundant blocking requests that kept the tab spinner going.
-->
<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@400;600;700;800;900&display=swap"
	/>
</svelte:head>

{#snippet comingSoonIndicator(paddingClass = 'pr-3')}
	<div class="flex shrink-0 items-center {paddingClass}" title="В разработке">
		<span
			class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-200/80"
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
{/snippet}

<header bind:this={headerEl} class="sticky top-0 z-[150] w-full sm:bg-white/95 sm:shadow-lg sm:backdrop-blur">
	<div class="max-w-9xl mx-auto hidden items-center justify-between px-4 py-4 sm:flex sm:px-8">
		<!-- Левая часть: Логотип -->
		<div class="flex flex-1 justify-start">
			<a
				href="/"
				class="group relative z-30 -m-1.5 -mb-10 hidden min-w-[140px] flex-col items-center justify-center rounded-b-2xl bg-white px-6 py-4 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl sm:flex"
			>
				<span class="sr-only">{siteName}</span>
				{#if data?.logoUrl}
					<img
						class="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
						src={String(data.logoUrl)}
						alt="Логотип {siteName}"
					/>
				{:else}
					<div class="flex flex-col items-center">
						<div
							class="mb-1 size-8 rounded-full bg-linear-to-tr from-sky-400 to-indigo-500 shadow-sm transition-transform duration-300 group-hover:scale-110"
						></div>
						<EditableField
							fieldKey="Header.siteName"
							label="Название сайта"
							value={!data?.siteName || data.siteName === 'Новострой'
								? 'Логотип'
								: String(data.siteName)}
							onSave={(val) => saveField('siteName', val)}
							{isEditable}
						>
							{#snippet children(displayValue)}
								<span
									class="text-[10px] font-black tracking-[0.2em] text-sky-900 uppercase transition-transform duration-300 group-hover:scale-105"
								>
									{displayValue}
								</span>
							{/snippet}
						</EditableField>
					</div>
				{/if}
				<div
					class="absolute inset-0 rounded-b-2xl bg-linear-to-t from-sky-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				></div>
			</a>
		</div>

		<!-- Центральная часть: Навигация (компонент Menu с переключением вариантов v1/v2) -->
		<Menu
			bind:data
			{editContext}
			{isEditable}
			{links}
			{visibleCatalogItems}
			{visibleServiceItems}
			{disabledRubrics}
			{disabledServices}
			onToggleRubric={handleToggleRubric}
			onToggleService={handleToggleService}
		/>

		<!-- Правая часть: Выбор города -->
		<div class="flex flex-1 items-center justify-end gap-3">
			<!-- Город -->
			<div
				role="group"
				class="relative hidden sm:block"
				onmouseenter={() => (visibleCityMenu = true)}
				onmouseleave={() => (visibleCityMenu = false)}
			>
				<button
					type="button"
					class="city-selector group relative flex items-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-slate-100/20 to-slate-50/80 px-5 py-2.5 text-base font-medium text-slate-700 ring-1 ring-slate-200/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10 hover:ring-sky-200"
					aria-expanded={visibleCityMenu}
				>
					<span
						class="absolute inset-0 -z-10 bg-linear-to-r from-sky-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
					></span>

					<span class="flex items-center justify-center">
						<svg
							class="h-4 w-4 text-sky-500 transition-transform duration-300 group-hover:scale-110"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</span>

					<span class="transition-colors duration-300 group-hover:text-sky-600"
						>{cityStore.city}</span
					>

					<svg
						class="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:text-sky-500 {visibleCityMenu
							? 'rotate-180'
							: ''}"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{#if visibleCityMenu}
					<div class="absolute top-full right-0 left-0 h-3"></div>
					<div
						transition:fly={{ y: -10, duration: 200, easing: cubicOut }}
						class="absolute top-full right-0 z-50 mt-3 w-48 overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-900/5"
					>
						<div
							class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-500 to-transparent"
						></div>

						{#each cities as city, idx}
							<button
								type="button"
								onclick={() => {
									cityStore.set(city.label);
									visibleCityMenu = false;
								}}
								class="group flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left transition-all duration-200 hover:bg-linear-to-r hover:from-sky-50 hover:to-cyan-50"
								class:bg-sky-50={cityStore.city === city.label}
								transition:fly={{ y: -5, duration: 150, delay: idx * 30 }}
							>
								<span
									class="text-sm font-medium transition-colors {cityStore.city === city.label
										? 'text-sky-600'
										: 'text-slate-700'} group-hover:text-sky-600">{city.label}</span
								>
								{#if cityStore.city === city.label}
									<svg
										class="h-4 w-4 text-sky-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								{/if}
							</button>
						{/each}

						{#if isEditable}
							<div class="mt-2 border-t border-slate-100 pt-2">
								<button
									type="button"
									onclick={() => {
										editStore.open({
											key: 'Header.cities',
											label: 'Список городов (каждый с новой строки)',
											value: citiesRaw,
											multiline: true,
											onSave: (val) => saveField('cities', val)
										});
									}}
									class="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 py-2 text-[10px] font-medium text-slate-400 transition-colors hover:border-sky-300 hover:text-sky-500 cursor-pointer"
								>
									Редактировать список
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Mobile nav -->
	{#if uiStore.menuOpen}
		<nav
			class="max-h-[70vh] overflow-y-auto border-t border-slate-100 bg-white px-6 py-4 shadow-2xl sm:hidden"
		>
			{#each links as link}
				{#if link.label === 'Услуги'}
					<div class="py-2">
						<div class="mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
							{link.label}
						</div>
							<div class="grid gap-1 pl-2">
								{#each visibleServiceItems as service}
									{@const isComingSoon = service.comingSoon === true}
									{@const isEnabled = !isComingSoon && !disabledServices.includes(service.href)}
									<div
										class="group flex w-full items-center justify-between rounded-lg transition-all duration-300 {isComingSoon
											? 'cursor-not-allowed opacity-60'
											: ''}"
										class:opacity-60={!isComingSoon && isEditable && !isEnabled}
										class:bg-slate-50={!isComingSoon && isEditable && !isEnabled}
										title={isComingSoon ? 'В разработке' : undefined}
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
											class="flex flex-1 items-center gap-3 py-2 text-sm font-medium text-slate-700 transition-colors {isComingSoon
												? 'pointer-events-none'
												: 'hover:text-sky-600'}"
											class:pointer-events-none={!isComingSoon && isEditable && !isEnabled}
										>
											<div
												class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sky-600"
											>
												{#if service.icon === 'chat'}
													<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="1.5"
															d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
														/>
													</svg>
												{:else if service.icon === 'design'}
													<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="1.5"
															d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
														/>
													</svg>
												{:else if service.icon === 'ruler'}
													<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="1.5"
															d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
														/>
													</svg>
												{:else if service.icon === 'project'}
													<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="1.5"
															d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
														/>
													</svg>
												{:else}
													<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
											</div>
											<span class="flex items-center gap-2">
												{service.label}
												{#if isEditable && !isEnabled && !isComingSoon}
													<span class="text-[9px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">Откл.</span>
												{/if}
											</span>
										</a>
										{#if isEditable}
											{#if isComingSoon}
												{@render comingSoonIndicator('pr-2')}
											{:else}
												<div class="pr-2 flex items-center">
													<button
														type="button"
														onclick={(e) => handleToggleService(service.href, isEnabled, e)}
														class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 {isEnabled ? 'bg-sky-500' : 'bg-slate-300'}"
														title={isEnabled ? 'Скрыть услугу' : 'Показать услугу'}
													>
														<span
															class="pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out {isEnabled ? 'translate-x-4' : 'translate-x-0'}"
														>
														</span>
													</button>
												</div>
											{/if}
										{/if}
									</div>
								{/each}
							</div>
					</div>
				{:else if link.label === 'Каталог'}
					<div class="py-2">
						<div class="mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
							{link.label}
						</div>
						<div class="grid gap-1 pl-2">
							{#each visibleCatalogItems as item}
								{@const isComingSoon = item.comingSoon === true}
								{@const isEnabled = !isComingSoon && !disabledRubrics.includes(item.href)}
								<div
									class="group flex w-full items-center justify-between rounded-lg transition-all duration-300 {isComingSoon
										? 'cursor-not-allowed opacity-60'
										: ''}"
									class:opacity-60={!isComingSoon && isEditable && !isEnabled}
									class:bg-slate-50={!isComingSoon && isEditable && !isEnabled}
									title={isComingSoon ? 'В разработке' : undefined}
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
										class="flex flex-1 items-center gap-3 py-2 text-sm font-medium text-slate-700 transition-colors {isComingSoon
											? 'pointer-events-none'
											: 'hover:text-sky-600'}"
										class:pointer-events-none={!isComingSoon && isEditable && !isEnabled}
									>
										<div
											class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sky-600"
										>
											{#if item.icon === 'sofa'}
												<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M20 12V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4M4 12v6a2 2 0 002 2h2m10-8V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0v6a2 2 0 01-2 2h-2M4 12h16m-16 0v-2a2 2 0 012-2h12a2 2 0 012 2v2"
													/>
												</svg>
											{:else if item.icon === 'surface'}
												<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M3 10h18M3 14h18m-9-4v8m-3-8v8m6-8v8M3 6h18a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z"
													/>
												</svg>
											{:else if item.icon === 'fridge'}
												<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h4m-4 4h4"
													/>
												</svg>
											{:else if item.icon === 'faucet'}
												<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
													/>
												</svg>
											{:else if item.icon === 'hinge'}
												<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m12 12a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
													/>
												</svg>
											{:else if item.icon === 'tiles'}
												<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
													/>
												</svg>
											{:else}
												<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M4 6h16M4 12h16m-7 6h7"
													/>
												</svg>
											{/if}
										</div>
										<span class="flex items-center gap-2">
											{item.label}
											{#if isEditable && !isEnabled && !isComingSoon}
												<span class="text-[9px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">Откл.</span>
											{/if}
										</span>
									</a>
									{#if isEditable}
										{#if isComingSoon}
											{@render comingSoonIndicator('pr-2')}
										{:else}
											<div class="pr-2 flex items-center">
												<button
													type="button"
													onclick={(e) => handleToggleRubric(item.href, isEnabled, e)}
													class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 {isEnabled ? 'bg-sky-500' : 'bg-slate-300'}"
													title={isEnabled ? 'Скрыть рубрику' : 'Показать рубрику'}
												>
													<span
														class="pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out {isEnabled ? 'translate-x-4' : 'translate-x-0'}"
													>
													</span>
												</button>
											</div>
										{/if}
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<a
						href={link.href}
						onclick={() => uiStore.closeMenu()}
						class="block border-b border-slate-50 py-3 text-sm font-bold tracking-wider uppercase transition-colors last:border-0 {isLinkActive(
							link.href
						)
							? 'text-sky-600'
							: 'text-slate-700'} hover:text-sky-600"
					>
						{link.label}
					</a>
				{/if}
			{/each}
			<div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
				<span class="text-sm font-medium text-slate-500">{cityStore.city}</span>
				<div class="flex gap-2 overflow-x-auto pb-2">
					{#each cities.slice(0, 3) as city}
						<button
							type="button"
							onclick={() => cityStore.set(city.label)}
							class="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium whitespace-nowrap text-slate-700"
							class:bg-sky-100={cityStore.city === city.label}
							class:text-sky-700={cityStore.city === city.label}
						>
							{city.label}
						</button>
					{/each}
				</div>
			</div>
		</nav>
	{/if}
</header>

<style>
	.city-selector::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 9999px;
		padding: 1px;
		background: linear-gradient(135deg, transparent 40%, #7dd3fc 50%, transparent 60%);
		-webkit-mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		opacity: 0;
		transition: opacity 0.3s;
	}

	.city-selector:hover::before {
		opacity: 1;
		animation: border-spin 3s linear infinite;
	}

	@keyframes border-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
