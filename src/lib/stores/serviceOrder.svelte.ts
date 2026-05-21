/**
 * Глобальный store для управления формой заказа услуг
 */

export type ServiceType = 'consultation' | 'design-project' | 'furniture-project' | 'assembly' | 'measurement' | 'partnership';

export const SERVICE_TITLES: Record<ServiceType, string> = {
	'consultation': 'Консультация дизайнера',
	'design-project': 'Заказать дизайн-проект',
	'furniture-project': 'Проектирование мебели',
	'assembly': 'Сборка и монтаж',
	'measurement': 'Замер помещения',
	'partnership': 'Заявка на сотрудничество'
};

let _isOpen = $state(false);
let _serviceType = $state<ServiceType>('consultation');

export const serviceOrderStore = {
	get isOpen() {
		return _isOpen;
	},
	get serviceType() {
		return _serviceType;
	},
	get title() {
		return SERVICE_TITLES[_serviceType] || 'Заказать услугу';
	},
	open(type: ServiceType) {
		_serviceType = type;
		_isOpen = true;
	},
	close() {
		_isOpen = false;
	}
};
