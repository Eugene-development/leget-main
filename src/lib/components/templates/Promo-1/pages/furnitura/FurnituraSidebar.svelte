<script lang="ts">
	// Артикулы: 1.22.1.1, 1.36.1.1 — см. docs/architecture/component-articles-map.md
	// Разметку и поведение отдаёт общий CatalogSidebar.
	import SingleVersionSettings from '$lib/components/SingleVersionSettings.svelte';
	import { type EditContext } from '$lib/utils/page-edit';
	import CatalogSidebar from '../_shared/CatalogSidebar.svelte';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		componentId = null
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
		componentId?: string | null;
	} = $props();

	// Список магазинов приходит из справочника рубрики furnitura через RenderPage.
</script>

<CatalogSidebar
	bind:data
	{editContext}
	{isEditable}
	componentType="FurnituraSidebar"
	settings={componentSettings}
	itemsKey="shops"
	basePath="/furnitura"
	defaultTitle="Магазины фурнитуры"
	fabLabel="Магазины"
	emptyText="Магазины пока не добавлены"
	accent="amber"
	canToggleItems
	itemNoun="магазин"
	cta={{
		title: 'Премиум фурнитура',
		text: 'Blum, Hettich, Grass — официальные дилеры',
		button: 'Подобрать фурнитуру'
	}}
/>

{#snippet componentSettings()}
	<SingleVersionSettings
		bind:data
		{editContext}
		{isEditable}
		componentType="FurnituraSidebar"
		resetId={componentId}
		placement="inline"
	/>
{/snippet}
