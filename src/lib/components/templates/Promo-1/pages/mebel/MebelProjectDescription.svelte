<script lang="ts">
	// Артикул: 1.18.3.1 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
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

	const description = $derived(data.description || '');

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelProjectDescription', updated);
		data = updated;
	}
</script>

<div class="mebel-container mt-16">
	<div class="rounded-2xl border border-ink-50 bg-surface-raised p-8 shadow-sm sm:p-12">
		<h2 class="text-2xl text-ink-900">Описание проекта</h2>

		<div class="prose mt-8 max-w-none leading-relaxed text-ink-600 prose-slate">
			{#if isEditable}
				<EditableField
					legacyHtml
					fieldKey="MebelProjectDescription.description"
					label="Описание"
					value={description}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
				>
					{#snippet children(val)}
						<RichText value={val || 'Добавьте описание проекта...'} legacyHtml />
					{/snippet}
				</EditableField>
			{:else}
				<RichText value={description} legacyHtml />
			{/if}
		</div>
	</div>
</div>

<style>
	.mebel-container {
		max-width: 1536px;
		margin-left: auto;
		margin-right: auto;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	@media (min-width: 1024px) {
		.mebel-container {
			padding-left: 360px;
		}
	}
</style>
