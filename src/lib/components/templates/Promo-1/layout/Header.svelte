<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { cityStore } from '$lib/stores/city.svelte';
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
	const links = $derived(Array.isArray(data?.links) && (data.links as unknown[]).length > 0 ? (data.links as { href: string; label: string }[]) : [
		{ href: '/',         label: 'Главная' },
		{ href: '/actions',  label: 'Акции'   },
		{ href: '/catalog',  label: 'Каталог' },
		{ href: '/services', label: 'Услуги'  },
		{ href: '/contacts', label: 'Контакты' },
	]);

	let menuOpen = $state(false);
	let visibleCityMenu = $state(false);

	const defaultCities = [
		'Москва и МО',
		'Санкт-Петербург',
		'Новосибирск',
		'Екатеринбург',
		'Казань',
		'Нижний Новгород'
	];

	const citiesRaw = $derived(typeof data?.cities === 'string' ? data.cities : defaultCities.join('\n'));
	const cities = $derived(citiesRaw.split('\n').filter(Boolean).map(c => ({ label: c.trim() })));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveLayoutData(editContext, 'Header', updated);
		data = updated;
	}
</script>

<header class="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
	<div class="mx-auto flex max-w-9xl items-center justify-between px-4 py-4 sm:px-8">
		<!-- Левая часть: Логотип -->
		<div class="flex flex-1 justify-start">
			<a
				href="/"
				class="group relative -m-1.5 -mb-10 flex flex-col items-center justify-center rounded-b-2xl bg-white px-6 py-4 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 z-30 min-w-[140px]"
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
						<div class="size-8 rounded-full bg-linear-to-tr from-sky-400 to-indigo-500 mb-1 transition-transform duration-300 group-hover:scale-110 shadow-sm"></div>
						<EditableField
							fieldKey="Header.siteName"
							label="Название сайта"
							value={!data?.siteName || data.siteName === 'Новострой' ? 'Логотип' : String(data.siteName)}
							onSave={(val) => saveField('siteName', val)}
							{isEditable}
						>
							{#snippet children(displayValue)}
								<span class="text-[10px] font-black uppercase tracking-[0.2em] text-sky-900 transition-transform duration-300 group-hover:scale-105">
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
				<a
					href={link.href}
					class="group relative px-2 py-1 text-sm font-bold uppercase tracking-wider text-slate-700 transition-colors duration-300 hover:text-sky-600"
				>
					<span>{link.label}</span>
					<span
						class="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-sky-500 transition-transform duration-300 group-hover:scale-x-100"
					></span>
				</a>
			{/each}
		</nav>

		<!-- Правая часть: Выбор города и мобильное меню -->
		<div class="flex flex-1 items-center justify-end gap-3">
			<!-- Город -->
			<div
				class="relative hidden sm:block"
				onmouseenter={() => (visibleCityMenu = true)}
				onmouseleave={() => (visibleCityMenu = false)}
			>
				<button
					type="button"
					class="city-selector group relative flex items-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-slate-100/20 to-slate-50/80 px-5 py-2.5 text-base font-medium text-slate-700 ring-1 ring-slate-200/50 transition-all duration-300 hover:ring-sky-200 hover:shadow-lg hover:shadow-sky-500/10"
					aria-expanded={visibleCityMenu}
				>
					<span class="absolute inset-0 -z-10 bg-linear-to-r from-sky-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
					></span>

					<span class="flex items-center justify-center">
						<svg class="h-4 w-4 text-sky-500 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</span>

					<span class="transition-colors duration-300 group-hover:text-sky-600">{cityStore.city}</span>

					<svg class="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:text-sky-500 {visibleCityMenu ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{#if visibleCityMenu}
					<div class="absolute left-0 right-0 top-full h-3"></div>
					<div
						transition:fly={{ y: -10, duration: 200, easing: cubicOut }}
						class="absolute right-0 top-full z-40 mt-3 w-48 overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-900/5"
					>
						<div class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-500 to-transparent"></div>

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
								<span class="text-sm font-medium transition-colors {cityStore.city === city.label ? 'text-sky-600' : 'text-slate-700'} group-hover:text-sky-600">{city.label}</span>
								{#if cityStore.city === city.label}
									<svg class="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
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
										<div class="flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 py-2 text-[10px] font-medium text-slate-400 transition-colors hover:border-sky-300 hover:text-sky-500">
											Редактировать список
										</div>
									{/snippet}
								</EditableField>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Mobile menu toggle -->
			<button
				type="button"
				onclick={() => (menuOpen = !menuOpen)}
				class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:hidden"
				aria-label="Меню"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{#if menuOpen}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>
	</div>

	<!-- Mobile nav -->
	{#if menuOpen}
		<nav class="border-t border-slate-100 px-6 py-4 sm:hidden">
			{#each links as link}
				<a
					href={link.href}
					onclick={() => (menuOpen = false)}
					class="block py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
				>
					{link.label}
				</a>
			{/each}
			<div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
				<span class="text-sm font-medium text-slate-500">{cityStore.city}</span>
				<div class="flex gap-2 overflow-x-auto pb-2">
					{#each cities.slice(0, 3) as city}
						<button
							type="button"
							onclick={() => cityStore.set(city.label)}
							class="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
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
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
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
