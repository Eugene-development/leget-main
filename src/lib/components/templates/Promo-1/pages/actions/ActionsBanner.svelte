<script lang="ts">
	// Артикул: 1.4.4.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'ActionsBanner', updated);
		data = updated;
	}
</script>

<section class="bg-gray-50 py-24 sm:py-32">
	<div class="mx-auto max-w-5xl px-6 lg:px-8">
		<div class="overflow-hidden rounded-3xl">
			<EditableField
				fieldKey="ActionsBanner.imageUrl"
				label="URL изображения"
				value={String(data?.imageUrl ?? '')}
				{isEditable}
				onSave={(v) => saveField('imageUrl', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					{#if displayValue}
						<img loading="lazy"
							alt={String(data?.imageAlt ?? 'Акция')}
							src={displayValue}
							class="w-full object-cover">
					{/if}
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
