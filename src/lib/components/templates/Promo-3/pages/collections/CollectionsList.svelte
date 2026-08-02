<script lang="ts">
	// Артикул: 3.4.2.1 — см. docs/architecture/component-articles-map.md
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let { data = $bindable(), editContext = null, isEditable = false }: { data: Record<string, unknown>; editContext?: EditContext | null; isEditable?: boolean } = $props();

	let searchQuery = $state('');
	let selectedBrands = $state(new Set<string>());

	const defaultCollections = [
		{ name: 'Nero Marquina',   brand: 'Kerama Marazzi', countryFlag: '🇷🇺', image: null,  tag: 'Хит продаж', tagColor: 'bg-amber-500',   href: '/collections/nero-marquina'   },
		{ name: 'Calacatta Oro',   brand: 'Atlas Concorde', countryFlag: '🇮🇹', image: null,    tag: 'Люкс',       tagColor: 'bg-violet-600',  href: '/collections/calacatta-oro'   },
		{ name: 'Urban Craft',     brand: 'Italon',         countryFlag: '🇷🇺', image: null,  tag: 'Новинка',    tagColor: 'bg-emerald-600', href: '/collections/urban-craft'     },
		{ name: 'Royal Deco',      brand: 'Laparet',        countryFlag: '🇷🇺', image: null, tag: 'Эксклюзив',  tagColor: 'bg-rose-600',    href: '/collections/royal-deco'      },
		{ name: 'Emerald Kitchen', brand: 'Cersanit',       countryFlag: '🇵🇱', image: null,   tag: 'Популярное', tagColor: 'bg-sky-600',     href: '/collections/emerald-kitchen' },
		{ name: 'Hex Terracotta',  brand: 'Estima',         countryFlag: '🇷🇺', image: null, tag: 'Тренд',      tagColor: 'bg-orange-500',  href: '/collections/hex-terracotta'  },
		{ name: 'Marble Sky',      brand: 'Porcelanosa',    countryFlag: '🇪🇸', image: null,    tag: 'Люкс',       tagColor: 'bg-violet-600',  href: '/collections/marble-sky'      },
		{ name: 'Stone Loft',      brand: 'Marazzi',        countryFlag: '🇮🇹', image: null, tag: 'Новинка',    tagColor: 'bg-emerald-600', href: '/collections/stone-loft'      },
	];

	const collections = $derived(Array.isArray(data?.collections) && (data.collections as unknown[]).length > 0 ? (data.collections as typeof defaultCollections) : defaultCollections);
	const brands = $derived([...new Set(collections.map((c) => c.brand))]);

	function toggleBrand(brand: string) {
		const next = new Set(selectedBrands);
		if (next.has(brand)) { next.delete(brand); } else { next.add(brand); }
		selectedBrands = next;
	}

	const filteredCollections = $derived(
		collections.filter((c) => {
			const q = searchQuery.toLowerCase();
			const matchesSearch = q === '' || c.name.toLowerCase().includes(q);
			const matchesBrand = selectedBrands.size === 0 || selectedBrands.has(c.brand);
			return matchesSearch && matchesBrand;
		})
	);
</script>

<section class="relative py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<!-- Filters -->
		<div class="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
			<div class="relative w-full max-w-sm">
				<svg viewBox="0 0 20 20" class="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 fill-surface-500"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" /></svg>
				<input type="text" bind:value={searchQuery} placeholder="Поиск по названию коллекции..." class="w-full rounded-xl border border-surface-600 bg-surface-800/50 py-3.5 pr-5 pl-11 text-sm text-white placeholder-surface-400 transition-all duration-300 outline-none focus:border-accent-500/60 focus:bg-surface-800" />
			</div>
			<div class="flex flex-wrap gap-2">
				<button onclick={() => (selectedBrands = new Set())} class="rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 {selectedBrands.size === 0 ? 'border-accent-500 bg-accent-500/10 text-accent-500' : 'border-surface-600 bg-surface-800/40 text-surface-300 hover:border-surface-500 hover:text-surface-200'}">Все</button>
				{#each brands as brand}
					<button onclick={() => toggleBrand(brand)} class="rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 {selectedBrands.has(brand) ? 'border-accent-500 bg-accent-500/10 text-accent-500' : 'border-surface-600 bg-surface-800/40 text-surface-300 hover:border-surface-500 hover:text-surface-200'}">{brand}</button>
				{/each}
			</div>
		</div>

		<p class="mb-8 text-sm text-surface-400">
			{#if filteredCollections.length === collections.length}Все {collections.length} коллекций{:else}Найдено: <span class="text-accent-500">{filteredCollections.length}</span> из {collections.length}{/if}
		</p>

		{#if filteredCollections.length > 0}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each filteredCollections as item}
					<a href={item.href} class="group relative flex flex-col overflow-hidden rounded-2xl border border-surface-700/50 bg-surface-800/40 transition-all duration-500 hover:border-accent-500/30 hover:shadow-2xl hover:shadow-accent-500/5">
						<div class="relative aspect-[4/3] overflow-hidden">
							<img loading="lazy" src={item.image || undefined} alt={item.name} class="size-full object-cover transition-transform duration-700 group-hover:scale-110">
							<div class="absolute inset-0 bg-gradient-to-t from-surface-900/70 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80"></div>
							<div class="absolute top-3 left-3"><span class="rounded-lg {item.tagColor} px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-lg">{item.tag}</span></div>
							<div class="absolute right-3 bottom-3"><div class="flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface-900/70 px-2.5 py-1.5 backdrop-blur-sm"><span class="text-base leading-none">{item.countryFlag}</span></div></div>
						</div>
						<div class="flex flex-1 flex-col p-5">
							<div class="text-[10px] font-semibold tracking-[0.25em] text-accent-500/80 uppercase">{item.brand}</div>
							<h2 class="mt-1.5 text-base font-bold text-white transition-colors duration-300 group-hover:text-accent-400">{item.name}</h2>
							<div class="mt-4 mt-auto flex items-center justify-between border-t border-surface-700/40 pt-4">
								<span class="text-xs text-surface-400">Смотреть коллекцию</span>
								<div class="flex size-7 items-center justify-center rounded-full border border-surface-600 bg-surface-700/50 transition-all duration-300 group-hover:border-accent-500/50 group-hover:bg-accent-500/10">
									<svg viewBox="0 0 12 12" class="size-3 fill-surface-400 transition-colors group-hover:fill-accent-500"><path fill-rule="evenodd" d="M2 6a.5.5 0 01.5-.5h6.293L6.646 3.354a.5.5 0 01.708-.708l3 3a.5.5 0 010 .708l-3 3a.5.5 0 01-.708-.708L8.793 6.5H2.5A.5.5 0 012 6z" clip-rule="evenodd" /></svg>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center py-24 text-center">
				<div class="mb-5 text-5xl">🔍</div>
				<h3 class="text-xl font-bold text-white">Ничего не найдено</h3>
				<p class="mt-2 text-surface-400">Попробуйте изменить запрос или сбросить фильтры</p>
				<button onclick={() => { searchQuery = ''; selectedBrands = new Set(); }} class="mt-6 rounded-xl border border-surface-600 px-6 py-3 text-sm font-medium text-surface-300 transition-all hover:border-surface-400 hover:text-white">Сбросить фильтры</button>
			</div>
		{/if}
	</div>
</section>
