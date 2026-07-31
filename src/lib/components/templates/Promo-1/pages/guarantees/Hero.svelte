<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import './theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'GuaranteesHero', updated);
		data = updated;
	}
</script>

<!--
	Hero страницы «Гарантии».

	ВНИМАНИЕ — стык секций: снизу Hero обрезан волной, её заливка обязана
	совпадать с фоном следующего блока (GuaranteeTerms, `bg-slate-50` = #f8fafc).
	Цвет задан один раз переменной `--gh-wave` ниже: меняешь фон GuaranteeTerms —
	меняешь и её, иначе на границе появится полоса (фон body тут другой, #faf9f7).
-->
<section
	class="gt-enter relative isolate overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900"
>
	<!-- Декор: сетка-ромбы прежней версии, свечения в акцентных цветах, линия сверху -->
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div
			class="absolute inset-0 opacity-20"
			style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
		></div>
		<div class="gt-glow absolute -top-32 left-1/2 size-144 -translate-x-1/2 bg-emerald-500/20"></div>
		<div class="gt-glow absolute top-1/3 -right-24 size-96 bg-cyan-400/15"></div>
		<div
			class="absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-linear-to-r from-transparent via-emerald-400/60 to-transparent"
		></div>
	</div>

	<div
		class="relative mx-auto max-w-4xl px-4 pt-20 pb-32 text-center sm:px-6 sm:pt-28 sm:pb-40 lg:px-8 lg:pb-44"
	>
		<div
			class="gt-item mx-auto flex size-18 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-cyan-500 text-white ring-1 ring-white/25 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.9)]"
		>
			<svg class="size-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
			</svg>
		</div>

		<EditableField
			fieldKey="GuaranteesHero.title"
			label="Заголовок"
			value={String(data?.title ?? 'Гарантия качества')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="gt-item gt-d1 mt-8 block"
		>
			{#snippet children(displayValue)}
				<h1
					class="text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-pretty text-white sm:text-5xl lg:text-6xl"
				>
					{displayValue}
				</h1>
			{/snippet}
		</EditableField>

		<div class="gt-rule gt-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
			<span class="h-px flex-1 bg-white/15"></span>
			<span class="size-1.5 rotate-45 border border-emerald-400/80"></span>
			<span class="h-px flex-1 bg-white/15"></span>
		</div>

		<EditableField
			fieldKey="GuaranteesHero.subtitle"
			label="Подзаголовок"
			value={String(data?.subtitle ?? 'Мы уверены в качестве продукции наших партнёров. Вся продукция имеет расширенную гарантию на материалы и работу мастеров.')}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="gt-item gt-d3 mt-6 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto max-w-2xl text-sm/6 text-slate-300 sm:text-base/7">{displayValue}</p>
			{/snippet}
		</EditableField>
	</div>

	<!--
		Волна-переход в следующую секцию — РОВНО ОДИН слой в цвет фона GuaranteeTerms.
		Полупрозрачный подслой для «глубины» тут не работает: над градиентом секции
		он читается как посторонняя полоса вдоль волны.
		preserveAspectRatio="none" + фиксированная высота — чтобы на широких
		экранах не оставалось щели между волной и краем секции.
	-->
	<div class="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
		<svg
			class="gh-wave block h-16 w-full sm:h-20 lg:h-28"
			viewBox="0 0 1440 120"
			preserveAspectRatio="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				class="gh-wave-front"
				d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
			/>
		</svg>
	</div>
</section>

<style>
	/* Цвет волны = фон следующей секции (GuaranteeTerms, bg-slate-50). */
	.gh-wave {
		--gh-wave: #f8fafc;
	}

	.gh-wave-front {
		fill: var(--gh-wave);
	}
</style>
