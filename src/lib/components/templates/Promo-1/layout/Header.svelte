<script lang="ts">
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { cityStore } from '$lib/stores/city.svelte';
	import { uiStore } from '$lib/stores/ui.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveLayoutData, type EditContext } from '$lib/utils/page-edit';

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

	const catalogItems = [
		{ href: '/mebel', label: 'Мебель', icon: 'sofa', desc: 'Кухни, шкафы, гардеробные' },
		{
			href: '/stoleshnica',
			label: 'Столешницы',
			icon: 'surface',
			desc: 'Из камня, дерева и пластика'
		},
		{
			href: '/bytovaya-tehnika',
			label: 'Бытовая техника',
			icon: 'fridge',
			desc: 'Встраиваемая и отдельностоящая'
		},
		{
			href: '/santehnika',
			label: 'Сантехника',
			icon: 'faucet',
			desc: 'Смесители, мойки, аксессуары'
		},
		{ href: '/furnitura', label: 'Фурнитура', icon: 'hinge', desc: 'Ручки, петли, механизмы' },
		{ href: '/plitka', label: 'Плитка', icon: 'tiles', desc: 'Керамогранит и мозаика' }
	];

	const serviceItems = [
		{
			href: '/consultation',
			label: 'Бесплатная консультация',
			icon: 'chat',
			desc: 'Профессиональная помощь в подборе решений'
		},
		{
			href: '/design-project',
			label: 'Дизайн интерьера',
			icon: 'design',
			desc: 'Индивидуальные 3D-проекты любой сложности'
		},
		{
			href: '/measurement',
			label: 'Замер помещения',
			icon: 'ruler',
			desc: 'Точные расчеты для идеальной установки'
		},
		{
			href: '/furniture-project',
			label: 'Проект мебели',
			icon: 'project',
			desc: 'Проработка конструктива и эргономики'
		},
		{
			href: '/assembly',
			label: 'Сборка и установка',
			icon: 'tools',
			desc: 'Качественный монтаж вашей мебели'
		}
	];

	let visibleCityMenu = $state(false);
	let visibleServicesMenu = $state(false);
	let visibleCatalogMenu = $state(false);
	let hoveredItem = $state<string | null>(null);

	const isCatalogActive = $derived(
		hoveredItem === 'catalog' ||
			(hoveredItem === null &&
				(visibleCatalogMenu || catalogItems.some((item) => $page.url.pathname.startsWith(item.href))))
	);

	const isServicesActive = $derived(
		hoveredItem === 'services' ||
			(hoveredItem === null &&
				(visibleServicesMenu || serviceItems.some((item) => $page.url.pathname === item.href)))
	);

	function isLinkActive(href: string) {
		return hoveredItem === href || (hoveredItem === null && $page.url.pathname === href);
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

<header class="sticky top-0 z-50 w-full sm:bg-white/95 sm:shadow-lg sm:backdrop-blur">
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

		<!-- Центральная часть: Навигация -->
		<nav class="hidden items-center gap-6 sm:flex">
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
						<button
							type="button"
							class="group relative flex items-center gap-1 px-2 py-1 text-sm font-bold tracking-wider uppercase transition-colors duration-300 {isServicesActive
								? 'text-sky-600'
								: 'text-slate-700'} hover:text-sky-600"
							aria-expanded={visibleServicesMenu}
						>
							<span>{link.label}</span>
							<svg
								class="h-3.5 w-3.5 transition-transform duration-300 {visibleServicesMenu
									? 'rotate-180 text-sky-500'
									: 'text-slate-400 group-hover:text-sky-500'}"
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
							<span
								class="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-sky-500 transition-transform duration-300 group-hover:scale-x-100"
								class:scale-x-100={isServicesActive}
							></span>
						</button>

						{#if visibleServicesMenu}
							<div class="absolute top-full left-1/2 h-4 w-full -translate-x-1/2"></div>
							<div
								transition:fly={{ y: -10, duration: 250, easing: cubicOut }}
								class="absolute top-full left-1/2 z-40 mt-4 w-80 -translate-x-1/2 overflow-hidden rounded-2xl bg-white/98 p-2 shadow-2xl ring-1 ring-slate-200 backdrop-blur-xl"
							>
								<div
									class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-500/50 to-transparent"
								></div>

								{#each serviceItems as service, idx}
									<a
										onclick={() => (visibleServicesMenu = false)}
										href={service.href}
										class="group flex items-start gap-3 rounded-xl p-3 transition-all duration-300 hover:translate-x-1 hover:bg-linear-to-r hover:from-sky-50/50 hover:to-indigo-50/50"
										transition:fly={{ y: -5, duration: 200, delay: idx * 40 }}
									>
										<div
											class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-sky-100/50 to-indigo-100/50 text-sky-600 transition-all duration-300 group-hover:from-sky-500 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-sky-500/25"
										>
											{#if service.icon === 'chat'}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
													/>
												</svg>
											{:else if service.icon === 'design'}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
													/>
												</svg>
											{:else if service.icon === 'ruler'}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
													/>
												</svg>
											{:else if service.icon === 'project'}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
													/>
												</svg>
											{:else}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
										<div class="flex-1">
											<p
												class="text-sm font-bold text-slate-900 transition-colors group-hover:text-sky-600"
											>
												{service.label}
											</p>
											<p class="mt-0.5 text-[11px] leading-tight text-slate-500">{service.desc}</p>
										</div>
										<svg
											class="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-sky-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</a>
								{/each}
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
						<button
							type="button"
							class="group relative flex items-center gap-1 px-2 py-1 text-sm font-bold tracking-wider uppercase transition-colors duration-300 {isCatalogActive
								? 'text-sky-600'
								: 'text-slate-700'} hover:text-sky-600"
							aria-expanded={visibleCatalogMenu}
						>
							<span>{link.label}</span>
							<svg
								class="h-3.5 w-3.5 transition-transform duration-300 {visibleCatalogMenu
									? 'rotate-180 text-sky-500'
									: 'text-slate-400 group-hover:text-sky-500'}"
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
							<span
								class="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-sky-500 transition-transform duration-300 group-hover:scale-x-100"
								class:scale-x-100={isCatalogActive}
							></span>
						</button>

						{#if visibleCatalogMenu}
							<div class="absolute top-full left-1/2 h-4 w-full -translate-x-1/2"></div>
							<div
								transition:fly={{ y: -10, duration: 250, easing: cubicOut }}
								class="absolute top-full left-1/2 z-40 mt-4 w-80 -translate-x-1/2 overflow-hidden rounded-2xl bg-white/98 p-2 shadow-2xl ring-1 ring-slate-200 backdrop-blur-xl"
							>
								<div
									class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-500/50 to-transparent"
								></div>

								{#each catalogItems as item, idx}
									<a
										onclick={() => (visibleCatalogMenu = false)}
										href={item.href}
										class="group flex items-start gap-3 rounded-xl p-3 transition-all duration-300 hover:translate-x-1 hover:bg-linear-to-r hover:from-sky-50/50 hover:to-indigo-50/50"
										transition:fly={{ y: -5, duration: 200, delay: idx * 40 }}
									>
										<div
											class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-sky-100/50 to-indigo-100/50 text-sky-600 transition-all duration-300 group-hover:from-sky-500 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-sky-500/25"
										>
											{#if item.icon === 'sofa'}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M20 12V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4M4 12v6a2 2 0 002 2h2m10-8V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0v6a2 2 0 01-2 2h-2M4 12h16m-16 0v-2a2 2 0 012-2h12a2 2 0 012 2v2"
													/>
												</svg>
											{:else if item.icon === 'surface'}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M3 10h18M3 14h18m-9-4v8m-3-8v8m6-8v8M3 6h18a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z"
													/>
												</svg>
											{:else if item.icon === 'fridge'}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h4m-4 4h4"
													/>
												</svg>
											{:else if item.icon === 'faucet'}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
													/>
												</svg>
											{:else if item.icon === 'hinge'}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m12 12a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
													/>
												</svg>
											{:else if item.icon === 'tiles'}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
													/>
												</svg>
											{:else}
												<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M4 6h16M4 12h16m-7 6h7"
													/>
												</svg>
											{/if}
										</div>
										<div class="flex-1">
											<p
												class="text-sm font-bold text-slate-900 transition-colors group-hover:text-sky-600"
											>
												{item.label}
											</p>
											<p class="mt-0.5 text-[11px] leading-tight text-slate-500">{item.desc}</p>
										</div>
										<svg
											class="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-sky-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</a>
								{/each}
							</div>
						{/if}
					</div>
				{:else}
					<a
						href={link.href}
						class="group relative px-2 py-1 text-sm font-bold tracking-wider uppercase transition-colors duration-300 {isLinkActive(
							link.href
						)
							? 'text-sky-600'
							: 'text-slate-700'} hover:text-sky-600"
						onmouseenter={() => (hoveredItem = link.href)}
						onmouseleave={() => (hoveredItem = null)}
					>
						<span>{link.label}</span>
						<span
							class="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-sky-500 transition-transform duration-300 group-hover:scale-x-100"
							class:scale-x-100={isLinkActive(link.href)}
						></span>
					</a>
				{/if}
			{/each}
		</nav>

		<!-- Правая часть: Выбор города -->
		<div class="flex flex-1 items-center justify-end gap-3">
			<!-- Город -->
			<div
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
						class="absolute top-full right-0 z-40 mt-3 w-48 overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-900/5"
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
								<EditableField
									fieldKey="Header.cities"
									label="Список городов (каждый с новой строки)"
									value={citiesRaw}
									onSave={(val) => saveField('cities', val)}
									{isEditable}
									multiline
								>
									{#snippet children()}
										<div
											class="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 py-2 text-[10px] font-medium text-slate-400 transition-colors hover:border-sky-300 hover:text-sky-500"
										>
											Редактировать список
										</div>
									{/snippet}
								</EditableField>
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
							{#each serviceItems as service}
								<a
									href={service.href}
									onclick={() => uiStore.closeMenu()}
									class="flex items-center gap-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-sky-600"
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
									{service.label}
								</a>
							{/each}
						</div>
					</div>
				{:else if link.label === 'Каталог'}
					<div class="py-2">
						<div class="mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
							{link.label}
						</div>
						<div class="grid gap-1 pl-2">
							{#each catalogItems as item}
								<a
									href={item.href}
									onclick={() => uiStore.closeMenu()}
									class="flex items-center gap-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-sky-600"
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
									{item.label}
								</a>
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
