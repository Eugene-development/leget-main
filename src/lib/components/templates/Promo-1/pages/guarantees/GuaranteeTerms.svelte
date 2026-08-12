<script lang="ts">
	// Артикул: 1.9.2.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'GuaranteeTerms', updated);
		data = updated;
	}

	const defaultItems = [
		{
			years: '3+',
			unit: 'лет',
			title: 'Фасады из дерева',
			text: 'Натуральное дерево или шпон с защитным покрытием',
			color: 'from-cat-1-500 to-cat-8-500 shadow-cat-1-500/25',
			dot: 'from-cat-1-100 to-cat-8-100'
		},
		{
			years: '5',
			unit: 'лет',
			title: 'Каркасы мебели',
			text: 'ЛДСП и МДФ с двусторонним покрытием высокого качества',
			color: 'from-link-500 to-cat-11-500 shadow-link-500/25',
			dot: 'from-link-100 to-cat-11-100'
		},
		{
			years: '5+',
			unit: 'лет',
			title: 'Столешницы',
			text: 'Вариант из кварца, акрила и компакт-плиты',
			color: 'from-cat-2-500 to-cat-9-500 shadow-cat-2-500/25',
			dot: 'from-cat-2-100 to-cat-9-100'
		},
		{
			years: '5',
			unit: 'лет',
			title: 'Бытовая техника',
			text: 'Официальная гарантия производителя',
			color: 'from-cat-3-500 to-cat-10-500 shadow-cat-3-500/25',
			dot: 'from-cat-3-100 to-cat-10-100'
		},
		{
			years: '5',
			unit: 'лет',
			title: 'Алюминиевый профиль',
			text: 'Фасады с алюминиевой рамкой со стеклом и без него',
			color: 'from-ink-600 to-ink-700 shadow-ink-500/25',
			dot: 'from-ink-100 to-ink-200'
		},
		{
			years: '5',
			unit: 'лет',
			title: 'Фурнитура',
			text: 'Петли, направляющие и навесы премиум-класса',
			color: 'from-cat-5-500 to-link-500 shadow-cat-5-500/25',
			dot: 'from-cat-5-100 to-link-100'
		},
		{
			years: '15',
			unit: 'лет',
			title: 'Мойки',
			text: 'Нержавеющая сталь PVD и композитный камень',
			color: 'from-cat-11-500 to-cat-4-500 shadow-cat-11-500/25',
			dot: 'from-cat-11-100 to-cat-4-100'
		},
		{
			years: '7',
			unit: 'лет',
			title: 'Стекло и зеркала',
			text: 'Закалённое стекло и зеркальные фасады с рисунком и без него',
			color: 'from-cat-7-500 to-cat-6-500 shadow-cat-7-500/25',
			dot: 'from-cat-7-100 to-cat-6-100'
		}
	];

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
	ВНИМАНИЕ — стык секций: сверху в этот блок «вливается» волна из Hero
	(GuaranteesHero). Заливка волны — переменная `--gh-wave` (#f8fafc), поэтому
	фон секции обязан быть ровно `bg-ink-50` и БЕЗ градиента у верхней кромки.
-->
<section class="relative isolate overflow-hidden bg-ink-50 py-section-xs sm:py-section-sm">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="gt-rules"></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div use:revealOnScroll class="gt-reveal text-center">
			<EditableField
				fieldKey="GuaranteeTerms.title"
				label="Заголовок"
				value={String(data?.title ?? 'Сроки гарантии')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="gt-item block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl text-pretty text-ink-900 sm:text-4xl lg:text-5xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="GuaranteeTerms.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Официальная гарантия от производителей на все категории')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="gt-item gt-d1 mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-2xl text-sm/6 text-ink-600 sm:text-base/7">{displayValue}</p>
				{/snippet}
			</EditableField>
			<div class="gt-rule gt-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="h-px flex-1 bg-ink-900/10"></span>
				<span class="size-1.5 rotate-45 border border-cat-2-500/70"></span>
				<span class="h-px flex-1 bg-ink-900/10"></span>
			</div>
		</div>

		<div use:revealOnScroll class="gt-reveal mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each items as item, i}
				<div
					class="gt-card group relative overflow-hidden rounded-3xl border border-ink-900/10 bg-surface-raised p-6 shadow-[0_28px_70px_-50px] shadow-ink-900/40 transition duration-300 hover:border-ink-900/20 hover:shadow-[0_34px_80px_-44px] hover:shadow-ink-900/50 motion-safe:hover:-translate-y-1"
					style="--gt-delay: {i * 60}ms"
				>
					<!-- Цветное пятно и плитка иконки берут градиенты из данных (item.dot / item.color) -->
					<div
						class="pointer-events-none absolute -top-6 -right-6 size-28 rounded-full bg-linear-to-br opacity-60 transition-transform duration-500 group-hover:scale-150 {item.dot}"
						aria-hidden="true"
					></div>

					<div class="relative">
						<div
							class="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br text-on-dark shadow-lg ring-1 ring-on-dark/25 transition-transform duration-300 motion-safe:group-hover:-rotate-6 {item.color}"
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
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>

						<div class="mt-5 flex items-baseline gap-1.5">
							<span class="text-4xl font-semibold tracking-[-0.04em] text-ink-900 tabular-nums">
								<EditableField
									fieldKey="GuaranteeTerms.{i}.years"
									label="Кол-во лет"
									value={item.years}
									{isEditable}
									inline
									onSave={(v) => updateItem(i, 'years', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</span>
							<span class="text-[11px] font-semibold tracking-[0.16em] text-ink-500 uppercase">
								<EditableField
									fieldKey="GuaranteeTerms.{i}.unit"
									label="Ед. измерения"
									value={item.unit}
									{isEditable}
									inline
									onSave={(v) => updateItem(i, 'unit', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</span>
						</div>

						<h3 class="p1-title-sub mt-4 border-t border-ink-900/10 pt-4 text-base text-ink-900">
							<EditableField
								fieldKey="GuaranteeTerms.{i}.title"
								label="Категория"
								value={item.title}
								{isEditable}
								inline
								onSave={(v) => updateItem(i, 'title', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</h3>
						<p class="mt-2 text-sm/6 text-ink-500">
							<EditableField
								fieldKey="GuaranteeTerms.{i}.text"
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
