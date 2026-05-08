<script lang="ts">
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

	const items = $derived(data.items || [
		{ title: 'Кухонные мойки', desc: 'Врезные, накладные, интегрированные',          image: '/kitchen_sink.png' },
		{ title: 'Смесители',      desc: 'С выдвижным изливом, сенсорные, классические',  image: '/kitchen_faucet.png' }
	]);
</script>

<div class="mebel-container mb-12 mt-12">
	<h2 class="mb-8 text-2xl font-bold text-slate-900">{data.title || 'Популярные категории'}</h2>

	<div class="grid gap-6 sm:grid-cols-2">
		{#each items as item}
			<div class="group relative overflow-hidden rounded-2xl bg-slate-100">
				<img
					src={item.image}
					alt={item.title}
					class="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<div class="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
				<div class="absolute bottom-0 left-0 right-0 p-6">
					<h3 class="text-xl font-bold text-white">{item.title}</h3>
					<p class="mt-1 text-sm text-slate-300">{item.desc ?? ''}</p>
				</div>
			</div>
		{/each}
	</div>
</div>
