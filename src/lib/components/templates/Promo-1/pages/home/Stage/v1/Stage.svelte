<script lang="ts">
	// Артикул: 1.1.5.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const steps = $derived(
		Array.isArray(data?.steps) && data.steps.length > 0
			? (data.steps as { title: string; description: string }[])
			: [
					{
						title: 'Консультация',
						description:
							'Наш менеджер даст консультацию по материалам и возможным решениям в проектировании мебели'
					},
					{
						title: 'Замер',
						description:
							'Организуем проектный замер помещения с обозначением углов, коммуникаций и розеток'
					},
					{
						title: 'Проект',
						description:
							'Дизайнер составит проект мебели с учётом всех ваших пожеланий и размеров помещения'
					},
					{
						title: 'Договор',
						description:
							'Поможем комфортно заключить договор с указанием всех условий выполнения вашего проекта'
					},
					{
						title: 'Изготовление',
						description:
							'Фабрика изготовит заказ на высокотехнологичном оборудовании под контролем технологов'
					},
					{
						title: 'Сборка',
						description:
							'Профессиональные сборщики компании качественно выполнят монтаж и установку мебели'
					}
				]
	);

	// SVG иконки для каждого шага
	const icons = [
		'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
		'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
		'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
		'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
		'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
		'M5 13l4 4L19 7'
	];

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Stage', updated);
		data = updated;
	}

	async function saveStepField(index: number, field: 'title' | 'description', value: string) {
		if (!editContext) return;
		const updatedSteps = [...steps];
		updatedSteps[index] = { ...updatedSteps[index], [field]: value };
		const updated = { ...data, steps: updatedSteps };
		await saveComponentData(editContext, 'Stage', updated);
		data = updated;
	}
</script>

<!--
	Этапы работы (Stage), v1.

	Блок фото-замочный: темы у него нет (`themeVersions={['v2']}` в index.svelte),
	потому что под текстом лежит снимок тенанта — нейтральной палитры у такой
	композиции не бывает. Отсюда абсолютные шкалы (`ink`, `link`, `on-dark`,
	`scrim`) вместо ролей `p1-*`: роль вместе с темой здесь переключать нечему.

	Плотность скрима — 65%, а не прежние 50%. Считано, а не подобрано: в худшем
	случае (белый кадр) под чёрной плёнкой 65% остаётся яркость 0,10, то есть
	`on-dark` берёт 7,0:1, а `ink-200` мелкой строки — 5,5:1. На прежних 50%
	белый давал 3,3:1, и карточки поверх скрима ещё и подсвечивались
	`bg-on-dark/10`, то есть контраст под текстом снижался. Здесь карточка,
	наоборот, ДОГАЩАЕТ кадр (`bg-scrim/35`), и текст стоит на 12:1.

	`bg-ink-950` на самой секции — основание под кадром. Картинки у Stage
	в `defaults` нет вовсе, то есть типовое состояние блока — `ImageFallback`,
	и без основания секция досталась бы фону страницы. По контракту заглушки
	на её обёртке стоит текстовая роль (здесь — `text-ink-300`): заглушка
	рисуется `currentColor`, и без цвета растворилась бы в собственном фоне.
