<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import RichText from '$lib/components/RichText.svelte';
	// Артикулы: 1.20.7.1, 1.28.4.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'ByttehnikaCTA', updated);
		data = updated;
	}
</script>

<CatalogCTA drawing="appliances" {sitePhone}>
	{#snippet title()}
		<EditableField
			fieldKey="ByttehnikaCTA.title"
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
			fieldKey="ByttehnikaCTA.description"
			label="Описание CTA"
			value={editableText(
				data.description,
				'Наши специалисты помогут подобрать технику под ваши задачи и бюджет'
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
			data-metrika-goal="pages_bytovaya_tehnika_byttehnikacta_open_1"
			data-goal-action="open"
			onclick={() => serviceOrderStore.open('appliance-selection')}
			type="button"
			class={buttonClass}
		>
			<EditableField
				fieldKey="ByttehnikaCTA.buttonText"
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
