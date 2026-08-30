<script lang="ts">
	// Артикулы: 1.20.1.1, 1.28.1.1 — см. docs/architecture/component-articles-map.md
	// Разметку и поведение отдаёт общий CatalogSidebar. Бренды — справочник в БД
	// (категории рубрики «bytovaya-tehnika»), поэтому у пунктов есть тумблер
	// включения, как у категорий мебели.
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

	/**
	 * Демо-данные для превью без API. Рабочий список приходит из справочника,
	 * который синхронизируется из leget-db/config/catalog.php. Пустой ответ
	 * API остаётся пустым; тумблер работает только у записей с id.
	 */
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
	showDisabledBadge={false}
	canToggleItems
	itemNoun="бренд"
	settings={componentSettings}
	cta={{
		title: 'Подбор техники',
		text: 'Поможем выбрать бытовую технику под ваш проект',
		button: 'Подобрать технику'
	}}
/>

{#snippet componentSettings()}
	<SingleVersionSettings
		bind:data
		{editContext}
		{isEditable}
		componentType="ByttehnikaSidebar"
		resetId={componentId}
		placement="inline"
	/>
{/snippet}
