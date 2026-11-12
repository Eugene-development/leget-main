<script lang="ts">
	// Артикул: 2.16.2.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import FavoriteButton from '../../favorites/FavoriteButton.svelte';
	import Heart from '../../favorites/Heart.svelte';
	import { readFavorites, subscribeFavorites, type FavoriteVariant } from '../../favorites/storage';
	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();
	let items = $state<FavoriteVariant[]>([]);
	let ready = $state(false);
	let filter = $state<'all' | 'kitchen' | 'wardrobe'>('all');
	$effect(() => {
		items = readFavorites();
		ready = true;
		return subscribeFavorites((value) => {
			items = value;
		});
	});
	const visibleItems = $derived(items.filter((item) => filter === 'all' || item.kind === filter));
	const filters = [
		{ key: 'all', label: 'Все' },
		{ key: 'kitchen', label: 'Кухни' },
		{ key: 'wardrobe', label: 'Шкафы' }
	] as const;
	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'FavoritesGallery', updated);
		data = updated;
	}
</script>

<section class="min-h-[50vh] bg-surface py-12 md:py-16" aria-busy={!ready}>
	<div class="p2-container mx-auto">
		<div
			class="flex flex-wrap items-center justify-between gap-6 border-b border-border-light pb-6"
		>
			<EditableField
				fieldKey="FavoritesGallery.heading"
				label="Заголовок подборки"
				value={String(data?.heading ?? 'Ваш выбор')}
				{isEditable}
				onSave={(value) => saveField('heading', value)}
				class="block"
			>
				{#snippet children(value)}<h2
						class="text-3xl text-primary md:text-4xl"
						style="font-family: var(--font-heading);"
					>
						<RichText {value} />
					</h2>{/snippet}
			</EditableField>
			<div class="flex flex-wrap gap-2" aria-label="Тип мебели">
				{#each filters as option}
					<button
						type="button"
						onclick={() => {
							filter = option.key;
						}}
						data-goal-ignore="Фильтр локального избранного без формы"
						aria-pressed={filter === option.key}
						class="min-h-11 rounded-full border px-5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent {filter ===
						option.key
							? 'border-primary bg-primary text-surface'
							: 'border-border-light text-primary hover:bg-surface-warm'}"
					>
						{option.label}
						<span class="ml-1 tabular-nums"
							>{items.filter((item) => option.key === 'all' || item.kind === option.key)
								.length}</span
						>
					</button>
				{/each}
			</div>
		</div>
		{#if !ready}<p role="status" class="py-12 text-secondary">Загружаем избранное…</p>
		{:else if items.length === 0 || isEditable}
			<div class="py-16 text-center">
				<div class="mb-6 flex justify-center text-secondary"><Heart class="h-12 w-12" /></div>
				<EditableField
					fieldKey="FavoritesGallery.emptyTitle"
					label="Заголовок пустого списка"
					value={String(data?.emptyTitle ?? 'Здесь будут ваши идеи')}
					{isEditable}
					onSave={(value) => saveField('emptyTitle', value)}
					class="block"
				>
					{#snippet children(value)}<h3
							class="text-3xl text-primary"
							style="font-family: var(--font-heading);"
						>
							<RichText {value} />
						</h3>{/snippet}
				</EditableField><EditableField
					fieldKey="FavoritesGallery.emptyMessage"
					label="Текст пустого списка"
					value={String(
						data?.emptyMessage ??
							'Нажмите на сердечко на фотографии кухни или шкафа — понравившийся вариант появится здесь.'
					)}
					{isEditable}
					onSave={(value) => saveField('emptyMessage', value)}
					class="block"
				>
					{#snippet children(value)}<p
							class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-secondary"
						>
							<RichText {value} />
						</p>{/snippet}
				</EditableField>
				<div class="mt-8 flex flex-wrap justify-center gap-4">
					<EditableField
						fieldKey="FavoritesGallery.kitchensLabel"
						label="Ссылка на кухни"
						value={String(data?.kitchensLabel ?? 'Смотреть кухни')}
						{isEditable}
						richText={false}
						onSave={(value) => saveField('kitchensLabel', value)}
					>
						{#snippet children(value)}
							<a
								href="/kitchens"
								class="inline-flex min-h-11 items-center justify-center rounded-sm border border-primary bg-primary px-6 py-3 text-sm text-surface transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
								>{value}</a
							>
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="FavoritesGallery.wardrobesLabel"
						label="Ссылка на шкафы"
						value={String(data?.wardrobesLabel ?? 'Смотреть шкафы')}
						{isEditable}
						richText={false}
						onSave={(value) => saveField('wardrobesLabel', value)}
					>
						{#snippet children(value)}
							<a
								href="/wardrobes"
								class="inline-flex min-h-11 items-center justify-center rounded-sm border border-border-medium px-6 py-3 text-sm text-primary transition-colors hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
								>{value}</a
							>
						{/snippet}
					</EditableField>
				</div>
			</div>
		{/if}
		{#if ready && visibleItems.length > 0}
			<div class="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-4">
				{#each visibleItems as item (item.id)}
					<article>
						<div class="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface-muted">
							<a
								href={item.kind === 'kitchen' ? '/kitchens' : '/wardrobes'}
								aria-label={`Смотреть ${item.kind === 'kitchen' ? 'кухни' : 'шкафы'}: ${item.title}`}
								class="block h-full focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent"
							>
								<img
									src={item.image}
									alt={item.title}
									loading="lazy"
									class="h-full w-full object-cover"
								/>
							</a>
							<div class="absolute top-4 right-4 z-20"><FavoriteButton {item} /></div>
						</div>
						<div class="mt-5 flex items-baseline gap-3">
							<p
								class="shrink-0 text-xs tracking-widest whitespace-nowrap text-secondary uppercase"
							>
								{item.kind === 'kitchen' ? 'Кухня' : 'Шкаф / гардеробная'}
							</p>
							<h3
								class="min-w-0 truncate text-2xl text-primary"
								style="font-family: var(--font-heading);"
								title={item.title}
							>
								{item.title}
							</h3>
						</div>
						<p class="mt-2 text-sm leading-relaxed text-secondary">{item.description}</p>
					</article>
				{/each}
			</div>
		{:else if ready && items.length > 0 && !isEditable}
			<p role="status" class="py-16 text-center text-secondary">
				В этой категории пока нет сохранённых вариантов. Выберите другую категорию или добавьте
				мебель из каталога.
			</p>
		{/if}
	</div>
</section>
