<script lang="ts">
	// Артикул: 2.16.1.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
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
		await saveComponentData(editContext, 'FavoritesHero', updated);
		data = updated;
	}
</script>

<section class="border-b border-border-light bg-surface-warm py-14 md:py-20">
	<div class="p2-container mx-auto">
		<EditableField
			fieldKey="FavoritesHero.heading"
			label="Название страницы"
			value={String(data?.heading ?? 'Избранное')}
			{isEditable}
			onSave={(value) => saveField('heading', value)}
			class="block"
		>
			{#snippet children(value)}<h1
					class="text-5xl text-primary md:text-7xl"
					style="font-family: var(--font-heading);"
				>
					<RichText {value} />
				</h1>{/snippet}
		</EditableField>
		<EditableField
			fieldKey="FavoritesHero.description"
			label="Описание"
			value={String(
				data?.description ??
					'Кухни и шкафы, которые вам понравились. Сохраните идеи и вернитесь к ним, когда будете готовы выбирать.'
			)}
			{isEditable}
			multiline
			onSave={(value) => saveField('description', value)}
			class="block"
		>
			{#snippet children(value)}<p class="mt-6 max-w-2xl text-lg leading-relaxed text-secondary">
					<RichText {value} />
				</p>{/snippet}
		</EditableField>
	</div>
</section>
