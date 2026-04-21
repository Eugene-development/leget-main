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
		await saveComponentData(editContext, 'CTA', updated);
		data = updated;
	}
</script>

<section class="bg-slate-900 px-6 py-20 text-center text-white">
	<div class="mx-auto max-w-2xl">
		<EditableField
			fieldKey="CTA.title"
			label="Заголовок"
			value={String(data?.title ?? '')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="text-3xl font-bold sm:text-4xl">{displayValue}</h2>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="CTA.buttonText"
			label="Текст кнопки"
			value={String(data?.buttonText ?? 'Написать')}
			{isEditable}
			onSave={(v) => saveField('buttonText', v)}
			class="mt-8 inline-block"
		>
			{#snippet children(displayValue)}
				<a
					href="/contact"
					class="mt-8 inline-block rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
				>
					{displayValue}
				</a>
			{/snippet}
		</EditableField>
	</div>
</section>
