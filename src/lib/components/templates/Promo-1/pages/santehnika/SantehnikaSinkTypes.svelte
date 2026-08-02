<script lang="ts">
	// Артикул: 1.21.4.1 — см. docs/architecture/component-articles-map.md
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
		{ title: 'Нержавеющая сталь',     desc: 'Классика для любой кухни. Прочные, гигиеничные, доступные по цене',                  icon: 'cube',    color: 'slate' },
		{ title: 'Гранитные композитные',  desc: 'Стильный внешний вид, устойчивость к царапинам и высоким температурам',              icon: 'sparkles', color: 'amber' },
		{ title: 'Керамические',           desc: 'Элегантность и долговечность. Идеально для классических интерьеров',                 icon: 'palette',  color: 'sky' }
	]);

	const colorClasses: Record<string, string> = {
		slate:  'bg-slate-100 text-slate-600 group-hover:bg-slate-700 group-hover:text-white',
		amber:  'bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
		sky:    'bg-sky-100 text-sky-600 group-hover:bg-sky-500 group-hover:text-white',
	};
</script>

<div class="mebel-container mb-12 mt-12">
	<h2 class="mb-8 text-2xl font-bold text-slate-900">{data.title || 'Типы кухонных моек'}</h2>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each items as item, i}
			<div
				class="group rounded-2xl border border-slate-50 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
				in:fly={{ y: 20, duration: 600, delay: i * 100, easing: cubicOut }}
			>
				<div class="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 {colorClasses[item.color] || 'bg-slate-100 text-slate-600'}">
					{#if item.icon === 'cube'}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
					{:else if item.icon === 'sparkles'}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
						</svg>
					{:else}
						<!-- palette -->
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
						</svg>
					{/if}
				</div>
				<h3 class="mt-4 text-lg font-semibold text-slate-900 transition-colors group-hover:text-sky-600">{item.title}</h3>
				<p class="mt-2 text-sm leading-relaxed text-slate-600">{item.desc ?? ''}</p>
			</div>
		{/each}
	</div>
</div>
