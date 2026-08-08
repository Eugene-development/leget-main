<script lang="ts">
	// Артикул: 1.21.1.1 — см. docs/architecture/component-articles-map.md
	// Разметку и поведение отдаёт общий CatalogSidebar.
	import { type EditContext } from '$lib/utils/page-edit';
	import CatalogSidebar from '../_shared/CatalogSidebar.svelte';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
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
	itemsKey="brands"
	basePath="/santehnika"
	defaultTitle="Бренды"
	defaultItems={DEFAULT_BRANDS}
	fabLabel="Бренды"
	emptyText="Бренды появятся здесь"
	accent="sky"
	cta={{
		title: 'Подбор сантехники',
		text: 'Поможем выбрать мойку и смеситель под ваш проект',
		button: 'Подобрать комплект'
	}}
/>
