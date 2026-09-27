/** Карточки второго блока страницы акций, общие для блока и верхней ленты. */
export interface ExtraCard {
	id: string;
	title: string;
	description: string;
	badge: string;
	icon: string;
	enabled?: boolean;
}

export const defaultExtraCards: ExtraCard[] = [
	{
		id: 'repeat',
		title: 'Особое предложение',
		description:
			'Если вы приобретаете мебель повторно, то для вас будет особое предложение в виде скидки или подарка.',
		badge: 'Для постоянных клиентов',
		icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z'
	},
	{
		id: 'bulk',
		title: 'Скидки за большой заказ',
		description:
			'Если вы заказываете несколько позиций мебели, то мы обязательно согласуем вам дополнительную скидку.',
		badge: 'Скидка',
		icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z'
	},
	{
		id: 'taxi',
		title: 'Такси до дома',
		description:
			'После оформления договора вызовем вам такси в пределах города за счёт нашей компании.',
		badge: 'Бесплатно',
		icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12'
	},
	{
		id: 'sink',
		title: 'Каменная мойка в подарок',
		description:
			'При заказе кухонного гарнитура дарим стильную и долговечную мойку из искусственного камня в цвет выбранной столешницы.',
		badge: 'Подарок',
		icon: 'M2.25 12c0-3.578 2.893-6.5 6.45-6.5h6.6c3.557 0 6.45 2.922 6.45 6.5m-19.5 0h19.5M2.25 12v6a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-6'
	},
	{
		id: 'delivery',
		title: 'Доставка и подъём',
		description:
			'Вам не придется думать о транспортировке: мы бережно доставим готовую мебель и бесплатно поднимем ее прямо в вашу квартиру.',
		badge: 'Бесплатно',
		icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75'
	}
];

export function mergeExtraCards(propsCards: any[] | undefined): ExtraCard[] {
	if (!Array.isArray(propsCards) || propsCards.length === 0) {
		return defaultExtraCards;
	}

	const savedMap = new Map<string, ExtraCard>();
	propsCards.forEach((card: any) => {
		let id = card.id;
		if (!id) {
			const matchedDefault = defaultExtraCards.find((d) => d.title === card.title);
			id = matchedDefault ? matchedDefault.id : card.title;
		}
		savedMap.set(id, { ...card, id });
	});

	const result: ExtraCard[] = [];
	savedMap.forEach((card) => {
		result.push(card);
	});

	defaultExtraCards.forEach((defaultCard) => {
		const hasSaved =
			savedMap.has(defaultCard.id) ||
			Array.from(savedMap.values()).some((s) => s.title === defaultCard.title);

		if (!hasSaved) {
			result.push({
				...defaultCard,
				enabled: false
			});
		}
	});

	return result;
}

export function activeExtraActionCards(saved: unknown) {
	if (Array.isArray(saved) && saved.length === 0) return [];
	return mergeExtraCards(saved as any[] | undefined)
		.filter((card) => card.enabled !== false)
		.map((card) => ({ id: `extra-${card.id}`, title: card.title, badge: card.badge }));
}
