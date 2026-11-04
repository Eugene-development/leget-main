import { defaultActionCards } from './actionCards';
import { defaultExtraCards } from './actionCardsExtra';

export interface ActionIcon {
	id: string;
	label: string;
	path: string;
}

/** Curated 24×24 outline icons. Paths stay compatible with existing saved cards. */
export const actionIcons: readonly ActionIcon[] = [
	...defaultActionCards.map((card, index) => ({
		id: card.id,
		label: [
			'Консультация',
			'Замер',
			'Инструменты',
			'Дизайн',
			'Подарок',
			'Коробка',
			'Дом',
			'Оплата'
		][index],
		path: card.icon
	})),
	...defaultExtraCards.map((card, index) => ({
		id: `extra-${card.id}`,
		label: ['Особое предложение', 'Деньги', 'Такси', 'Мойка', 'Доставка'][index],
		path: card.icon
	})),
	{
		id: 'percent',
		label: 'Скидка',
		path: 'M6 18 18 6M9 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm10 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z'
	},
	{ id: 'tag', label: 'Ценник', path: 'M3 3h7l11 11-7 7L3 10V3Zm4 4h.01' },
	{ id: 'clock', label: 'Время', path: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2' },
	{
		id: 'calendar',
		label: 'Календарь',
		path: 'M7 3v4m10-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 9h2m4 0h2m-8 3h2'
	},
	{ id: 'shield', label: 'Гарантия', path: 'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Zm-4 9 3 3 5-6' },
	{ id: 'check', label: 'Проверено', path: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-13 0 3 3 5-6' },
	{
		id: 'star',
		label: 'Звезда',
		path: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z'
	},
	{
		id: 'heart',
		label: 'Забота',
		path: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z'
	},
	{
		id: 'sofa',
		label: 'Мебель',
		path: 'M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 17h14M5 19v-2m14 2v-2M3 10a2 2 0 0 1 2 2v2h14v-2a2 2 0 1 1 4 0v5H1v-5a2 2 0 0 1 2-2Z'
	},
	{
		id: 'kitchen',
		label: 'Кухня',
		path: 'M3 10h18v11H3V10Zm9 0v11M8 14v3m8-3v3M3 3h7v5H3V3Zm11 0h7v5h-7V3Z'
	},
	{
		id: 'building',
		label: 'Новостройка',
		path: 'M5 21V3h14v18M3 21h18M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1m-4 6v-3h2v3'
	}
];

export function matchingActionIcons(query: string): readonly ActionIcon[] {
	const words = query.trim().toLocaleLowerCase('ru').split(/\s+/).filter(Boolean);
	return actionIcons.filter((icon) =>
		words.every((word) => icon.label.toLocaleLowerCase('ru').includes(word))
	);
}
