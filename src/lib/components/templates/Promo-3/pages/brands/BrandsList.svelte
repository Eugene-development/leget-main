<script lang="ts">
	// Артикул: 3.3.2.1 — см. docs/architecture/component-articles-map.md
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	let searchQuery = $state('');
	let selectedBrands = $state(new Set<string>());

	const defaultBrands = [
		{
			name: 'Kerama Marazzi',
			country: 'Россия',
			flag: '🇷🇺',
			description: 'Крупнейший производитель плитки в России с итальянскими корнями.',
			tags: ['Настенная', 'Напольная', 'Мозаика'],
			href: '/brands/kerama-marazzi',
			founded: '1994'
		},
		{
			name: 'Atlas Concorde',
			country: 'Италия',
			flag: '🇮🇹',
			description: 'Итальянский концерн, законодатель мод в мире фарфора и керамогранита.',
			tags: ['Керамогранит', 'Коллекции', 'Дизайн'],
			href: '/brands/atlas-concorde',
			founded: '1969'
		},
		{
			name: 'Italon',
			country: 'Россия / Италия',
			flag: '🇷🇺',
			description: 'Производит керамогранит по итальянским технологиям на заводах в России.',
			tags: ['Керамогранит', 'Интерьер'],
			href: '/brands/italon',
			founded: '1996'
		},
		{
			name: 'Laparet',
			country: 'Россия',
			flag: '🇷🇺',
			description: 'Российский бренд с широким ассортиментом плитки для любых интерьерных решений.',
			tags: ['Настенная', 'Напольная', 'Декоры'],
			href: '/brands/laparet',
			founded: '2003'
		},
		{
			name: 'Cersanit',
			country: 'Польша',
			flag: '🇵🇱',
			description: 'Один из крупнейших производителей плитки в Центральной и Восточной Европе.',
			tags: ['Ванная', 'Кухня', 'Напольная'],
			href: '/brands/cersanit',
			founded: '1990'
		},
		{
			name: 'Estima',
			country: 'Россия',
			flag: '🇷🇺',
			description: 'Современный российский производитель керамогранита и настенной плитки.',
			tags: ['Керамогранит', 'Фасад'],
			href: '/brands/estima',
			founded: '2000'
		},
		{
			name: 'Porcelanosa',
			country: 'Испания',
			flag: '🇪🇸',
			description:
				'Испанская группа, эталон роскоши и инноваций в индустрии материалов для отделки.',
			tags: ['Люкс', 'Роскошь', 'Дизайн'],
			href: '/brands/porcelanosa',
			founded: '1973'
		},
		{
			name: 'Marazzi',
			country: 'Италия',
			flag: '🇮🇹',
			description: 'Легендарный итальянский производитель, определяющий тренды в дизайне плитки.',
			tags: ['Классика', 'Люкс', 'Коллекции'],
			href: '/brands/marazzi',
			founded: '1935'
		}
	];

	const brands = $derived(
		Array.isArray(data?.brands) && (data.brands as unknown[]).length > 0
			? (data.brands as typeof defaultBrands)
			: defaultBrands
	);
	const brandNames = $derived(brands.map((b) => b.name));

	function toggleBrand(name: string) {
		const next = new Set(selectedBrands);
		if (next.has(name)) {
			next.delete(name);
		} else {
			next.add(name);
		}
		selectedBrands = next;
	}

	const filteredBrands = $derived(
		brands.filter((b) => {
			const q = searchQuery.toLowerCase();
			const matchesSearch =
				q === '' ||
				b.name.toLowerCase().includes(q) ||
				b.country.toLowerCase().includes(q) ||
				b.tags.some((t) => t.toLowerCase().includes(q));
			const matchesBrand = selectedBrands.size === 0 || selectedBrands.has(b.name);
			return matchesSearch && matchesBrand;
		})
	);
</script>

