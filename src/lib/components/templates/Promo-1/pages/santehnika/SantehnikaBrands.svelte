<script lang="ts">
	// Артикул: 1.21.3.1 — см. docs/architecture/component-articles-map.md
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const brands = $derived(data.brands || []);
</script>

{#if brands.length > 0}
<div class="mebel-container mb-12 mt-12" in:fly={{ y: 20, duration: 500, easing: cubicOut }}>
	<h2 class="mb-6 text-2xl font-bold text-slate-900">{data.title || 'Бренды сантехники'}</h2>
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
		{#each brands.slice(0, 12) as brand, i}
			<a href="/santehnika/{brand.slug}"
				class="group flex h-20 items-center justify-center rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
				in:fly={{ y: 10, duration: 400, delay: i * 50, easing: cubicOut }}>
				{#if brand.logo}
					<img loading="lazy" src={brand.logo} alt={brand.title ?? brand.value} class="max-h-10 max-w-full object-contain">
				{:else}
					<span class="text-base font-bold text-slate-500 transition-colors group-hover:text-sky-600">
						{brand.title ?? brand.value ?? brand.name}
					</span>
				{/if}
			</a>
		{/each}
	</div>
</div>
{/if}
