<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	// Артикулы: 1.22.4.1, 1.36.4.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'FurnituraCTA', updated);
		data = updated;
	}
</script>

<CatalogCTA drawing="hardware" {sitePhone} showDesktopPhone>
	{#snippet title()}
		<EditableField
			fieldKey="FurnituraCTA.title"
			label="Заголовок CTA"
			value={editableText(data.title, 'Подберём фурнитуру под ваш проект')}
			{isEditable}
			inline
			onSave={(v) => saveField('title', v)}
		>
			{#snippet children(val)}<RichText value={val} />{/snippet}
		</EditableField>
	{/snippet}
	{#snippet description()}
		<EditableField
			fieldKey="FurnituraCTA.description"
			label="Описание CTA"
			value={editableText(
				data.description,
				'Поможем выбрать оптимальное решение с учётом бюджета и требований к мебели'
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
			data-metrika-goal="pages_furnitura_furnituracta_open_1"
			data-goal-action="open"
			onclick={() => serviceOrderStore.open('consultation')}
			type="button"
			class={buttonClass}
		>
			<EditableField
				fieldKey="FurnituraCTA.buttonText"
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
