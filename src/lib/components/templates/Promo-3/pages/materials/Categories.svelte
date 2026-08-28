<script lang="ts">
	// Артикул: 3.6.2.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Categories', updated);
		data = updated;
	}

	const defaultCategories = [
		{
			id: 'ceramic',
			name: 'Керамическая плитка',
			icon: '🟫',
			description:
				'Классическая керамическая плитка для стен и полов. Широкий выбор форматов, цветов и фактур.',
			tags: ['Ванная', 'Кухня', 'Прихожая'],
			sizes: ['20×30', '25×50', '30×60'],
			features: ['Влагостойкость', 'Лёгкая укладка', 'Доступная цена']
		},
		{
			id: 'porcelain',
			name: 'Керамогранит',
			icon: '⬛',
			description:
				'Прочный и долговечный материал с низким водопоглощением. Подходит для высоконагруженных зон.',
			tags: ['Пол', 'Фасад', 'Терраса'],
			sizes: ['60×60', '80×80', '120×60'],
			features: ['Высокая прочность', 'Морозостойкость', 'Большие форматы']
		},
		{
			id: 'mosaic',
			name: 'Мозаика',
			icon: '🔷',
			description:
				'Декоративная мозаика из стекла, камня или керамики. Создаёт уникальные акценты в интерьере.',
			tags: ['Декор', 'Акцентная стена'],
			sizes: ['2,5×2,5', '5×5', '10×10'],
			features: ['Декоративность', 'Гибкость применения', 'Уникальность']
		},
		{
			id: 'natural-stone',
			name: 'Натуральный камень',
			icon: '🪨',
			description:
				'Мрамор, гранит, травертин и сланец. Эксклюзивный природный материал с уникальным рисунком каждой плиты.',
			tags: ['Люкс', 'Интерьер', 'Спа'],
			sizes: ['Индивидуальный раскрой'],
			features: ['Натуральность', 'Эксклюзивность', 'Долговечность']
		},
		{
			id: 'decor',
			name: 'Декоративные элементы',
			icon: '✨',
			description:
				'Бордюры, вставки, декоры и панно. Создайте изысканный акцент и завершённость любой плиточной композиции.',
			tags: ['Бордюр', 'Вставка', 'Панно'],
			sizes: ['Различные'],
			features: ['Дизайн', 'Акцент', 'Завершённость']
		},
		{
			id: 'outdoor',
			name: 'Уличные покрытия',
			icon: '🏡',
			description:
				'Клинкер, брусчатка и противоскользящий керамогранит для террас, садовых дорожек и открытых площадок.',
			tags: ['Терраса', 'Сад', 'Бассейн'],
			sizes: ['30×30', '40×40', '60×60'],
			features: ['Морозостойкость', 'Нескользящая поверхность', 'Уличное применение']
		}
	];

	const categories = $derived(
		Array.isArray(data?.categories) && (data.categories as unknown[]).length > 0
			? (data.categories as typeof defaultCategories)
			: defaultCategories
	);
</script>

<section class="relative py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<div class="mb-16">
			<EditableField
				fieldKey="Categories.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Категории материалов')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}<h2 class="text-3xl text-white lg:text-4xl">
						{displayValue}
					</h2>{/snippet}
			</EditableField>
			<EditableField
				fieldKey="Categories.description"
				label="Описание"
				value={String(
					data?.description ?? 'Все виды плитки и облицовочных материалов в одном месте.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}<p class="mt-4 max-w-xl text-surface-400">
						{displayValue}
					</p>{/snippet}
			</EditableField>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each categories as cat}
				<div
					class="group relative flex flex-col rounded-2xl border border-surface-700/50 bg-surface-800/40 p-8 transition-all duration-500 hover:border-accent-500/30 hover:bg-surface-800/70 hover:shadow-2xl hover:shadow-accent-500/5"
				>
					<div class="mb-5 flex items-start gap-4">
						<span class="text-3xl">{cat.icon}</span>
						<h3
							class="ds-title-sub text-xl text-white transition-colors duration-300 group-hover:text-accent-500"
						>
							{cat.name}
						</h3>
					</div>
					<p class="flex-1 text-sm leading-relaxed text-surface-300">{cat.description}</p>
					<div class="mt-5 flex flex-wrap gap-1.5">
						{#each cat.tags as tag}
							<span
								class="rounded-full bg-accent-500/8 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-accent-500/80 uppercase"
								>{tag}</span
							>
						{/each}
					</div>
					<div class="my-5 border-t border-surface-700/50"></div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<p class="mb-2 text-[10px] font-semibold tracking-wider text-surface-500 uppercase">
								Особенности
							</p>
							<ul class="space-y-1">
								{#each cat.features as f}<li
										class="flex items-center gap-1.5 text-xs text-surface-300"
									>
										<span class="size-1 shrink-0 rounded-full bg-accent-500/60"></span>{f}
									</li>{/each}
							</ul>
						</div>
						<div>
							<p class="mb-2 text-[10px] font-semibold tracking-wider text-surface-500 uppercase">
								Форматы, см
							</p>
							<ul class="space-y-1">
								{#each cat.sizes as s}<li class="text-xs font-medium text-surface-200">
										{s}
									</li>{/each}
							</ul>
						</div>
					</div>
					<div class="mt-6 flex items-center justify-between border-t border-surface-700/50 pt-5">
						<span
							class="text-xs font-medium text-surface-400 transition-colors group-hover:text-surface-300"
							>Смотреть ассортимент</span
						>
						<div
							class="flex size-7 items-center justify-center rounded-full border border-surface-600 bg-surface-700/50 transition-all duration-300 group-hover:border-accent-500/50 group-hover:bg-accent-500/10"
						>
							<svg
								viewBox="0 0 12 12"
								class="size-3 fill-surface-400 transition-colors group-hover:fill-accent-500"
								><path
									fill-rule="evenodd"
									d="M2 6a.5.5 0 01.5-.5h6.293L6.646 3.354a.5.5 0 01.708-.708l3 3a.5.5 0 010 .708l-3 3a.5.5 0 01-.708-.708L8.793 6.5H2.5A.5.5 0 012 6z"
									clip-rule="evenodd"
								/></svg
							>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
