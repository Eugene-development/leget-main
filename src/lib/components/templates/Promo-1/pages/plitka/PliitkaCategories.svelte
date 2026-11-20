<script lang="ts">
	import { withPromoMotion } from '$lib/motion/transition';
	import { fly } from 'svelte/transition';
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 1.23.5.1 — см. docs/architecture/component-articles-map.md
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
				title: 'Керамогранит',
				desc: 'Прочный и долговечный материал для пола и стен',
				gradient: 'from-cat-1-50 to-cat-8-50'
			},
			{
				title: 'Керамическая плитка',
				desc: 'Классическое решение для ванной и кухни',
				gradient: 'from-link-50 to-cat-11-50'
			}
		]
	);
	// Legacy defaults can carry primitive Tailwind names; adapt on render without rewriting tenant data.
	function categoryGradient(value: unknown) {
		return String(value ?? 'from-cat-1-50 to-cat-8-50')
			.replace(/\bfrom-amber-50\b/g, 'from-cat-1-50')
			.replace(/\bto-orange-50\b/g, 'to-cat-8-50')
			.replace(/\bfrom-sky-50\b/g, 'from-link-50')
			.replace(/\bto-blue-50\b/g, 'to-cat-11-50');
	}
	const p1_fly = withPromoMotion(fly);
</script>

<div class="mebel-container mt-12 mb-12">
	<h2 class="ds-title-sub mb-8 text-2xl text-ink-900">{editableText(data.title, 'Популярные категории')}</h2>

	<div class="grid gap-6 sm:grid-cols-2">
		{#each items as item, i}
			<div
				class="group relative overflow-hidden rounded-2xl bg-linear-to-br {categoryGradient(
					item.gradient
				)} p-8 transition-all duration-300 hover:shadow-lg"
				in:p1_fly={{ y: 20, duration: 500, delay: i * 100, easing: cubicOut }}
			>
				<h3 class="p1-title-sub text-xl text-ink-900">{item.title}</h3>
				<p class="mt-2 text-sm text-ink-600">{item.desc ?? ''}</p>
				<div class="mt-4">
					<span class="inline-flex items-center gap-1 text-sm font-medium text-link-600">
						Смотреть
						<svg
							class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</span>
				</div>
			</div>
		{/each}
	</div>
</div>
