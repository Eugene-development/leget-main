<script lang="ts">
	// Артикул: 1.1.6.2 — см. docs/architecture/component-articles-map.md
	//
	// THESIS: блок про ВЫБОР, а не про кадры. До 12.08.2026 v2 повторял v1 до
	//   уровня `slice(0, 2)` / `slice(2, 4)` со сдвигом второй колонки: та же
	//   мозаика 4:3, тот же градиент, та же подпись внизу кадра, — и отличался
	//   отделкой (пилюля с иконкой, стеклянный шильдик, своя гарнитура). Две
	//   версии, решающие одно и то же, — это одна версия и её отделка. Здесь
	//   имена выгод стали главным предметом, а кадр — доказательством к
	//   выбранному имени: ровно то, что говорит текст блока про «помогаем
	//   сделать правильный выбор».
	// OWN-WORLD: мир Базовой без единого собственного значения — антиква на
	//   крупном кегле, роль `p1-title-sub` на именах, волосяные `p1-line` вместо
	//   рамок, парящая тень `p1-card`, тема-зависимый акцент `p1-accent` на
	//   выбранной строке.
	// STORY: посетитель ведёт глазом по четырём именам, останавливается на
	//   своём и получает к нему кадр — вместо четырёх кадров сразу, из которых
	//   ни один не относится к нему лично.
	// FIRST VIEWPORT: заголовок и абзац слева, под ними четыре строки выбора;
	//   справа один крупный кадр выбранной выгоды.
	// FORM: выбор из четырёх — направление выбрано пользователем.
	// FINISH: unreviewed and undocumented is unfinished; this build ends with
	//   the finish review, the verdict, and DESIGN.md.
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
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

	// Выбор живёт в состоянии, а не в данных: это поведение посетителя, а не
	// контент тенанта. Первая выгода выбрана сразу, поэтому SSR отдаёт готовый
	// блок с кадром, а не пустую рамку до гидратации.
	let selected = $state(0);

	let tabEls: (HTMLElement | null)[] = $state([]);

	function move(to: number) {
		const next = (to + gallery.length) % gallery.length;
		selected = next;
		tabEls[next]?.focus();
	}

	function onTabKey(event: KeyboardEvent, index: number) {
		switch (event.key) {
			case 'ArrowDown':
			case 'ArrowRight':
				event.preventDefault();
				move(index + 1);
				break;
			case 'ArrowUp':
			case 'ArrowLeft':
				event.preventDefault();
				move(index - 1);
				break;
			case 'Home':
				event.preventDefault();
				move(0);
				break;
			case 'End':
				event.preventDefault();
				move(gallery.length - 1);
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				selected = index;
				break;
		}
	}

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Incentives', updated);
		data = updated;
	}

	// Подписи снова редактируемые. В прежней v2 они были простым `{item.label}`:
	// тенант правил их на v1 и v3 и терял эту возможность, переключившись на v2.
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

