<script lang="ts">
	// Артикул: 1.2.5.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { revealOnScroll } from './theme';
	import './theme.css';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Ink-блок: дефолт тёмный. Нейтральная палитра — из классов p1-*,
	// акцентные плитки и кнопки остаются белым по цвету бренда.
	const isLight = $derived(isLightBlock(data, 'dark'));
	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'WhyUs', updated);
		data = updated;
	}

	const defaultItems = [
		{
			title: 'Гарантия до 10 лет',
			text: 'Расширенная гарантия на все виды продукции наших партнёров',
			color: 'sky'
		},
		{
			title: 'Рассрочка 0%',
			text: 'Удобные условия оплаты без переплат и комиссий',
			color: 'emerald'
		},
		{
			title: 'Бесплатный проект',
			text: 'Дизайнерская 3D-визуализация вашей мебели',
			color: 'violet'
		},
		{
			title: 'Доставка и монтаж',
			text: 'Профессиональная сборка и установка "под ключ"',
			color: 'amber'
		}
	];

	/**
	 * Палитра плиток на тёмной поверхности. Ключи цветов прежние, к ним добавлены
	 * акцентная линия сверху карточки и hover-кайма.
	 */
	const colorMap: Record<string, { tile: string; hairline: string; border: string }> = {
		sky: {
			tile: 'bg-link-500/20 text-link-400 ring-link-500/25',
			hairline: 'bg-linear-to-r from-transparent via-link-400 to-transparent',
			border: 'hover:border-link-500/40'
		},
		emerald: {
			tile: 'bg-cat-2-500/20 text-cat-2-400 ring-cat-2-500/25',
			hairline: 'bg-linear-to-r from-transparent via-cat-2-400 to-transparent',
			border: 'hover:border-cat-2-500/40'
		},
		violet: {
			tile: 'bg-cat-3-500/20 text-cat-3-400 ring-cat-3-500/25',
			hairline: 'bg-linear-to-r from-transparent via-cat-3-400 to-transparent',
			border: 'hover:border-cat-3-500/40'
		},
		amber: {
			tile: 'bg-cat-1-500/20 text-cat-1-400 ring-cat-1-500/25',
			hairline: 'bg-linear-to-r from-transparent via-cat-1-400 to-transparent',
			border: 'hover:border-cat-1-500/40'
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
	class="p1-surface relative isolate overflow-hidden py-24 sm:py-28"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<!-- Градиентная подложка — только в тёмной теме: на светлой она бы гасила контраст. -->
	{#if !isLight}
		<div
			class="pointer-events-none absolute inset-0 bg-linear-to-br from-ink-800 to-ink-900"
			aria-hidden="true"
		></div>
	{/if}
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="ab-grid"></div>
		<div class="ab-glow absolute -top-40 -left-24 size-112 bg-brand-500/15"></div>
		<div class="ab-glow absolute -right-32 bottom-0 size-96 bg-ink-400/10"></div>
		<div
			class="absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-linear-to-r from-transparent via-brand-500/60 to-transparent"
		></div>
		<div
			class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-on-dark/10 to-transparent"
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
					<h2 class="p1-title text-3xl text-pretty sm:text-4xl lg:text-5xl">
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
					<p class="p1-body mx-auto max-w-2xl text-sm/6 sm:text-base/7">{displayValue}</p>
				{/snippet}
			</EditableField>

			<div class="ab-rule ab-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="p1-line h-px flex-1"></span>
				<span class="size-1.5 rotate-45 border border-brand-500/80"></span>
				<span class="p1-line h-px flex-1"></span>
			</div>
		</div>

		<div use:revealOnScroll class="ab-reveal mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each items as item, i}
				{@const c = colorMap[item.color] ?? colorMap.sky}
				<div
					class="ab-card group p1-border p1-card hover:p1-card relative overflow-hidden rounded-3xl border p-6 transition duration-300 motion-safe:hover:-translate-y-1 {c.border}"
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
							<svg
								class="size-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
								/>
							</svg>
						</div>

						<h3 class="p1-title p1-title-sub mt-5 text-base sm:text-lg">
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
						<p class="p1-border p1-muted mt-2 border-t pt-3 text-sm/6">
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
