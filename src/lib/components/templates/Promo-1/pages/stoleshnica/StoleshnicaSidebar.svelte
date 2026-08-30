<script lang="ts">
	// Артикул: 1.19.1.1 — см. docs/architecture/component-articles-map.md
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
	const DEFAULT_MATERIALS = [
		{ title: 'Кварц', slug: 'kvarc' },
		{ title: 'Акриловый камень', slug: 'akril' },
		{ title: 'ДСП / Постформинг', slug: 'dsp' },
		{ title: 'Массив дерева', slug: 'massiv' },
		{ title: 'Керамика', slug: 'keramika' }
	];
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
	defaultItems={DEFAULT_MATERIALS}
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
