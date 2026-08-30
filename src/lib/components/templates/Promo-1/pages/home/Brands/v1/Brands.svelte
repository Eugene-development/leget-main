<script lang="ts">
	// Артикул: 1.1.8.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { getContext } from 'svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import {
		createEditableVisibility,
		EDITABLE_VISIBILITY_CONTEXT,
		type EditableVisibility
	} from '$lib/utils/editable-visibility.svelte';
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

	// Используем общий контроллер редактора, чтобы сохранения hiddenFields
	// сериализовались вместе с переключателями текстов. В отдельном превью — свой.
	const visibility =
		getContext<EditableVisibility | undefined>(EDITABLE_VISIBILITY_CONTEXT) ??
		createEditableVisibility({
			getComponentType: () => 'Brands',
			getData: () => data,
			setData: (next) => (data = next),
			getEditContext: () => editContext
		});

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
			? (data.partners as { name: string; logo: string; url?: string }[])
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

	// Ключи привязаны к исходному индексу, а не к позиции после фильтрации.
	const renderedPartners = $derived(
		partners
			.map((partner, index) => ({ partner, index }))
			.filter(({ index }) => isEditable || visibility.isVisible(`partner:${index}`))
	);
	const renderedBrands = $derived(
		brands
			.map((brand, index) => ({ brand, index }))
			.filter(({ index }) => isEditable || visibility.isVisible(`brand:${index}`))
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Brands', updated);
		data = updated;
	}
</script>

{#snippet logoToggle(key: string, name: string, position: string)}
	{#if isEditable && editContext}
		<button
			type="button"
			role="switch"
			aria-checked={visibility.isVisible(key)}
			aria-busy={visibility.isPending(key)}
			aria-label={`${visibility.isVisible(key) ? 'Скрыть' : 'Показать'} логотип «${name}»`}
			title={`${visibility.isVisible(key) ? 'Скрыть' : 'Показать'} логотип «${name}»`}
			disabled={visibility.isPending(key)}
			onclick={(event) => visibility.toggle(key, event)}
			class="absolute z-10 flex size-11 cursor-pointer items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 {position}"
		>
			<span
				aria-hidden="true"
				class="inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-surface-raised/80 shadow-sm transition-colors duration-[var(--ds-motion-duration-ui)] ease-ui {visibility.isVisible(
					key
				)
					? 'bg-link-500'
					: 'bg-ink-400'}"
			>
				<span
					class="inline-block size-4 rounded-full bg-surface-raised shadow-sm transition-transform duration-[var(--ds-motion-duration-ui)] ease-ui {visibility.isVisible(
						key
					)
						? 'translate-x-4'
						: 'translate-x-0'}"
				></span>
			</span>
		</button>
	{/if}
{/snippet}

<!--
	Бренды материалов (Brands), версия 1 — «логотипная стена».

	Несущая идея: чужой знак здесь не иконка при тексте, а само содержание.
	Поэтому карточки и тени убраны совсем — ячейки разделены волосяной сеткой,
	а все двенадцать логотипов поставлены в слот одной оптической меры
	(`p1-logo-slot`). До 19.08.2026 знаки стояли без слота: замер дал ширины от
	32 до 140px при одной высоте, и колонка с названием начиналась в каждой
	карточке на своей широте.

	25.08.2026 два списка поменялись местами: стену занимают партнёры-
	производители (мебельные фабрики, для которых работает компания), а бренды
	материалов и фурнитуры ушли в мелкую ленту под ней. Крупный план достался
	тому, кто заказывает, — знаки поставщиков остались справкой. Тогда же из ячейки
	убраны название, страна и описание — в стене остался один знак. Имя партнёра
	живёт в `alt` картинки: оно нужно поиску и скринридеру, но не глазу, а шесть
	подписей под шестью логотипами читались вторым, конкурирующим слоем.

	Стена читается целиком, а не по частям: на трёх колонках блок садится в
	высоту, остающуюся под липким хедером (`--chrome-overlay`), и раздаёт её
	рядам. Правило и пороги — в `<style>` внизу файла.