-->
<section class="p1-stage-screen relative isolate overflow-hidden bg-ink-950 py-section-xs">
	<ImageFallback
		src={String(data?.bgImage ?? '')}
		alt="Интерьер с мебелью"
		class="absolute inset-0 -z-20 h-full w-full object-cover text-ink-300"
	/>
	<div class="absolute inset-0 -z-10 bg-scrim/65"></div>

	<div class="p1-stage-inner mx-auto max-w-7xl px-6 lg:px-8">
		<!-- Шапка стоит прямо на кадре: своей коробки у неё нет, плёнку держит скрим секции. -->
		<div class="p1-stage-head max-w-3xl text-shadow-media">
			<span
				class="ds-label inline-flex items-center rounded-full border border-link-400/40 bg-link-500/15 px-4 py-1 text-link-200"
			>
				<EditableField
					fieldKey="Stage.badge"
					label="Метка"
					value={String(data?.badge ?? 'Это важно')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</span>

			<EditableField
				fieldKey="Stage.title"
				label="Заголовок"
				value={String(data?.title ?? 'Порядок работы')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="mt-4 text-4xl text-balance text-on-dark sm:text-5xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Stage.description"
				label="Описание"
				value={String(
					data?.description ??
						'Мы поддержим вас на всех этапах работы над мебельным проектом: от первой консультации до дня финальной сборки.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-ink-200">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>
		</div>

		<!--
			Порядок — единственное, ради чего этот блок существует, поэтому он
			лежит в разметке (`ol`), а не только в глазах: до 30.08.2026 шесть
			шагов стояли одинаковыми плитками сетки, и «Сборка» ничем не
			отличалась от «Консультации». `role="list"` — не избыточность:
			Safari снимает семантику списка, как только у него убран маркер,
			а маркер убирает preflight Tailwind.
		-->
		<ol
			role="list"
			class="p1-stage-grid mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3"
		>
			{#each steps as step, i}
				<li
					class="p1-stage-step group flex flex-col rounded-3xl bg-scrim/35 p-5 ring-1 ring-on-dark/15 backdrop-blur-md transition-colors duration-[var(--ds-motion-duration-ui)] ease-ui hover:ring-on-dark/30"
					style="--stage-i: {i}"
				>
					<!--
						Полоса шага: номер — линия — знак. Три полосы одного ряда
						встают на одной высоте и читаются как одна прерванная
						шкала времени, то есть ритм несёт сетка, а не заливка
						карточки. Номер — роль `ds-numeric` («индекс шага»),
						а не набранный руками кегль.
					-->
					<div class="mb-3 flex items-center gap-4">
						<span
							class="ds-numeric text-3xl leading-none text-on-dark/45 transition-colors duration-[var(--ds-motion-duration-ui)] ease-ui group-hover:text-link-200"
							aria-hidden="true"
						>
							{String(i + 1).padStart(2, '0')}
						</span>
						<span class="p1-stage-rule h-px flex-1 bg-on-dark/20"></span>
						<svg
							class="h-5 w-5 shrink-0 [stroke-width:var(--ds-icon-stroke)] text-link-300"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d={icons[i % icons.length]} />
						</svg>
					</div>

					<div class="mt-auto">
						<h3 class="ds-title-sub text-xl text-on-dark">
							<EditableField
								fieldKey={`Stage.steps.${i}.title`}
								label="Заголовок"
								value={step.title}
								{isEditable}
								inline
								onSave={(v) => saveStepField(i, 'title', v)}
								class="inline"
							>
								{#snippet children(displayValue)}{displayValue}{/snippet}
							</EditableField>
						</h3>
						<p class="mt-2 text-sm leading-relaxed text-ink-200">
							<EditableField
								fieldKey={`Stage.steps.${i}.description`}
								label="Описание"
								value={step.description}
								{isEditable}
								multiline
								inline
								onSave={(v) => saveStepField(i, 'description', v)}
								class="inline"
							>
								{#snippet children(displayValue)}{displayValue}{/snippet}
							</EditableField>
						</p>
					</div>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	/* Посадка в экран.

	   Блок мерили в `/_ds`, где он смонтирован голым, и 1022px на фоне окна
	   выглядели обычной секцией. На живой странице сверху стоит `sticky` хедер:
	   при 1440x900 под ним остаётся 828px, и два ряда шагов уходили за нижний
	   край. Порядок работ — это композиция, которую читают целиком; уехавший
	   вниз шестой шаг ломает ровно то, ради чего версия сделана.

	   Доступная высота берётся ролью `--chrome-overlay`, а не числом, — тот же
	   приём и тот же ключ, что у `Brands/v1` и `PartnerOffers/v1`. Баннер не
	   вычитается: он стоит НАД хедером и уезжает при прокрутке, а Stage на
	   главной пятый. Карточка `/_ds` вычитает оба и печатает худший случай
	   верхнего края страницы, поэтому её плашка строже живой страницы на
	   высоту баннера.

	   `min-height`, а не `height`, — и этим блок расходится с `Brands/v1`,
	   откуда приём взят. Там в ячейке один логотип, и ряд можно сжимать
	   вплотную к содержимому. Здесь в карточке проза, которую тенант правит
	   сам: замер на 1024x805 с вдвое длинным описанием дал переполнение всех
	   шести карточек до 41px, то есть жёсткая высота молча резала бы чужой
	   текст. Поэтому ряды объявлены `minmax(min-content, 1fr)`: свободную
	   высоту они делят поровну, но ниже своего содержимого не садятся, а
	   секция под ними растёт. Блок гарантированно НЕ короче экрана; выше
	   экрана он становится только там, где владелец сам написал столько
	   текста, и это видно ему, а не спрятано под обрезкой.

	   Режим включается только там, где он осмыслен: три колонки (>=64rem) и
	   окно не ниже 50rem. Порог — замер, а не круглое число: в этом режиме
	   поле секции падает на ступень (`section-2xs`), содержимое занимает 725px,
	   и `100svh - --chrome-overlay` перекрывает его начиная с 797px высоты
	   окна. Ниже пришлось бы сжимать ряды под их содержимое, то есть резать
	   текст тенанта; уже — шесть карточек в одну-две колонки в экран не
	   сажаются никаким уплотнением, и врать пустой высотой хуже, чем
	   прокрутиться. За пределами гейта блок остаётся в обычном потоке.
	*/
	@media (min-width: 64rem) and (min-height: 50rem) {
		.p1-stage-screen {
			/* Ступень ритма ниже обычной: внешний воздух секции складывается
			   с внутренним, который раздаёт свободную высоту рядам. */
			display: flex;
			min-height: calc(100svh - var(--chrome-overlay));
			flex-direction: column;
			padding-block: var(--spacing-section-2xs);
		}

		.p1-stage-screen .p1-stage-inner {
			display: flex;
			flex: 1;
			flex-direction: column;
		}

		.p1-stage-screen .p1-stage-head {
			flex-shrink: 0;
		}

		.p1-stage-screen .p1-stage-grid {
			flex: 1;
			grid-template-rows: repeat(2, minmax(min-content, 1fr));
		}
	}

	/*
	   Один авторский момент на блок: шаг встаёт на место, и его шкала
	   дочерчивается. Пацинг задаёт прокрутка, поэтому длительности нет —
	   есть доля входа (`--ds-motion-range-enter`), как у `p1-settle`
	   в `PartnerOffers/v1`. Лесенка набирается сдвигом НАЧАЛА диапазона
	   (`--stage-i`), а не задержкой: у скролл-связанной анимации задержки
	   во времени не существует.

	   Оба гейта — на включение: без поддержки `animation-timeline` и при
	   `prefers-reduced-motion: reduce` шаг просто стоит на месте, а шкала
	   нарисована целиком. Умолчание — конечный вид.
	*/
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.p1-stage-step {
				animation-name: p1-stage-settle;
				animation-duration: auto;
				animation-fill-mode: both;
				animation-timing-function: var(--ds-motion-ease);
				animation-timeline: view();
				animation-range: entry calc(var(--stage-i, 0) * 3%) entry var(--ds-motion-range-enter);
			}

			.p1-stage-rule {
				transform-origin: left center;
				animation-name: p1-stage-draw;
				animation-duration: auto;
				animation-fill-mode: both;
				animation-timing-function: var(--ds-motion-ease);
				animation-timeline: view();
				animation-range: entry calc(var(--stage-i, 0) * 3%) entry var(--ds-motion-range-enter);
			}
		}
	}

	@keyframes p1-stage-settle {
		from {
			opacity: 0;
			transform: translateY(var(--ds-motion-lift));
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes p1-stage-draw {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}
</style>
