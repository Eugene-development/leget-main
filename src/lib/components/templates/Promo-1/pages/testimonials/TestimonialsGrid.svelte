<script lang="ts">
	// Артикул: 1.7.2.1 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
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
		await saveComponentData(editContext, 'TestimonialsGrid', updated);
		data = updated;
	}

	async function updateFeatured(field: string, value: string) {
		const updatedFeatured = { ...featured, [field]: value };
		await saveField('featured', updatedFeatured);
	}

	async function updateReview(index: number, field: string, value: string) {
		const updatedReviews = [...reviews];
		updatedReviews[index] = { ...updatedReviews[index], [field]: value };
		await saveField('reviews', updatedReviews);
	}

	const defaultFeatured = {
		text: 'Ваша работа — это лучший знак качества. Убедились в этом снова. Наш новый гарнитур на кухне стал очень хорошим дополнением к интерьеру. Большое спасибо за вашу работу!',
		name: 'Тамара Фёдоровна Лукьянова',
		location: 'Москва'
	};

	const defaultReviews = [
		{
			text: 'Купили гардероб. Каждая деталь хорошо продумана. Мы остались довольны своей покупкой. Закажем ещё.',
			name: 'Сергей Александров',
			location: 'Балашиха'
		},
		{
			text: 'Советую всем дизайнера Евгения. Подобрал вариант с техникой по нашему бюджету и уложились в сроки. Благодарю!',
			name: 'LazyRich99',
			location: 'Реутов'
		},
		{
			text: 'До обращения к вам мы почти год не могли решить, как организовать кухню-гостиную: места мало, окно низкое, а в углу проходят трубы. Дизайнер предложил перенести высокие шкафы к противоположной стене и спрятать коммуникации за съёмной панелью. Теперь в комнате свободно, для всей техники нашлось место, а за общим столом наконец удобно собираться всей семьёй.',
			name: 'Анастасия Чернова',
			location: 'Москва'
		},
		{
			text: 'Спасибо! С вашей помощью мы удачно обновили кухню и теперь там больше времени проводим вместе с семьёй. Обновка моя удалась! Спасибочки)',
			name: 'Серафима',
			location: 'Казань'
		},
		{
			text: 'Мы довольны результатом выполненных работ этой компании. Новый шкаф в прихожую — это просто красота! Сборщики тоже хорошие.',
			name: 'Лена',
			location: 'Московская область'
		},
		{
			text: 'Наш новый шкаф купе — это радость для меня! Получилось стильно и удобно. Теперь наши вещи будут в порядке) Будем вас советовать.',
			name: 'Лана и Лёша',
			location: 'Мытищи'
		},
		{
			text: 'Начали с одного шкафа в прихожую, но уже на замере поняли, что лучше сразу связать его с тумбой, зеркалом и мягкой скамьёй. Нам нарисовали несколько вариантов, показали образцы в разном освещении и помогли не выйти за бюджет. Готовый комплект выглядит как единая композиция, а прихожая больше не кажется тёмной и тесной.',
			name: 'Семья Орловых',
			location: 'Звенигород'
		},
		{
			text: 'Хороший шкаф. Купили в мае. Покупка, которая оправдала все ожидания. Пришлось взять в рассрочку, так как не уложились в свой бюджет.',
			name: 'Лекс',
			location: 'Москва'
		},
		{
			text: 'Купил кухонный гарнитур через этих ребят. Работают профессионалы. Все идеально подходит, ничего не смущает даже.',
			name: 'Таймураз',
			location: 'Нижний Новгород'
		},
		{
			text: 'У нас самый крутой кухонный гарнитур среди друзей. Не можем налюбоваться! Спасибо за работу. Мы рады!',
			name: 'Танечка',
			location: 'Нижний Новгород'
		},
		{
			text: 'Квартира у нас небольшая, поэтому для кабинета пришлось искать место в гостиной. Вместо обычного стола нам спроектировали целую стену: рабочее место, закрытые шкафы для документов и открытые полки для книг. Вечером закрываем ноутбук, и мебель снова выглядит как часть гостиной. Продумано до мелочей и очень аккуратно исполнено.',
			name: 'Павел Смирнов',
			location: 'Санкт-Петербург'
		},
		{
			text: 'Мне очень нужен был вместительный шкаф. Мы довольны своим выбором дизайнера! Так же хочу сказать спасибо за скидку.',
			name: 'Анатолий',
			location: 'Владимир'
		},
		{
			text: 'Юрий! Большое спасибо за оперативность и дружелюбие. Мебель была мне в подарок и хорошо что вы успели к моему Дню рождения!',
			name: 'Марина',
			location: 'Санкт-Петербург'
		},
		{
			text: 'Знаком с вами очень давно. Не подвели. Меня порадовал адекватный выбор материалов для нашей спальни.',
			name: 'Георгий Феликсович',
			location: 'Санкт-Петербург'
		},
		{
			text: 'Хотела сохранить в спальне старинный комод, но вся новая мебель рядом с ним казалась чужой. Дизайнер не стал уговаривать нас избавиться от него, а подобрал для шкафов такой же тёплый оттенок дерева и сдержанную фурнитуру. В итоге новые вещи не спорят с историей дома, а комната выглядит цельной и очень уютной.',
			name: 'Юлия Андреева',
			location: 'Владимир'
		},
		{
			text: 'Начали переезд с обновления мебели. Заказали гардероб и гарнитур. Получилось функциональное украшение нашей спальни и кухни. Все удобно и лаконично! Рекомендуем вас друзьям.',
			name: 'Дина',
			location: 'Казань'
		},
		{
			text: 'Заказали дорогой кухонный гарнитур в загородный дом с подсветкой, мойкой и бытовой техникой. Очень боялись ошибиться. В итоге получили то что хотели. Мы счастливы, что сделали выбор с вашей помощью. Однозначно будем рекомендовать.',
			name: 'Счастливая семья Зиминых',
			location: 'Москва'
		},
		{
			text: 'Долго выбирали, где заказать кухню, и не пожалели. Дизайнер учёл все наши пожелания, а монтаж прошёл аккуратно и быстро.',
			name: 'Ольга Ковалёва',
			location: 'Тверь'
		},
		{
			text: 'В новой квартире нам нужно было сразу обустроить кухню, прихожую и две гардеробные, поэтому больше всего боялись путаницы в сроках и размерах. Нам составили единый план, заранее согласовали все точки с розетками и развели монтаж по этапам. Каждая бригада приезжала в назначенный день, а все фасады и столешницы совпали по оттенку. Мы въехали в уже готовый дом и не потратили ни одного лишнего дня на переделки.',
			name: 'Евгений и Дарья',
			location: 'Казань'
		},
		{
			text: 'Гардеробная получилась вместительной и при этом не перегрузила комнату. Отдельное спасибо за удобные полки и подсветку.',
			name: 'Илья Иванов',
			location: 'Москва'
		},
		{
			text: 'Заказывали шкаф в детскую. Цвет и фурнитуру подобрали идеально, все углы безопасные, двери закрываются бесшумно. Ребёнок в восторге.',
			name: 'Екатерина',
			location: 'Химки'
		},
		{
			text: 'Сделали тумбу под телевизор по моим размерам. Все провода спрятаны, ящики выдвигаются плавно. Именно так я и представлял.',
			name: 'Андрей',
			location: 'Подольск'
		},
		{
			text: 'Обратились с нестандартной задачей: нужно было спрятать в гостиной полноценное спальное место для гостей и не потерять шкафы для хранения. После нескольких вариантов проекта выбрали систему с откидной кроватью, которая днём полностью убирается за фасад. Механизм работает легко, все зазоры ровные, и никто из гостей даже не догадывается, что скрывается за обычной мебельной стенкой.',
			name: 'Ксения и Антон',
			location: 'Химки'
		},
		{
			text: 'Понравилось, что на каждом этапе мне показывали, что будет дальше. Никаких сюрпризов по цене и срокам, а результат даже лучше эскиза.',
			name: 'Вера Михайлова',
			location: 'Ярославль'
		},
		{
			text: 'Наша маленькая кухня теперь кажется намного просторнее. Дизайнер нашёл место для посудомойки и большой рабочей зоны. Очень удобно!',
			name: 'Полина и Максим',
			location: 'Калуга'
		},
		{
			text: 'Спасибо сборщикам: приехали вовремя, после себя всё убрали, мебель собрали без единой царапины. Приятно иметь дело с аккуратными людьми.',
			name: 'Николай Петрович',
			location: 'Долгопрудный'
		},
		{
			text: 'Заказывали мебель для детской сразу на несколько лет вперёд: сейчас сыну нужно место для игр, а скоро понадобятся письменный стол и больше полок. Дизайнер придумал модульную систему, где нижние ящики сейчас служат скамьёй, а позже переедут под столешницу. Все крепления спрятаны, материалы легко моются, а цвет не надоест ребёнку, когда он станет старше.',
			name: 'Олег и Марина',
			location: 'Обнинск'
		},
		{
			text: 'Заказала туалетный столик и комод в одном стиле. Оттенок фасадов точно совпал с образцом, фурнитура качественная. Спасибо за красоту!',
			name: 'Алина',
			location: 'Рязань'
		},
		{
			text: 'Стол для домашнего кабинета встал точно в нишу. Продумали место для проводов, документов и принтера. Работать за ним удобно даже целый день.',
			name: 'Дмитрий Соколов',
			location: 'Москва'
		},
		{
			text: 'Обновили мебель в прихожей. Теперь есть место и для обуви, и для верхней одежды, и для мелочей. Выглядит аккуратно, порядка стало больше.',
			name: 'Людмила',
			location: 'Одинцово'
		},
		{
			text: 'Сначала сомневались, стоит ли делать мебель для лоджии на заказ, но готовые шкафы либо закрывали окно, либо оставляли большие зазоры. На замере учли не только кривизну стен, но и место для сушилки, подоконных ящиков и складного столика. Фасады подобрали в цвет стен, поэтому большой шкаф почти не заметен, а лоджия осталась светлой и удобной.',
			name: 'Татьяна Ларина',
			location: 'Красногорск'
		},
		{
			text: 'У нас был сложный угол в спальне, куда не подходила готовая мебель. По проекту сделали целую систему хранения, и каждый сантиметр теперь работает.',
			name: 'Семья Кузнецовых',
			location: 'Королёв'
		},
		{
			text: 'Заказываю здесь уже второй раз. Сначала была кухня, теперь шкаф в прихожую. Качество осталось на том же уровне, поэтому могу смело советовать.',
			name: 'Ирина Лебедева',
			location: 'Мытищи'
		},
		{
			text: 'Помогли подобрать материалы, которые не боятся детей и домашних животных. Прошло уже несколько месяцев, фасады выглядят как новые.',
			name: 'Анна Романова',
			location: 'Зеленоград'
		},
		{
			text: 'У родителей на кухне было много открытых полок, до которых им уже стало неудобно дотягиваться. Мы попросили сделать гарнитур безопасным и понятным: часто используемые вещи перенесли в нижние выдвижные ящики, духовку подняли выше, а углы и ручки выбрали без острых кромок. Теперь мама и папа пользуются кухней без лишних наклонов и боязни удариться, а мы спокойны за них.',
			name: 'Александр Мельников',
			location: 'Сергиев Посад'
		},
		{
			text: 'Нужен был необычный стеллаж для книг и пластинок. Предложили интересную асимметричную конструкцию. Теперь это главный акцент в гостиной.',
			name: 'Михаил',
			location: 'Самара'
		},
		{
			text: 'Проект кухни для дачи сделали очень уютным. Удачно сочетали дерево и светлые фасады, а всю технику аккуратно встроили. Готовить там одно удовольствие.',
			name: 'Наталья Сергеевна',
			location: 'Истра'
		},
		{
			text: 'Заказали кровать с подъёмным механизмом и большим ящиком для белья. Механизм лёгкий, ничего не скрипит. Спим с удовольствием.',
			name: 'Алексей и Мария',
			location: 'Видное'
		},
		{
			text: 'Мой проект был небольшим, но отнеслись к нему очень внимательно. Тумба в ванную получилась красивой, влаги не боится и отлично вместилась.',
			name: 'Светлана Н.',
			location: 'Москва'
		},
		{
			text: 'Работаем из дома вдвоём, и нам было важно разместить два полноценных рабочих места в одной комнате, не посадив нас спиной друг к другу. После замера нам предложили угловую композицию с общей тумбой для принтера и отдельными секциями для документов. Кабели убрали в каналы внутри столешниц, над каждым столом добавили свою полку, и теперь мы можем одновременно созваниваться с коллегами и не мешать друг другу.',
			name: 'Кирилл и Мария',
			location: 'Москва'
		},
		{
			text: 'Выбрали матовые фасады и столешницу под камень. Всё выглядит дорого и лаконично, а ухаживать за кухней оказалось проще, чем мы думали.',
			name: 'Роман и Елена',
			location: 'Красногорск'
		},
		{
			text: 'Отдельная благодарность менеджеру за терпение. Мы несколько раз меняли детали проекта, но нам всегда спокойно помогали найти лучшее решение.',
			name: 'Вадим Белов',
			location: 'Тула'
		},
		{
			text: 'Шкаф-купе получился точно по размеру стены. Зеркала визуально расширили комнату, а внутри места хватило для всей семьи.',
			name: 'Денис Громов',
			location: 'Балашиха'
		}
	];

	type Review = { text: string; name: string; location: string };
	type IndexedReview = { review: Review; index: number };

	const featured = $derived(
		data?.featured && typeof data.featured === 'object' && !Array.isArray(data.featured)
			? (data.featured as typeof defaultFeatured)
			: defaultFeatured
	);

	const reviews = $derived(
		Array.isArray(data?.reviews) && (data.reviews as unknown[]).length > 0
			? (data.reviews as Review[])
			: defaultReviews
	);

	/*
		Каждую следующую группу из четырёх отзывов сдвигаем на одну колонку.
		Так карточки одинаковой длины, добавленные через равные интервалы,
		не скапливаются в одной вертикали. Исходный index сохраняем для EditableField.
	*/
	const reviewColumns = $derived.by(() => {
		const columns: IndexedReview[][] = [[], [], [], []];

		reviews.forEach((review, index) => {
			const columnIndex = (index + Math.floor(index / 4)) % columns.length;
			columns[columnIndex].push({ review, index });
		});

		return columns;
	});

	/** Инициалы автора для аватара-плашки. */
	function initials(name: string): string {
		return name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part.slice(0, 1).toUpperCase())
			.join('');
	}
