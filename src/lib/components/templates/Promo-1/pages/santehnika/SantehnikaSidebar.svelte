<script lang="ts">
	// Артикул: 1.21.1.1 — см. docs/architecture/component-articles-map.md
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

	/** Статика на случай пустого блока в БД — тот же список, что сейчас в справочнике. */
	const DEFAULT_BRANDS = [
		{ title: 'Blanco', slug: 'blanco' },
		{ title: 'Grohe', slug: 'grohe' },
		{ title: 'Hansgrohe', slug: 'hansgrohe' },
		{ title: 'Franke', slug: 'franke' },
		{ title: 'Omoikiri', slug: 'omoikiri' }
	];
</script>

<CatalogSidebar
	bind:data
	{editContext}
	{isEditable}
	componentType="SantehnikaSidebar"
	settings={componentSettings}
	itemsKey="brands"
	basePath="/santehnika"
	defaultTitle="Бренды"
	defaultItems={DEFAULT_BRANDS}
	fabLabel="Бренды"
	emptyText="Бренды появятся здесь"
	accent="sky"
	canToggleItems
	itemNoun="бренд"
	cta={{
		title: 'Подбор сантехники',
		text: 'Поможем выбрать мойку и смеситель под ваш проект',
		button: 'Подобрать комплект'
	}}
/>

{#snippet componentSettings()}
	<SingleVersionSettings
		bind:data
		{editContext}
		{isEditable}
		componentType="SantehnikaSidebar"
		resetId={componentId}
		placement="inline"
	/>
{/snippet}
