<script lang="ts">
	// Артикул: 1.23.1.1 — см. docs/architecture/component-articles-map.md
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
		{ title: 'Italon', slug: 'italon' },
		{ title: 'Kerama Marazzi', slug: 'kerama-marazzi' },
		{ title: 'Atlas Concorde', slug: 'atlas-concorde' },
		{ title: 'Estima', slug: 'estima' }
	];
</script>

<CatalogSidebar
	bind:data
	{editContext}
	{isEditable}
	componentType="PliitkaSidebar"
	settings={componentSettings}
	itemsKey="brands"
	basePath="/plitka"
	defaultTitle="Бренды"
	defaultItems={DEFAULT_BRANDS}
	fabLabel="Бренды"
	emptyText="Бренды появятся здесь"
	accent="sky"
	canToggleItems
	itemNoun="бренд"
	cta={{
		title: 'Подбор плитки',
		text: 'Поможем выбрать плитку под ваш дизайн-проект',
		button: 'Подобрать плитку'
	}}
/>

{#snippet componentSettings()}
	<SingleVersionSettings
		bind:data
		{editContext}
		{isEditable}
		componentType="PliitkaSidebar"
		resetId={componentId}
		placement="inline"
	/>
{/snippet}
