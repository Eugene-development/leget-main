<script lang="ts">
	// Артикул: 1.2.7.2 — см. docs/architecture/component-articles-map.md
	import QuoteMark from '../QuoteMark.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
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

	const isLight = $derived(isLightBlock(data, 'light'));
	async function saveContent(value: string) {
		if (!editContext) return;
		const updated = { ...data, content: value };
		await saveComponentData(editContext, 'Text', updated);
		data = updated;
	}

	const content = $derived(String(data?.content ?? ''));
</script>

{#if content.trim() || isEditable}
	<section
		class="p1-surface-alt px-5 py-section-2xs sm:px-8 sm:py-section-xs lg:py-section-sm"
		data-p1-theme={isLight ? 'light' : 'dark'}
	>
		<div class="p1-paper p1-border sheet rounded-3xl border">
			<div class="sheet-mark"><QuoteMark /></div>
			<div class="sheet-copy ds-prose p1-prose prose">
				<EditableField
					legacyHtml
					fieldKey="Text.content"
					label="Текст"
					value={content}
					{isEditable}
					multiline
					onSave={saveContent}
					class="block"
				>
					{#snippet children(displayValue)}
						<div class="ds-prose-content"><RichText value={displayValue} legacyHtml /></div>
					{/snippet}
				</EditableField>
			</div>
		</div>
	</section>
{/if}

<style>
	.sheet {
		display: grid;
		gap: 1.25rem;
		max-inline-size: 64rem;
		margin-inline: auto;
		padding: clamp(1.5rem, 5vw, 5rem);
	}

	.sheet-mark {
		inline-size: clamp(2rem, 5vw, 4rem);
		aspect-ratio: 4 / 3;
		color: var(--p1-accent);
	}

	.sheet-copy {
		min-inline-size: 0;
		max-inline-size: 65ch;
	}

	/* RichText оставляет всё содержимое одним редактируемым полем. */
	.sheet-copy
		:global(
			.rich-text > .rt-paragraph:first-child:has(~ :is(.rt-paragraph, .rt-ul, .rt-ol, .rt-quote))
		) {
		padding-block-end: var(--ds-space-prose-paragraph);
		margin-block-end: var(--ds-space-prose-paragraph);
		border-block-end: 1px solid var(--p1-line);
	}

	@media (min-width: 48rem) {
		.sheet {
			grid-template-columns: auto minmax(0, 1fr);
			column-gap: clamp(2rem, 5vw, 5rem);
			align-items: start;
		}
	}
</style>
