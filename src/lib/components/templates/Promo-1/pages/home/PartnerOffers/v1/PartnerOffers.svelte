<script lang="ts">
	// Артикул: 1.1.9.1 — см. docs/architecture/component-articles-map.md
	//
	// Номер 9, а не освободившийся 7: `component_number` не переприсваивается,
	// выведенный Direction оставляет дырку. Блок при этом рендерится вторым —
	// порядок задаёт `config/templates.php`, а не номер.
	//
	// Анатомия пришла из `Direction/v2` (1.1.7.2): кадр во всю карточку, скрим,
	// контурная рамка на кадре, градиентная кнопка на паре ролей `accent-surface`
	// / `on-accent`. 1.1.7.2 довели до чистых токенов, а потом решили сменить ему
	// назначение — блок переехал сюда вместе со всей проделанной работой,
	// а `Direction` выведен в legacy (config/component_lifecycle.php).
	//
	// От унаследованного к 17.08.2026 не осталось почти ничего. Блок стал экранным:
	// высота во весь видимый экран за вычетом липкого хрома, заголовок и описание
	// сверху, кадры на всё остальное. Скрим во всю карточку, тень и градиентная
	// кнопка на паре `accent-surface` / `on-accent` сняты — все трое существовали
	// ради кнопки на кадре, а её больше нет. Из наследства живёт контурная рамка.
	//
	// Весь интерфейс кадра теперь в его углах и на одной паре ролей
	// `scrim` / `on-dark`: срок акции слева сверху, переход на страницу акции
	// справа снизу. Ни то, ни другое теме не подчиняется — под ними фотография.
	//
	// Ключи `partner`, `offer`, `terms` и `buttonText` лежат в данных и не
	// рисуются. Это не забывчивость: удаление ключа обнуляет поле у тенантов,
	// которые его правили. `partner` и `offer` при этом работают — они собирают
	// доступное имя перехода, у которого своей надписи в свёрнутом виде нет.
	// `buttonText` осмысленно осел: надпись «Подробнее» принадлежит не офферу,
	// а самому элементу управления, и тенанту её менять нечем и незачем.
	// `validUntil` из спящих выведен: он теперь половина срока. Ключ `logo`
	// когда-то снят, а не оставлен, потому что прожил полчаса внутри одной
	// сессии и ни один тенант ничего под ним не сохранял — правило
	// неприкосновенности защищает чужие данные, а не свои черновики.
	//
	// Две раскладки на одном контракте: до двух офферов — грид; больше двух —
	// лента с автопрокруткой и бесшовным заворотом. Срок и переход у каждого
	// кадра свои в обеих раскладках, потому что живут на самом кадре. Порог
	// «больше двух», а не «больше одного»: пара ложится в `md:grid-cols-2`
	// без остатка, и катать её лентой незачем.
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

	// Тема блока красит только его собственную подложку (`p1-surface`). Всё, что
	// лежит НА кадре, теме не подчиняется: под контентом фотография, а не
	// поверхность секции, и её темнота не зависит от того, светлый блок или тёмный.
	// Поэтому единственное, что осталось на кадре, — контурная рамка на роли
	// `on-dark`. Заголовок, описание и сроки лежат на подложке секции, а не на
	// кадре, — у них роли темы.
	const isLight = $derived(isLightBlock(data, 'dark'));

	type Offer = {
		image: string;
		alt: string;
		partner: string;
		offer: string;
		terms: string;
		validFrom?: string;
		validUntil: string;
		buttonText: string;
		buttonHref: string;
	};

	const DEFAULT_TITLE = 'Предложения партнёров';
	const DEFAULT_DESCRIPTION =
		'Мы работаем напрямую с производителями фурнитуры и материалов, поэтому часть их выгоды достаётся вам. Условия действуют ограниченное время и суммируются со скидкой на проект.';

	const title = $derived(String(data?.title ?? DEFAULT_TITLE));
	const description = $derived(String(data?.description ?? DEFAULT_DESCRIPTION));

	const offers = $derived(
		Array.isArray(data?.offers) && data.offers.length > 0
			? (data.offers as Offer[])
			: [
					{
						image: 'https://storage.yandexcloud.net/novostroy/bg/vector-kitchen.jpg',
						alt: 'Скидка 15% на фурнитуру Blum',
						partner: 'Blum',
						offer: 'Скидка 15% на фурнитуру',
						terms: 'При заказе кухни от 150 000 ₽',
						validFrom: '01.09.2026',
						validUntil: '31.12.2026',
						buttonText: 'Получить предложение',
						buttonHref: '/contact'
					},
					{
						image: 'https://storage.yandexcloud.net/novostroy/bg/prih.jpg',
						alt: 'Столешница в подарок от Egger',
						partner: 'Egger',
						offer: 'Столешница в подарок',
						terms: 'К любому кухонному гарнитуру от 200 000 ₽',
						validFrom: '',
						validUntil: '30.11.2026',
						buttonText: 'Получить предложение',
						buttonHref: '/contact'
					}
				]
	);

	// Срок в трёх видах, как его и просили: «с и по», «с» и «по». Пустая строка
	// значит «границы нет» — тенант, стерший поле, получает открытый срок,
	// а не строку «с по». Формат даты не разбираем и не переводим: тенант правит
	// её текстом, и любая нормализация здесь молча испортила бы то, что он ввёл.
	function period(item: Offer) {
		const from = (item.validFrom ?? '').trim();
		const to = (item.validUntil ?? '').trim();
		if (from && to) return `с ${from} по ${to}`;
		if (from) return `с ${from}`;
		if (to) return `по ${to}`;
		return '';
	}

	const isSlider = $derived(offers.length > 2);

	// Три набора подряд, едем по среднему. Заворот делается телепортом на копию:
	// когда прокрутка уходит из среднего набора, `scrollLeft` сдвигается на ширину
	// набора, а под курсором остаётся пиксель в пиксель та же картинка — шва нет.
	// Двух наборов не хватает: назад от начала прокручивать было бы некуда.
	const SETS = 3;
	const track = $derived(
		isSlider
			? Array.from({ length: SETS }, (_, set) =>
					offers.map((offer, i) => ({ offer, set, i }))
				).flat()
			: []
	);

	let scroller = $state<HTMLElement | null>(null);
	let active = $state(0);
	let held = $state(false); // курсор/фокус/палец на ленте — автопрокрутка ждёт
	// Стартует `true`, а не `false`: IntersectionObserver здесь только экономит
	// работу, пока лента за экраном, и стоить запрошенного поведения это не должно.
	// С `false` автопрокрутка не завелась бы вовсе везде, где первый колбэк IO
	// не пришёл, — а отказ «тихо ничего не делает» ровно того сорта, что не виден
	// ни в одной проверке. Промах в другую сторону стоит лишнего таймера за экраном.
	let visible = $state(true);

	// Действие и сроки следуют за активным кадром. В гриде активного нет —
	// там у каждой карточки своя пара, см. разметку.
	const current = $derived(offers[active] ?? offers[0]);

	let stride = 0; // шаг между началами карточек: ширина карточки + зазор
	let setWidth = 0; // ширина одного набора

	const reduced = () =>
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

	function measure() {
		if (!scroller) return;
		const first = scroller.firstElementChild as HTMLElement | null;
		const second = scroller.children[1] as HTMLElement | null;
		if (!first) return;
		stride = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
		setWidth = stride * offers.length;
	}

	// Возврат прокрутки в средний набор. Без `behavior` — телепорт обязан быть
	// мгновенным, иначе он сам превратится в анимацию и станет виден.
	function normalize() {
		if (!scroller || !setWidth) return;
		const x = scroller.scrollLeft;
		if (x < setWidth * 0.5) scroller.scrollLeft = x + setWidth;
		else if (x >= setWidth * 1.5) scroller.scrollLeft = x - setWidth;
	}

	function slotAt() {
		return scroller && stride ? Math.round(scroller.scrollLeft / stride) : 0;
	}

	function goToSlot(slot: number) {
		if (!scroller || !stride) return;
		scroller.scrollTo({ left: slot * stride, behavior: reduced() ? 'auto' : 'smooth' });
	}

	const step = (dir: number) => goToSlot(slotAt() + dir);

	// К ближайшей копии нужного оффера, а не к его позиции в первом наборе:
	// иначе клик по точке рядом с текущей уводил бы ленту через весь трек.
	const goToOffer = (i: number) => goToSlot(slotAt() - active + i);

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			step(1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			step(-1);
		}
	}

	// Раскладка и позиция. Отдельным эффектом от таймера: пересчитывать размеры
	// нужно на ресайз, а таймер от ресайза перезапускать незачем.
	$effect(() => {
		if (!isSlider || !scroller) return;
		const el = scroller;

		measure();
		el.scrollLeft = setWidth; // старт со среднего набора
		active = slotAt() % offers.length;

		let settle: ReturnType<typeof setTimeout>;
		const onScroll = () => {
			active = ((slotAt() % offers.length) + offers.length) % offers.length;
			// Телепорт только после того, как прокрутка улеглась: посреди плавного
			// хода он бы его оборвал. `scrollend` есть не везде, поэтому по таймеру.
			clearTimeout(settle);
			settle = setTimeout(normalize, 140);
		};

		const ro = new ResizeObserver(() => {
			const slot = slotAt();
			measure();
			el.scrollLeft = slot * stride; // держим ту же карточку под тем же краем
		});
		ro.observe(el);

		const io = new IntersectionObserver((entries) => (visible = entries[0].isIntersecting), {
			threshold: 0.2
		});
		io.observe(el);

		el.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			clearTimeout(settle);
			el.removeEventListener('scroll', onScroll);
			ro.disconnect();
			io.disconnect();
		};
	});

	// Автопрокрутка. Стоит, пока лента не видна, пока на ней курсор или фокус,
	// пока вкладка в фоне — и не заводится вовсе при prefers-reduced-motion.
	$effect(() => {
		if (!isSlider || !scroller || held || !visible || reduced()) return;

		const raw = getComputedStyle(scroller).getPropertyValue('--ds-motion-dwell').trim();
		const dwell = raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000;
		if (!Number.isFinite(dwell) || dwell <= 0) return;

		const id = setInterval(() => {
			if (!document.hidden) step(1);
		}, dwell);
		return () => clearInterval(id);
	});

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'PartnerOffers', updated);
		data = updated;
	}
