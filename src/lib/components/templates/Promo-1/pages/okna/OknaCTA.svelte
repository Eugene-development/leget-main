<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	// Артикулы: 1.40.7.1, 1.41.5.1 — см. docs/architecture/component-articles-map.md
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import RichText from '$lib/components/RichText.svelte';

	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import CatalogCTA from '../_shared/CatalogCTA.svelte';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		sitePhone = null
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
		sitePhone?: string | null;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'OknaCTA', updated);
		data = updated;
	}
</script>

<CatalogCTA drawing="windows" {sitePhone}>
	{#snippet title()}
		<EditableField
			fieldKey="OknaCTA.title"
			label="Заголовок CTA"
			value={editableText(data.title, 'Нужна помощь в выборе?')}
			{isEditable}
			inline
			onSave={(v) => saveField('title', v)}
		>
			{#snippet children(val)}<RichText value={val} />{/snippet}
		</EditableField>
	{/snippet}
	{#snippet description()}
		<EditableField
			fieldKey="OknaCTA.description"
			label="Описание CTA"
			value={editableText(
				data.description,
				'Наши специалисты помогут подобрать окна под ваши задачи и бюджет'
			)}
			{isEditable}
			inline
			multiline
			onSave={(v) => saveField('description', v)}
		>
			{#snippet children(val)}<RichText value={val} />{/snippet}
		</EditableField>
	{/snippet}
	{#snippet action(buttonClass)}
		<button
			data-metrika-goal="pages_okna_oknacta_open_1"
			data-goal-action="open"
			onclick={() => serviceOrderStore.open('consultation')}
			type="button"
			class={buttonClass}
		>
			<EditableField
				fieldKey="OknaCTA.buttonText"
				label="Текст кнопки"
				value={editableText(data.buttonText, 'Получить консультацию')}
				{isEditable}
				inline
				onSave={(v) => saveField('buttonText', v)}
			>
				{#snippet children(val)}<RichText value={val} />{/snippet}
			</EditableField>
		</button>
	{/snippet}
</CatalogCTA>
