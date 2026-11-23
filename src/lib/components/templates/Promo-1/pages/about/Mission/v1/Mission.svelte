<script lang="ts">
	// Артикул: 1.2.3.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { editableText } from '$lib/utils/editable-text';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import '../../../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const headingId = $props.id();
	const isLight = $derived(isLightBlock(data, 'light'));
	const title = $derived(editableText(data?.title, 'Наша миссия'));
	const lead = $derived(editableText(data?.text1));
	const details = $derived(
		[
			{ key: 'text2', label: 'Абзац 2', value: editableText(data?.text2) },
			{ key: 'text3', label: 'Абзац 3', value: editableText(data?.text3) }
		].filter((paragraph) => paragraph.value.trim() || isEditable)
	);
	const imageUrl = $derived(editableText(data?.imageUrl).trim());
	const showImage = $derived(Boolean(imageUrl) || isEditable);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Mission', updated);
		data = updated;
	}
</script>

{#snippet paragraph(key: string, label: string, value: string)}
	<EditableField
		fieldKey="Mission.{key}"
		{label}
		{value}
		{isEditable}
		multiline
		onSave={(v) => saveField(key, v)}
		class="block min-w-0"
	>
		{#snippet children(displayValue)}
			{#if displayValue.trim()}
				<div class="p1-body max-w-[65ch] text-prose wrap-anywhere"><RichText value={displayValue} /></div>
			{:else if isEditable}
				<p class="p1-border p1-body rounded-lg border border-dashed px-4 py-3 text-sm/6">
					Добавьте {label.toLowerCase()}
				</p>
			{/if}
		{/snippet}
	</EditableField>
{/snippet}

{#if title.trim() || lead.trim() || details.length || showImage}
	<section
		class="p1-surface py-section-2xs sm:py-section-xs lg:py-section-sm"
		data-p1-theme={isLight ? 'light' : 'dark'}
		aria-labelledby={title.trim() ? headingId : undefined}
	>
		<div class="mission-layout mx-auto max-w-7xl px-5 sm:px-8" class:with-image={showImage}>
			{#if title.trim() || lead.trim() || isEditable}
				<div class="mission-intro grid min-w-0 gap-5">
					{#if title.trim() || isEditable}
						<EditableField
							fieldKey="Mission.title"
							label="Заголовок"
							value={title}
							{isEditable}
							onSave={(v) => saveField('title', v)}
							class="block min-w-0"
						>
							{#snippet children(displayValue)}
								{#if displayValue.trim()}
									<h2
										id={headingId}
										class="p1-title text-section-title text-balance wrap-anywhere"
									>
										<RichText value={displayValue} />
									</h2>
								{:else if isEditable}
									<p class="p1-border p1-body rounded-lg border border-dashed px-4 py-3 text-sm/6">
										Добавьте заголовок
									</p>
								{/if}
							{/snippet}
						</EditableField>
					{/if}
					{#if lead.trim() || isEditable}
						{@render paragraph('text1', 'Абзац 1', lead)}
					{/if}
				</div>
			{/if}
			{#if showImage}
				<div class="mission-media p1-body min-w-0">
					<ImageFallback
						src={imageUrl}
						imagePath={['imageUrl']}
						alt=""
						loading="lazy"
						decoding="async"
						class="block aspect-4/3 w-full rounded-3xl object-cover"
					/>
				</div>
			{/if}
			{#if details.length}
				<div class="mission-details grid min-w-0 gap-4">
					{#each details as detail (detail.key)}
						{@render paragraph(detail.key, detail.label, detail.value)}
					{/each}
				</div>
			{/if}
		</div>
	</section>
{/if}

<style>
	.mission-layout {
		display: grid;
	}

	.mission-layout > * + * {
		margin-block-start: var(--ds-space-prose-paragraph);
	}

	.mission-layout:not(.with-image),
	.mission-layout:not(:has(.mission-intro, .mission-details)) {
		max-inline-size: 48rem;
	}

	@media (min-width: 64rem) {
		.mission-layout.with-image:has(.mission-intro, .mission-details) {
			grid-template-areas: '. media' 'intro media' 'details media' '. media';
			grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
			grid-template-rows: 1fr auto auto 1fr;
			column-gap: clamp(2.5rem, 5vw, 5rem);
		}

		.with-image .mission-intro {
			grid-area: intro;
		}

		.with-image:has(.mission-intro, .mission-details) .mission-media {
			grid-area: media;
			align-self: center;
			margin-block-start: 0;
		}

		.with-image .mission-details {
			grid-area: details;
		}

		.with-image:not(:has(.mission-intro)) .mission-details {
			margin-block-start: 0;
		}
	}
</style>
