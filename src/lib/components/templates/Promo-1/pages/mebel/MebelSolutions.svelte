<script lang="ts">
	// Артикул: 1.16.4.1 — см. docs/architecture/component-articles-map.md
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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelSolutions', updated);
		data = updated;
	}

	async function updateItem(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedItems = [...(data.items || [])];
		if (!updatedItems[index]) {
			updatedItems[index] = { ...items[index] };
		}
		updatedItems[index] = { ...updatedItems[index], [field]: value };
		const updated = { ...data, items: updatedItems };
		await saveComponentData(editContext, 'MebelSolutions', updated);
		data = updated;
	}

	const items = $derived(
		data.items || [
			{
				title: 'Кухонные гарнитуры',
				desc: 'От классики до современного минимализма',
				image: 'https://storage.yandexcloud.net/leget-main/templates/promo-1/custom_kitchens.png'
			},
			{
				title: 'Шкафы',
				desc: 'Максимум функциональности и стиля',
				image: 'https://storage.yandexcloud.net/leget-main/templates/promo-1/custom_wardrobes.png'
			}
		]
	);
</script>

<div class="mebel-container mt-12 mb-12">
	<h2 class="mb-8 text-2xl text-ink-900">
		<EditableField
			fieldKey="MebelSolutions.title"
			label="Заголовок"
			value={String(data.title || 'Популярные решения')}
			{isEditable}
			inline
			onSave={(v) => saveField('title', v)}
		>
			{#snippet children(val)}
				{val}
			{/snippet}
		</EditableField>
	</h2>

	<div class="grid gap-6 sm:grid-cols-2">
		{#each items as item, i}
			<div class="group relative overflow-hidden rounded-2xl bg-ink-100">
				<ImageFallback
					loading="lazy"
					src={item.image}
					alt={item.title}
					class="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<div
					class="absolute inset-0 bg-linear-to-t from-ink-900/80 via-ink-900/20 to-transparent"
				></div>
				<div class="absolute right-0 bottom-0 left-0 p-6">
					<h3 class="p1-title-sub text-xl text-on-dark">
						<EditableField
							fieldKey="MebelSolutions.items.{i}.title"
							label="Заголовок решения"
							value={item.title}
							{isEditable}
							inline
							onSave={(v) => updateItem(i, 'title', v)}
						>
							{#snippet children(val)}
								{val}
							{/snippet}
						</EditableField>
					</h3>
					<p class="mt-1 text-sm text-ink-300">
						<EditableField
							fieldKey="MebelSolutions.items.{i}.desc"
							label="Описание решения"
							value={item.desc ?? ''}
							{isEditable}
							inline
							onSave={(v) => updateItem(i, 'desc', v)}
						>
							{#snippet children(val)}
								{val}
							{/snippet}
						</EditableField>
					</p>
				</div>
			</div>
		{/each}
	</div>
</div>
