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
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}
</script>

<section class="bg-slate-50 px-6 py-24 text-center">
	<div class="mx-auto max-w-3xl">
		<EditableField
			fieldKey="Hero.title"
			label="Заголовок"
			value={String(data?.title ?? '')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h1 class="text-4xl font-bold text-slate-900 sm:text-5xl">{displayValue}</h1>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="Hero.subtitle"
			label="Подзаголовок"
			value={String(data?.subtitle ?? '')}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="mt-4 block"
		>
			{#snippet children(displayValue)}
				<p class="mt-4 text-xl text-slate-600">{displayValue}</p>
			{/snippet}
		</EditableField>
	</div>
</section>
