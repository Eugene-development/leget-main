<script lang="ts">
	// Артикулы: 1.21.1.1, 1.31.1.1 — см. docs/architecture/component-articles-map.md
	// Разметку и поведение отдаёт общий CatalogSidebar. Бренды — справочник в БД
	// (категории рубрики «santehnika»), поэтому у пунктов есть тумблер
	// включения, как у брендов бытовой техники.
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
		{ title: 'Blanco', slug: 'blanco' },
		{ title: 'Grohe', slug: 'grohe' },
		{ title: 'Hansgrohe', slug: 'hansgrohe' },
		{ title: 'Franke', slug: 'franke' },
		{ title: 'Omoikiri', slug: 'omoikiri' },
		{ title: 'EMAR', slug: 'emar' },
		{ title: 'Florentina', slug: 'florentina' },
		{ title: 'Paulmark', slug: 'paulmark' },
		{ title: 'Pereal', slug: 'pereal' }
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
	showDisabledBadge={false}
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
