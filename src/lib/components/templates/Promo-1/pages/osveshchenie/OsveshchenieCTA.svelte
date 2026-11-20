<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	// Артикулы: 1.35.4.1, 1.37.4.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'OsveshchenieCTA', updated);
		data = updated;
	}
</script>

<CatalogCTA drawing="lighting" {sitePhone}>
	{#snippet title()}
		<EditableField
			fieldKey="OsveshchenieCTA.title"
			label="Заголовок CTA"
			value={editableText(data.title, 'Нужна помощь с выбором?')}
			{isEditable}
			inline
			onSave={(v) => saveField('title', v)}
		>
			{#snippet children(val)}<RichText value={val} />{/snippet}
		</EditableField>
	{/snippet}
	{#snippet description()}
		<EditableField
			fieldKey="OsveshchenieCTA.description"
			label="Описание CTA"
			value={editableText(
				data.description,
				'Наши специалисты помогут подобрать светильники под ваш интерьер и бюджет'
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
			data-metrika-goal="pages_osveshchenie_osveshcheniecta_open_1"
			data-goal-label="Получить консультацию — освещение"
			data-goal-action="open"
			onclick={() => serviceOrderStore.open('consultation')}
			type="button"
			class={buttonClass}
		>
			<EditableField
				fieldKey="OsveshchenieCTA.buttonText"
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
