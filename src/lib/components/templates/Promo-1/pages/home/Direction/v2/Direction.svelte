<script lang="ts">
	// Артикул: 1.1.7.2 — см. docs/architecture/component-articles-map.md
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

<section class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 min-h-140 bg-slate-950 font-sans select-none text-white">
	{#each directions as dir}
		<div class="group relative flex min-h-[400px] sm:min-h-[500px] overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
			<!-- Фоновая картинка с зумом -->
			<ImageFallback
				src={dir.image}
				alt={dir.alt}
				class="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
			/>
			<!-- Кинематографичный оверлей с мягким цветным градиентом при ховере -->
			<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:from-indigo-950/80 transition-colors duration-500"></div>
			
			<!-- Декоративная контурная рамка сзади -->
			<div class="absolute inset-4 rounded-2xl border border-white/5 pointer-events-none group-hover:border-sky-500/20 transition-colors duration-500"></div>

			<!-- Текстовое наполнение -->
			<div class="relative flex w-full flex-col items-start justify-end p-8 sm:p-12 z-10">
				<!-- Бэдж -->
				<span class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-slate-200 backdrop-blur-md">
					<span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
					{dir.badge}
				</span>
				
				<!-- Заголовок -->
				<h3 class="mt-4 text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-none text-shadow-lg group-hover:text-sky-300 transition-colors duration-300">
					{dir.title}
				</h3>

				<!-- Кнопка -->
				<a
					href={dir.buttonHref}
					class="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-4.5 text-sm font-bold uppercase tracking-wider text-white shadow-xl hover:shadow-sky-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
				>
					<span>{dir.buttonText}</span>
					<svg class="h-4 w-4 transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
					</svg>
				</a>
			</div>
		</div>
	{/each}
</section>

<style>
	/* Outfit font is loaded once in Promo-1 layout/Header.svelte */

	.font-display {
		font-family: 'Outfit', sans-serif;
	}

	.text-shadow-lg {
		text-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
	}
</style>
