<script lang="ts">
	// Артикул: 1.27.2.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import SingleVersionSettings from '$lib/components/SingleVersionSettings.svelte';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { requestApply, VACANCY_FORM_ID } from './apply';
	import { revealOnScroll } from './theme';
	import './theme.css';
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

	const isLight = $derived(isLightBlock(data, 'light'));

	/**
	 * Акцент страницы — индиго (`cat-4`), а не роль `p1-accent`: в Базовой она
	 * красная, и страница ушла бы в другую гамму, чем нарисована.
	 *
	 * Шкала от темы не зависит, но ступень зависит: на светлой поверхности
	 * читается 600, на тёмной она уходит в фон. Развилка объявлена один раз
	 * здесь — палитрой, как у PageHero, — а не условиями по месту.
	 */
	const accent = $derived(
		isLight
			? {
					text: 'text-cat-4-600',
					pill: 'border-cat-4-500/25 bg-cat-4-50 text-cat-4-700',
					dot: 'bg-cat-4-500',
					link: 'hover:border-cat-4-500 hover:text-cat-4-600'
				}
			: {
					text: 'text-cat-4-300',
					pill: 'border-cat-4-400/30 bg-cat-4-500/15 text-cat-4-200',
					dot: 'bg-cat-4-400',
					link: 'hover:border-cat-4-400 hover:text-cat-4-300'
				}
	);

	type Vacancy = {
		id: string;
		title: string;
		type: string;
		location: string;
		salary: string;
		/** Путь значка внутри viewBox 24×24 — только `d`, без разметки. */
		icon: string;
		description: string;
		duties: string[];
		requirements: string[];
	};

	/**
	 * Стартовые позиции. Текст перенесён из `Promo-3/pages/vacancies` дословно:
	 * он уже написан и согласован, а шаблон задаёт оформление, не содержание.
	 */
	const defaultVacancies: Vacancy[] = [
		{
			id: 'tiler',
			title: 'Плиточник',
			type: 'Полная занятость',
			location: 'Москва и МО',
			salary: 'от 90 000 ₽',
			icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
			description:
				'Занимаемся профессиональной укладкой плитки в жилых и коммерческих объектах. Ищем профессионала с безупречным качеством работы.',
			duties: [
				'Укладка настенной и напольной плитки, керамогранита и мозаики',
				'Подготовка поверхностей (штукатурка, выравнивание, гидроизоляция)',
				'Работа с погонажем, порогами и декоративными элементами'
			],
			requirements: [
				'Опыт укладки плитки от 3 лет',
				'Умение работать с крупноформатными плитами (60×120 и более)',
				'Аккуратность, ответственность, работа в команде'
			]
		},
		{
			id: 'sales',
			title: 'Менеджер по продажам',
			type: 'Полная занятость',
			location: 'Москва, офис / гибрид',
			salary: 'от 70 000 ₽ + бонусы',
			icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
			description:
				'Продажи — сердце нашего бизнеса. Мы ищем энергичного консультанта, который умеет слушать клиентов и подбирать решения.',
			duties: [
				'Консультирование клиентов в шоуруме и по телефону',
				'Подбор коллекций плитки под проект и бюджет клиента',
				'Ведение CRM, выставление счетов, контроль отгрузки'
			],
			requirements: [
				'Опыт продаж в сфере строительных материалов или интерьера от 1 года',
				'Умение работать с возражениями и вести переговоры',
				'Грамотная речь, презентабельный внешний вид'
			]
		},
		{
			id: 'designer',
			title: 'Дизайнер мебели',
			type: 'Полная занятость / Проектная работа',
			location: 'Москва, гибридный формат',
			salary: 'от 80 000 ₽',
			icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z',
			description:
				'Создаём интерьеры, в которых плитка и мебель дополняют друг друга. Ищем дизайнера, способного мыслить пространством и деталями одновременно.',
			duties: [
				'Разработка концепций меблировки для жилых и коммерческих интерьеров',
				'Создание 3D-визуализаций в сочетании с нашими коллекциями плитки',
				'Сопровождение проекта от эскиза до монтажа'
			],
			requirements: [
				'Профессиональное образование в области дизайна интерьеров',
				'Уверенное владение 3ds Max / SketchUp / Revit, Photoshop',
				'Портфолио выполненных проектов — обязательно'
			]
		},
		{
			id: 'curator',
			title: 'Куратор проектов',
			type: 'Полная занятость',
			location: 'Москва и МО',
			salary: 'от 85 000 ₽',
			icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12l2 2 4-4',
			description:
				'Координируем ремонтные проекты от замера до сдачи объекта. Ищем человека, который умеет держать всё под контролем.',
			duties: [
				'Координация взаимодействия между клиентами, дизайнерами и бригадами монтажников',
				'Составление и ведение проектных планов, контроль сроков и бюджетов',
				'Выезд на объекты для приёмки работ и консультаций'
			],
			requirements: [
				'Опыт управления строительными или ремонтными проектами от 2 лет',
				'Умение работать в режиме многозадачности',
				'Знание строительных технологий и материалов'
			]
		}
	];

	const vacancies = $derived(
		Array.isArray(data?.vacancies) && (data.vacancies as unknown[]).length > 0
			? (data.vacancies as Vacancy[])
			: defaultVacancies
	);

	/**
	 * Раскрыта одна позиция за раз: список остаётся описью, а не разъезжается
	 * в четыре простыни сразу. `null` означает «посетитель ещё не трогал» —
	 * тогда открыта первая; чтобы закрыть все, кладём пустую строку.
	 *
	 * Это состояние просмотра, а не контент: в `data` оно не пишется
	 * и других посетителей не касается.
	 */
	let openId = $state<string | null>(null);
	const activeId = $derived(openId ?? vacancies[0]?.id ?? '');

	/**
	 * В режиме правки раскрыты все и строка перестаёт быть кнопкой.
	 *
	 * Причин две, и обе жёсткие. Свёрнутый текст недоступен для правки — ровно
	 * то соображение, из-за которого аккордеона нет у InstallmentFAQ. А карандаш
	 * <EditableField> — сам по себе <button>, и внутри кнопки-строки он дал бы
	 * вложенную кнопку: разметка невалидна, а клик по карандашу вдобавок
	 * сворачивал бы карточку. Посетителю аккордеон нужен, поэтому он остаётся,
	 * а правка получает развёрнутый вид.
	 */
	function isOpen(id: string): boolean {
		return isEditable || activeId === id;
	}

	function toggle(id: string) {
		openId = activeId === id ? '' : id;
	}

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'VacancyList', updated);
		data = updated;
	}

	/** Правка поля позиции: список позиций хранится целиком в `data.vacancies`. */
	async function updateVacancy(index: number, field: keyof Vacancy, value: string) {
		const updated = vacancies.map((v, i) => (i === index ? { ...v, [field]: value } : v));
		await saveField('vacancies', updated);
	}

	/** Правка одной строки в перечне обязанностей или требований. */
	async function updateBullet(
		index: number,
		field: 'duties' | 'requirements',
		bulletIndex: number,
		value: string
	) {
		const updated = vacancies.map((v, i) =>
			i === index
				? { ...v, [field]: v[field].map((line, j) => (j === bulletIndex ? value : line)) }
				: v
		);
		await saveField('vacancies', updated);
	}
