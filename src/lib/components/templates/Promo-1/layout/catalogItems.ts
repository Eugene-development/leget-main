/**
 * Единый источник правды для пунктов каталога Promo-1.
 *
 * Используется и в Header.svelte (меню каталога + переключатели рубрик),
 * и в Footer.svelte (секция «Каталог»). Это исключает рассинхрон href'ов
 * и обеспечивает корректную фильтрацию по `disabledRubrics` в обоих местах.
 */

export interface CatalogItem {
	href: string;
	label: string;
	icon: string;
	desc?: string;
	/** Рубрика видна со статусом «Скоро», переход и переключатель недоступны. */
	comingSoon?: boolean;
}

/** Keep available items first, preserving the order within each status. */
export function orderCatalogItems<T extends { comingSoon?: boolean }>(items: readonly T[]): T[] {
	return [...items].sort(
		(first, second) => Number(first.comingSoon === true) - Number(second.comingSoon === true)
	);
}

export const catalogItems: CatalogItem[] = orderCatalogItems([
	{ href: '/mebel', label: 'Мебель', icon: 'sofa', desc: 'Кухни, шкафы, гардеробные' },
	{
		href: '/stoleshnica',
		label: 'Столешницы',
		icon: 'surface',
		desc: 'Из камня, дерева и пластика'
	},
	{
		href: '/bytovaya-tehnika',
		label: 'Бытовая техника',
		icon: 'fridge',
		desc: 'Встраиваемая и отдельностоящая'
	},
	{
		href: '/santehnika',
		label: 'Сантехника',
		icon: 'faucet',
		desc: 'Смесители, мойки, аксессуары'
	},
	{
		href: '/osveshchenie',
		label: 'Освещение',
		icon: 'lamp',
		desc: 'Светильники и световые решения',
		comingSoon: true
	},
	{
		href: '/dveri',
		label: 'Двери',
		icon: 'surface',
		desc: 'Каталог брендов дверей',
		comingSoon: true
	},
	{ href: '/okna', label: 'Окна', icon: 'surface', desc: 'Каталог брендов окон', comingSoon: true },
	{ href: '/furnitura', label: 'Фурнитура', icon: 'hinge', desc: 'Ручки, петли, механизмы' },
	{
		href: '/steklo-i-zerkala',
		label: 'Стекло и Зеркала',
		icon: 'surface',
		desc: 'Изделия по вашим размерам'
	},
	{
		href: '/plitka',
		label: 'Плитка',
		icon: 'tiles',
		desc: 'Керамогранит и мозаика',
		comingSoon: true
	}
]);
