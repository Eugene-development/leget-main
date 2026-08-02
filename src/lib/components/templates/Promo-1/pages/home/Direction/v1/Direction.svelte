<script lang="ts">
	// Артикул: 1.1.7.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const directions = $derived(
		Array.isArray(data?.directions) && data.directions.length > 0
			? (data.directions as { image: string; alt: string; badge: string; title: string; buttonText: string; buttonHref: string }[])
			: [
					{
						image:      'https://storage.yandexcloud.net/novostroy/bg/vector-kitchen.jpg',
						alt:        'Кухонные гарнитуры',
						badge:      'Основное направление',
						title:      'Кухонные гарнитуры',
						buttonText: 'Просчитать ваш проект',
						buttonHref: '/contact',
					},
					{
						image:      'https://storage.yandexcloud.net/novostroy/bg/prih.jpg',
						alt:        'Шкафы и гардеробы',
						badge:      'Основное направление',
						title:      'Шкафы и гардеробы',
						buttonText: 'Просчитать ваш проект',
						buttonHref: '/contact',
					},
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Direction', updated);
		data = updated;
	}
</script>

<!-- Направления (Direction) -->
<section class="grid min-h-160 grid-cols-1 gap-1 lg:grid-cols-2">
	{#each directions as dir}
		<div class="group relative flex min-h-100 overflow-hidden">
			<ImageFallback
				src={dir.image}
				alt={dir.alt}
				class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
			/>
			<div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent"></div>
			<div class="relative flex w-full flex-col items-start justify-end p-8 sm:p-12">
				<span class="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur-sm">
					{dir.badge}
				</span>
				<h3 class="mt-3 text-3xl font-bold text-white">{dir.title}</h3>
				<a
					href={dir.buttonHref}
					class="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:bg-sky-50 hover:shadow-xl"
				>
					{dir.buttonText}
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</a>
			</div>
		</div>
	{/each}
</section>