<section class="relative py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<!-- Filters -->
		<div class="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
			<div class="relative w-full max-w-sm">
				<svg
					viewBox="0 0 20 20"
					class="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 fill-surface-500"
					><path
						fill-rule="evenodd"
						d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
						clip-rule="evenodd"
					/></svg
				>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Поиск по бренду или стране..."
					class="w-full rounded-xl border border-surface-600 bg-surface-800/50 py-3.5 pr-5 pl-11 text-sm text-white placeholder-surface-300 transition-all duration-300 outline-none focus:border-accent-500/60 focus:bg-surface-800"
				/>
			</div>
			<div class="flex flex-wrap gap-2">
				<button
					onclick={() => (selectedBrands = new Set())}
					class="rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 {selectedBrands.size ===
					0
						? 'border-accent-500 bg-accent-500/10 text-accent-500'
						: 'border-surface-600 bg-surface-800/40 text-surface-300 hover:border-surface-500 hover:text-surface-200'}"
					>Все</button
				>
				{#each brandNames as name}
					<button
						onclick={() => toggleBrand(name)}
						class="rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 {selectedBrands.has(
							name
						)
							? 'border-accent-500 bg-accent-500/10 text-accent-500'
							: 'border-surface-600 bg-surface-800/40 text-surface-300 hover:border-surface-500 hover:text-surface-200'}"
						>{name}</button
					>
				{/each}
			</div>
		</div>

		<p class="mb-8 text-sm text-surface-300">
			{#if filteredBrands.length === brands.length}Все {brands.length} брендов{:else}Найдено: <span
					class="text-accent-500">{filteredBrands.length}</span
				>
				из {brands.length}{/if}
		</p>

		{#if filteredBrands.length > 0}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each filteredBrands as brand}
					<a
						href={brand.href}
						class="group relative flex flex-col rounded-2xl border border-surface-700/50 bg-surface-800/40 p-7 transition-all duration-500 hover:border-accent-500/30 hover:bg-surface-800/70 hover:shadow-2xl hover:shadow-accent-500/5"
					>
						<div class="mb-5 flex items-start justify-between">
							<span class="text-2xl">{brand.flag}</span>
							<span
								class="rounded-lg border border-surface-600/50 bg-surface-700/30 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-surface-300 uppercase"
								>с {brand.founded}</span
							>
						</div>
						<h2
							class="ds-title-sub text-xl text-white transition-colors duration-300 group-hover:text-accent-500"
						>
							{brand.name}
						</h2>
						<div class="mt-1.5 text-xs text-surface-300">{brand.country}</div>
						<p class="mt-4 flex-1 text-sm leading-relaxed text-surface-300">{brand.description}</p>
						<div class="mt-6 flex items-center justify-between border-t border-surface-700/50 pt-5">
							<span class="text-xs font-medium text-surface-300">Смотреть коллекции</span>
							<div
								class="flex size-7 items-center justify-center rounded-full border border-surface-600 bg-surface-700/50 transition-all duration-300 group-hover:border-accent-500/50 group-hover:bg-accent-500/10"
							>
								<svg
									viewBox="0 0 12 12"
									class="size-3 fill-surface-400 transition-colors group-hover:fill-accent-500"
									><path
										fill-rule="evenodd"
										d="M2 6a.5.5 0 01.5-.5h6.293L6.646 3.354a.5.5 0 01.708-.708l3 3a.5.5 0 010 .708l-3 3a.5.5 0 01-.708-.708L8.793 6.5H2.5A.5.5 0 012 6z"
										clip-rule="evenodd"
									/></svg
								>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center py-24 text-center">
				<div class="mb-5 text-5xl">🔍</div>
				<h3 class="text-xl text-white">Ничего не найдено</h3>
				<p class="mt-2 text-surface-300">Попробуйте изменить запрос или сбросить фильтры</p>
				<button
					onclick={() => {
						searchQuery = '';
						selectedBrands = new Set();
					}}
					class="mt-6 rounded-xl border border-surface-600 px-6 py-3 text-sm font-medium text-surface-300 transition-all hover:border-surface-400 hover:text-white"
					>Сбросить фильтры</button
				>
			</div>
		{/if}
	</div>
</section>
