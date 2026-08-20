<script lang="ts">
	// Артикулы: 1.16.3.2, 1.17.4.2 — см. docs/architecture/component-articles-map.md
	//
	// THESIS: выгоды — это ОБЯЗАТЕЛЬСТВА, а не рекламные плашки. v1 подаёт их
	//   тремя пастельными карточками с цветной плиткой-иконкой, где цвет ничего
	//   не кодирует: «гарантия», «сроки» и «дизайн» не категории, а три равных
	//   пункта, покрашенные в link / cat-2 / cat-1 просто чтобы не были
	//   одинаковыми. v2 отказывается от карточек целиком и строит спецификацию:
	//   строки во всю ширину полосы, две колонки, волосяные линейки вместо рамок,
	//   никакого подъёма на hover. Читается как техпаспорт, а не как баннер.
	// OWN-WORLD: мир Базовой без единого собственного значения — линейки `p1-line`,
	//   роль `p1-title-sub`, толщина штриха иконки из `--ds-icon-stroke`, ритм
	//   `py-section-*`, лестница появления `--ds-motion-stagger-*`.
	// STORY: посетитель видит опись обязательств, где каждое можно прочесть
	//   отдельно и предъявить, — вместо трёх одинаковых карточек, которые глаз
	//   пролистывает как декорацию.
	// FIRST VIEWPORT: заголовок слева; ниже три строки во всю ширину полосы, имя
	//   у левого края, расшифровка справа.
	//   Служебной обвязки описи нет намеренно — ни шапки колонок, ни нумерации,
	//   ни метки над заголовком: две колонки читаются таблицей и без подписей,
	//   а «Что» / «Что это значит», «01…03» и eyebrow ничего не сообщают
	//   посетителю и только добавляют строк, которые он обязан пропустить.
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
<!--
	Тему красит панель внутри полосы контента, а не сама секция.
	На обычной странице `p1-surface` на `<section>` — правильно: секция занимает
	всю ширину, и тёмная тема даёт тёмную полосу во всю страницу. На каталожной
	странице слева стоит фиксированный `CatalogSidebar`, который в поток не входит,
	поэтому такая заливка уезжает под него: сайдбар остаётся светлой карточкой на
	тёмном поле, которое ему не принадлежит. Тема блока обязана красить блок.
	Роль — `p1-catalog-panel`, см. Promo-1/theme.css.
-->
<!--
	Ритм секции на ступень тише обычного (`xs`/`sm` вместо `sm`/`section`):
	воздух вокруг блока теперь складывается из двух слагаемых — внешнего ритма
	между блоками и собственных полей панели. На полной ступени они суммируются
	в полторы секции пустоты над заголовком.
-->
<section class="relative py-section-xs sm:py-section-sm" data-p1-theme={isLight ? 'light' : 'dark'}>
	<div class="p1-catalog-container">
		<div class="p1-surface p1-catalog-panel px-6 py-12 sm:px-10 sm:py-16">
			<div class="max-w-2xl">
				<h2 class="p1-title text-4xl sm:text-5xl">
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
						class="spec-row p1-line group animate-fade-up-in"
						style="animation-delay: var(--ds-motion-stagger-{Math.min(i + 1, 5)})"
					>
						<div class="spec-name">
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
	   базовая линия берётся у первого элемента, а первый элемент здесь — svg,
	   у которого текстовой базовой линии нет вовсе. В описи важно, чтобы обе
	   колонки строки начинались с одной высоты, поэтому выравниваем верх. */
	.spec-row {
		align-items: start;
		padding-block: 1.5rem;
	}

	/* Замыкающая линейка описи: без неё последняя строка висит в воздухе,
	   и таблица перестаёт читаться таблицей. Цвет приходит от `p1-line`,
	   который с 19.08.2026 задаёт `border-color` разом на все стороны.

	   До этой даты здесь стоял `p1-border` — рамка карточки, 0,1 против 0,07
	   у линии, — и стоял не по решению, а потому что роль разделителя красила
	   фон и границей её было не взять. Линейка описи была самым тёмным
	   разделителем шаблона; теперь она такая же, как все. */
	.spec-row:last-child {
		border-block-end-width: 1px;
		border-block-end-style: solid;
	}

	.spec-name {
		display: flex;
		align-items: center;
		gap: 0.875rem;
	}

	.spec-icon {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		stroke-width: var(--ds-icon-stroke);
		transition: color var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}

	.group:hover .spec-icon {
		color: var(--p1-accent);
	}

	@media (prefers-reduced-motion: reduce) {
		.spec-row {
			animation: none;
		}
		.spec-icon {
			transition: none;
		}
	}
</style>
