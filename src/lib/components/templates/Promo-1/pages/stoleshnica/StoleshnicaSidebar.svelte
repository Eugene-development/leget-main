<script lang="ts">
	// Артикулы: 1.19.1.1, 1.29.1.1, 1.30.1.1 — см. docs/architecture/component-articles-map.md
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
</script>

<CatalogSidebar
	bind:data
	{editContext}
	{isEditable}
	componentType="StoleshnicaSidebar"
	settings={componentSettings}
	itemsKey="categories"
	basePath="/stoleshnica"
	defaultTitle="Материалы столешниц"
	nestedBrands
	fabLabel="Материалы"
	emptyText="Материалы появятся здесь"
	accent="amber"
	canToggleItems
	itemNoun="материал"
	cta={{
		title: 'Подбор столешницы',
		text: 'Поможем выбрать материал и рассчитать стоимость',
		button: 'Получить расчёт'
	}}
/>

{#snippet componentSettings()}
	<SingleVersionSettings
		bind:data
		{editContext}
		{isEditable}
		componentType="StoleshnicaSidebar"
		resetId={componentId}
		placement="inline"
	/>
{/snippet}
