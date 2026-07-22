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
		await saveComponentData(editContext, 'Mission', updated);
		data = updated;
	}
</script>

<div class="bg-white py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
			<div>
				<EditableField
					fieldKey="Mission.title"
					label="Заголовок"
					value={String(data?.title ?? 'Наша миссия')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="text-3xl font-bold text-slate-900">{displayValue}</h2>
					{/snippet}
				</EditableField>

				<div class="mt-6 h-1 w-20 rounded-full bg-red-500"></div>

				<EditableField
					fieldKey="Mission.text1"
					label="Абзац 1"
					value={String(data?.text1 ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('text1', v)}
					class="mt-6 block"
				>
					{#snippet children(displayValue)}
						{#if displayValue}
							<p class="mt-6 text-lg text-slate-600">{displayValue}</p>
						{/if}
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Mission.text2"
					label="Абзац 2"
					value={String(data?.text2 ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('text2', v)}
					class="mt-4 block"
				>
					{#snippet children(displayValue)}
						{#if displayValue}
							<p class="mt-4 text-lg text-slate-600">{displayValue}</p>
						{/if}
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Mission.text3"
					label="Абзац 3"
					value={String(data?.text3 ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('text3', v)}
					class="mt-4 block"
				>
					{#snippet children(displayValue)}
						{#if displayValue}
							<p class="mt-4 text-lg text-slate-600">{displayValue}</p>
						{/if}
					{/snippet}
				</EditableField>
			</div>

			<div class="mt-12 lg:mt-0">
				<EditableField
					fieldKey="Mission.imageUrl"
					label="URL изображения"
					value={String(data?.imageUrl ?? '')}
					{isEditable}
					onSave={(v) => saveField('imageUrl', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						{#if displayValue}
							<img loading="lazy" src={displayValue} alt="" class="w-full rounded-2xl shadow-xl">
						{/if}
					{/snippet}
				</EditableField>
			</div>
		</div>
	</div>
</div>
