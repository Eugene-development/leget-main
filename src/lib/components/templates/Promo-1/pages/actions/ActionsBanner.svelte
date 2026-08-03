<script lang="ts">
	// Артикул: 1.4.4.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import BlockThemeToggle from '$lib/components/BlockThemeToggle.svelte';
	import { createThemeToggle, isLightBlock } from '$lib/utils/block-theme';
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

	// Тема блока: нейтральная палитра идёт из семантических классов p1-*,
	// акценты (красный) от темы не зависят.
	const isLight = $derived(isLightBlock(data, 'light'));
	const toggleTheme = createThemeToggle({
		type: 'ActionsBanner',
		fallback: 'light',
		getData: () => data,
		setData: (next) => (data = next),
		getContext: () => editContext
	});

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ActionsBanner', updated);
		data = updated;
	}
</script>

<section class="p1-surface-alt relative py-24 sm:py-32" data-p1-theme={isLight ? 'light' : 'dark'}>
	<BlockThemeToggle {isLight} onToggle={toggleTheme} {isEditable} {editContext} />

	<div class="mx-auto max-w-5xl px-6 lg:px-8">
		<div class="overflow-hidden rounded-3xl">
			<EditableField
				fieldKey="ActionsBanner.imageUrl"
				label="URL изображения"
				value={String(data?.imageUrl ?? '')}
				{isEditable}
				onSave={(v) => saveField('imageUrl', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					{#if displayValue}
						<img
							loading="lazy"
							alt={String(data?.imageAlt ?? 'Акция')}
							src={displayValue}
							class="w-full object-cover"
						/>
					{/if}
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
