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

<section
	class="relative flex min-h-[60vh] items-center justify-center px-6 py-24 text-center"
	style={data?.backgroundImage ? `background-image: url('${data.backgroundImage}'); background-size: cover; background-position: center;` : ''}
>
	{#if data?.backgroundImage}
		<div class="absolute inset-0 bg-black/50"></div>
	{/if}

	<div class="relative z-10 max-w-3xl">
		{#if data?.title || isEditable}
			<EditableField
				fieldKey="Hero.title"
				label="Заголовок"
				value={String(data?.title ?? '')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h1
						class="text-4xl font-bold text-red-700 tracking-tight sm:text-5xl md:text-6xl"
						class:text-white={data?.backgroundImage}
					>
						{displayValue}
					</h1>
				{/snippet}
			</EditableField>
		{/if}

		{#if data?.subtitle || isEditable}
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
					<p
						class="mt-4 text-lg sm:text-xl"
						class:text-gray-200={data?.backgroundImage}
						class:text-gray-600={!data?.backgroundImage}
					>
						{displayValue}
					</p>
				{/snippet}
			</EditableField>
		{/if}
	</div>
</section>
