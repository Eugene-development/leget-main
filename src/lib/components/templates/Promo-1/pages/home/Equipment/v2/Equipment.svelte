<script lang="ts">
	// Артикул: 1.1.4.2 — см. docs/architecture/component-articles-map.md
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

	/**
	 * Раскладка бенто — таблицей, а не пятью копиями разметки.
	 *
	 * Ключи данных (`item1Title` … `item5Description`) остаются ровно теми же:
	 * форма данных блока — неявный контракт с уже сохранённым контентом
	 * тенантов, и переименование ключа молча обнулило бы поле. Здесь меняется
	 * только способ записи разметки.
	 *
	 * Классы держатся литералами: Tailwind читает исходник как текст, и
	 * собранная из кусков строка утилиту не породит.
	 */
	const cards = [
		{
			n: 1,
			title: 'Столешницы',
			description:
				'Широкий выбор дизайнов для вашей кухни. Качественные столешницы от ведущих производителей. Большой выбор материалов и цветов',
			span: 'lg:col-span-3',
			frame: 'aspect-video',
			pad: 'p-8',
			heading: 'text-xl'
		},
		{
			n: 2,
			title: 'Системы выдвижения',
			description:
				'Современные механизмы Hettich и BLUM, обеспечивающие плавность, надежность и бесшумность. Широкий ассортимент для комфортного хранения',
			span: 'lg:col-span-3',
			frame: 'aspect-video',
			pad: 'p-8',
			heading: 'text-xl'
		},
		{
			n: 3,
			title: 'Бытовая техника',
			description:
				'Встраиваемая и отдельностоящая техника от проверенных производителей с гарантией',
			span: 'lg:col-span-2',
			frame: 'aspect-square',
			pad: 'p-6',
			heading: 'text-lg'
		},
		{
			n: 4,
			title: 'Мойки и смесители',
			description: 'Качественная сантехника от ведущих мировых производителей с гарантией до 5 лет',
			span: 'lg:col-span-2',
			frame: 'aspect-square',
			pad: 'p-6',
			heading: 'text-lg'
		},
		{
			n: 5,
			title: 'Зональное освещение',
			description: 'Комфортное освещение для создания уютной атмосферы в каждом уголке вашего дома',
			// Пятая карточка одна в ряду при двух колонках — занимает ряд целиком,
			// и кадр там становится горизонтальным: квадрат во всю ширину планшета
			// вырастает в экран высотой.
			span: 'sm:col-span-2 lg:col-span-2',
			frame: 'aspect-square sm:aspect-video lg:aspect-square',
			pad: 'p-6',
			heading: 'text-lg'
		}
	];

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Equipment', updated);
		data = updated;
	}

	function fieldValue(key: string, fallback: string) {
		return String(data?.[key] ?? fallback);
	}
</script>

<section
	class="p1-surface p1-title relative overflow-hidden py-section-sm font-sans select-none sm:py-section"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<!--
		Вспомогательные засветки — то, что преломляет стекло карточек: без них
		`backdrop-blur` на полупрозрачной `p1-card` размывал бы ровную заливку.
		Обе на одной роли: вторая до 31.08.2026 стояла на `cat-3-500` — цвете
		рубрики каталога, взятом как окружение. То же схлопывание, что у
		`ServiceOrderIsland`, где `sky` и `indigo` свелись к `link`.
	-->
	<div
		class="pointer-events-none absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-link-500/5 blur-[120px]"
	></div>
	<div
		class="pointer-events-none absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-link-500/5 blur-[120px]"
	></div>

	<div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
		<!-- Заголовок -->
		<div class="mx-auto mb-16 max-w-2xl text-center lg:max-w-none lg:text-left">
			<span
				class="p1-label p1-body inline-flex items-center rounded-full border border-link-500/30 bg-link-500/10 px-3 py-1"
			>
				<EditableField
					fieldKey="Equipment.badge"
					label="Метка"
					value={fieldValue('badge', 'Дополнительно')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</span>
			<EditableField
				fieldKey="Equipment.title"
				label="Заголовок"
				value={fieldValue('title', 'Комплектация проектов')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="p1-title mt-4 text-3xl sm:text-5xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
		</div>

		<!-- Бенто (V2 Carbon Glassmorphism) -->
		<div class="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-6 lg:grid-rows-2">
			{#each cards as card (card.n)}
				<div
					class="equip-card p1-border p1-card p1-card-hover relative overflow-hidden rounded-3xl border shadow-lg backdrop-blur-xl transition-colors hover:border-link-500/30 {card.span}"
				>
					<div class="relative w-full overflow-hidden {card.frame}">
						<ImageFallback
							class="equip-image h-full w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui-slow)] ease-ui"
							src={fieldValue(`item${card.n}Image`, '')}
							alt={fieldValue(`item${card.n}Title`, card.title)}
						/>
					</div>
					<div class={card.pad}>
						<h3 class="p1-title p1-title-sub {card.heading}">
							<EditableField
								fieldKey={`Equipment.item${card.n}Title`}
								label="Заголовок"
								value={fieldValue(`item${card.n}Title`, card.title)}
								{isEditable}
								inline
								onSave={(v) => saveField(`item${card.n}Title`, v)}
								class="inline"
							>
								{#snippet children(displayValue)}{displayValue}{/snippet}
							</EditableField>
						</h3>
						<p class="equip-text p1-muted mt-3 text-sm leading-relaxed transition-colors">
							<EditableField
								fieldKey={`Equipment.item${card.n}Description`}
								label="Описание"
								value={fieldValue(`item${card.n}Description`, card.description)}
								{isEditable}
								multiline
								inline
								onSave={(v) => saveField(`item${card.n}Description`, v)}
								class="inline"
							>
								{#snippet children(displayValue)}{displayValue}{/snippet}
							</EditableField>
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	/*
	 * Описание карточки светлеет по наведению — правилом, а не вариантом
	 * Tailwind: `p1-muted` и `p1-body` — рукописные классы шаблона, и варианта
	 * `group-hover:p1-body` генератор не производит (тот же разбор, что
	 * у Incentives/v2). До 31.08.2026 блок писал именно его — и вместе с ним
	 * `hover:p1-card`, то есть половина состояний наведения молча не работала.
	 *
	 * Заголовок цвет по наведению больше не меняет. Он брал
	 * `group-hover:text-link-300` — утилиту живую, но светлую: на светлой
	 * половине блока бледно-голубое по белому не читалось. Карточка не ссылка
	 * и уже отвечает тремя способами — поверхностью, рамкой и кадром, —
	 * четвёртый сигнал ей не нужен, а перекрашивать заголовок в `--p1-accent`
	 * значит поставить коралловый рядом с синей рамкой того же наведения.
	 */
	.equip-card:hover .equip-text {
		color: var(--p1-body);
	}
	.equip-card:hover :global(.equip-image) {
		transform: scale(1.05);
	}

	@media (prefers-reduced-motion: reduce) {
		.equip-card:hover :global(.equip-image) {
			transform: none;
		}
	}
</style>
