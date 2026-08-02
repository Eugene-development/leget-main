<script lang="ts">
	// Артикул: 1.20.4.1 — см. docs/architecture/component-articles-map.md
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
		{ title: 'Официальная гарантия', desc: 'Вся техника с официальной гарантией производителя до 5 лет', icon: 'shield', color: 'emerald' },
		{ title: 'Выгодные цены',        desc: 'Прямые поставки техники от производителей без посредников',  icon: 'wallet', color: 'sky' },
		{ title: 'Быстрая доставка',     desc: 'Доставим технику в удобное время с подъёмом на этаж',        icon: 'bolt',   color: 'amber' }
	]);

	const colorClasses: Record<string, string> = {
		emerald: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white',
		sky:     'bg-sky-100 text-sky-600 group-hover:bg-sky-500 group-hover:text-white',
		amber:   'bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white'
	};
</script>

<div class="mebel-container mb-12 mt-12">
	<h2 class="mb-8 text-2xl font-bold text-slate-900">
		{data.title || 'Почему покупают у нас'}
	</h2>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each items as item, i}
			<div
				class="group rounded-2xl border border-slate-50 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
				in:fly={{ y: 20, duration: 600, delay: i * 100, easing: cubicOut }}
			>
				<div class="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 {colorClasses[item.color] || 'bg-slate-100 text-slate-600'}">
					{#if item.icon === 'shield'}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					{:else if item.icon === 'wallet'}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
					{:else}
						<!-- bolt -->
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					{/if}
				</div>
				<h3 class="mt-4 text-lg font-semibold text-slate-900 transition-colors group-hover:text-sky-600">
					{item.title}
				</h3>
				<p class="mt-2 text-sm leading-relaxed text-slate-600">{item.desc ?? ''}</p>
			</div>
		{/each}
	</div>
</div>
