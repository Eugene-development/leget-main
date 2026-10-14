/** Page-block motion is deliberately separate from the template's layout. */
export const PROMO_MOTION_CONTEXT = Symbol('promo-page-motion');

export interface PromoMotionContext {
	readonly supported: boolean;
	readonly enabled: boolean;
	readonly editable: boolean;
}

export type MotionProfile =
	| 'hero'
	| 'cards'
	| 'steps'
	| 'statistics'
	| 'gallery'
	| 'brands'
	| 'form'
	| 'faq'
	| 'editorial'
	| 'sidebar'
	| 'model';

/** Keep the previously saved HeroMain v1 switch working on existing sites. */
export function animationsEnabled(data: Record<string, unknown>): boolean {
	return (data.animationsEnabled ?? data.animationsEnabledV1) !== false;
}

/** Profiles describe the job of a block, rather than the page it happens to be on. */
export function motionProfile(type: string): MotionProfile {
	if (type.endsWith('Sidebar')) return 'sidebar';
	if (type === 'MebelProjectModel') return 'model';
	if (type === 'Statistics' || type === 'TestimonialsSummary' || type === 'SocialProof')
		return 'statistics';
	if (/FAQ/.test(type)) return 'faq';
	if (/Form$|Request$|CTA$/.test(type)) return 'form';
	if (/Hero/.test(type) || type === 'NotFound') return 'hero';
	if (/Stage|Steps|Process|HowToStart|HowToApply/.test(type)) return 'steps';
	if (/Brands$|Banks$/.test(type)) return 'brands';
	if (/Grid$|Feed$|Similar$|FavoritesPage|Direction|Solutions$/.test(type)) return 'gallery';
	if (
		/Features$|Benefits$|Categories$|Materials$|Services$|Cards|Values|Why|WhoWeInvite|WhatsCovered|Requirements|Plans|Equipment|Incentives|PartnerOffers|Shops|SinkTypes/.test(
			type
		)
	)
		return 'cards';
	return 'editorial';
}

export const motionDescriptions: Record<MotionProfile, string> = {
	hero: 'Плавное появление заголовка, текста и фотографий.',
	cards: 'Поочерёдное появление карточек при прокрутке.',
	steps: 'Последовательное появление этапов и соединяющих линий.',
	statistics: 'Появление показателей и плавный набор числовых значений.',
	gallery: 'Появление работ и мягкое раскрытие изображений.',
	brands: 'Появление логотипов и движение лент брендов.',
	form: 'Спокойное появление блока и основных действий.',
	faq: 'Появление списка вопросов без движения открытого ответа.',
	editorial: 'Появление текста, иллюстраций и разделительных линий.',
	sidebar: 'Короткое появление пунктов каталога.',
	model: 'Появление подписи и кнопки просмотра модели.'
};
