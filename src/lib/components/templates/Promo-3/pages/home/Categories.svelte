<script lang="ts">
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
		{ title: 'Настенная плитка', description: 'Элегантные решения для стен',       image: '/images/tile-marble.png',     count: '340+ вариантов', href: '/catalog/wall'      },
		{ title: 'Напольная плитка', description: 'Прочность и стиль для вашего пола', image: '/images/tile-hexagonal.png',  count: '280+ вариантов', href: '/catalog/floor'     },
		{ title: 'Керамогранит',     description: 'Элегантная отделка нового поколения', image: '/images/tile-geometric.png', count: '420+ вариантов', href: '/catalog/porcelain' },
		{ title: 'Мозаика',          description: 'Уникальные узоры для акцентных зон', image: '/images/tile-terrazzo.png',  count: '190+ вариантов', href: '/catalog/mosaic'    },
	];

	const categories = $derived(
		Array.isArray(data?.categories) && (data.categories as unknown[]).length > 0
			? (data.categories as typeof defaultCategories)
			: defaultCategories
	);
</script>

<section class="relative py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<div class="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
			<div>
				<EditableField fieldKey="Categories.label" label="Лейбл" value={String(data?.label ?? 'Категории')} {isEditable} onSave={(v) => saveField('label', v)}>
					{#snippet children(displayValue)}
						<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase">{displayValue}</span>
					{/snippet}
				</EditableField>
				<EditableField fieldKey="Categories.heading" label="Заголовок" value={String(data?.heading ?? 'Подберите идеальную плитку')} {isEditable} onSave={(v) => saveField('heading', v)} class="block">
					{#snippet children(displayValue)}
						<h2 class="mt-3 font-display text-4xl font-bold tracking-wide text-white lg:text-5xl">{displayValue}</h2>
					{/snippet}
				</EditableField>
			</div>
			<a href={String(data?.allLink ?? '/collections')} class="group flex items-center gap-2 text-sm font-medium text-accent-500 transition-colors hover:text-accent-400">
				{String(data?.allLinkText ?? 'Весь каталог')}
				<svg viewBox="0 0 20 20" class="size-4 fill-current transition-transform duration-300 group-hover:translate-x-1"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" /></svg>
			</a>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each categories as cat}
				<a href={cat.href} class="group relative overflow-hidden rounded-2xl border border-surface-700/50 bg-surface-800/50 transition-all duration-500 hover:border-accent-500/30 hover:shadow-2xl hover:shadow-accent-500/5">
					<div class="aspect-[4/3] overflow-hidden">
						<img src={cat.image} alt={cat.title} class="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
						<div class="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/30 to-transparent"></div>
					</div>
					<div class="absolute right-0 bottom-0 left-0 p-6">
						<span class="mb-2 inline-block rounded-full bg-accent-500/20 px-3 py-1 text-[10px] font-bold tracking-wider text-accent-600 uppercase">{cat.count}</span>
						<h3 class="text-lg font-bold text-white">{cat.title}</h3>
						<p class="mt-1 text-sm leading-relaxed text-surface-200">{cat.description}</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>