-->
{#if renderedPartners.length > 0 || renderedBrands.length > 0 || isEditable}
	<section
		class="brands-screen p1-surface py-section-xs sm:py-section"
		data-p1-theme={isLight ? 'light' : 'dark'}
		data-has-partners={renderedPartners.length > 0}
	>
		<div class="mx-auto flex h-full max-w-7xl flex-col px-6 lg:px-8">
			<div class="mx-auto max-w-2xl shrink-0 py-4 text-center sm:py-6">
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
						value={String(data?.badge ?? 'Партнёры')}
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
					value={String(data?.title ?? 'Фабрики изготовители мебели')}
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
			{#if renderedPartners.length > 0}
				<div
					class="brand-wall p1-border mt-12 grid min-h-0 flex-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3"
					style:--brand-wall-rows={Math.ceil(renderedPartners.length / 3)}
				>
					{#each renderedPartners as { partner, index } (index)}
						<svelte:element
							this={partner.url && !isEditable ? 'a' : 'div'}
							{...partner.url && !isEditable
								? { href: partner.url, target: '_blank', rel: 'noopener noreferrer' }
								: {}}
							class="brand-cell group p1-surface relative flex min-h-0 flex-col items-center justify-center px-6 py-10 text-center [--p1-logo-slot:108px]"
							data-logo-hidden={!visibility.isVisible(`partner:${index}`)}
						>
							<div class="p1-logo-slot p1-body justify-center self-center">
								<ImageFallback class="p1-logo" src={partner.logo} alt={partner.name} />
							</div>
							{@render logoToggle(`partner:${index}`, partner.name, 'top-1 right-1')}
						</svelte:element>
					{/each}
				</div>
			{/if}

			<!-- Бренды материалов и фурнитуры: тот же слот и та же роль, ступень мельче -->
			{#if renderedBrands.length > 0}
				<div class="brands-strip mt-16 shrink-0 py-4">
					<div class="p1-label p1-muted text-center uppercase">
						<EditableField
							fieldKey="Brands.partnersLabel"
							label="Подпись брендов"
							value={String(data?.partnersLabel ?? 'Поставщики техники')}
							{isEditable}
							onSave={(v) => saveField('partnersLabel', v)}
							inline
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</div>
					<div class="brands-strip-grid mt-8 grid grid-cols-3 gap-x-8 gap-y-10 sm:grid-cols-6">
						{#each renderedBrands as { brand, index } (index)}
							<div
								class="group p1-logo-slot p1-body relative justify-center [--p1-logo-slot:48px]"
								title={brand.name}
								data-logo-hidden={!visibility.isVisible(`brand:${index}`)}
							>
								<ImageFallback class="p1-logo max-h-8" src={brand.logo} alt={brand.name} />
								{@render logoToggle(`brand:${index}`, brand.name, '-top-6 right-0')}
							</div>
						{/each}
					</div>

					{#if data?.partnersNote}
						<p class="p1-muted mt-10 text-center text-sm">
							{String(data.partnersNote)}
						</p>
					{/if}
				</div>
			{/if}
		</div>
	</section>
{/if}

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
			/* Ступень ритма ниже обычной: внешний воздух секции складывается
			   с внутренним, который раздаёт свободную высоту стены. */
			padding-block: var(--spacing-section-2xs);
		}

		.brands-screen[data-has-partners='true'] {
			height: calc(100svh - var(--chrome-overlay));
		}

		/* Стена забирает всё, что осталось от заголовка и ленты партнёров, и
		   делит поровну между видимыми рядами. `minmax(0, 1fr)` обязателен: у `1fr`
		   минимум равен содержимому, и ряд не сжимался бы, а переполнял
		   секцию — высота уезжала бы ровно так же, как до правки. */
		.brands-screen .brand-wall {
			margin-top: 1.5rem;
			grid-template-rows: repeat(var(--brand-wall-rows), minmax(0, 1fr));
		}

		/* Слот растёт с высотой окна. Все три величины увеличены на 50%,
		   сохраняя прежнюю адаптивную пропорцию верхних логотипов. */
		.brands-screen .brand-cell {
			--p1-logo-slot: clamp(78px, 8.25vh, 114px);
			padding-block: 1.25rem;
		}

		/* Слот не сжимается: `min-h-0` на ячейке нужен ей самой, чтобы уступать
		   высоту ряду, но уступать должен воздух, а не знак — иначе логотип
		   плющится, продолжая считать свою высоту по `--p1-logo-slot`. */
		.brands-screen .brand-cell > * {
			flex: none;
		}

		.brands-screen .brands-strip {
			margin-top: 2rem;
		}

		.brands-screen .brands-strip-grid {
			margin-top: 1rem;
		}
	}

	/* Оба ряда сохраняют фирменные цвета и полную непрозрачность постоянно.
	   Общая роль `p1-logo` в других компонентах остаётся без изменений. */
	.brand-wall :global(.p1-logo),
	.brands-strip :global(.p1-logo) {
		filter: none;
		opacity: 1;
	}

	/* Скрытые знаки доступны владельцу для повторного включения.
	   Сам переключатель не приглушаем; активные логотипы всегда цветные. */
	[data-logo-hidden='true'] :global(.p1-logo) {
		opacity: 0.45;
	}

	/* Низкое окно при трёх колонках (ноутбучные 768px и мельче): доступной
	   высоты остаётся ~690px, и ступень выше в неё не садится. Уступает
	   то же самое — знак и воздух вокруг него, ещё на ступень. */
	@media (min-width: 64rem) and (min-height: 44rem) and (max-height: 48rem) {
		.brands-screen .brand-cell {
			--p1-logo-slot: 66px;
			padding-block: 0.75rem;
		}
	}
</style>
