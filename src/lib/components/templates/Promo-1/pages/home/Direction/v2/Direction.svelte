<script lang="ts">
	// Артикул: 1.1.7.2 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Нейтральная палитра — из классов p1-*; акценты от темы не зависят.
	const isLight = $derived(isLightBlock(data, 'dark'));

	const directions = $derived(
		Array.isArray(data?.directions) && data.directions.length > 0
			? (data.directions as {
					image: string;
					alt: string;
					badge: string;
					title: string;
					buttonText: string;
					buttonHref: string;
				}[])
			: [
					{
						image: 'https://storage.yandexcloud.net/novostroy/bg/vector-kitchen.jpg',
						alt: 'Кухонные гарнитуры',
						badge: 'Основное направление',
						title: 'Кухонные гарнитуры',
						buttonText: 'Просчитать ваш проект',
						buttonHref: '/contact'
					},
					{
						image: 'https://storage.yandexcloud.net/novostroy/bg/prih.jpg',
						alt: 'Шкафы и гардеробы',
						badge: 'Основное направление',
						title: 'Шкафы и гардеробы',
						buttonText: 'Просчитать ваш проект',
						buttonHref: '/contact'
					}
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Direction', updated);
		data = updated;
	}
</script>

<section
	class="p1-surface p1-title grid min-h-140 grid-cols-1 gap-4 p-4 font-sans select-none md:grid-cols-2"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	{#each directions as dir}
		<div
			class="group p1-border relative flex min-h-[400px] overflow-hidden rounded-3xl border shadow-2xl sm:min-h-[500px]"
		>
			<!-- Фоновая картинка с зумом -->
			<ImageFallback
				src={dir.image}
				alt={dir.alt}
				class="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
			/>
			<!-- Кинематографичный оверлей с мягким цветным градиентом при ховере -->
			<div
				class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent opacity-90 transition-colors duration-500 group-hover:from-cat-4-950/80"
			></div>

			<!-- Декоративная контурная рамка сзади -->
			<div
				class="p1-border pointer-events-none absolute inset-4 rounded-2xl border transition-colors duration-500 group-hover:border-link-500/20"
			></div>

			<!-- Текстовое наполнение -->
			<div class="relative z-10 flex w-full flex-col items-start justify-end p-8 sm:p-12">
				<!-- Бэдж -->
				<span
					class="p1-border p1-card p1-body inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-link-400"></span>
					{dir.badge}
				</span>

				<!-- Заголовок -->
				<h3
					class="p1-title p1-title-sub font-display mt-4 text-3xl transition-colors duration-300 text-shadow-lg group-hover:text-link-300 sm:text-4xl"
				>
					{dir.title}
				</h3>

				<!-- Кнопка -->
				<a
					href={dir.buttonHref}
					class="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-link-500 to-cat-4-600 px-6 py-4.5 text-sm font-bold tracking-wider text-on-accent uppercase shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-link-500/20 active:scale-[0.98]"
				>
					<span>{dir.buttonText}</span>
					<svg
						class="h-4 w-4 translate-x-0 transform transition-transform duration-300 group-hover:translate-x-1.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2.5"
					>
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
