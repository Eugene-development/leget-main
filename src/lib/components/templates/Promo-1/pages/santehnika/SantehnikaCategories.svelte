<script lang="ts">
	// Артикул: 1.21.5.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
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

	const items = $derived(
		data.items || [
			{
				title: 'Кухонные мойки',
				desc: 'Врезные, накладные, интегрированные',
				image: 'https://storage.yandexcloud.net/leget-main/templates/promo-1/kitchen_sink.png'
			},
			{
				title: 'Смесители',
				desc: 'С выдвижным изливом, сенсорные, классические',
				image: 'https://storage.yandexcloud.net/leget-main/templates/promo-1/kitchen_faucet.png'
			}
		]
	);
</script>

<div class="mebel-container mt-12 mb-12">
	<h2 class="mb-8 text-2xl text-ink-900">{data.title || 'Популярные категории'}</h2>

	<div class="grid gap-6 sm:grid-cols-2">
		{#each items as item}
			<div class="group relative overflow-hidden rounded-2xl bg-ink-100">
				<ImageFallback
					loading="lazy"
					src={item.image}
					alt={item.title}
					class="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<div
					class="absolute inset-0 bg-linear-to-t from-ink-900/80 via-ink-900/20 to-transparent"
				></div>
				<div class="absolute right-0 bottom-0 left-0 p-6">
					<h3 class="p1-title-sub text-xl text-on-dark">{item.title}</h3>
					<p class="mt-1 text-sm text-ink-300">{item.desc ?? ''}</p>
				</div>
			</div>
		{/each}
	</div>
</div>
