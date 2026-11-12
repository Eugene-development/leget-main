<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		field,
		label,
		fallback = '',
		multiline = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
		field: string;
		label: string;
		fallback?: string;
		multiline?: boolean;
	} = $props();

	async function save(value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}
</script>

<EditableField
	fieldKey={`Hero.${field}`}
	{label}
	value={editableText(data?.[field], fallback)}
	{isEditable}
	{multiline}
	inline={!multiline}
	onSave={save}
>
	{#snippet children(displayValue)}<RichText value={displayValue} />{/snippet}
</EditableField>
