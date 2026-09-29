<script lang="ts">
	// Артикул: 1.32.4.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import Catalog from '$lib/university/Catalog.svelte';
	import CertificateVerifier from '$lib/university/CertificateVerifier.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { universityProgram as defaults } from './content';
	import '../../theme.css';
	import './university.css';

	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();
	const isLight = $derived(isLightBlock(data, 'light'));
	async function saveField(field: keyof typeof defaults, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'UniversityProgram', updated);
		data = updated;
	}
</script>

{#snippet field(key: keyof typeof defaults, label: string)}
	<EditableField
		fieldKey="UniversityProgram.{key}"
		{label}
		value={String(data[key] ?? defaults[key])}
		{isEditable}
		inline
		onSave={(value) => saveField(key, value)}
	>
		{#snippet children(value)}<RichText {value} />{/snippet}
	</EditableField>
{/snippet}

<section
	class="uni uni-program p1-surface-paper"
	data-p1-theme={isLight ? 'light' : 'dark'}
	aria-label="Учебная программа"
>
	<div class="uni-wrap">
		<Catalog>
			{#snippet heading()}{@render field('title', 'Заголовок программы')}{/snippet}
			{#snippet description()}{@render field('description', 'Описание программы')}{/snippet}
		</Catalog>
		<CertificateVerifier />
	</div>
</section>
