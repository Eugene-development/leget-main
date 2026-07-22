/**
 * Единый источник правды для пунктов услуг Promo-1.
 *
 * Используется и в Header.svelte (меню услуг + переключатели),
 * и в Footer.svelte (секция «Услуги»). Это исключает рассинхрон href'ов
 * и обеспечивает корректную фильтрацию по `disabledServices` в обоих местах.
 *
 * Аналогичен ./catalogItems.ts — намеренно такая же структура.
 */

export interface ServiceItem {
	href: string;
	label: string;
	icon: string;
	desc?: string;
	/** Услуга ещё не запущена — недоступна для посещения, переключатель скрыт. */
	comingSoon?: boolean;
}

export const serviceItems: ServiceItem[] = [
	{
		href: '/consultation',
		label: 'Консультация',
		icon: 'chat',
		desc: 'Профессиональная помощь в подборе решений'
	},
	{
		href: '/design-project',
		label: 'Дизайн интерьера',
		icon: 'design',
		desc: 'Индивидуальные 3D-проекты любой сложности'
	},
	{
		href: '/measurement',
		label: 'Замер помещения',
		icon: 'ruler',
		desc: 'Точные расчеты для идеальной установки'
	},
	{
		href: '/furniture-project',
		label: 'Проект мебели',
		icon: 'project',
		desc: 'Проработка конструктива и эргономики'
	},
	{
		href: '/assembly',
		label: 'Сборка и установка',
		icon: 'tools',
		desc: 'Качественный монтаж вашей мебели'
	}
];
