<script lang="ts">
	import RichText from '$lib/components/RichText.svelte';
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

<div class="bg-white px-6 py-16">
	<div class="mx-auto prose prose-lg max-w-3xl text-stone-700">
		<EditableField
			legacyHtml
			fieldKey="Text.content"
			label="Текст"
			value={String(data?.content ?? '')}
			{isEditable}
			multiline
			onSave={(v) => saveField('content', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<RichText value={displayValue} legacyHtml />
			{/snippet}
		</EditableField>
	</div>
</div>
