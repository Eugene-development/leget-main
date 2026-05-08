<script lang="ts">
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

	const items = $derived(data.items || [
		{ title: 'Керамогранит',        desc: 'Прочный и долговечный материал для пола и стен', gradient: 'from-amber-50 to-orange-50' },
		{ title: 'Керамическая плитка', desc: 'Классическое решение для ванной и кухни',        gradient: 'from-sky-50 to-blue-50' }
	]);
</script>

<div class="mebel-container mb-12 mt-12">
	<h2 class="mb-8 text-2xl font-bold text-slate-900">{data.title || 'Популярные категории'}</h2>

	<div class="grid gap-6 sm:grid-cols-2">
		{#each items as item, i}
			<div
				class="group relative overflow-hidden rounded-2xl bg-linear-to-br {item.gradient} p-8 transition-all duration-300 hover:shadow-lg"
				in:fly={{ y: 20, duration: 500, delay: i * 100, easing: cubicOut }}
			>
				<h3 class="text-xl font-bold text-slate-900">{item.title}</h3>
				<p class="mt-2 text-sm text-slate-600">{item.desc ?? ''}</p>
				<div class="mt-4">
					<span class="inline-flex items-center gap-1 text-sm font-medium text-sky-600">
						Смотреть
						<svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</span>
				</div>
			</div>
		{/each}
	</div>
</div>
