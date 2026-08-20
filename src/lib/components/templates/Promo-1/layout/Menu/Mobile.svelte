<script lang="ts">
	import MobileMenuV1 from './v1/MobileMenu.svelte';
	import MobileMenuV2 from './v2/MobileMenu.svelte';
	import MobileMenuV3 from './v3/MobileMenu.svelte';
	import MobileMenuV4 from './v4/MobileMenu.svelte';
	import type { CatalogItem } from '../catalogItems';
	import type { ServiceItem } from '../serviceItems';

	// Мобильное меню (хэдер Promo-1) — та же навигация, что в `Menu/index.svelte`,
	// на узком экране. Версию НЕ выбирает: читает ту же `data.menuVersion`, что
	// и десктопное меню, поэтому переключатель в SideDrawer меняет обе стороны
	// разом, а мобильный вариант не может разойтись с десктопным.
	//
	// Собственного артикула у мобильных вариантов нет: `v1/MobileMenu.svelte` —
	// вторая половина версии `1.М.1.1`, а не отдельный компонент. Раздел «М»
	// (тип Header) остаётся одним, номера версий общие.
	//
	// Данные приходят пропсами из Header.svelte — те же, что у десктопной
	// половины, плюс список городов: на узком экране выбор города живёт в меню,
	// а не отдельной кнопкой в шапке.
	let {
		data = {},
		links = [],
		visibleCatalogItems = [],
		visibleServiceItems = [],
		disabledRubrics = [],
		disabledServices = [],
		cities = [],
		isEditable = false,
		onToggleRubric,
		onToggleService
	}: {
		data: Record<string, unknown>;
		links: { href: string; label: string }[];
		visibleCatalogItems: CatalogItem[];
		visibleServiceItems: ServiceItem[];
		disabledRubrics: string[];
		disabledServices: string[];
		cities: { label: string }[];
		isEditable: boolean;
		onToggleRubric: (href: string, currentEnabled: boolean, e: Event) => void;
		onToggleService: (href: string, currentEnabled: boolean, e: Event) => void;
	} = $props();

	type MenuVersion = 'v1' | 'v2' | 'v3' | 'v4';

	// Версия читается выражением, а не эффектом: на сервере эффекты не идут, и
	// SSR отдавал бы v1 независимо от данных — на живых сайтах это подмена
	// варианта после гидратации (тот же разбор, что в `Menu/index.svelte`).
	const version = $derived<MenuVersion>((data?.menuVersion as MenuVersion) ?? 'v1');
</script>

{#if version === 'v4'}
	<MobileMenuV4
		{links}
		{visibleCatalogItems}
		{visibleServiceItems}
		{disabledRubrics}
		{disabledServices}
		{cities}
		{isEditable}
		{onToggleRubric}
		{onToggleService}
	/>
{:else if version === 'v3'}
	<MobileMenuV3
		{links}
		{visibleCatalogItems}
		{visibleServiceItems}
		{disabledRubrics}
		{disabledServices}
		{cities}
		{isEditable}
		{onToggleRubric}
		{onToggleService}
	/>
{:else if version === 'v2'}
	<MobileMenuV2
		{links}
		{visibleCatalogItems}
		{visibleServiceItems}
		{disabledRubrics}
		{disabledServices}
		{cities}
		{isEditable}
		{onToggleRubric}
		{onToggleService}
	/>
{:else}
	<MobileMenuV1
		{links}
		{visibleCatalogItems}
		{visibleServiceItems}
		{disabledRubrics}
		{disabledServices}
		{cities}
		{isEditable}
		{onToggleRubric}
		{onToggleService}
	/>
{/if}
