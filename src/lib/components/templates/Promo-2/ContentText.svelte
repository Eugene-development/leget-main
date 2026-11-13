<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	import { saveComponentData, saveLayoutData, type EditContext } from '$lib/utils/page-edit';
	import { readTextPath, updateTextPath, type TextPath } from './content-text';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		componentType,
		path,
		fallback = '',
		defaults = {},
		label = 'Текст',
		placeholder = '',
		multiline = false,
		richText = true,
		scope = 'page'
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
		componentType: string;
		path: TextPath;
		fallback?: unknown;
		defaults?: Record<string, unknown>;
		label?: string;
		placeholder?: string;
		multiline?: boolean;
		richText?: boolean;
		scope?: 'page' | 'Header' | 'Footer';
	} = $props();

	const value = $derived(editableText(readTextPath(data, path), String(fallback ?? '')));

	async function save(value: string) {
		if (!editContext) return;
		const updated = updateTextPath(data, path, value, defaults);
		if (scope === 'page') await saveComponentData(editContext, componentType, updated);
		else await saveLayoutData(editContext, scope, updated);
		data = updated;
	}
</script>

<EditableField
	fieldKey={`${componentType}.${path.join('.')}`}
	{label}
	{value}
	isEditable={isEditable && !!editContext}
	{multiline}
	{richText}
	inline
	onSave={save}
>
	{#snippet children(displayValue)}
		{#if isEditable && editContext && !displayValue.trim() && placeholder}
			<span>{placeholder}</span>
		{:else}
			<RichText value={displayValue} />
		{/if}
	{/snippet}
</EditableField>