</script>

<!--
	Содержимое строки позиции. Вынесено в snippet, потому что носитель у него
	разный: посетителю строка отдаётся кнопкой (вся строка — зона нажатия,
	на 390px это единственный способ удержать цель выше 44px), а в режиме
	правки — обычным <div>, см. isOpen() выше.
-->
{#snippet row(vacancy: Vacancy, i: number)}
	<span
		class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-cat-4-400 to-cat-4-500 text-on-accent sm:size-14"
		aria-hidden="true"
	>
		<svg
			class="size-6 sm:size-7"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="1.5"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d={vacancy.icon} />
		</svg>
	</span>

	<span class="flex min-w-0 flex-1 flex-col gap-1.5">
		<span class="p1-title-sub p1-title text-lg sm:text-xl">
			<EditableField
				fieldKey="VacancyList.{i}.title"
				label="Должность"
				value={vacancy.title}
				{isEditable}
				inline
				onSave={(v) => updateVacancy(i, 'title', v)}
			>
				{#snippet children(val)}{val}{/snippet}
			</EditableField>
		</span>
		<span class="p1-muted p1-note">
			<EditableField
				fieldKey="VacancyList.{i}.type"
				label="Занятость"
				value={vacancy.type}
				{isEditable}
				inline
				onSave={(v) => updateVacancy(i, 'type', v)}
			>
				{#snippet children(val)}{val}{/snippet}
			</EditableField>
			·
			<EditableField
				fieldKey="VacancyList.{i}.location"
				label="Город"
				value={vacancy.location}
				{isEditable}
				inline
				onSave={(v) => updateVacancy(i, 'location', v)}
			>
				{#snippet children(val)}{val}{/snippet}
			</EditableField>
		</span>
	</span>

	<!--
		Оклад. На узком экране уходит под подпись отдельной строкой
		(`basis-full` + `order-last`), на широком встаёт в строку перед
		шевроном. Элемент один, а не два по медиазапросу: второй пришлось бы
		завести с тем же ключом правки, и карандашей на одно поле стало бы два.
	-->
	<span class="order-last basis-full sm:order-none sm:basis-auto">
		<span class="p1-numeric inline-block rounded-full border px-4 py-1.5 text-sm {accent.pill}">
			<EditableField
				fieldKey="VacancyList.{i}.salary"
				label="Оклад"
				value={vacancy.salary}
				{isEditable}
				inline
				onSave={(v) => updateVacancy(i, 'salary', v)}
			>
				{#snippet children(val)}{val}{/snippet}
			</EditableField>
		</span>
	</span>

	{#if !isEditable}
		<span
			class="p1-muted flex shrink-0 items-center transition-transform duration-300"
			class:rotate-180={isOpen(vacancy.id)}
			aria-hidden="true"
		>
			<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
			</svg>
		</span>
	{/if}
{/snippet}

<!--
	Опись открытых позиций.

	ВНИМАНИЕ — стык секций: сверху в блок «вливается» волна из VacancyHero,
	её заливка равна `--ds-light-surface-alt`, то есть фону этой секции
	в светлой теме. В тёмную переводить нужно оба блока сразу, иначе на стыке
	появится полоса.
-->
<section
	class="p1-surface-alt relative isolate overflow-hidden py-section-sm"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<SingleVersionSettings
		bind:data
		{editContext}
		{isEditable}
		componentType="VacancyList"
		themeToggle
		themeDefault="light"
		title="Открытые позиции"
	/>

	{#if isLight}
		<div class="pointer-events-none absolute inset-0" aria-hidden="true">
			<div class="vc-rules"></div>
		</div>
	{/if}

	<div class="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
		<div use:revealOnScroll class="vc-reveal text-center">
			<EditableField
				fieldKey="VacancyList.label"
				label="Метка"
				value={String(data?.label ?? 'Открытые позиции')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
				class="vc-item block"
			>
				{#snippet children(displayValue)}
					<span class="p1-label {accent.text}">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="VacancyList.title"
				label="Заголовок"
				value={String(data?.title ?? 'Кого мы ищем')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="vc-item vc-d1 mt-5 block"
			>
				{#snippet children(displayValue)}
					<h2 class="p1-title text-3xl text-pretty sm:text-4xl">{displayValue}</h2>
				{/snippet}
			</EditableField>

			<div class="vc-rule vc-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="p1-line flex-1 border-t"></span>
				<span class="size-1.5 rotate-45 border border-cat-4-500/70"></span>
				<span class="p1-line flex-1 border-t"></span>
			</div>

			<EditableField
				fieldKey="VacancyList.description"
				label="Пояснение"
				value={String(
					data?.description ?? 'Нажмите на позицию, чтобы раскрыть обязанности и требования.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="vc-item vc-d3 mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="p1-body mx-auto max-w-xl text-base/7 text-pretty">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<div use:revealOnScroll class="vc-reveal mt-14 flex flex-col gap-4">
			{#each vacancies as vacancy, i (vacancy.id ?? i)}
				<div
					class="vc-card p1-card p1-card-hover overflow-hidden rounded-3xl border transition duration-300"
					style="--vc-delay: {i * 70}ms"
				>
					{#if isEditable}
						<div class="flex flex-wrap items-center gap-x-4 gap-y-4 p-6 sm:gap-x-6 sm:p-7">
							{@render row(vacancy, i)}
						</div>
					{:else}
						<button
							type="button"
							class="flex w-full cursor-pointer flex-wrap items-center gap-x-4 gap-y-4 p-6 text-left sm:gap-x-6 sm:p-7"
							aria-expanded={isOpen(vacancy.id)}
							aria-controls="vacancy-panel-{vacancy.id ?? i}"
							onclick={() => toggle(vacancy.id)}
						>
							{@render row(vacancy, i)}
						</button>
					{/if}

					<div
						class="vc-fold"
						data-open={isOpen(vacancy.id) ? 'true' : 'false'}
						id="vacancy-panel-{vacancy.id ?? i}"
					>
						<div>
							<div class="px-6 pb-7 sm:px-7 sm:pb-8">
								<div class="p1-line mb-6 border-t"></div>

								<p class="p1-body max-w-3xl text-base/7">
									<EditableField
										fieldKey="VacancyList.{i}.description"
										label="Описание позиции"
										value={vacancy.description}
										{isEditable}
										inline
										multiline
										onSave={(v) => updateVacancy(i, 'description', v)}
									>
										{#snippet children(val)}{val}{/snippet}
									</EditableField>
								</p>

								<!--
									Обязанности и требования: на широком экране две колонки,
									на узком одна. Перечни правятся построчно; добавить или
									убрать строку можно в данных блока — как и везде в шаблоне,
									инструмента для правки состава списка на странице нет.
								-->
								<div class="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-10">
									<div>
										<span class="p1-label p1-muted">Обязанности</span>
										<ul class="mt-4 flex flex-col gap-3">
											{#each vacancy.duties as duty, j (j)}
												<li class="p1-body flex gap-3 text-sm/6">
													<span
														class="mt-2 size-1.5 shrink-0 rounded-full {accent.dot}"
														aria-hidden="true"
													></span>
													<span>
														<EditableField
															fieldKey="VacancyList.{i}.duties.{j}"
															label="Обязанность"
															value={duty}
															{isEditable}
															inline
															multiline
															onSave={(v) => updateBullet(i, 'duties', j, v)}
														>
															{#snippet children(val)}{val}{/snippet}
														</EditableField>
													</span>
												</li>
											{/each}
										</ul>
									</div>

									<div>
										<span class="p1-label p1-muted">Требования</span>
										<ul class="mt-4 flex flex-col gap-3">
											{#each vacancy.requirements as requirement, j (j)}
												<li class="p1-body flex gap-3 text-sm/6">
													<span
														class="p1-rail mt-2 size-1.5 shrink-0 rounded-full"
														aria-hidden="true"
													></span>
													<span>
														<EditableField
															fieldKey="VacancyList.{i}.requirements.{j}"
															label="Требование"
															value={requirement}
															{isEditable}
															inline
															multiline
															onSave={(v) => updateBullet(i, 'requirements', j, v)}
														>
															{#snippet children(val)}{val}{/snippet}
														</EditableField>
													</span>
												</li>
											{/each}
										</ul>
									</div>
								</div>

								<!--
									«Откликнуться» — ссылка на якорь формы, а не кнопка со
									скриптом: форма стоит отдельным блоком ниже, и посетитель
									обязан попадать к ней даже без JS. Событие лишь подставляет
									позицию в поле (см. ./apply.ts).
								-->
								<div class="mt-8">
									<a
										class="p1-border p1-title inline-flex items-center gap-2.5 rounded-full border px-7 py-3 text-sm font-semibold transition duration-300 {accent.link}"
										href="#{VACANCY_FORM_ID}"
										onclick={() => requestApply(vacancy.title)}
									>
										Откликнуться
										<span aria-hidden="true">→</span>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
