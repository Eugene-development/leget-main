<script lang="ts">
	// Артикулы: 1.16.3.2, 1.17.4.2 — см. docs/architecture/component-articles-map.md
	//
	// THESIS: выгоды — это ОБЯЗАТЕЛЬСТВА, а не рекламные плашки. v1 подаёт их
	//   тремя пастельными карточками с цветной плиткой-иконкой, где цвет ничего
	//   не кодирует: «гарантия», «сроки» и «дизайн» не категории, а три равных
	//   пункта, покрашенные в link / cat-2 / cat-1 просто чтобы не были
	//   одинаковыми. v2 отказывается от карточек целиком и строит спецификацию:
	//   пронумерованные строки, две колонки «что» / «что это значит», волосяные
	//   линейки вместо рамок, никакого подъёма на hover. Читается как техпаспорт,
	//   а не как баннер.
	// OWN-WORLD: мир Базовой без единого собственного значения — линейки `p1-border`,
	//   роли `p1-label` / `p1-title-sub` / `p1-numeric`, толщина штриха иконки
	//   из `--ds-icon-stroke`, ритм `py-section-*`, лестница появления
	//   `--ds-motion-stagger-*`.
	// STORY: посетитель видит опись обязательств, где каждое можно прочесть
	//   отдельно и предъявить, — вместо трёх одинаковых карточек, которые глаз
	//   пролистывает как декорацию.
	// FIRST VIEWPORT: метка «Обязательства» и заголовок слева; ниже три строки
	//   во всю ширину полосы, номер и имя у левого края, расшифровка справа.
	//   Шапки колонок нет: две колонки читаются как таблица и без подписей, а
	//   «Что» / «Что это значит» над ними — служебный текст, который посетителю
	//   ничего не сообщает.
	// FORM: спецификация — направление выбрано пользователем.
	// FINISH: unreviewed and undocumented is unfinished; this build ends with
	//   the finish review, the verdict, and DESIGN.md.
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { MEBEL_BENEFITS_DEFAULT_TITLE, resolveMebelBenefits } from '../data';
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

	// Нейтральная палитра — из классов p1-*; собственных цветов у версии нет.
	const isLight = $derived(isLightBlock(data, 'light'));

	const items = $derived(resolveMebelBenefits(data?.items));

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelBenefits', updated);
		data = updated;
	}

	async function updateItem(index: number, field: 'title' | 'desc', value: string) {
		const newItems = items.map((item, itemIndex) =>
			itemIndex === index ? { ...item, [field]: value } : item
		);
		await saveField('items', newItems);
	}
</script>

<!-- Почему выбирают нас (MebelBenefits) — спецификация обязательств -->
<section
	class="p1-surface relative py-section-sm sm:py-section"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="p1-catalog-container">
		<div class="max-w-2xl">
			<span class="p1-label p1-muted block uppercase">Обязательства</span>
			<h2 class="p1-title mt-4 text-4xl sm:text-5xl">
				<EditableField
					fieldKey="MebelBenefits.title"
					label="Заголовок блока"
					value={String(data.title || MEBEL_BENEFITS_DEFAULT_TITLE)}
					{isEditable}
					inline
					onSave={(v) => saveField('title', v)}
				>
					{#snippet children(val)}
						{val}
					{/snippet}
				</EditableField>
			</h2>
		</div>

		<dl class="spec mt-12 sm:mt-16">
			{#each items as item, i}
				<div
					class="spec-row p1-border group animate-fade-up-in"
					style="animation-delay: var(--ds-motion-stagger-{Math.min(i + 1, 5)})"
				>
					<div class="spec-name">
						<span class="p1-numeric p1-muted spec-index text-sm"
							>{String(i + 1).padStart(2, '0')}</span
						>
						<svg
							class="spec-icon p1-muted"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							aria-hidden="true"
						>
							{#if item.icon === 'shield'}
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							{:else if item.icon === 'clock'}
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							{:else}
								<!-- design / fallback -->
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							{/if}
						</svg>
						<dt class="p1-title p1-title-sub text-lg sm:text-xl">
							<EditableField
								fieldKey="MebelBenefits.item.{i}.title"
								label="Заголовок карточки"
								value={String(item.title)}
								{isEditable}
								inline
								onSave={(v) => updateItem(i, 'title', v)}
							>
								{#snippet children(val)}
									{val}
								{/snippet}
							</EditableField>
						</dt>
					</div>

					<dd class="p1-body spec-meaning text-base leading-relaxed">
						<EditableField
							fieldKey="MebelBenefits.item.{i}.desc"
							label="Описание карточки"
							value={String(item.desc ?? '')}
							{isEditable}
							inline
							multiline
							onSave={(v) => updateItem(i, 'desc', v)}
						>
							{#snippet children(val)}
								{val}
							{/snippet}
						</EditableField>
					</dd>
				</div>
			{/each}
		</dl>
	</div>
</section>

<style>
	/* Мера колонки имени — частное этой версии: сколько места занимает имя
	   обязательства, система не решает. Всё остальное здесь — роли. */
	.spec-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.5rem 2.5rem;
		border-block-start-width: 1px;
		border-block-start-style: solid;
	}

	@media (min-width: 640px) {
		.spec-row {
			grid-template-columns: 22rem minmax(0, 1fr);
		}
	}

	/* Выравнивание по верху, а не по базовой линии: `.spec-name` — флекс, и его
	   базовая линия берётся у первого элемента, то есть у номера. Строка
	   расшифровки (16px) вставала бы по базовой линии номера и оказывалась выше
	   имени. В описи важно, чтобы строки начинались с одной высоты, поэтому
	   выравниваем верх, а оптический сдвиг снимаем сравнимым интерлиньяжем. */
	.spec-row {
		align-items: start;
		padding-block: 1.5rem;
	}

	/* Замыкающая линейка описи: без неё последняя строка висит в воздухе,
	   и таблица перестаёт читаться таблицей. Цвет приходит от `p1-border`,
	   который задаёт `border-color` разом на все стороны. */
	.spec-row:last-child {
		border-block-end-width: 1px;
		border-block-end-style: solid;
	}

	.spec-name {
		display: flex;
		align-items: center;
		gap: 0.875rem;
	}

	.spec-index {
		/* Ширина под два разряда: номера обязаны стоять в одной вертикали
		   независимо от того, сколько их в блоке. Кегль — ступенью шкалы
		   (`text-sm` в разметке), а не литералом. */
		min-width: 1.75rem;
		transition: color var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}

	.spec-icon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		stroke-width: var(--ds-icon-stroke);
		transition: color var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}

	.group:hover .spec-icon,
	.group:hover .spec-index {
		color: var(--p1-accent);
	}

	@media (prefers-reduced-motion: reduce) {
		.spec-row {
			animation: none;
		}
		.spec-icon,
		.spec-index {
			transition: none;
		}
	}
</style>
