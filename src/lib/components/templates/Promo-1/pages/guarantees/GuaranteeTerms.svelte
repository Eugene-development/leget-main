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
		{ years: '3+', unit: 'лет', title: 'Фасады из дерева',    text: 'Натуральное дерево или шпон с защитным покрытием',          color: 'from-amber-500 to-orange-500 shadow-amber-500/25',   dot: 'from-amber-100 to-orange-100' },
		{ years: '5',  unit: 'лет', title: 'Каркасы мебели',      text: 'ЛДСП и МДФ с двусторонним покрытием высокого качества',     color: 'from-sky-500 to-blue-500 shadow-sky-500/25',         dot: 'from-sky-100 to-blue-100' },
		{ years: '5+', unit: 'лет', title: 'Столешницы',          text: 'Вариант из кварца, акрила и компакт-плиты',                 color: 'from-emerald-500 to-teal-500 shadow-emerald-500/25', dot: 'from-emerald-100 to-teal-100' },
		{ years: '5',  unit: 'лет', title: 'Бытовая техника',     text: 'Официальная гарантия производителя',                        color: 'from-violet-500 to-purple-500 shadow-violet-500/25', dot: 'from-violet-100 to-purple-100' },
		{ years: '5',  unit: 'лет', title: 'Алюминиевый профиль', text: 'Фасады с алюминиевой рамкой со стеклом и без него',         color: 'from-slate-600 to-gray-700 shadow-slate-500/25',     dot: 'from-slate-100 to-gray-200' },
		{ years: '5',  unit: 'лет', title: 'Фурнитура',           text: 'Петли, направляющие и навесы премиум-класса',               color: 'from-cyan-500 to-sky-500 shadow-cyan-500/25',        dot: 'from-cyan-100 to-sky-100' },
		{ years: '15', unit: 'лет', title: 'Мойки',               text: 'Нержавеющая сталь PVD и композитный камень',                color: 'from-blue-500 to-indigo-500 shadow-blue-500/25',     dot: 'from-blue-100 to-indigo-100' },
		{ years: '7',  unit: 'лет', title: 'Стекло и зеркала',    text: 'Закалённое стекло и зеркальные фасады с рисунком и без него', color: 'from-pink-500 to-rose-500 shadow-pink-500/25',      dot: 'from-pink-100 to-rose-100' },
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
	фон секции обязан быть ровно `bg-slate-50` и БЕЗ градиента у верхней кромки.
-->
<section class="relative isolate overflow-hidden bg-slate-50 py-20 sm:py-24">
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
					<h2
						class="text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-pretty text-slate-900 sm:text-4xl lg:text-5xl"
					>
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
					<p class="mx-auto max-w-2xl text-sm/6 text-slate-600 sm:text-base/7">{displayValue}</p>
				{/snippet}
			</EditableField>
			<div class="gt-rule gt-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="h-px flex-1 bg-slate-900/10"></span>
				<span class="size-1.5 rotate-45 border border-emerald-500/70"></span>
				<span class="h-px flex-1 bg-slate-900/10"></span>
			</div>
		</div>

		<div use:revealOnScroll class="gt-reveal mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each items as item, i}
				<div
					class="gt-card group relative overflow-hidden rounded-3xl border border-slate-900/10 bg-white p-6 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.4)] transition duration-300 hover:border-slate-900/20 hover:shadow-[0_34px_80px_-44px_rgba(15,23,42,0.5)] motion-safe:hover:-translate-y-1"
					style="--gt-delay: {i * 60}ms"
				>
					<!-- Цветное пятно и плитка иконки берут градиенты из данных (item.dot / item.color) -->
					<div
						class="pointer-events-none absolute -top-6 -right-6 size-28 rounded-full bg-linear-to-br opacity-60 transition-transform duration-500 group-hover:scale-150 {item.dot}"
						aria-hidden="true"
					></div>

					<div class="relative">
						<div
							class="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-lg ring-1 ring-white/25 transition-transform duration-300 motion-safe:group-hover:-rotate-6 {item.color}"
						>
							<svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						</div>

						<div class="mt-5 flex items-baseline gap-1.5">
							<span class="text-4xl font-semibold tracking-[-0.04em] tabular-nums text-slate-900">
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
							<span class="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
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

						<h3
							class="mt-4 border-t border-slate-900/10 pt-4 text-base font-semibold tracking-[-0.01em] text-slate-900"
						>
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
						<p class="mt-2 text-sm/6 text-slate-500">
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
