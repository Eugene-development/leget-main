<script lang="ts">
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
</script>

<div class="bg-surface pb-24 sm:pb-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm/6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">

			<!-- Главный отзыв -->
			<figure
				class="review-card rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/5 sm:col-span-2 xl:col-start-2 xl:row-end-1"
				style="animation-delay: 0ms"
			>
				<blockquote class="p-6 text-lg font-semibold tracking-tight text-gray-900 sm:p-12 sm:text-xl/8">
					<p>{featured.text}</p>
				</blockquote>
				<figcaption class="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-gray-900/10 px-6 py-4 sm:flex-nowrap">
					<div class="flex-auto">
						<div class="font-semibold">{featured.name}</div>
						<div class="text-gray-600">{featured.location}</div>
					</div>
				</figcaption>
			</figure>

			<!-- Колонка 1 -->
			<div class="space-y-8 xl:contents xl:space-y-0">
				<div class="space-y-8 xl:row-span-2">
					{#each col1 as review, i}
						<figure
							class="review-card rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
							style="animation-delay: {getGlobalIndex(0, i) * 80 + 100}ms"
						>
							<blockquote class="text-gray-900"><p>{review.text}</p></blockquote>
							<figcaption class="mt-6 flex items-center gap-x-4">
								<div>
									<div class="font-semibold">{review.name}</div>
									<div class="text-gray-600">{review.location}</div>
								</div>
							</figcaption>
						</figure>
					{/each}
				</div>

				<!-- Колонка 2 -->
				<div class="space-y-8 xl:row-start-1">
					{#each col2 as review, i}
						<figure
							class="review-card rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
							style="animation-delay: {getGlobalIndex(1, i) * 80 + 100}ms"
						>
							<blockquote class="text-gray-900"><p>{review.text}</p></blockquote>
							<figcaption class="mt-6 flex items-center gap-x-4">
								<div>
									<div class="font-semibold">{review.name}</div>
									<div class="text-gray-600">{review.location}</div>
								</div>
							</figcaption>
						</figure>
					{/each}
				</div>

				<!-- Колонка 3 -->
				<div class="space-y-8 xl:row-start-1">
					{#each col3 as review, i}
						<figure
							class="review-card rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
							style="animation-delay: {getGlobalIndex(2, i) * 80 + 100}ms"
						>
							<blockquote class="text-gray-900"><p>{review.text}</p></blockquote>
							<figcaption class="mt-6 flex items-center gap-x-4">
								<div>
									<div class="font-semibold">{review.name}</div>
									<div class="text-gray-600">{review.location}</div>
								</div>
							</figcaption>
						</figure>
					{/each}
				</div>

				<!-- Колонка 4 -->
				<div class="space-y-8 xl:row-span-2">
					{#each col4 as review, i}
						<figure
							class="review-card rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
							style="animation-delay: {getGlobalIndex(3, i) * 80 + 100}ms"
						>
							<blockquote class="text-gray-900"><p>{review.text}</p></blockquote>
							<figcaption class="mt-6 flex items-center gap-x-4">
								<div>
									<div class="font-semibold">{review.name}</div>
									<div class="text-gray-600">{review.location}</div>
								</div>
							</figcaption>
						</figure>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes reviewFadeUp {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.review-card {
		animation: reviewFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	.review-card:hover {
		transform: translateY(-4px);
		box-shadow:
			0 20px 25px -5px rgb(0 0 0 / 0.08),
			0 8px 10px -6px rgb(0 0 0 / 0.08);
	}
</style>
