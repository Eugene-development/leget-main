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
	/** Рубрика ещё не запущена — недоступна для посещения, переключатель скрыт. */
	comingSoon?: boolean;
}

export const catalogItems: CatalogItem[] = [
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
	{ href: '/furnitura', label: 'Фурнитура', icon: 'hinge', desc: 'Ручки, петли, механизмы' },
	{
		href: '/plitka',
		label: 'Плитка',
		icon: 'tiles',
		desc: 'Керамогранит и мозаика',
		comingSoon: true
	}
];