</script>

{#snippet card(item: Offer, clone: boolean)}
	<!-- Кадр. Рамка карточки — единственное место в блоке, где тема ещё уместна:
	     эта линия отделяет плитку от подложки секции, а не лежит на кадре.

	     Тени нет. `shadow-2xl` — это `0 25px 50px -12px rgb(0 0 0 / 0.25)`, то есть
	     смещение на 25px вниз при размытии 50px: под кадром она читалась размытым
	     тёмным градиентом, особенно на светлой подложке. Приподнимать карточку над
	     страницей здесь нечем и незачем — кадр и так отделён от поверхности рамкой
	     и радиусом, а «парящая» тень системы рассчитана на панель с текстом, а не
	     на фотографию во всю плитку. -->
	<div class="group p1-border relative flex h-full min-h-60 overflow-hidden rounded-3xl border">
		<!-- Фоновая картинка с зумом. Длительность — роль «медленной перестройки»
		     системы (Базовая 500ms, Графит 300ms). Кривая приходит из
		     `--default-transition-timing-function`, поэтому своей `ease-*` тут нет. -->
		<ImageFallback
			src={item.image}
			alt={clone ? '' : item.alt}
			class="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui-slow)] group-hover:scale-105"
		/>
		<!-- Скрима во всю карточку нет, и это решение, а не пропуск: градиент поверх
		     фотографии, под которым ничего не читают, — просто испорченная фотография.
		     Роль `--ds-scrim` вернулась ровно там, где она и нужна, — плашкой под
		     текстом срока, а не покрывалом на весь кадр. -->

		<!-- Декоративная контурная рамка сзади. `border-on-dark/15`, а не
		     `p1-border`: она лежит на кадре, и в светлой теме тёмная линия
		     системы на фотографии не видна вовсе. -->
		<div
			class="pointer-events-none absolute inset-4 rounded-2xl border border-on-dark/15 transition-colors duration-[var(--ds-motion-duration-ui-slow)] group-hover:border-on-dark/40"
		></div>

		<!-- Срок акции. Лежит НА кадре, поэтому теме не подчиняется: пара
		     `scrim` / `on-dark`, а не роли темы. Плотность 60% выбрана не на глаз —
		     это порог, ниже которого пара перестаёт держать 4,5:1 на худшей из
		     возможных фотографий (белой): 60% чёрного по белому дают #666, и белый
		     текст на нём — 5,73:1. Любая более тёмная фотография только добавляет
		     запаса, поэтому плашка читается на любом кадре, какой загрузит тенант.

		     Отступ 7/8, а не 4: на 4 плашка легла бы ровно на декоративную рамку
		     (`inset-4`) и перечеркнула бы её. Пустой срок не рисует пустую плашку. -->
		{#if period(item)}
			<div
				class="absolute top-7 left-7 z-10 rounded-xl bg-scrim/60 px-3 py-2 text-xs text-on-dark sm:top-8 sm:left-8"
			>
				{period(item)}
			</div>
		{/if}

		<!-- Переход на страницу акции. Та же пара `scrim` / `on-dark`, что и у
		     срока по диагонали напротив: оба лежат на кадре и теме не подчиняются.

		     Свёрнутая кнопка — только стрелка, поэтому доступное имя обязано
		     прийти атрибутом: «Подробнее» появляется на наведении, а мышью на
		     тач-экране никто не наводит, и скринридер надписи не видит вовсе.
		     Имя собрано из партнёра и предложения — на одном экране таких кнопок
		     до четырёх, и без имени они прочитались бы как четыре одинаковых.

		     Раскрытие сделано `max-width: 0 → 7rem`, и это вторая попытка. Первой
		     был модный приём `grid-template-columns: 0fr → 1fr`, который меряет
		     текст сам и не требует числа. Здесь он молча не работает: `overflow-hidden`
		     обнуляет минимальный размер дорожки, а грид сидит внутри `inline-flex`
		     с шириной по содержимому, и колонка резолвится в 0 даже при `1fr` —
		     замерено, прирост ширины оказался 0px. `max-width` в этой обвязке
		     предсказуем; 7rem заведомо больше надписи в любой из гарнитур систем,
		     а лишний запас виден только тем, что рост останавливается чуть раньше
		     конца перехода. Ширину элемента задаёт содержимое, не этот потолок.

		     Раскрытие висит и на `focus-visible`: с клавиатуры наведения не бывает,
		     а кнопка обязана называть себя и там. Пустая ссылка кнопку не рисует. -->
		{#if item.buttonHref}
			<a
				href={item.buttonHref}
				tabindex={clone ? -1 : undefined}
				aria-label={`Подробнее — ${item.partner}, ${item.offer}`}
				class="group/more absolute right-7 bottom-7 z-10 inline-flex h-11 items-center rounded-full bg-scrim/60 px-3.5 text-on-dark transition-colors hover:bg-scrim/80 focus-visible:bg-scrim/80 sm:right-8 sm:bottom-8"
			>
				<span
					class="max-w-0 overflow-hidden transition-[max-width] duration-[var(--ds-motion-duration-ui)] group-hover/more:max-w-28 group-focus-visible/more:max-w-28"
				>
					<span class="block pr-2 text-xs whitespace-nowrap">Подробнее</span>
				</span>
				<!-- Штрих иконки — роль системы (Базовая 2, Графит 1,75). Атрибут
				     `var()` не парсит, поэтому ключ берётся через `style`. -->
				<svg
					class="h-4 w-4 shrink-0"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					style="stroke-width: var(--ds-icon-stroke-bold)"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
				</svg>
			</a>
		{/if}
	</div>
{/snippet}

<!-- Спецпредложения партнёров (PartnerOffers) — экранный блок: шапка, кадры, действие -->
<section
	class="p1-surface flex min-h-[calc(100svh-var(--chrome-overlay))] flex-col px-4 py-section-2xs font-sans select-none sm:py-section-xs"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<!-- Шапка. `shrink-0`, иначе на низком экране флекс сжал бы её раньше кадров. -->
	<div class="mx-auto w-full max-w-3xl shrink-0 text-center">
		<EditableField
			fieldKey="PartnerOffers.title"
			label="Заголовок"
			value={title}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="p1-title text-3xl sm:text-5xl">{displayValue}</h2>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="PartnerOffers.description"
			label="Описание"
			value={description}
			{isEditable}
			multiline
			onSave={(v) => saveField('description', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<p class="p1-body mt-5 text-base leading-7">{displayValue}</p>
			{/snippet}
		</EditableField>
	</div>

	{#if isSlider}
		<!-- `p1-settle` висит СНАРУЖИ горизонтального скроллера, и это не
		     стилистический выбор. `overflow-x: auto` заводит контейнер прокрутки,
		     а `view()` считает видимость относительно ближайшего такого контейнера:
		     повесь дыхание на карточку внутри ленты — и таймлайн станет мерить её
		     положение в ленте, а не на странице, прогресс замрёт, анимация молча
		     не пойдёт. Ровно та же ловушка, что была с `overflow-hidden` на обёртке
		     блока (см. DESIGN.md, раздел Motion).

		     `min-h-0` обязателен: без него флекс-элемент не сжимается ниже своего
		     содержимого, и лента распирала бы секцию выше экрана. -->
		<div
			class="p1-settle mt-10 flex min-h-0 flex-1 flex-col"
			role="group"
			aria-roledescription="карусель"
			aria-label={title}
			onpointerenter={() => (held = true)}
			onpointerleave={() => (held = false)}
			onfocusin={() => (held = true)}
			onfocusout={() => (held = false)}
		>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				bind:this={scroller}
				tabindex="0"
				onkeydown={onKeydown}
				class="p1-offer-rail flex min-h-0 flex-1 snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain"
			>
				{#each track as slot (`${slot.set}-${slot.i}`)}
					<div
						class="w-[85%] shrink-0 snap-start sm:w-[55%] lg:w-[42%]"
						aria-hidden={slot.set === 1 ? undefined : 'true'}
					>
						{@render card(slot.offer, slot.set !== 1)}
					</div>
				{/each}
			</div>

			<!-- Подвал: только управление лентой, по центру. Срок ушёл отсюда на кадр,
			     а следом и действие — 17.08.2026 кнопка «Получить предложение» снята
			     совсем, её место занял переход на страницу акции в углу кадра.
			     Роли `p1-card` / `p1-border` / `p1-title` темозависимые, поэтому
			     в светлой секции стрелки не остаются тёмными пятнами. -->
			<div class="mt-6 flex shrink-0 items-center justify-center">
				<div class="flex items-center gap-4">
					<button
						type="button"
						onclick={() => step(-1)}
						aria-label="Предыдущее предложение"
						class="p1-card p1-border p1-title flex h-11 w-11 items-center justify-center rounded-full border transition-transform hover:scale-105 active:scale-95"
					>
						<svg
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							style="stroke-width: var(--ds-icon-stroke-bold)"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
						</svg>
					</button>

					<div class="flex items-center gap-2">
						{#each offers as item, i (i)}
							<button
								type="button"
								onclick={() => goToOffer(i)}
								aria-label={`Предложение ${i + 1} — ${item.partner}`}
								aria-current={active === i ? 'true' : undefined}
								class="p1-title flex h-4 items-center"
							>
								<!-- Состояние несёт ширина (6 против 1,5 — вчетверо), а не одна
								     яркость: на 35% неактивная точка давала 3,13:1 против порога
								     3:1 для управляющих элементов, то есть проходила без запаса.
								     На 50% — 5,32:1, а различие активной держится на длине. -->
								<span
									class="h-1.5 rounded-full bg-current transition-all duration-[var(--ds-motion-duration-ui)] {active ===
									i
										? 'w-6 opacity-100'
										: 'w-1.5 opacity-50'}"
								></span>
							</button>
						{/each}
					</div>

					<button
						type="button"
						onclick={() => step(1)}
						aria-label="Следующее предложение"
						class="p1-card p1-border p1-title flex h-11 w-11 items-center justify-center rounded-full border transition-transform hover:scale-105 active:scale-95"
					>
						<svg
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							style="stroke-width: var(--ds-icon-stroke-bold)"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Грид: и срок, и переход у каждой карточки свои, но оба живут на самом
		     кадре — см. сниппет `card`. Подвала под карточками здесь больше нет. -->
		<div class="mt-10 grid min-h-0 flex-1 grid-cols-1 gap-8 md:grid-cols-2">
			{#each offers as item, i (i)}
				<div class="p1-settle flex min-h-0 flex-col">
					{@render card(item, false)}
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	/* Дыхание поля вокруг карточек.

	   Воздух секции держит системная ступень ритма — до 16.08.2026 здесь стоял
	   `p-4`, то есть 16px мимо шкалы вовсе (нижняя ступень — 48px). Карточка
	   входит в этот воздух снизу: на старте поле над ней шире собственной
	   ступени на `--ds-motion-lift`, под ней — на столько же уже, и по ходу
	   входа блока во вьюпорт оба выравниваются к ступени.

	   Двигается только карточка, геометрия секции постоянна: `padding` пришлось
	   бы пересчитывать раскладкой на каждом кадре прокрутки, и вся страница
	   ниже ехала бы вслед за блоком. Здесь же меняется один `transform`.

	   Пацинг задаёт прокрутка, поэтому длительности нет — есть доля входа
	   (`--ds-motion-range-enter`). Кривая системная: прогресс скролла проходит
	   через неё, и «Графит» своей кривой, своей долей и своим `--ds-motion-lift`
	   собирает блок резче, не трогая этот файл.

	   Оба гейта — на включение, а не на выключение: без поддержки
	   `animation-timeline` и при `prefers-reduced-motion: reduce` карточка
	   просто стоит на месте, а поле равно ступени. Умолчание — конечный вид. */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.p1-settle {
				animation-name: p1-offer-settle;
				animation-duration: auto;
				animation-fill-mode: both;
				animation-timing-function: var(--ds-motion-ease);
				animation-timeline: view();
				animation-range: entry 0% entry var(--ds-motion-range-enter);
			}
		}
	}

	@keyframes p1-offer-settle {
		from {
			transform: translateY(var(--ds-motion-lift));
		}
		to {
			transform: translateY(0);
		}
	}

	/* Имя с префиксом блока, не `p1-rail`: `p1-rail` — существующая роль темы,
	   красящая фон (`theme.css`), и повесить её на ленту значило бы залить
	   скроллер чужой подложкой. */
	.p1-offer-rail {
		scrollbar-width: none;
	}
	.p1-offer-rail::-webkit-scrollbar {
		display: none;
	}
</style>
