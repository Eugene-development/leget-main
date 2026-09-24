/**
 * Глобальный store для управления формой заказа услуг
 */

export type ServiceType =
	| 'glass-mirrors'
	| 'consultation'
	| 'design-project'
	| 'furniture-project'
	| 'assembly'
	| 'measurement'
	| 'countertop-estimate'
	| 'appliance-selection'
	| 'plumbing-selection'
	| 'installment'
	| 'partnership'
	| 'promo';

export const SERVICE_TITLES: Record<ServiceType, string> = {
	'glass-mirrors': 'Стекло и Зеркала',
	consultation: 'Консультация дизайнера',
	'design-project': 'Заказать дизайн-проект',
	'furniture-project': 'Проектирование мебели',
	assembly: 'Сборка и монтаж',
	measurement: 'Заказ замера',
	'countertop-estimate': 'Просчёт столешницы',
	'appliance-selection': 'Подбор техники',
	'plumbing-selection': 'Подбор сантехники',
	installment: 'Заявка на рассрочку',
	partnership: 'Заявка на сотрудничество',
	promo: 'Получить промокод'
};

export const SERVICE_MESSAGE_PLACEHOLDERS: Record<ServiceType, string> = {
	'glass-mirrors': 'Опишите изделие, размеры и пожелания.',
	consultation: 'Напишите, какой вопрос хотите обсудить с дизайнером.',
	'design-project': 'Опишите помещение, желаемый стиль и задачи дизайн-проекта.',
	'furniture-project':
		'Расскажите, какую мебель нужно спроектировать, и укажите примерные размеры.',
	assembly: 'Укажите, какую мебель нужно собрать или установить, и особенности помещения.',
	measurement: 'Напишите, что нужно измерить, а также удобные дату и время для визита.',
	'countertop-estimate': '',
	'appliance-selection': 'Перечислите нужную технику, укажите размеры ниш и пожелания по бюджету.',
	'plumbing-selection': 'Укажите, какую сантехнику подбираете, размеры и важные требования.',
	installment: 'Укажите сумму покупки и удобный срок рассрочки.',
	partnership: 'Кратко расскажите о себе и желаемом формате сотрудничества.',
	promo: 'Укажите, какое предложение или товар вас заинтересовали.'
};

let _isOpen = $state(false);
let _serviceType = $state<ServiceType>('consultation');
let _session = $state(0);

export const serviceOrderStore = {
	get session() {
		return _session;
	},
	get isOpen() {
		return _isOpen;
	},
	get serviceType() {
		return _serviceType;
	},
	get title() {
		return SERVICE_TITLES[_serviceType] || 'Заказать услугу';
	},
	get messagePlaceholder() {
		return SERVICE_MESSAGE_PLACEHOLDERS[_serviceType];
	},
	open(type: ServiceType) {
		_session++;
		_serviceType = type;
		_isOpen = true;
	},
	close() {
		_session++;
		_isOpen = false;
	}
};
