<script lang="ts">
	// Артикул: 1.23.4.1 — см. docs/architecture/component-articles-map.md
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

	const items = $derived(
		data.items || [
			{
				title: 'Сертифицированная продукция',
				desc: 'Вся плитка сертифицирована и соответствует стандартам качества',
				icon: 'shield',
				color: 'emerald'
			},
			{
				title: 'Широкий ассортимент',
				desc: 'Более 1000 коллекций плитки различных стилей и форматов',
				icon: 'grid',
				color: 'sky'
			},
			{
				title: 'Профессиональный подбор',
				desc: 'Поможем подобрать плитку, подходящую по стилю и бюджету вашего проекта',
				icon: 'bolt',
				color: 'amber'
			}
		]
	);

	const colorClasses: Record<string, string> = {
		emerald: 'bg-cat-2-100 text-cat-2-600 group-hover:bg-cat-2-500 group-hover:text-on-accent',
		sky: 'bg-link-100 text-link-600 group-hover:bg-link-500 group-hover:text-on-accent',
		amber: 'bg-cat-1-100 text-cat-1-600 group-hover:bg-cat-1-500 group-hover:text-on-accent'
	};
</script>

<div class="mebel-container mt-12 mb-12">
	<h2 class="mb-8 text-2xl text-ink-900">{data.title || 'Почему выбирают нас'}</h2>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each items as item, i}
			<div
				class="group rounded-2xl border border-ink-50 bg-surface-raised p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink-200/50"
				in:fly={{ y: 20, duration: 600, delay: i * 100, easing: cubicOut }}
			>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 {colorClasses[
						item.color
					] || 'bg-ink-100 text-ink-600'}"
				>
					{#if item.icon === 'shield'}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
					{:else if item.icon === 'grid'}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
							/>
						</svg>
					{:else}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					{/if}
				</div>
				<h3
					class="p1-title-sub mt-4 text-lg text-ink-900 transition-colors group-hover:text-link-600"
				>
					{item.title}
				</h3>
				<p class="mt-2 text-sm leading-relaxed text-ink-600">{item.desc ?? ''}</p>
			</div>
		{/each}
	</div>
</div>
