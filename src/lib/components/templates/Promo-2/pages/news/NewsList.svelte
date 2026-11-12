<script lang="ts">
	import ContentText from '$lib/components/templates/Promo-2/ContentText.svelte';
	// Артикул: 2.3.2.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
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

	let visible = $state(false);
	let sectionEl: HTMLElement;
	let activeCategory = $state('Все');

	const defaultCategories = ['Все', 'Производство', 'Компания'];

	const defaultNews = [
		{
			id: 1,
			date: '30 января 2026',
			category: 'Производство',
			title: 'Дизайн-профиль с акцентной подсветкой для ящика AVANTECH YOU',
			excerpt:
				'У нас новинка! Дизайн-профиль со встроенной светодиодной подсветкой для торца ящика AvanTech YOU обеспечивает премиальный внешний вид мебели без лишних деталей.'
		},
		{
			id: 2,
			date: '20 марта 2026',
			category: 'Производство',
			title: 'Линейка фасадов ЛДСП Egger',
			excerpt:
				'Встречайте новинку! Расширение ассортимента фасадов ЛДСП Egger. Теперь в нашем каталоге представлено 10 новых декоров, которые позволят реализовать ваши идеи с минимальным бюджетом и в короткие сроки.'
		},
		{
			id: 3,
			date: '7 января 2026',
			category: 'Компания',
			title: 'Итоги года: рост выручки на 22% и выход на новые рынки',
			excerpt:
				'Фабрика завершила год с рекордными показателями. Общий объём исполненных заказов превысил 38 000 кухонь. В декабре открылись первые три партнёрских салона в новых регионах.'
		}
	];

	const news = $derived(
		Array.isArray(data?.news) && (data.news as unknown[]).length > 0
			? (data.news as typeof defaultNews)
			: defaultNews
	);

	const categories = $derived([
		...new Set([
			...defaultCategories,
			...(Array.isArray(data?.categories) ? (data.categories as string[]) : []),
			...news.map((item) => item.category)
		])
	]);

	const filteredNews = $derived(
		activeCategory === 'Все' ? news : news.filter((n) => n.category === activeCategory)
	);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.05 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<!-- Filter Bar -->
<div class="sticky top-[80px] z-20 border-b border-border-light bg-white/95 backdrop-blur-md">
	<div class="p2-container mx-auto">
		<div class="flex items-center gap-1 overflow-x-auto py-4" style="scrollbar-width: none;">
			{#each categories as cat}
				<button
					class="rounded-sm border px-4 py-1.5 text-xs tracking-wider whitespace-nowrap transition-all duration-300"
					class:border-primary={activeCategory === cat}
					class:bg-primary={activeCategory === cat}
					class:text-white={activeCategory === cat}
					class:border-border-light={activeCategory !== cat}
					class:text-secondary={activeCategory !== cat}
					class:hover:border-secondary={activeCategory !== cat}
					onclick={() => (activeCategory = cat)}
				>
					<ContentText
						bind:data
						{editContext}
						{isEditable}
						componentType="NewsList"
						path={['copy', 'categories', `label:${cat}`]}
						fallback={cat}
						label="Текст"
						richText={false}
					/>
				</button>
			{/each}
		</div>
	</div>
</div>

<!-- News List -->
<section class="py-16 lg:py-20" bind:this={sectionEl}>
	<div class="p2-container mx-auto">
		<div class="divide-y divide-border-light">
			{#each filteredNews as item, i (item.id)}
				<article
					class="group flex flex-col gap-3 rounded-sm py-8 opacity-0 transition-all duration-500 hover:bg-surface-warm/40 md:flex-row md:items-start md:gap-10 lg:px-4"
					class:animate-fade-up={visible}
					style="animation-delay: {0.05 + i * 0.07}s"
				>
					<!-- Date + Category -->
					<div
						class="flex shrink-0 flex-row items-center gap-3 md:w-44 md:flex-col md:items-start md:gap-1.5"
					>
						<time class="text-xs text-muted tabular-nums"
							><ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="NewsList"
								path={['news', news.indexOf(item), 'date']}
								fallback={item.date}
								label="Текст"
								defaults={{ news }}
								richText={false}
							/></time
						>
						<span
							class="inline-block border border-secondary/30 px-2 py-0.5 text-[10px] tracking-[0.2em] text-secondary uppercase"
						>
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="NewsList"
								path={['news', news.indexOf(item), 'category']}
								fallback={item.category}
								label="Текст"
								defaults={{ news }}
								richText={false}
							/>
						</span>
					</div>

					<!-- Content -->
					<div class="min-w-0 flex-1">
						<h2
							class="text-lg text-primary transition-colors duration-300 group-hover:text-secondary md:text-xl"
							style="font-family: var(--font-heading);"
						>
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="NewsList"
								path={['news', news.indexOf(item), 'title']}
								fallback={item.title}
								label="Заголовок"
								defaults={{ news }}
							/>
						</h2>
						<p class="mt-2.5 text-sm leading-relaxed text-secondary">
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="NewsList"
								path={['news', news.indexOf(item), 'excerpt']}
								fallback={item.excerpt}
								label="Описание"
								defaults={{ news }}
								multiline
							/>
						</p>
					</div>
				</article>
			{/each}
		</div>

		{#if filteredNews.length === 0}
			<div class="py-24 text-center">
				<p class="text-base text-muted">
					<ContentText
						bind:data
						{editContext}
						{isEditable}
						componentType="NewsList"
						path={['copy', 'body1']}
						fallback={'Новостей в этой категории пока нет'}
						label="Новостей в этой категории пока нет"
						multiline
					/>
				</p>
			</div>
		{/if}
	</div>
</section>
