<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { resolveFacades } from './data';
	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		index,
		field,
		detail = false,
		multiline = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
		index: number;
		field: string;
		detail?: boolean;
		multiline?: boolean;
	} = $props();
	const facade = $derived(resolveFacades(data)[index]);
	const value = $derived(
		String(
			detail
				? (facade?.details[field as keyof typeof facade.details] ?? '')
				: (facade?.[field as 'title' | 'description'] ?? '')
		)
	);
	async function save(value: string) {
		if (!editContext) return;
		const facades = resolveFacades(data).map((item, i) =>
			i !== index
				? item
				: detail
					? { ...item, details: { ...item.details, [field]: value } }
					: { ...item, [field]: value }
		);
		const updated = { ...data, facades };
		await saveComponentData(editContext, 'FacadesCatalog', updated);
		data = updated;
	}
</script>

<EditableField
	fieldKey={`FacadesCatalog.facades.${index}.${detail ? 'details.' : ''}${field}`}
	label="Содержание материала"
	{value}
	{isEditable}
	{multiline}
	inline={!multiline}
	onSave={save}
>
	{#snippet children(displayValue)}<RichText value={displayValue} />{/snippet}
</EditableField>
