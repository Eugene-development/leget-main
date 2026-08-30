<script lang="ts">
	// Артикулы: 1.19.6.1, 1.29.4.1, 1.30.4.1 — см. docs/architecture/component-articles-map.md
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

	const services = $derived(
		data.services || [
			{ title: 'Выезд замерщика', desc: 'Бесплатный замер помещения' },
			{ title: 'Изготовление', desc: 'Производство по вашим размерам' },
			{ title: 'Вырезы под технику', desc: 'Под мойку, варочную панель, смеситель' },
			{ title: 'Доставка и монтаж', desc: 'Профессиональная установка' }
		]
	);
</script>

<div class="mebel-container mt-12 mb-12">
	<div
		class="rounded-2xl bg-surface-raised p-8 shadow-sm"
		in:fly={{ y: 20, duration: 500, easing: cubicOut }}
	>
		<h2 class="text-2xl text-ink-900">
			{data.title || 'Что входит в стоимость'}
		</h2>

		<div class="mt-6 grid gap-4 sm:grid-cols-2">
			{#each services as service, i}
				<div
					class="flex items-start gap-3"
					in:fly={{ y: 10, duration: 400, delay: i * 80, easing: cubicOut }}
				>
					<svg
						class="h-6 w-6 shrink-0 text-cat-2-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<div>
						<h3 class="p1-title-sub text-ink-900">{service.title}</h3>
						<p class="text-sm text-ink-600">{service.desc ?? ''}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
