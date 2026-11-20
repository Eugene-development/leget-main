<script lang="ts">
	import RichText from '$lib/components/RichText.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
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

<section class="relative flex min-h-[60vh] items-center justify-center px-6 py-24 text-center">
	<ImageFallback
		imagePath={['backgroundImage']}
		src={String(data?.backgroundImage ?? '')}
		alt="Фон первого экрана"
		class="absolute inset-0 h-full w-full object-cover"
	/>
	{#if data?.backgroundImage}
		<div class="absolute inset-0 bg-black/50"></div>
	{/if}

	<div
		class="ds-media-panel relative z-10 max-w-3xl"
		data-ds-surface={data?.backgroundImage ? 'dark' : 'surface'}
		style={data?.backgroundImage ? 'background:var(--ds-dark-surface)' : undefined}
	>
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
					<h1 class="ds-accent text-4xl sm:text-5xl md:text-6xl">
						<RichText value={displayValue} />
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
					<p class="ds-copy mt-4 text-lg sm:text-xl">
						<RichText value={displayValue} />
					</p>
				{/snippet}
			</EditableField>
		{/if}
	</div>
</section>
