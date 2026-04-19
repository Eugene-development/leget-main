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

<div class="prose prose-lg mx-auto max-w-3xl px-6 py-12">
	{#if data?.content || isEditable}
		<EditableField
			value={String(data?.content ?? '')}
			{isEditable}
			multiline
			onSave={(v) => saveField('content', v)}
			class="block"
		>
			{#if data?.content}
				{@html data.content}
			{/if}
		</EditableField>
	{/if}
</div>
