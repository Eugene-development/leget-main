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

<section class="relative overflow-hidden bg-ink-900 px-6 py-section text-on-dark sm:py-section-lg">
	<div
		class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_color-mix(in_oklab,var(--color-cat-11-800)_13.3%,transparent),_transparent_60%)]"
	></div>
	<div class="relative mx-auto max-w-4xl text-center">
		<EditableField
			fieldKey="Hero.title"
			label="Заголовок"
			value={String(data?.title ?? '')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h1 class="text-5xl sm:text-6xl lg:text-7xl">
					{displayValue}
				</h1>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="Hero.subtitle"
			label="Подзаголовок"
			value={String(data?.subtitle ?? '')}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="mt-6 block"
		>
			{#snippet children(displayValue)}
				<p class="mt-6 text-xl text-ink-300 sm:text-2xl">{displayValue}</p>
			{/snippet}
		</EditableField>
	</div>
</section>
