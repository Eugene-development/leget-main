<script lang="ts">
	// Артикул: 1.19.1.1 — см. docs/architecture/component-articles-map.md
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
	itemsKey="categories"
	basePath="/stoleshnica"
	defaultTitle="Материалы столешниц"
	defaultItems={DEFAULT_MATERIALS}
	fabLabel="Материалы"
	emptyText="Материалы появятся здесь"
	accent="amber"
	cta={{
		title: 'Подбор столешницы',
		text: 'Поможем выбрать материал и рассчитать стоимость',
		button: 'Получить расчёт'
	}}
/>
