import { writable } from 'svelte/store';

export const formDefinitions = {
	consultation: {
		title: 'Бесплатная консультация',
		type: 'consultation',
		description: 'Оставьте контакты — обсудим ваши пожелания и поможем с выбором мебели.'
	},
	showroom: {
		title: 'Записаться в салон',
		type: 'showroom-visit',
		description: 'Укажите город и удобное время. Мы свяжемся с вами, чтобы согласовать встречу.'
	},
	'home-designer': {
		title: 'Вызвать дизайнера на дом',
		type: 'design-project',
		description: 'Расскажите, куда пригласить дизайнера. Мы позвоним и согласуем выезд.'
	},
	'kitchen-project': {
		title: 'Спроектировать кухню',
		type: 'design-project',
		description: 'Расскажите о будущей кухне. Дизайнер свяжется с вами, чтобы обсудить проект.'
	},
	'wardrobe-project': {
		title: 'Спроектировать шкаф',
		type: 'design-project',
		description: 'Расскажите о системе хранения, которую хотите создать.'
	},
	'design-project': {
		title: 'Заказать дизайн-проект',
		type: 'design-project',
		description: 'Обсудим планировку, материалы и ваши пожелания к мебели.'
	},
	estimate: {
		title: 'Рассчитать стоимость мебели',
		type: 'furniture-estimate',
		description: 'Укажите размеры и пожелания. Мы свяжемся с вами для уточнения расчёта.'
	},
	'action-consultation': {
		title: 'Консультация по акции',
		type: 'consultation',
		description: 'Поможем разобраться в условиях предложения и подобрать подходящий вариант.'
	},
	partnership: {
		title: 'Заявка на партнёрство',
		type: 'partnership',
		description: 'Расскажите о вашей работе. Мы свяжемся с вами и обсудим сотрудничество.'
	},
	careers: {
		title: 'Отклик на вакансию',
		type: 'careers',
		description: 'Оставьте контакты и расскажите о своём опыте.'
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
