<script lang="ts">
	// Артикул: 1.1.6.1 — см. docs/architecture/component-articles-map.md
	//
	// Версия остаётся тем, чем была: мозаика из четырёх кадров с подписью на
	// кадре, слева заголовок с абзацем и одна кнопка. Разбор 31.08.2026 не
	// менял композицию — он вернул системе то, что версия держала у себя.
	// Пять мест, каждое из них видно замером, а не на глаз:
	//
	//   1. Тень карточки. На плитках стояли `shadow-lg` / `hover:shadow-xl` —
	//      утилиты поверх роли `p1-card`, которая объявляет `--p1-shadow`.
	//      Утилита из `utilities` бьёт `components`, поэтому замер в браузере
	//      давал `0 10px 15px -3px` (дефолт фреймворка) вместо системной
	//      «парящей» `0 30px 80px -50px`. Блок ходил не с той пластикой глубины,
	//      что весь остальной шаблон, и при смене системы тень не менялась.
	//   2. Скрим. Затемнение под подписью набиралось руками
	//      (`from-scrim/60 … opacity-60`), то есть 36% у основания кадра вместо
	//      80%, которые роль `p1-scrim` держит как порог читаемости. На светлой
	//      фотографии («Цена», «Сроки») белая подпись на этом почти не читалась.
	//      Роль заведена ровно для этого случая: текст на кадре, а не на
	//      поверхности секции.
	//   3. Линейка под абзацем снята. Набрана она была `from-link-300 to-cat-5-300`
	//      — двухцветным градиентом из числовых шкал: теме блока не подчинялась,
	//      ни на что в блоке не ссылалась и на светлой секции читалась случайным
	//      голубым штрихом. Это ровно тот запрет, из-за которого версия не вправе
	//      нести собственную палитру. Замены ей нет намеренно, и роли на выбор
	//      были: `p1-accent-bg` в этом блоке даёт КРАСНУЮ метку прямо над синей
	//      контурной кнопкой — тот же разнотон, ради которого с кнопки уже
	//      снимали тень `brand-500`; `p1-line` (0,07) на бумаге `#faf9f7` не
	//      виден вовсе, а невидимый элемент хуже отсутствующего; `p1-rail`
	//      объявлен связкой — рельсом маршрута, стеблем таймлайна, — и здесь
	//      соединять нечего. Роли под «декоративную метку» у системы нет, потому
	//      что метка тут не нужна: колонка читается заголовком, абзацем и
	//      кнопкой. Паузу перед кнопкой держит воздух (`mt-10`).
	//   4. Голоса. Подписи набирались `font-bold`, то есть Inter 700: третий
	//      голос при двух ролях, и самый тяжёлый — не на главном элементе.
	//      Тот же промах, что разобран на v2 12.08.2026. Подпись на 18px — это
	//      подчинённый заголовок, её роль `p1-title-sub`.
	//   5. Пластика. `duration-500` / `duration-700` — миллисекунды в разметке
	//      мимо `--ds-motion-duration-ui*`: скорость блока не менялась вместе
	//      с системой. Заодно снят мёртвый `hover:ring-ink-300` — без ширины
	//      кольца он не рисовал ничего.
	//
	// Плюс контракт `ImageFallback`: на обёртке обязана стоять текстовая роль
	// темы, иначе заглушка (типовое состояние — картинка задана у десятка
	// определений из ~226) берёт цвет от `body` и на тёмной секции тонет.
	// Роли `p1-body` на плитках не было.
	//
	// Разметка плитки была написана дважды — по разу на колонку, с ручной
	// арифметикой индексов (`slice(2, 4)` и `index + 2`). Теперь это сниппет:
	// один источник, индекс приходит снаружи.
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import {
		INCENTIVES_DEFAULT_TEXT,
		INCENTIVES_DEFAULT_TITLE,
		resolveIncentivesGallery,
		type IncentiveGalleryItem
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

	/**
	 * Порядок прихода плиток — по диагонали мозаики, а не по порядку в DOM:
	 * левый верх, правый верх (он смещён вниз), левый низ, правый низ. По DOM
	 * это 0, 2, 1, 3, поэтому ступень задаётся списком, а не `nth-child`.
	 *
	 * В списке лежат имена системных ступеней, а не миллисекунды: величину
	 * по-прежнему решает дизайн-система, блок решает только очередь.
	 */
	const TILE_DELAY = [
		'var(--ds-motion-stagger-1)',
		'var(--ds-motion-stagger-3)',
		'var(--ds-motion-stagger-2)',
		'var(--ds-motion-stagger-4)'
	];

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

<!--
	Плитка мозаики. Пропорция и радиус — на самой карточке, картинка заполняет
	её целиком: отдельная обёртка под соотношение сторон здесь ничего не держала.
-->
{#snippet tile(item: IncentiveGalleryItem, index: number)}
	<div
		class="tile p1-card p1-border p1-body relative aspect-4/3 overflow-hidden rounded-3xl border"
		style="animation-delay: {TILE_DELAY[index] ?? '0s'}"
	>
		<ImageFallback src={item.src} alt={item.alt} class="h-full w-full object-cover" />
		<!--
			Скрим — роль, а не набор утилит: плотность у основания кадра и доля
			кадра под затемнением принадлежат системе. Теме блока роль не
			подчиняется намеренно — под ней фотография, а не поверхность секции,
			и текст поверх неё всегда светлый.
		-->
		<div class="p1-scrim pointer-events-none absolute inset-0"></div>
		<div class="absolute inset-x-5 bottom-5 text-on-dark sm:inset-x-6 sm:bottom-6">
			<EditableField
				fieldKey={`Incentives.gallery.${index}.label`}
				label={`Подпись карточки ${index + 1}`}
				value={item.label}
				{isEditable}
				onSave={(value) => saveGalleryLabel(index, value)}
				class="block"
			>
				{#snippet children(displayValue)}
					<!--
						Роль `p1-title-sub`, а не `p1-title-display`: подпись живёт на 18px,
						а дисплейная роль ниже ~28px разваливается — Cormorant рассчитан на
						крупный кегль. Предмет этой версии — сам коллаж, подпись к кадру
						служебная, и голос у неё служебный.
					-->
					<p class="p1-title-sub text-lg break-words">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>
	</div>
{/snippet}

<!-- Преимущества (Incentives) — мозаика кадров -->
<section
	class="p1-surface relative py-section-sm sm:py-section"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid gap-12 sm:gap-16 lg:grid-cols-2 lg:gap-24">
			<!-- Текст -->
			<!-- Метки над заголовком у блока нет: пилюля «Выгода» удалена 12.08.2026
			     во всех трёх версиях сразу. Ключ `badge` в данных остаётся —
			     переименование или удаление ключа обнулило бы поле у тенантов,
			     которые его уже правили. -->
			<div class="flex flex-col justify-center lg:py-8">
				<EditableField
					fieldKey="Incentives.title"
					label="Заголовок"
					value={String(data?.title ?? INCENTIVES_DEFAULT_TITLE)}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<!-- Кегль сведён с остальными версиями блока (`5xl`/`6xl`): на 3xl
						     заголовок был на ступень тише коллажа справа и проигрывал ему
						     первый взгляд, хотя предмет блока называет именно он. -->
						<h2 class="p1-title text-4xl sm:text-5xl lg:text-6xl">{displayValue}</h2>
					{/snippet}
				</EditableField>

				<div class="p1-body mt-8 space-y-2 text-base leading-7">
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

				<!-- Заявку рисует глобальный ServiceOrderIsland (+layout.svelte): блок только
				     открывает его через стор. Ключ `ctaText` общий для версий Incentives —
				     правка текста в v1 переносится в v3 и обратно.

				     Кнопка контурная, а не залитая акцентом, как в v3. Причина не во вкусе:
				     v1 — коллаж из четырёх фотографий, и залитая пилюля оказывалась
				     единственным насыщенным плоским пятном рядом с ними, перетягивая вес
				     с заголовка. Контур говорит на языке блока — тем же волосяным штрихом,
				     что и линейка над ним. Тени нет намеренно: прежняя бралась от
				     `brand-500`, то есть от КРАСНОЙ шкалы, и под синей заливкой лежало
				     тёплое свечение — половина ощущения «громко» была от него.

				     Поле 15/27, а не `py-4 px-7`: рамка добавляет 2px к коробке, и без
				     поправки кнопка стала бы 58px против 56px у залитых кнопок шаблона. -->
				<div class="mt-10 flex justify-start">
					<button
						type="button"
						onclick={() => serviceOrderStore.open('consultation')}
						class="inline-flex cursor-pointer items-center justify-center gap-3 rounded-full border border-accent-ink/35 px-[27px] py-[15px] text-base font-medium text-accent-ink transition-[background-color,border-color] duration-[var(--ds-motion-duration-ui)] ease-ui hover:border-accent-ink hover:bg-accent-ink-wash focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2"
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

			<!-- Галерея. Сдвиг второй колонки — с `sm`: на телефоне колонка уже 150px,
			     и свисающая четвёртая плитка добавляла блоку высоты, ничего не добавляя
			     к рисунку. Ниже `sm` мозаика собирается в ровное каре. -->
			<div class="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
				<div class="space-y-4 sm:space-y-6 lg:space-y-8">
					{#each gallery.slice(0, 2) as item, index}
						{@render tile(item, index)}
					{/each}
				</div>

				<div class="space-y-4 sm:space-y-6 sm:pt-12 lg:space-y-8">
					{#each gallery.slice(2, 4) as item, index}
						{@render tile(item, index + 2)}
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/*
	 * Единственный авторский момент версии: мозаика собирается — плитки приходят
	 * снизу по диагонали, в том же порядке, в каком глаз читает коллаж. Своего
	 * здесь нет ничего: траектория из общих @keyframes приложения, длительность
	 * и кривая из `--animate-fade-up-in`, ступени из `--ds-motion-stagger-*`
	 * (очередь задаётся в разметке, см. TILE_DELAY).
	 */
	.tile {
		animation: var(--animate-fade-up-in);
	}

	/*
	 * Кадр приближается на наведении. Свойство одно и дешёвое; заглушку
	 * `ImageFallback` не двигаем — увеличивать пиктограмму нечем и незачем.
	 */
	.tile :global(img) {
		transition: transform var(--ds-motion-duration-ui-slow) var(--ds-motion-ease-ui);
	}
	.tile:hover :global(img) {
		transform: scale(1.05);
	}

	@media (prefers-reduced-motion: reduce) {
		.tile {
			animation: none;
		}
		.tile :global(img) {
			transition: none;
		}
		.tile:hover :global(img) {
			transform: none;
		}
	}
</style>
