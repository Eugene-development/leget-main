<script lang="ts">
	// Артикул: 1.22.1.1 — см. docs/architecture/component-articles-map.md
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

	// Статики нет намеренно: справочник магазинов в БД пуст, и придумывать
	// записи здесь значило бы наплодить ссылки на несуществующие страницы.
	// До наполнения справочника сайдбар показывает пустое состояние.
</script>

<CatalogSidebar
	bind:data
	{editContext}
	{isEditable}
	componentType="FurnituraSidebar"
	itemsKey="shops"
	basePath="/furnitura"
	defaultTitle="Магазины фурнитуры"
	fabLabel="Магазины"
	emptyText="Магазины пока не добавлены"
	accent="amber"
	cta={{
		title: 'Премиум фурнитура',
		text: 'Blum, Hettich, Grass — официальные дилеры',
		button: 'Подобрать фурнитуру'
	}}
/>
