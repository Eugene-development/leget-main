<script lang="ts">
	// Артикул: 1.7.2.1 — см. docs/architecture/component-articles-map.md
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
		location: 'Москва',
	};

	const defaultReviews = [
		{ text: 'Купили гардероб. Каждая деталь хорошо продумана. Мы остались довольны своей покупкой. Закажем ещё.', name: 'Сергей Александров', location: 'Балашиха' },
		{ text: 'Советую всем дизайнера Евгения. Подобрал вариант с техникой по нашему бюджету и уложились в сроки. Благодарю!', name: 'LazyRich99', location: 'Реутов' },
		{ text: 'Спасибо! С вашей помощью мы удачно обновили кухню и теперь там больше времени проводим вместе с семьёй. Обновка моя удалась! Спасибочки)', name: 'Серафима', location: 'Казань' },
		{ text: 'Мы довольны результатом выполненных работ этой компании. Новый шкаф в прихожую — это просто красота! Сборщики тоже хорошие.', name: 'Лена', location: 'Московская область' },
		{ text: 'Наш новый шкаф купе — это радость для меня! Получилось стильно и удобно. Теперь наши вещи будут в порядке) Будем вас советовать.', name: 'Лана и Лёша', location: 'Мытищи' },
		{ text: 'Хороший шкаф. Купили в мае. Покупка, которая оправдала все ожидания. Пришлось взять в рассрочку, так как не уложились в свой бюджет.', name: 'Лекс', location: 'Москва' },
		{ text: 'Купил кухонный гарнитур через этих ребят. Работают профессионалы. Все идеально подходит, ничего не смущает даже.', name: 'Таймураз', location: 'Нижний Новгород' },
		{ text: 'У нас самый крутой кухонный гарнитур среди друзей. Не можем налюбоваться! Спасибо за работу. Мы рады!', name: 'Танечка', location: 'Нижний Новгород' },
		{ text: 'Мне очень нужен был вместительный шкаф. Мы довольны своим выбором дизайнера! Так же хочу сказать спасибо за скидку.', name: 'Анатолий', location: 'Владимир' },
		{ text: 'Юрий! Большое спасибо за оперативность и дружелюбие. Мебель была мне в подарок и хорошо что вы успели к моему Дню рождения!', name: 'Марина', location: 'Санкт-Петербург' },
		{ text: 'Знаком с вами очень давно. Не подвели. Меня порадовал адекватный выбор материалов для нашей спальни.', name: 'Георгий Феликсович', location: 'Санкт-Петербург' },
		{ text: 'Начали переезд с обновления мебели. Заказали гардероб и гарнитур. Получилось функциональное украшение нашей спальни и кухни. Все удобно и лаконично! Рекомендуем вас друзьям.', name: 'Дина', location: 'Казань' },
		{ text: 'Заказали дорогой кухонный гарнитур в загородный дом с подсветкой, мойкой и бытовой техникой. Очень боялись ошибиться. В итоге получили то что хотели. Мы счастливы, что сделали выбор с вашей помощью. Однозначно будем рекомендовать.', name: 'Счастливая семья Зиминых', location: 'Москва' },
	];

	type Review = { text: string; name: string; location: string };

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

	const col1 = $derived(reviews.filter((_, i) => i % 4 === 0));
	const col2 = $derived(reviews.filter((_, i) => i % 4 === 1));
	const col3 = $derived(reviews.filter((_, i) => i % 4 === 2));
	const col4 = $derived(reviews.filter((_, i) => i % 4 === 3));

	// Global index counter for staggered delays
	function getGlobalIndex(colIndex: number, itemIndex: number): number {
		return itemIndex * 4 + colIndex;
	}

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
		class="tm-card group relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white p-6 shadow-[0_26px_70px_-50px_rgba(24,24,27,0.45)] transition duration-300 hover:border-pink-500/40 hover:shadow-[0_32px_80px_-44px_rgba(24,24,27,0.5)] motion-safe:hover:-translate-y-1"
		style="--tm-delay: {Math.min(globalIdx, 8) * 70}ms"
	>
		<div
			class="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-pink-500/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			aria-hidden="true"
		></div>

		<blockquote class="relative text-sm/6 text-gray-700">
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
					<p>{val}</p>
				{/snippet}
			</EditableField>
		</blockquote>

		<figcaption class="mt-6 flex items-center gap-3 border-t border-gray-900/10 pt-4">
			<span
				class="flex size-9 shrink-0 items-center justify-center rounded-full bg-pink-50 text-[11px] font-semibold text-pink-600 ring-1 ring-pink-500/20"
				aria-hidden="true"
			>
				{initials(review.name)}
			</span>
			<div class="min-w-0">
				<div class="text-sm font-semibold text-gray-900">
					<EditableField
						fieldKey="TestimonialsGrid.reviews.{globalIdx}.name"
						label="Имя автора"
						value={review.name}
						{isEditable}
						inline
						onSave={(v) => updateReview(globalIdx, 'name', v)}
					>
						{#snippet children(val)}{val}{/snippet}
					</EditableField>
				</div>
				<div class="text-[11px] font-semibold tracking-[0.16em] text-gray-500 uppercase">
					<EditableField
						fieldKey="TestimonialsGrid.reviews.{globalIdx}.location"
						label="Город"
						value={review.location}
						{isEditable}
						inline
						onSave={(v) => updateReview(globalIdx, 'location', v)}
					>
						{#snippet children(val)}{val}{/snippet}
					</EditableField>
				</div>
			</div>
		</figcaption>
	</figure>
{/snippet}

<section class="bg-surface relative isolate overflow-hidden pt-12 pb-24 sm:pb-32">
	<div class="relative mx-auto max-w-7xl px-6 lg:px-8">
		<div
			class="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 gap-6 text-sm/6 text-gray-900 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4"
		>
			<!-- Главный отзыв -->
			<figure
				use:revealOnScroll
				class="tm-reveal tm-card relative overflow-hidden rounded-4xl border border-gray-900/10 bg-white shadow-[0_40px_100px_-60px_rgba(24,24,27,0.5)] sm:col-span-2 xl:col-start-2 xl:row-end-1"
			>
				<div
					class="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-pink-500/70 to-transparent"
					aria-hidden="true"
				></div>

				<blockquote class="relative p-6 sm:p-12">
					<div
						class="flex size-11 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 ring-1 ring-pink-500/20"
						aria-hidden="true"
					>
						<svg class="size-5" viewBox="0 0 24 24" fill="currentColor">
							<path d="M9.5 5.5C6.46 5.5 4 7.96 4 11v7.5h7.5V11H7.75c0-1.24 1.01-2.25 2.25-2.25V5.5zm10 0C16.46 5.5 14 7.96 14 11v7.5h7.5V11h-3.75c0-1.24 1.01-2.25 2.25-2.25V5.5z" />
						</svg>
					</div>
					<div class="mt-6 text-lg font-medium tracking-[-0.01em] text-pretty text-gray-900 sm:text-xl/8">
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
								<p>{val}</p>
							{/snippet}
						</EditableField>
					</div>
				</blockquote>

				<figcaption
					class="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-gray-900/10 px-6 py-5 sm:flex-nowrap sm:px-12"
				>
					<span
						class="flex size-10 shrink-0 items-center justify-center rounded-full bg-pink-50 text-xs font-semibold text-pink-600 ring-1 ring-pink-500/20"
						aria-hidden="true"
					>
						{initials(featured.name)}
					</span>
					<div class="flex-auto">
						<div class="text-sm font-semibold text-gray-900">
							<EditableField
								fieldKey="TestimonialsGrid.featured.name"
								label="Имя автора"
								value={featured.name}
								{isEditable}
								inline
								onSave={(v) => updateFeatured('name', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</div>
						<div class="text-[11px] font-semibold tracking-[0.16em] text-gray-500 uppercase">
							<EditableField
								fieldKey="TestimonialsGrid.featured.location"
								label="Город"
								value={featured.location}
								{isEditable}
								inline
								onSave={(v) => updateFeatured('location', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</div>
					</div>
				</figcaption>
			</figure>

			<div class="space-y-6 xl:contents xl:space-y-0">
				<!--
					Каждая колонка — свой триггер появления: сетка высокая, и единый
					триггер на весь блок «проигрывал» бы анимацию нижних карточек
					задолго до того, как они появятся на экране.
				-->
				<div use:revealOnScroll class="tm-reveal space-y-6 xl:row-span-2">
					{#each col1 as review, i}
						{@render reviewCard(review, getGlobalIndex(0, i))}
					{/each}
				</div>

				<div use:revealOnScroll class="tm-reveal space-y-6 xl:row-start-1">
					{#each col2 as review, i}
						{@render reviewCard(review, getGlobalIndex(1, i))}
					{/each}
				</div>

				<div use:revealOnScroll class="tm-reveal space-y-6 xl:row-start-1">
					{#each col3 as review, i}
						{@render reviewCard(review, getGlobalIndex(2, i))}
					{/each}
				</div>

				<div use:revealOnScroll class="tm-reveal space-y-6 xl:row-span-2">
					{#each col4 as review, i}
						{@render reviewCard(review, getGlobalIndex(3, i))}
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
