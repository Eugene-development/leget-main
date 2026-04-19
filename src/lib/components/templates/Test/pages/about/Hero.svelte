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
	class="relative flex min-h-[70vh] items-center justify-center px-6 py-32 text-center bg-linear-to-br from-indigo-900 to-purple-800"
	style={data?.backgroundImage ? `background-image: url('${data.backgroundImage}'); background-size: cover; background-position: center;` : ''}
>
	{#if data?.backgroundImage}
		<div class="absolute inset-0 bg-indigo-900/60"></div>
	{/if}

	<div class="relative z-10 max-w-4xl">
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
					<h1 class="text-5xl font-extrabold text-white tracking-tight sm:text-6xl md:text-7xl drop-shadow-lg">
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
				class="mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="mt-6 text-xl text-indigo-200 sm:text-2xl">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>
		{/if}

		{#if data?.cta || isEditable}
			<EditableField
				fieldKey="Hero.cta"
				label="Кнопка (текст)"
				value={String(data?.cta ?? '')}
				{isEditable}
				onSave={(v) => saveField('cta', v)}
				class="mt-10 inline-block"
			>
				{#snippet children(displayValue)}
					<a
						href={String(data?.ctaUrl ?? '#')}
						class="mt-10 inline-block rounded-full bg-white px-8 py-3 text-lg font-semibold text-indigo-900 shadow-lg hover:bg-indigo-50 transition"
					>
						{displayValue}
					</a>
				{/snippet}
			</EditableField>
		{/if}
	</div>
</section>
