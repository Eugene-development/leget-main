export type GoalType = 'click' | 'compound';
export type GoalPriority = 'high' | 'medium' | 'low';

export interface RouteGoalPage {
	scope: 'route';
	label: string;
	path: string;
}

export interface SitewideGoalPage {
	scope: 'sitewide';
	label: string;
}

export type GoalPage = RouteGoalPage | SitewideGoalPage;

export interface GoalDefinition {
	id: string;
	name: string;
	type: GoalType;
	status: 'draft';
	priority: GoalPriority;
	description: string;
	eventName: string;
	condition: string;
	pages: GoalPage[];
	buttonLabel?: string;
	selector?: string;
	dependsOn?: string[];
}

/**
 * Проект карты целей. Эти записи описывают будущий контракт аналитики, но сами
 * цели в Яндекс Метрике/Директе пока не создают и события на сайте не отправляют.
 */
export const goalDefinitions: GoalDefinition[] = [
	{
		id: 'click-phone',
		name: 'Клик по номеру телефона',
		type: 'click',
		status: 'draft',
		priority: 'high',
		description: 'Фиксирует намерение позвонить из шапки, футера или контактного блока.',
		eventName: 'click_phone',
		condition: 'Клик по любой ссылке с протоколом tel:',
		pages: [{ scope: 'sitewide', label: 'Весь сайт' }],
		buttonLabel: 'Позвонить',
		selector: 'a[href^="tel:"]'
	},
	{
		id: 'click-calculation',
		name: 'Запрос расчёта стоимости',
		type: 'click',
		status: 'draft',
		priority: 'high',
		description: 'Главный коммерческий CTA для посетителя, который уже выбирает решение.',
		eventName: 'click_calculation',
		condition: 'Клик по CTA с ролью расчёта стоимости',
		pages: [
			{ scope: 'route', label: 'Главная', path: '/' },
			{ scope: 'route', label: 'Мебель', path: '/mebel' }
		],
		buttonLabel: 'Рассчитать стоимость',
		selector: '[data-goal="calculation"]'
	},
	{
		id: 'click-consultation',
		name: 'Запрос консультации',
		type: 'click',
		status: 'draft',
		priority: 'high',
		description: 'Открытие формы или переход к контакту для разговора со специалистом.',
		eventName: 'click_consultation',
		condition: 'Клик по CTA консультации независимо от варианта компонента',
		pages: [
			{ scope: 'route', label: 'Контакты', path: '/contacts' },
			{ scope: 'route', label: 'Главная', path: '/' }
		],
		buttonLabel: 'Получить консультацию',
		selector: '[data-goal="consultation"]'
	},
	{
		id: 'click-measurement',
		name: 'Заявка на замер',
		type: 'click',
		status: 'draft',
		priority: 'high',
		description: 'Отделяет посетителей с предметным интересом от общего трафика.',
		eventName: 'click_measurement',
		condition: 'Клик по кнопке заказа замера',
		pages: [
			{ scope: 'route', label: 'Мебель', path: '/mebel' },
			{ scope: 'route', label: 'Контакты', path: '/contacts' }
		],
		buttonLabel: 'Заказать замер',
		selector: '[data-goal="measurement"]'
	},
	{
		id: 'click-partnership',
		name: 'Партнёрское обращение',
		type: 'click',
		status: 'draft',
		priority: 'medium',
		description: 'Отдельная конверсия для дизайнеров, бригад и производителей.',
		eventName: 'click_partnership',
		condition: 'Клик по основному CTA партнёрской страницы',
		pages: [{ scope: 'route', label: 'Партнёрство', path: '/partnership' }],
		buttonLabel: 'Стать партнёром',
		selector: '[data-goal="partnership"]'
	},
	{
		id: 'behavior-engaged',
		name: 'Вовлечённый посетитель',
		type: 'compound',
		status: 'draft',
		priority: 'medium',
		description: 'Показывает содержательные визиты без обязательного клика по CTA.',
		eventName: 'behavior_engaged',
		condition: 'Не менее 90 секунд на сайте И просмотр не менее 2 страниц',
		pages: [{ scope: 'sitewide', label: 'Весь сайт' }],
		dependsOn: ['Время на сайте ≥ 90 сек.', 'Глубина просмотра ≥ 2']
	},
	{
		id: 'behavior-catalog-depth',
		name: 'Глубокий интерес к каталогу',
		type: 'compound',
		status: 'draft',
		priority: 'medium',
		description: 'Выделяет посетителей, которые изучили каталог и открыли предметную страницу.',
		eventName: 'behavior_catalog_depth',
		condition: 'Просмотр каталога И переход в категорию И глубина визита не менее 3 страниц',
		pages: [
			{ scope: 'route', label: 'Мебель', path: '/mebel' },
			{ scope: 'route', label: 'Каталог', path: '/catalog' }
		],
		dependsOn: ['Просмотр каталога', 'Переход в категорию', 'Глубина просмотра ≥ 3']
	},
	{
		id: 'behavior-high-intent',
		name: 'Высокое намерение обратиться',
		type: 'compound',
		status: 'draft',
		priority: 'high',
		description: 'Собирает самые тёплые визиты для последующей оптимизации рекламы.',
		eventName: 'behavior_high_intent',
		condition: 'Коммерческий CTA ИЛИ клик по телефону, после просмотра не менее 2 страниц',
		pages: [{ scope: 'sitewide', label: 'Весь сайт' }],
		dependsOn: ['click_phone ИЛИ любой коммерческий CTA', 'Глубина просмотра ≥ 2']
	}
];
