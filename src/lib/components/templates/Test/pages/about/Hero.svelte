<script lang="ts">
	import RichText from '$lib/components/RichText.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { blockTheme } from '$lib/utils/block-theme';
	import '../../../Promo-1/theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const theme = $derived(blockTheme(data, 'dark'));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}
</script>

<section
	class="p1-surface-alt relative flex min-h-[70vh] items-center justify-center px-6 py-32 text-center"
	data-p1-theme={theme}
>
	<ImageFallback
		imagePath={['backgroundImage']}
		src={String(data?.backgroundImage ?? '')}
		alt="Фон первого экрана"
		class="absolute inset-0 h-full w-full object-cover"
	/>
	{#if data?.backgroundImage}
		<div class="bg-scrim/60 pointer-events-none absolute inset-0" aria-hidden="true"></div>
	{/if}

	<div
		class="ds-media-panel relative z-10 max-w-4xl"
		data-ds-surface={theme}
		style:background-color="var(--p1-surface)"
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
					<h1 class="p1-title text-5xl sm:text-6xl md:text-7xl">
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
				class="mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="ds-copy mt-6 text-xl sm:text-2xl">
						<RichText value={displayValue} />
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
						class="ds-action mt-10 inline-block rounded-full px-8 py-3 text-lg font-semibold shadow-lg transition"
					>
						<RichText value={displayValue} />
					</a>
				{/snippet}
			</EditableField>
		{/if}
	</div>
</section>