</script>

<!--
	Разметка карточки одна для всех четырёх колонок — раньше она была скопирована
	четыре раза, и любая правка требовала синхронного редактирования копий.
	Задержка появления берётся из глобального индекса, порядок и ключи данных те же.
-->
{#snippet reviewCard(review: Review, globalIdx: number)}
	<figure
		use:revealOnScroll={{ threshold: 0.2, rootMargin: '0px 0px -12% 0px' }}
		class="tm-reveal tm-card group relative overflow-hidden rounded-3xl border border-ink-900/10 bg-surface-raised p-6 shadow-[0_26px_70px_-50px] shadow-ink-900/45 transition duration-300 hover:border-cat-7-500/40 hover:shadow-[0_32px_80px_-44px] hover:shadow-ink-900/50 motion-safe:hover:-translate-y-1"
	>
		<div
			class="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-cat-7-500/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			aria-hidden="true"
		></div>

		<blockquote class="relative text-sm/6 text-ink-700">
			<EditableField
				fieldKey="TestimonialsGrid.reviews.{globalIdx}.text"
				label="Текст отзыва"
				value={review.text}
				{isEditable}
				inline
				multiline
				onSave={(v) => updateReview(globalIdx, 'text', v)}
			>
				{#snippet children(val)}
					<p><RichText value={val} /></p>
				{/snippet}
			</EditableField>
		</blockquote>

		<figcaption class="mt-6 flex items-center gap-3 border-t border-ink-900/10 pt-4">
			<span
				class="flex size-9 shrink-0 items-center justify-center rounded-full bg-cat-7-50 text-[11px] font-semibold text-cat-7-600 ring-1 ring-cat-7-500/20"
				aria-hidden="true"
			>
				{initials(review.name)}
			</span>
			<div class="min-w-0">
				<div class="text-sm font-semibold text-ink-900">
					<EditableField
						fieldKey="TestimonialsGrid.reviews.{globalIdx}.name"
						label="Имя автора"
						value={review.name}
						{isEditable}
						inline
						onSave={(v) => updateReview(globalIdx, 'name', v)}
					>
						{#snippet children(val)}<RichText value={val} />{/snippet}
					</EditableField>
				</div>
				<div class="text-[11px] font-semibold tracking-[0.16em] text-ink-500 uppercase">
					<EditableField
						fieldKey="TestimonialsGrid.reviews.{globalIdx}.location"
						label="Город"
						value={review.location}
						{isEditable}
						inline
						onSave={(v) => updateReview(globalIdx, 'location', v)}
					>
						{#snippet children(val)}<RichText value={val} />{/snippet}
					</EditableField>
				</div>
			</div>
		</figcaption>
	</figure>
{/snippet}

<section class="relative isolate overflow-hidden bg-surface pt-12 pb-24 sm:pb-32">
	<div class="relative mx-auto max-w-7xl px-6 lg:px-8">
		<div
			class="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 gap-6 text-sm/6 text-ink-900 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4"
		>
			<!-- Главный отзыв -->
			<figure
				use:revealOnScroll
				class="tm-reveal tm-card relative overflow-hidden rounded-4xl border border-ink-900/10 bg-surface-raised shadow-[0_40px_100px_-60px] shadow-ink-900/50 sm:col-span-2 xl:col-start-2 xl:row-end-1"
			>
				<div
					class="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-cat-7-500/70 to-transparent"
					aria-hidden="true"
				></div>

				<blockquote class="relative p-6 sm:p-12">
					<div
						class="flex size-11 items-center justify-center rounded-2xl bg-cat-7-50 text-cat-7-600 ring-1 ring-cat-7-500/20"
						aria-hidden="true"
					>
						<svg class="size-5" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M9.5 5.5C6.46 5.5 4 7.96 4 11v7.5h7.5V11H7.75c0-1.24 1.01-2.25 2.25-2.25V5.5zm10 0C16.46 5.5 14 7.96 14 11v7.5h7.5V11h-3.75c0-1.24 1.01-2.25 2.25-2.25V5.5z"
							/>
						</svg>
					</div>
					<div
						class="mt-6 text-lg font-medium tracking-[-0.01em] text-pretty text-ink-900 sm:text-xl/8"
					>
						<EditableField
							fieldKey="TestimonialsGrid.featured.text"
							label="Текст отзыва"
							value={featured.text}
							{isEditable}
							inline
							multiline
							onSave={(v) => updateFeatured('text', v)}
						>
							{#snippet children(val)}
								<p><RichText value={val} /></p>
							{/snippet}
						</EditableField>
					</div>
				</blockquote>

				<figcaption
					class="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-ink-900/10 px-6 py-5 sm:flex-nowrap sm:px-12"
				>
					<span
						class="flex size-10 shrink-0 items-center justify-center rounded-full bg-cat-7-50 text-xs font-semibold text-cat-7-600 ring-1 ring-cat-7-500/20"
						aria-hidden="true"
					>
						{initials(featured.name)}
					</span>
					<div class="flex-auto">
						<div class="text-sm font-semibold text-ink-900">
							<EditableField
								fieldKey="TestimonialsGrid.featured.name"
								label="Имя автора"
								value={featured.name}
								{isEditable}
								inline
								onSave={(v) => updateFeatured('name', v)}
							>
								{#snippet children(val)}<RichText value={val} />{/snippet}
							</EditableField>
						</div>
						<div class="text-[11px] font-semibold tracking-[0.16em] text-ink-500 uppercase">
							<EditableField
								fieldKey="TestimonialsGrid.featured.location"
								label="Город"
								value={featured.location}
								{isEditable}
								inline
								onSave={(v) => updateFeatured('location', v)}
							>
								{#snippet children(val)}<RichText value={val} />{/snippet}
							</EditableField>
						</div>
					</div>
				</figcaption>
			</figure>

			<div class="space-y-6 xl:contents xl:space-y-0">
				<!--
					Каждая карточка сама следит за входом во вьюпорт: триггер на высокой
					колонке преждевременно показал бы все отзывы ниже экрана.
				-->
				<div class="space-y-6 xl:row-span-2">
					{#each reviewColumns[0] as item}
						{@render reviewCard(item.review, item.index)}
					{/each}
				</div>

				<div class="space-y-6 xl:row-start-1">
					{#each reviewColumns[1] as item}
						{@render reviewCard(item.review, item.index)}
					{/each}
				</div>

				<div class="space-y-6 xl:row-start-1">
					{#each reviewColumns[2] as item}
						{@render reviewCard(item.review, item.index)}
					{/each}
				</div>

				<div class="space-y-6 xl:row-span-2">
					{#each reviewColumns[3] as item}
						{@render reviewCard(item.review, item.index)}
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
