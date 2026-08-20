<script lang="ts">
	// Артикул: 1.1.6.3 — см. docs/architecture/component-articles-map.md
	//
	// THESIS: блок несёт НАЗВАНИЯ направлений, а не фотографии. v1 и v2 решают
	//   одно и то же — мозаика кадров с подписью поверх градиента; v3 отказывается
	//   от коллажа и строит опись: строка = направление, кадр к ней — образец.
	// OWN-WORLD: мир Базовой без изменений — антиква на крупном кегле, гротеск в
	//   подчинённом заголовке, волосяные линии p1-line вместо рамок, парящая тень
	//   на образце, щедрый вертикальный воздух.
	// STORY: посетитель читает четыре направления подбора и понимает, что здесь
	//   помогают выбрать, а не просто показывают красивые ракурсы.
	// FIRST VIEWPORT: заголовок и абзац в меру max-w-2xl слева; ниже — метка описи
	//   и четыре строки во всю ширину контейнера, название у левого края в одной
	//   вертикали с заголовком, квадратный образец у правого.
	// FORM: опись направлений — первая в списке структур, выбрана пользователем.
	// FINISH: unreviewed and undocumented is unfinished; this build ends with the
	//   finish review, the verdict, and DESIGN.md.
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import {
		INCENTIVES_DEFAULT_TEXT,
		INCENTIVES_DEFAULT_TITLE,
		resolveIncentivesGallery
	} from '../data';
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
	const isLight = $derived(isLightBlock(data, 'light'));

	const gallery = $derived(resolveIncentivesGallery(data?.gallery));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Incentives', updated);
		data = updated;
	}

	async function saveGalleryLabel(index: number, value: string) {
		if (!editContext) return;
		const updatedGallery = gallery.map((item, itemIndex) =>
			itemIndex === index ? { ...item, label: value } : item
		);
		const updated = { ...data, gallery: updatedGallery };
		await saveComponentData(editContext, 'Incentives', updated);
		data = updated;
	}
</script>

<!-- Преимущества (Incentives) — опись направлений -->
<!--
	Вертикальный ритм — `py-section-sm` / `py-section`, а не захардкоженные
	`py-24 sm:py-32`, как в v1 и v2. Утилиты идут от `--ds-spacing-section`,
	то есть ритм принадлежит системе и сжимается вместе с ней (Базовая 100/120px,
	«Графит» 72/96px). До этого блока утилиты в Promo-1 не использовал никто:
	114 захардкоженных `py-20/24/28/32` против нуля `py-section`, из-за чего
	сжатый ритм «Графита» до шаблона просто не доходил. Остальные 114 не
	переведены — см. Layout в DESIGN.md.
