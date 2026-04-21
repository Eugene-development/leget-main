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
		await saveComponentData(editContext, 'Text', updated);
		data = updated;
	}
</script>

<div class="bg-stone-50 px-6 py-16">
	<div class="prose prose-lg mx-auto max-w-3xl text-stone-700">
		<EditableField
			fieldKey="Text.content"
			label="Текст"
			value={String(data?.content ?? '')}
			{isEditable}
			multiline
			onSave={(v) => saveField('content', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				{@html displayValue}
			{/snippet}
		</EditableField>
	</div>
</div>
