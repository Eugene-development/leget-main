<script lang="ts">
	// Артикул: 1.20.5.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ByttehnikaCategories', updated);
		data = updated;
	}

	async function updateItem(index: number, field: 'title' | 'desc', value: string) {
		const updatedItems = [...items];
		updatedItems[index] = { ...updatedItems[index], [field]: value };
		await saveField('items', updatedItems);
	}

	const items = $derived(
		data.items || [
			{
				title: 'Варочные панели',
				desc: 'Индукционные, газовые, электрические',
				image: 'https://storage.yandexcloud.net/leget-main/templates/promo-1/varochna.jpg'
			},
			{
				title: 'Духовые шкафы',
				desc: 'Встраиваемые с конвекцией и грилем',
				image: 'https://storage.yandexcloud.net/leget-main/templates/promo-1/duhshkaf.jpg'
			}
		]
	);
</script>

<div class="mebel-container mt-12 mb-12">
	<h2 class="mb-8 text-2xl text-ink-900">
		<EditableField
			fieldKey="ByttehnikaCategories.title"
			label="Заголовок блока"
			value={String(data.title ?? 'Популярные категории')}
			{isEditable}
			inline
			onSave={(value) => saveField('title', value)}
		>
			{#snippet children(value)}{value}{/snippet}
		</EditableField>
	</h2>

	<div class="grid gap-6 sm:grid-cols-2">
		{#each items as item, i}
			<div class="group relative overflow-hidden rounded-2xl bg-ink-100">
				<ImageFallback
					loading="lazy"
					src={item.image}
					alt={item.title}
					class="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<div
					class="absolute inset-0 bg-linear-to-t from-ink-900/80 via-ink-900/20 to-transparent"
				></div>
				<div class="absolute right-0 bottom-0 left-0 p-6">
					<h3 class="p1-title-sub text-xl text-on-dark">
						<EditableField
							fieldKey="ByttehnikaCategories.item.{i}.title"
							label="Заголовок карточки"
							value={String(item.title ?? '')}
							{isEditable}
							inline
							onSave={(value) => updateItem(i, 'title', value)}
						>
							{#snippet children(value)}{value}{/snippet}
						</EditableField>
					</h3>
					<p class="mt-1 text-sm text-ink-300">
						<EditableField
							fieldKey="ByttehnikaCategories.item.{i}.desc"
							label="Описание карточки"
							value={String(item.desc ?? '')}
							{isEditable}
							inline
							multiline
							onSave={(value) => updateItem(i, 'desc', value)}
						>
							{#snippet children(value)}{value}{/snippet}
						</EditableField>
					</p>
				</div>
			</div>
		{/each}
	</div>
</div>