-->
<section
	class="p1-surface relative py-section-sm sm:py-section"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<!-- Шапка: мера абзаца ограничена, опись ниже идёт во всю ширину -->
		<div class="max-w-2xl">
			<EditableField
				fieldKey="Incentives.title"
				label="Заголовок"
				value={String(data?.title ?? INCENTIVES_DEFAULT_TITLE)}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<!-- Ступень мобильного кегля убрана: 36 против 30 у имён — это 1,2×,
					     и при одинаковой антикве заголовок переставал читаться главным.
					     48 против 30 держит ту же полуторную ступень, что и на широком
					     экране (60 против 30). -->
					<h2 class="p1-title text-5xl lg:text-6xl">{displayValue}</h2>
				{/snippet}
			</EditableField>

			<div class="p1-body mt-6 text-lg leading-8">
				<EditableField
					fieldKey="Incentives.text"
					label="Текст"
					value={String(data?.text ?? INCENTIVES_DEFAULT_TEXT)}
					{isEditable}
					multiline
					onSave={(v) => saveField('text', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						{@html displayValue}
					{/snippet}
				</EditableField>
			</div>
		</div>

		<!-- Опись. Метки у неё нет: пилюля «Выгода» удалена 12.08.2026 во всех трёх
		     версиях сразу. Ключ `badge` в данных остаётся — переименование или
		     удаление ключа обнулило бы поле у тенантов, которые его правили. -->
		<div class="mt-16 sm:mt-20">
			<ul class="ledger">
				{#each gallery as item, index}
					<li class="ledger-row">
						<div class="group flex items-center gap-5 py-4 sm:gap-8 sm:py-5">
							<!-- Роль `p1-title-display`, а не `p1-title-sub` (12.08.2026).
							     Названия направлений — предмет описи, и голос у них тот же,
							     что у заголовка: в блоке два голоса, антиква называет вещи,
							     гротеск объясняет. С `-sub` их было три, причём гротеск 600
							     на 30px по оптической массе спорил с антиквой 400 на 60px —
							     разбор в DESIGN.md, «Правило распределения веса». Кегль без
							     ступеней: ниже ~28px дисплейная роль не ставится. -->
							<EditableField
								fieldKey={`Incentives.gallery.${index}.label`}
								label={`Название выгоды ${index + 1}`}
								value={item.label}
								{isEditable}
								onSave={(value) => saveGalleryLabel(index, value)}
								class="block sm:shrink-0"
							>
								{#snippet children(displayValue)}
									<p class="p1-title p1-title-display text-3xl break-words">
										{displayValue}
									</p>
								{/snippet}
							</EditableField>
							<!-- Выносная линия: она связывает название с образцом, иначе на
							     широком экране между ними остаётся 700px пустоты и строка
							     распадается на два несвязанных предмета. Ниже sm строка
							     слишком узкая — линия сжимается в ноль, и связь берёт на
							     себя разделитель под строкой. -->
							<div class="p1-line hidden flex-1 border-t sm:block"></div>
							<div
								class="specimen p1-card p1-border p1-body ml-auto aspect-square w-20 shrink-0 overflow-hidden rounded-2xl border sm:ml-0 sm:w-24"
							>
								<ImageFallback src={item.src} alt={item.alt} class="h-full w-full object-cover" />
							</div>
						</div>
						<div class="p1-line w-full border-t sm:hidden"></div>
					</li>
				{/each}
			</ul>

			<div class="mt-10 flex justify-start sm:mt-12">
				<button
					type="button"
					onclick={() => serviceOrderStore.open('consultation')}
					class="inline-flex cursor-pointer items-center justify-center gap-3 rounded-full bg-accent-surface px-7 py-4 text-base font-semibold text-on-accent shadow-[0_8px_30px] shadow-brand-500/25 transition-[transform,background-color,box-shadow] duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-0.5 hover:bg-accent-surface-deep hover:shadow-brand-500/35 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 active:translate-y-0"
				>
					<EditableField
						fieldKey="Incentives.ctaText"
						label="Текст кнопки"
						value={String(data?.ctaText ?? 'Получить консультацию')}
						{isEditable}
						onSave={(v) => saveField('ctaText', v)}
						class="inline"
					>
						{#snippet children(displayValue)}{displayValue}{/snippet}
					</EditableField>
					<svg
						class="h-4 w-4 shrink-0"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</section>

<style>
	/* Единственный авторский момент блока: строки описи приходят лестницей
	   сверху вниз, как заполняемый список. Собственного здесь нет ничего —
	   траектория из общих @keyframes приложения, длительность и кривая из
	   `--animate-fade-up-in`, ступени из `--ds-motion-stagger-*`. Блок решает
	   только то, что ему и положено: какие элементы идут лестницей. */
	.ledger-row {
		animation: var(--animate-fade-up-in);
	}
	.ledger-row:nth-child(1) {
		animation-delay: var(--ds-motion-stagger-1);
	}
	.ledger-row:nth-child(2) {
		animation-delay: var(--ds-motion-stagger-2);
	}
	.ledger-row:nth-child(3) {
		animation-delay: var(--ds-motion-stagger-3);
	}
	.ledger-row:nth-child(4) {
		animation-delay: var(--ds-motion-stagger-4);
	}

	/* Образец приближается на наведении строки. Свойство одно и дешёвое —
	   ни фон, ни тень на наведении не трогаем. */
	.specimen :global(> *) {
		transition: transform var(--ds-motion-duration) var(--ds-motion-ease);
	}
	.group:hover .specimen :global(> *) {
		transform: scale(1.06);
	}

	@media (prefers-reduced-motion: reduce) {
		.ledger-row {
			animation: none;
		}
		.specimen :global(> *) {
			transition: none;
		}
		.group:hover .specimen :global(> *) {
			transform: none;
		}
	}
</style>
