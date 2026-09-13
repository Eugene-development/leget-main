<script lang="ts">
	// Артикул: 1.2.7.1 — см. docs/architecture/component-articles-map.md
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

	// Тема блока: нейтральная палитра — из классов p1-*, акценты не зависят от темы.
	const isLight = $derived(isLightBlock(data, 'light'));
	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Text', updated);
		data = updated;
	}

	const content = $derived(String(data?.content ?? '').trim());
</script>

<!-- Пустой блок скрыт на сайте; в редакторе поле остаётся доступным. -->
{#if content || isEditable}
	<section
		class="p1-surface-alt py-section-xs sm:py-section-sm"
		data-p1-theme={isLight ? 'light' : 'dark'}
	>
		<div class="mx-auto max-w-3xl px-6 lg:px-8">
			<div class="ds-prose p1-prose mx-auto prose max-w-[65ch]">
				<EditableField
					legacyHtml
					fieldKey="Text.content"
					label="Текст"
					value={String(data?.content ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('content', v)}
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
