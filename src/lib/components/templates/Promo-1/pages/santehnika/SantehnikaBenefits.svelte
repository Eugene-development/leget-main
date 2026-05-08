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
		{ title: 'Оригинальная продукция',    desc: 'Только сертифицированная сантехника от официальных дистрибьюторов', icon: 'shield', color: 'emerald' },
		{ title: 'Профессиональный монтаж',   desc: 'Установка с подключением и проверкой на герметичность',             icon: 'tools',  color: 'sky' },
		{ title: 'Выгодные комплекты',        desc: 'Скидки при покупке мойки со смесителем и аксессуарами',             icon: 'coin',   color: 'amber' }
	]);

	const colorClasses: Record<string, string> = {
		emerald: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white',
		sky:     'bg-sky-100 text-sky-600 group-hover:bg-sky-500 group-hover:text-white',
		amber:   'bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white'
	};
</script>

<div class="mebel-container mb-12 mt-12">
	<h2 class="mb-8 text-2xl font-bold text-slate-900">{data.title || 'Почему выбирают нас'}</h2>

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
					{:else if item.icon === 'tools'}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
						</svg>
					{:else}
						<!-- coin -->
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					{/if}
				</div>
				<h3 class="mt-4 text-lg font-semibold text-slate-900 transition-colors group-hover:text-sky-600">{item.title}</h3>
				<p class="mt-2 text-sm leading-relaxed text-slate-600">{item.desc ?? ''}</p>
			</div>
		{/each}
	</div>
</div>
