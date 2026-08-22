<script lang="ts">
	// Артикул: 1.1.8.1 — см. docs/architecture/component-articles-map.md
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

	// Нейтральная палитра — из классов p1-*; акценты от темы не зависят.
	const isLight = $derived(isLightBlock(data, 'light'));

	const brands = $derived(
		Array.isArray(data?.brands) && data.brands.length > 0
			? (data.brands as { name: string; logo: string; country: string; description: string }[])
			: [
					{
						name: 'BLUM',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/blum-Logo.png',
						country: 'Австрия',
						description: 'Компания BLUM занимается производством премиальной мебельной фурнитуры'
					},
					{
						name: 'Hettich',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/hettich-Logo.png',
						country: 'Германия',
						description:
							'Бренд, специализирующийся на производстве мебельной фурнитуры высокого класса'
					},
					{
						name: 'FGV',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/FGV-Logo.png',
						country: 'Италия',
						description:
							'Компания, специализирующаяся на производстве систем выдвижения и мебельных петель'
					},
					{
						name: 'Egger',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/egger-Logo.png',
						country: 'Австрия',
						description:
							'Производство плитных материалов различной толщины для каркасов и мебельных фасадов'
					},
					{
						name: 'Renolit',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/Renolit_logo.svg.png',
						country: 'Германия',
						description:
							'Высококачественные полимерные пленки и термопластик для фасадов различного цвета'
					},
					{
						name: 'GTV',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/GTV-Logo.png',
						country: 'Польша',
						description:
							'Доступная и качественная мебельная фурнитура и освещение с доставкой по всему миру'
					}
				]
	);

	const partners = $derived(
		Array.isArray(data?.partners) && data.partners.length > 0
			? (data.partners as { name: string; logo: string; url: string }[])
			: [
					{ name: 'ЗОВ', logo: 'https://zov.com.by/images/logo3.png', url: 'https://zov.top/' },
					{
						name: 'Стильные кухни',
						logo: 'https://avatars.mds.yandex.net/i?id=ada48033e9cfa95f38d69fc9ae7b5bcc25b72f13-5037427-images-thumbs&n=13',
						url: 'https://www.stilkuhni.ru/'
					},
					{
						name: 'Мария',
						logo: 'https://avatars.mds.yandex.net/i?id=b761d395235060d89bd5d574233ee6bca202edcb-2037526-images-thumbs&n=13',
						url: 'https://www.marya.ru/'
					},
					{
						name: 'Мистер Дорс',
						logo: 'https://avatars.mds.yandex.net/i?id=cf4673eacc853d6f062852c16c8f10af8dd28ace-7909006-images-thumbs&n=13',
						url: 'https://www.mrdoors.ru/'
					},
					{
						name: 'Кухонный двор',
						logo: 'https://avatars.mds.yandex.net/i?id=a74ec62d72576744e414d4b9ac3b0455aa296a51-4477047-images-thumbs&n=13',
						url: 'https://www.kuxni.net/'
					},
					{
						name: 'Аристо',
						logo: 'https://www.aristo.ru/include/logo_header.png',
						url: 'https://www.aristo.ru'
					}
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Brands', updated);
		data = updated;
	}
</script>

<!--
	Бренды материалов (Brands), версия 1 — «логотипная стена».

	Несущая идея: чужой знак здесь не иконка при тексте, а само содержание.
	Поэтому карточки и тени убраны совсем — ячейки разделены волосяной сеткой,
	а все двенадцать логотипов поставлены в слот одной оптической меры
	(`p1-logo-slot`) и приведены к нейтрали ролью `p1-logo`. До 19.08.2026 знаки
	стояли без слота: замер дал ширины от 32 до 140px при одной высоте, и колонка
	с названием начиналась в каждой карточке на своей широте.

	Стена читается целиком, а не по частям: на трёх колонках блок садится в
	высоту, остающуюся под липким хедером (`--chrome-overlay`), и раздаёт её
	рядам. Правило и пороги — в `<style>` внизу файла.
-->
<section
	class="brands-screen p1-surface py-section-xs sm:py-section"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="mx-auto flex h-full max-w-7xl flex-col px-6 lg:px-8">
		<div class="mx-auto max-w-2xl shrink-0 text-center">
			<!--
				Метка берёт роль `p1-label`, а не пилюлю `bg-link-100 / text-link-700`,
				как было до 19.08.2026. Шкала `link` системная, но абсолютная: замер
				на инвертированном блоке давал ту же светло-синюю плашку на почти
				чёрной поверхности — светлый островок, не зависящий от темы блока.
			-->
			<span class="p1-label p1-muted uppercase">
				<EditableField
					fieldKey="Brands.badge"
					label="Метка"
					value={String(data?.badge ?? 'Бренды')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</span>
			<EditableField
				fieldKey="Brands.title"
				label="Заголовок"
				value={String(data?.title ?? 'Бренды, говорящие о качестве')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="p1-title mt-3 text-3xl sm:text-4xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
		</div>

		<!-- Стена: ячейки стоят на поверхности секции, зазор в пиксель играет линией.

		     Класс `p1-line` снят 19.08.2026, когда роль разделителя переехала с
		     заливки на границу. Здесь линией работает НЕ линия, а фон контейнера,
		     проступающий в зазоре `gap-px`, — единственный приём, одинаково
		     годный на одну, две и три колонки. Роль границей этого не выразит,
		     поэтому значение берётся переменной напрямую (`.brand-wall`).
		     Заодно снята стопка `p1-line p1-border` на одном элементе: рамка
		     стены — рамка карточки (0,1), а решётка внутри — линия (0,07), и
		     раньше эти два тона спорили за один `border-color`. -->
		<div
			class="brand-wall p1-border mt-12 grid min-h-0 flex-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3"
		>
			{#each brands as brand}
				<div
					class="brand-cell group p1-surface flex min-h-0 flex-col items-center justify-center px-6 py-10 text-center [--p1-logo-slot:56px]"
				>
					<div class="p1-logo-slot p1-body justify-center self-center">
						<ImageFallback class="p1-logo" src={brand.logo} alt={brand.name} />
					</div>
					<h3 class="brand-name p1-title p1-title-sub mt-7">{brand.name}</h3>
					<span class="p1-label p1-muted mt-1 uppercase">{brand.country}</span>
					<p class="brand-note p1-body mt-3 max-w-[34ch] text-sm">{brand.description}</p>
				</div>
			{/each}
		</div>

		<!-- Партнёры-производители: тот же слот и та же роль, ступень мельче -->
		<div class="brands-partners mt-16 shrink-0">
			<p class="p1-label p1-muted text-center uppercase">
				<EditableField
					fieldKey="Brands.partnersLabel"
					label="Подпись партнёров"
					value={String(data?.partnersLabel ?? 'Для нас делают мебель')}
					{isEditable}
					onSave={(v) => saveField('partnersLabel', v)}
					inline
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</p>
			<div class="brands-partners-grid mt-8 grid grid-cols-3 gap-x-8 gap-y-10 sm:grid-cols-6">
				{#each partners as partner}
					<a
						href={partner.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group p1-logo-slot p1-body justify-center [--p1-logo-slot:32px]"
						aria-label={partner.name}
					>
						<ImageFallback class="p1-logo" src={partner.logo} alt={partner.name} />
					</a>
				{/each}
			</div>

			{#if data?.partnersNote}
				<p class="p1-muted mt-10 text-center text-sm">
					{String(data.partnersNote)}
				</p>
			{/if}
		</div>
	</div>
</section>

<style>
	/* Решётка стены брендов: зазор `gap-px` показывает фон контейнера, и это
	   единственная в шаблоне линия, которую рисует заливка, а не граница.
	   Значение — роль разделителя, только взятое переменной: класс `p1-line`
	   с 19.08.2026 красит `border-color`. */
	.brand-wall {
		background-color: var(--p1-line);
	}

	/* Посадка в экран (с 19.08.2026).

	   Блок мерили в `/_ds`, где карточка монтирует его голым, и высота 1139px
	   на фоне окна выглядела обычной секцией. На живой странице сверху стоит
	   `sticky` хедер: при окне 1440×900 под ним остаётся 824px, и стена
	   уходила за нижний край на 315px — двенадцать знаков переставали
	   читаться одной композицией, ради которой версия и сделана.

	   Доступная высота берётся ролью `--chrome-overlay`, а не числом: тот же
	   ключ обслуживает `scroll-padding-top`, и выведен он из `--header-h`
	   (76px по ResizeObserver на промо-1-дев против SSR-дефолта 72px). Баннер
	   не вычитается — он стоит НАД хедером и уезжает при прокрутке, а этот
	   блок на главной не первый. Карточка `/_ds` вычитает оба и печатает
	   худший случай верхнего края страницы; расхождение в 36–46px ожидаемо.

	   Режим включается только там, где он осмыслен: три колонки (≥64rem) и
	   окно не ниже 44rem. Уже или ниже блок остаётся в обычном потоке — шесть
	   карточек с описаниями в одну колонку в экран не сажаются никаким
	   уплотнением, и врать пустой высотой хуже, чем прокрутиться.

	   Нижний порог — замер, а не круглое число: при 1024×640 под хедером
	   остаётся 564px, ряд получает 121px, а самый короткий осмысленный набор
	   ячейки (знак, название, страна, строка описания) занимает 141px —
	   переполнение на 20px. На 44rem набор сходится. */
	@media (min-width: 64rem) and (min-height: 44rem) {
		.brands-screen {
			height: calc(100svh - var(--chrome-overlay));
			/* Ступень ритма ниже обычной: внешний воздух секции складывается
			   с внутренним, который раздаёт свободную высоту стены. */
			padding-block: var(--spacing-section-2xs);
		}

		/* Стена забирает всё, что осталось от заголовка и ленты партнёров, и
		   делит поровну на два ряда. `minmax(0, 1fr)` обязателен: у `1fr`
		   минимум равен содержимому, и ряд не сжимался бы, а переполнял
		   секцию — высота уезжала бы ровно так же, как до правки. */
		.brands-screen .brand-wall {
			margin-top: 1.5rem;
			grid-template-rows: repeat(2, minmax(0, 1fr));
		}

		/* Ячейка отдаёт высоту первой: её воздух — воздух, а не содержание.
		   Слот принимает размер от ячейки (переменная наследуется вниз), как
		   и в разметке, — только ступенью мельче и с ростом по высоте окна:
		   на 1920×1080 ряд получает 341px против 193px набора, и без роста
		   знака полтораста пикселей уходили бы в пустоту между строк. Верх
		   `clamp` — 64px, чуть выше исходных 56px: слот задаёт высоту знака,
		   и выше этого мелкие логотипы начинают растрироваться. */
		.brands-screen .brand-cell {
			--p1-logo-slot: clamp(40px, 4.5vh, 64px);
			padding-block: 1.25rem;
		}

		/* Набор ячейки не сжимается: `min-h-0` на ячейке нужен ей самой, чтобы
		   уступать высоту ряду, но если сжимать ещё и содержимое, описание
		   режется посреди строки — кламп при этом продолжает считать свои три
		   строки и об обрезке не знает. Высота набора детерминирована, а
		   уступают ей заранее рассчитанные воздухи ниже. */
		.brands-screen .brand-cell > * {
			flex: none;
		}

		.brands-screen .brand-name {
			margin-top: 1.25rem;
		}

		/* Описание — единственное место, где блок жертвует содержанием, и
		   делает это по строкам, а не по пикселям: три строки при 3 колонках
		   покрывают все шесть описаний демо-контента и обрезают только
		   длиннее написанные. */
		.brands-screen .brand-note {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 3;
			margin-top: 0.5rem;
			overflow: hidden;
		}

		.brands-screen .brands-partners {
			margin-top: 2rem;
		}

		.brands-screen .brands-partners-grid {
			margin-top: 1rem;
		}
	}

	/* Партнёры-производители — цветные логотипы: в отличие от стены брендов
	   выше, гашение цвета роли `p1-logo` здесь не нужно, поэтому фильтр и
	   приглушение сняты локально, не трогая саму роль (её ещё несёт стена). */
	.brands-partners-grid :global(.p1-logo) {
		filter: none;
		opacity: 1;
	}

	/* Низкое окно при трёх колонках (ноутбучные 768px и мельче): доступной
	   высоты остаётся ~690px, и набор предыдущей ступени в неё не садится —
	   замер давал переполнение ячейки на ~22px. Уступают те же величины,
	   ещё на ступень, и описание сокращается до двух строк. */
	@media (min-width: 64rem) and (min-height: 44rem) and (max-height: 48rem) {
		.brands-screen .brand-cell {
			--p1-logo-slot: 32px;
			padding-block: 0.75rem;
		}

		.brands-screen .brand-name {
			margin-top: 0.75rem;
		}

		.brands-screen .brand-note {
			margin-top: 0.25rem;
			-webkit-line-clamp: 2;
		}
	}
</style>
