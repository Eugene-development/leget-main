<script lang="ts">
	// Артикулы: 1.28.5.1, 1.31.5.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import '../../theme.css';

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
	const title = $derived(String(data.title || 'О бренде'));
	const description = $derived(String(data.description || ''));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'BrandAbout', updated);
		data = updated;
	}
</script>

{#if title || description || isEditable}
	<section class="p1-catalog-container mt-6" data-p1-theme={isLight ? 'light' : 'dark'}>
		<div
			class="p1-catalog-panel p1-surface-alt grid gap-5 px-8 py-9 sm:px-10 sm:py-10 md:grid-cols-[minmax(180px,0.35fr)_minmax(0,0.65fr)] md:gap-10 lg:px-12"
		>
			<h2 class="p1-title text-2xl sm:text-3xl">
				<EditableField
					fieldKey="BrandAbout.title"
					label="Заголовок"
					value={title}
					{isEditable}
					inline
					onSave={(value) => saveField('title', value)}
				>
					{#snippet children(value)}<RichText {value} />{/snippet}
				</EditableField>
			</h2>

			<div class="ds-prose p1-prose max-w-[65ch]">
				<EditableField
					fieldKey="BrandAbout.description"
					label="Описание бренда"
					value={description}
					{isEditable}
					multiline
					onSave={(value) => saveField('description', value)}
					class="block"
				>
					{#snippet children(value)}
						<div class="ds-prose-content p1-body text-lg"><RichText {value} /></div>
					{/snippet}
				</EditableField>
			</div>
		</div>
	</section>
{/if}
