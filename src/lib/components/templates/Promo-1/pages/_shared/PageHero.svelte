<script lang="ts">
	import type { Snippet } from 'svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import type { HeroField, HeroPalette } from './hero';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		componentType,
		palette,
		icon,
		title,
		text
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
		/** Тип компонента для saveComponentData и префикс fieldKey. */
		componentType: string;
		palette: HeroPalette;
		/** Значок в плитке — путь(и) внутри 24×24 viewBox. */
		icon: Snippet;
		title: HeroField;
		text: HeroField;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, componentType, updated);
		data = updated;
	}

	/**
	 * Текстура-ромбы. Собирается из палитры, чтобы не дублировать длинный
	 * data-URL в каждом Hero страницы.
	 */
	const patternUrl = $derived(
		`url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22${palette.patternColor}%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
	);
</script>

<!--
	Единый Hero внутренних страниц Promo-1. Эталон структуры — страница «Гарантии».

	Структура фиксированная и состоит РОВНО из четырёх элементов сверху вниз:
	значок → заголовок → линия → текст. Ничего сюда не добавляется: ни
	надзаголовков, ни кнопок, ни вторых абзацев, ни дополнительных линий
	(в том числе по кромке секции). Страницы передают только палитру и значок.

	ВНИМАНИЕ — стык секций: волна снизу заливается `palette.wave`, и этот цвет
	обязан совпадать с фоном следующего блока страницы. Слой ровно один:
	полупрозрачный подслой над градиентом читается как посторонняя полоса.

	Анимация появления стартует сразу (`hr-enter`) — блок находится над сгибом.
	Никакого backdrop-blur на анимируемых узлах: при активном transform
	backdrop-filter сэмплит другую подложку и тон элемента скачет в конце анимации.
-->
<section class="hr-enter relative isolate overflow-hidden {palette.section}">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="absolute inset-0 {palette.patternOpacity}" style="background-image: {patternUrl};"></div>
		<div class="hr-glow absolute -top-32 left-1/2 size-144 -translate-x-1/2 {palette.glowA}"></div>
		<div class="hr-glow absolute top-1/3 -right-24 size-96 {palette.glowB}"></div>
	</div>

	<div
		class="relative mx-auto max-w-4xl px-4 pt-20 pb-32 text-center sm:px-6 sm:pt-28 sm:pb-40 lg:px-8 lg:pb-44"
	>
		<!-- 1. Значок -->
		<div
			class="hr-item mx-auto flex size-18 items-center justify-center rounded-2xl text-white {palette.iconTile}"
		>
			<svg class="size-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
				{@render icon()}
			</svg>
		</div>

		<!-- 2. Заголовок -->
		<EditableField
			fieldKey="{componentType}.{title.key}"
			label={title.label}
			value={title.value}
			{isEditable}
			onSave={(v) => saveField(title.key, v)}
			class="hr-item hr-d1 mt-8 block"
		>
			{#snippet children(displayValue)}
				<h1
					class="text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-pretty text-white sm:text-5xl lg:text-6xl"
				>
					{displayValue}
				</h1>
			{/snippet}
		</EditableField>

		<!-- 3. Линия -->
		<div class="hr-rule hr-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
			<span class="h-px flex-1 {palette.rule}"></span>
			<span class="size-1.5 rotate-45 border {palette.diamond}"></span>
			<span class="h-px flex-1 {palette.rule}"></span>
		</div>

		<!-- 4. Текст -->
		<EditableField
			fieldKey="{componentType}.{text.key}"
			label={text.label}
			value={text.value}
			{isEditable}
			multiline
			onSave={(v) => saveField(text.key, v)}
			class="hr-item hr-d3 mt-6 block"
		>
			{#snippet children(displayValue)}
				{#if displayValue}
					<p class="mx-auto max-w-2xl text-base/7 text-pretty sm:text-lg/8 {palette.text}">
						{displayValue}
					</p>
				{/if}
			{/snippet}
		</EditableField>
	</div>

	<div class="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
		<svg
			class="hr-wave block h-16 w-full sm:h-20 lg:h-28"
			viewBox="0 0 1440 120"
			preserveAspectRatio="none"
			style="--hr-wave: {palette.wave}"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				class="hr-wave-front"
				d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
			/>
		</svg>
	</div>
</section>

<style>
	.hr-wave-front {
		fill: var(--hr-wave);
	}

	/* Классы глобальные: часть анимируемых узлов — обёртки <EditableField>. */

	:global(.hr-glow) {
		filter: blur(80px);
		border-radius: 9999px;
	}

	@keyframes hr-rise {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes hr-rule {
		from {
			opacity: 0;
			transform: scaleX(0.4);
		}
		to {
			opacity: 1;
			transform: scaleX(1);
		}
	}

	/*
		fill-mode = backwards, а не both: при `both` финальный transform анимации
		остаётся на элементе и перебивает hover-эффекты внутри Hero.
	*/
	:global(.hr-enter .hr-item) {
		animation: hr-rise 780ms cubic-bezier(0.22, 1, 0.36, 1) var(--hr-delay, 0ms) backwards;
	}

	:global(.hr-enter .hr-rule) {
		animation: hr-rule 780ms cubic-bezier(0.22, 1, 0.36, 1) var(--hr-delay, 0ms) backwards;
	}

	/* Ступени задержки через кастомное свойство: shorthand выше не сбрасывает его. */
	:global(.hr-d1) {
		--hr-delay: 80ms;
	}
	:global(.hr-d2) {
		--hr-delay: 160ms;
	}
	:global(.hr-d3) {
		--hr-delay: 240ms;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.hr-enter .hr-item),
		:global(.hr-enter .hr-rule) {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