<!-- Преимущества (Incentives) — выбор из четырёх -->
<section
	class="p1-surface-alt relative py-section-sm sm:py-section"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
			<!-- Слева: заголовок, абзац и сам выбор. Колонки соразмерны намеренно:
			     при 5/7 кадр выходил в полтора раза крупнее всего выбора и снова
			     становился предметом блока, как в прежней мозаике. -->
			<div class="lg:col-span-6">
				<EditableField
					fieldKey="Incentives.title"
					label="Заголовок"
					value={String(data?.title ?? INCENTIVES_DEFAULT_TITLE)}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<!-- Кегль разведён с именами вдвое (60 против 30): обе роли теперь
						     антиквенные, и если ступень между ними мала, иерархия держится
						     на одном лишь размере и читается вяло. Ступени мобильного
						     кегля нет по той же причине: 36 против 30 — это 1,2×. -->
						<h2 class="p1-title text-5xl lg:text-6xl">{displayValue}</h2>
					{/snippet}
				</EditableField>

				<div class="p1-body mt-6 max-w-lg text-base leading-relaxed">
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

				<!-- Метки у списка нет: пилюля «Выгода» удалена 12.08.2026 во всех трёх
				     версиях сразу. Ключ `badge` в данных остаётся — переименование или
				     удаление ключа обнулило бы поле у тенантов, которые его правили.
				     Список подписан для доступности через `aria-label`, а не текстом.

				     Мера списка ограничена: имена короткие («Цена», «Сроки»), и на всю
				     ширину колонки разделители уходили пустой линейкой далеко вправо,
				     превращая выбор в таблицу без второго столбца. -->
				<div role="tablist" aria-orientation="vertical" aria-label="Выгоды" class="mt-10 max-w-md">
					{#each gallery as item, index (index)}
						{@const isCurrent = index === selected}
						<!-- Строка выбора — `div[role=tab]`, а не `<button>`, намеренно:
						     в режиме редактирования EditableField добавляет внутрь
						     собственную кнопку-карандаш, а кнопка в кнопке невалидна и
						     разъезжается между SSR и гидратацией. Роль, tabindex и
						     раскладка стрелок дают ту же клавиатуру, что у кнопки. -->
						<div
							bind:this={tabEls[index]}
							role="tab"
							id="incentive-tab-{index}"
							aria-selected={isCurrent}
							aria-controls="incentive-panel"
							tabindex={isCurrent ? 0 : -1}
							class="choice group flex cursor-pointer items-center gap-5 py-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link-600"
							onclick={() => (selected = index)}
							onkeydown={(event) => onTabKey(event, index)}
						>
							<!-- Выносная черта: короткая у невыбранной строки, длинная и
							     акцентная у выбранной. Это единственное движение блока
							     помимо смены кадра. Дорожка под ней фиксированной ширины —
							     иначе растущая черта толкает имя вправо, и при
							     переключении все четыре имени скачут по горизонтали. -->
							<span class="w-8 shrink-0 sm:w-14">
								<span
									class="block h-px transition-all duration-[var(--ds-motion-duration-ui)] ease-ui {isCurrent
										? 'p1-accent-bg w-8 sm:w-14'
										: 'p1-line w-4 group-hover:w-6 sm:w-6 sm:group-hover:w-9'}"
								></span>
							</span>
							<EditableField
								fieldKey={`Incentives.gallery.${index}.label`}
								label={`Название выгоды ${index + 1}`}
								value={item.label}
								{isEditable}
								onSave={(value) => saveGalleryLabel(index, value)}
								class="block"
							>
								{#snippet children(displayValue)}
									<!-- Роль `p1-title-display`, а не `p1-title-sub`. Имена выгод —
									     предмет блока, и на них стоит тот же голос, что на
									     заголовке: в блоке два голоса, антиква называет вещи,
									     гротеск объясняет. С `-sub` их было три — Cormorant 400
									     на заголовке, Inter 600 на именах и Inter 400 в абзаце, —
									     причём самым тяжёлым оказывался не главный элемент. -->
									<span
										class="choice-name p1-title-display block text-3xl transition-colors duration-[var(--ds-motion-duration-ui)] ease-ui"
									>
										{displayValue}
									</span>
								{/snippet}
							</EditableField>
						</div>
						{#if index < gallery.length - 1}
							<div class="p1-line h-px w-full"></div>
						{/if}
					{/each}
				</div>
			</div>

			<!-- Справа: кадр выбранной выгоды. Все четыре лежат стопкой и меняются
			     проявлением — так между кадрами нет ни белой вспышки, ни повторной
			     загрузки, а перестройка идёт в темпе системы. -->
			<div class="lg:col-span-6">
				<div
					id="incentive-panel"
					role="tabpanel"
					aria-labelledby="incentive-tab-{selected}"
					class="p1-card p1-border p1-body relative aspect-4/3 overflow-hidden rounded-3xl border"
				>
					{#each gallery as item, index (index)}
						{@const isCurrent = index === selected}
						<div
							class="absolute inset-0 transition-[opacity,transform] duration-[var(--ds-motion-duration-ui-slow)] ease-ui motion-reduce:transition-none {isCurrent
								? 'scale-100 opacity-100'
								: 'scale-[1.03] opacity-0'}"
							aria-hidden={!isCurrent}
						>
							<ImageFallback src={item.src} alt={item.alt} class="h-full w-full object-cover" />
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/*
	 * Три ступени текста имени — по состоянию строки, а не тремя условными
	 * классами в разметке. Утилитой это не выражается: `p1-muted` / `p1-body` /
	 * `p1-title` — рукописные классы шаблона, а не утилиты Tailwind, и варианта
	 * `group-hover:p1-body` генератор не производит. Собственных значений здесь
	 * нет: те же переменные темы, которые стоят за этими классами, — цвет по
	 * прежнему принадлежит системе и переключается вместе с темой блока.
	 */
	.choice-name {
		color: var(--p1-muted);
	}
	.choice:hover .choice-name {
		color: var(--p1-body);
	}
	.choice[aria-selected='true'] .choice-name {
		color: var(--p1-title);
	}
</style>
