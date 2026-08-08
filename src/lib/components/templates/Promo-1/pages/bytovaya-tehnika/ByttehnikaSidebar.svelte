<script lang="ts">
	// Артикул: 1.20.1.1 — см. docs/architecture/component-articles-map.md
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
		{ title: 'Bosch', slug: 'bosch' },
		{ title: 'Siemens', slug: 'siemens' },
		{ title: 'Electrolux', slug: 'electrolux' },
		{ title: 'Hansa', slug: 'hansa' },
		{ title: 'Gorenje', slug: 'gorenje' }
	];
</script>

<CatalogSidebar
	bind:data
	{editContext}
	{isEditable}
	componentType="ByttehnikaSidebar"
	itemsKey="brands"
	basePath="/bytovaya-tehnika"
	defaultTitle="Бренды"
	defaultItems={DEFAULT_BRANDS}
	fabLabel="Бренды"
	emptyText="Бренды появятся здесь"
	accent="sky"
	cta={{
		title: 'Подбор техники',
		text: 'Поможем выбрать бытовую технику под ваш проект',
		button: 'Подобрать технику'
	}}
/>
