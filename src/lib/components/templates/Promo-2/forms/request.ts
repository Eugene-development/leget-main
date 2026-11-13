import { writable } from 'svelte/store';

export const formDefinitions = {
	consultation: {
		title: 'Бесплатная консультация',
		type: 'consultation'
	},
	showroom: {
		title: 'Записаться в салон',
		type: 'showroom-visit'
	},
	'home-designer': {
		title: 'Вызвать дизайнера на дом',
		type: 'design-project'
	},
	'kitchen-project': {
		title: 'Спроектировать кухню',
		type: 'design-project'
	},
	'wardrobe-project': {
		title: 'Спроектировать шкаф',
		type: 'design-project'
	},
	'design-project': {
		title: 'Заказать дизайн-проект',
		type: 'design-project'
	},
	estimate: {
		title: 'Рассчитать стоимость мебели',
		type: 'furniture-estimate'
	},
	'action-consultation': {
		title: 'Консультация по акции',
		type: 'consultation'
	},
	partnership: {
		title: 'Заявка на партнёрство',
		type: 'partnership'
	},
	careers: {
		title: 'Отклик на вакансию',
		type: 'careers'
	}
} as const;
export type Promo2FormKind = keyof typeof formDefinitions;
export type Promo2Request = { kind: Promo2FormKind; subject: string };
export const promo2Request = writable<Promo2Request | null>(null);

export function openPromo2Form(kind: Promo2FormKind, subject = '') {
	promo2Request.set({
		kind,
		subject: subject
			.replace(/<[^>]*>/g, '')
			.trim()
			.slice(0, 255)
	});
}
