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
		await saveComponentData(editContext, 'InstallmentHero', updated);
		data = updated;
	}
</script>

<!--
	Hero страницы «Рассрочка».

	ВНИМАНИЕ — стык секций: снизу Hero обрезан волной, её заливка обязана
	совпадать с фоном следующего блока (InstallmentPlans, `bg-slate-50` = #f8fafc).
	Цвет задан один раз переменной `--ih-wave` ниже: меняешь фон Plans — меняешь
	и её, иначе на границе появится полоса (фон body тут другой, #faf9f7).
-->
<section
	class="it-enter relative isolate overflow-hidden bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700"
>
	<!-- Декор: техническая сетка-ромбы, световые пятна, волосяная линия сверху -->
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div
			class="absolute inset-0 opacity-30"
			style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
		></div>
		<div class="it-glow absolute -top-32 left-1/2 size-144 -translate-x-1/2 bg-white/15"></div>
		<div class="it-glow absolute top-1/3 -right-24 size-96 bg-indigo-400/25"></div>
		<div
			class="absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-linear-to-r from-transparent via-white/50 to-transparent"
		></div>
	</div>

	<div
		class="relative mx-auto max-w-4xl px-4 pt-20 pb-32 text-center sm:px-6 sm:pt-28 sm:pb-40 lg:px-8 lg:pb-44"
	>
		<div
			class="it-item mx-auto flex size-18 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 shadow-[0_20px_50px_-20px_rgba(49,46,129,0.9)]"
		>
			<svg class="size-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
			</svg>
		</div>

		<EditableField
			fieldKey="InstallmentHero.title"
			label="Заголовок"
			value={String(data?.title ?? 'Рассрочка без переплаты')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="it-item it-d1 mt-8 block"
		>
			{#snippet children(displayValue)}
				<h1
					class="text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-pretty text-white sm:text-5xl lg:text-6xl"
				>
					{displayValue}
				</h1>
			{/snippet}
		</EditableField>

		<div class="it-rule it-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
			<span class="h-px flex-1 bg-white/30"></span>
			<span class="size-1.5 rotate-45 border border-white/70"></span>
			<span class="h-px flex-1 bg-white/30"></span>
		</div>

		<EditableField
			fieldKey="InstallmentHero.subtitle"
			label="Подзаголовок"
			value={String(data?.subtitle ?? 'Купите мебель и технику сейчас — платите частями до 12 месяцев. Быстрое одобрение, минимум документов.')}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="it-item it-d3 mt-6 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto max-w-2xl text-sm/6 text-purple-50/90 sm:text-base/7">{displayValue}</p>
			{/snippet}
		</EditableField>

		<div class="it-item it-d4 mt-10 flex flex-wrap justify-center gap-4">
			<a
				href="/contact"
				class="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-violet-700 shadow-[0_20px_50px_-20px_rgba(49,46,129,0.7)] transition duration-300 hover:bg-violet-50 hover:shadow-[0_26px_60px_-18px_rgba(49,46,129,0.8)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-safe:hover:-translate-y-0.5"
			>
				<EditableField
					fieldKey="InstallmentHero.buttonText"
					label="Текст кнопки"
					value={String(data?.buttonText ?? 'Консультация по рассрочке')}
					{isEditable}
					onSave={(v) => saveField('buttonText', v)}
					class="inline"
				>
					{#snippet children(displayValue)}
						{displayValue}
					{/snippet}
				</EditableField>
				<span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
			</a>
		</div>
	</div>

	<!--
		Волна-переход в следующую секцию — РОВНО ОДИН слой в цвет фона Plans.
		Полупрозрачный подслой для «глубины» тут не работает: над градиентом
		секции он читается как посторонняя полоса вдоль волны.
		preserveAspectRatio="none" + фиксированная высота — чтобы на широких
		экранах не оставалось щели между волной и краем секции.
	-->
	<div class="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
		<svg
			class="ih-wave block h-16 w-full sm:h-20 lg:h-28"
			viewBox="0 0 1440 120"
			preserveAspectRatio="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				class="ih-wave-front"
				d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
			/>
		</svg>
	</div>
</section>

<style>
	/* Цвет волны = фон следующей секции (InstallmentPlans, bg-slate-50). */
	.ih-wave {
		--ih-wave: #f8fafc;
	}

	.ih-wave-front {
		fill: var(--ih-wave);
	}
</style>
