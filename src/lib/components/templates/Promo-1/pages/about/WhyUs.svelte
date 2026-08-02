<script lang="ts">
	// Артикул: 1.2.5.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { revealOnScroll } from './theme';
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

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'WhyUs', updated);
		data = updated;
	}

	const defaultItems = [
		{ title: 'Гарантия до 10 лет', text: 'Расширенная гарантия на все виды продукции наших партнёров', color: 'sky' },
		{ title: 'Рассрочка 0%', text: 'Удобные условия оплаты без переплат и комиссий', color: 'emerald' },
		{ title: 'Бесплатный проект', text: 'Дизайнерская 3D-визуализация вашей мебели', color: 'violet' },
		{ title: 'Доставка и монтаж', text: 'Профессиональная сборка и установка "под ключ"', color: 'amber' },
	];

	/**
	 * Палитра плиток на тёмной поверхности. Ключи цветов прежние, к ним добавлены
	 * акцентная линия сверху карточки и hover-кайма.
	 */
	const colorMap: Record<string, { tile: string; hairline: string; border: string }> = {
		sky: {
			tile: 'bg-sky-500/20 text-sky-400 ring-sky-500/25',
			hairline: 'bg-linear-to-r from-transparent via-sky-400 to-transparent',
			border: 'hover:border-sky-500/40'
		},
		emerald: {
			tile: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/25',
			hairline: 'bg-linear-to-r from-transparent via-emerald-400 to-transparent',
			border: 'hover:border-emerald-500/40'
		},
		violet: {
			tile: 'bg-violet-500/20 text-violet-400 ring-violet-500/25',
			hairline: 'bg-linear-to-r from-transparent via-violet-400 to-transparent',
			border: 'hover:border-violet-500/40'
		},
		amber: {
			tile: 'bg-amber-500/20 text-amber-400 ring-amber-500/25',
			hairline: 'bg-linear-to-r from-transparent via-amber-400 to-transparent',
			border: 'hover:border-amber-500/40'
		}
	};

	async function updateItem(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedItems = [...items];
		updatedItems[index] = { ...updatedItems[index], [field]: value };
		await saveField('items', updatedItems);
	}

	const items = $derived(
		Array.isArray(data?.items) && (data.items as unknown[]).length > 0
			? (data.items as typeof defaultItems)
			: defaultItems
	);
</script>

<!--
	Тёмная секция перед финальным CTA. Без backdrop-blur на анимируемых узлах —
	при активном transform backdrop-filter сэмплит другую подложку и тон плитки
	скачет в конце анимации появления.
-->
<section
	class="relative isolate overflow-hidden bg-linear-to-br from-slate-800 to-slate-900 py-24 sm:py-28"
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="ab-grid"></div>
		<div class="ab-glow absolute -top-40 -left-24 size-112 bg-red-500/15"></div>
		<div class="ab-glow absolute -right-32 bottom-0 size-96 bg-slate-400/10"></div>
		<div
			class="absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-linear-to-r from-transparent via-red-500/60 to-transparent"
		></div>
		<div
			class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"
		></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div use:revealOnScroll class="ab-reveal text-center">
			<EditableField
				fieldKey="WhyUs.title"
				label="Заголовок"
				value={String(data?.title ?? 'Почему выбирают нас')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="ab-item block"
			>
				{#snippet children(displayValue)}
					<h2
						class="text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-pretty text-white sm:text-4xl lg:text-5xl"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="WhyUs.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Преимущества работы с нами')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="ab-item ab-d1 mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-2xl text-sm/6 text-slate-300 sm:text-base/7">{displayValue}</p>
				{/snippet}
			</EditableField>

			<div class="ab-rule ab-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="h-px flex-1 bg-white/15"></span>
				<span class="size-1.5 rotate-45 border border-red-500/80"></span>
				<span class="h-px flex-1 bg-white/15"></span>
			</div>
		</div>

		<div use:revealOnScroll class="ab-reveal mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each items as item, i}
				{@const c = colorMap[item.color] ?? colorMap.sky}
				<div
					class="ab-card group relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-6 transition duration-300 hover:bg-white/8 motion-safe:hover:-translate-y-1 {c.border}"
					style="--ab-delay: {i * 70}ms"
				>
					<div
						class="pointer-events-none absolute inset-x-6 top-0 h-px opacity-60 transition-opacity duration-300 group-hover:opacity-100 {c.hairline}"
						aria-hidden="true"
					></div>

					<div class="relative">
						<div
							class="flex size-12 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 motion-safe:group-hover:-rotate-6 {c.tile}"
						>
							<svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
							</svg>
						</div>

						<h3 class="mt-5 text-base font-semibold tracking-[-0.01em] text-white sm:text-lg">
							<EditableField
								fieldKey="WhyUs.{i}.title"
								label="Заголовок"
								value={item.title}
								{isEditable}
								inline
								onSave={(v) => updateItem(i, 'title', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</h3>
						<p class="mt-2 border-t border-white/10 pt-3 text-sm/6 text-slate-400">
							<EditableField
								fieldKey="WhyUs.{i}.text"
								label="Описание"
								value={item.text}
								{isEditable}
								inline
								onSave={(v) => updateItem(i, 'text', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
