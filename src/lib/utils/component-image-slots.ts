import type { ComponentImageSlot } from '$lib/utils/component-images';
import type { EditContext } from '$lib/utils/page-edit';

const SLOT_KEYS: Record<string, string[]> = {
	'1:/about:Mission': ['imageUrl'],
	'1:/actions:ActionsBanner': ['imageUrl'],
	'1:/bytovaya-tehnika:ByttehnikaHero': ['bgImage'],
	'1:/contacts:ContactAddress': ['mapImageUrl'],
	'1:/furnitura:FurnituraHero': ['bgImage'],
	'1:/guarantees:WhatsCovered': ['imageUrl'],
	'1:/:Equipment': ['item1Image', 'item2Image', 'item3Image', 'item4Image', 'item5Image'],
	'1:/mebel:MebelHero': ['bgImage'],
	'1:/plitka:PliitkaHero': ['bgImage'],
	'1:/santehnika:SantehnikaHero': ['bgImage'],
	'1:/services/assembly:AssemblyHero': ['hero_image'],
	'1:/services/assembly:AssemblyWhy': ['imageUrl'],
	'1:/services/consultation:ConsultationHero': ['hero_image'],
	'1:/services/consultation:ConsultationWhy': ['imageUrl'],
	'1:/services/design-project:DesignProjectHero': ['hero_image'],
	'1:/services/design-project:DesignProjectWhy': ['imageUrl'],
	'1:/services/furniture-project:FurnitureProjectHero': ['hero_image'],
	'1:/services/furniture-project:FurnitureProjectWhy': ['imageUrl'],
	'1:/services/measurement:MeasurementHero': ['hero_image'],
	'1:/services/measurement:MeasurementWhy': ['imageUrl'],
	'1:/stoleshnica:StoleshnicaHero': ['bgImage'],
	'2:/about:Hero': ['image'],
	'2:/about:LeaderSection': ['image'],
	'2:/actions:ActionsBanner': ['image'],
	'2:/actions:Hero': ['image'],
	'2:/facades:Hero': ['image'],
	'2:/furniture:Hero': ['image'],
	'2:/:Details': ['image'],
	'2:/:Hero': ['mobileImage'],
	'2:/kitchens:Hero': ['image'],
	'2:/kitchens:ProductionCycle': ['designImage', 'productionImage', 'assemblyImage'],
	'2:/showrooms:Hero': ['image'],
	'2:/wardrobes:Hero': ['image'],
	'2:/yandex-direct:Hero': ['bgImage'],
	'3:/:Banner': ['image'],
	'3:/:Hero': ['image'],
	'3:/yandex-direct:Hero': ['bgImage'],
	'0:/about:Hero': ['backgroundImage'],
	'0:/:Hero': ['backgroundImage']
};

const normalizeSlug = (slug: string | null | undefined) => {
	if (!slug || slug === 'home') return '/';
	return slug.startsWith('/') ? slug : `/${slug}`;
};

/**
 * Пустые поля невозможно найти обходом JSON. Этот реестр описывает видимые
 * image-слоты, которые компоненты читают как `data.<field>`, ещё до первой правки.
 */
export function componentImageSlots(
	context: EditContext,
	componentType: string,
	data: Record<string, unknown> = {}
): ComponentImageSlot[] {
	const key = `${Number(context.templateId ?? 0)}:${normalizeSlug(context.slug)}:${componentType}`;
	if (key === '1:/:HeroMain') {
		const version = String(data.heroVersion ?? 'v1');
		// `bgImage` — легаси-фолбэк из HeroV1.svelte (`data?.bgImageV1 ?? data?.bgImage ??
		// default`): реально пишет и читает интерфейс только `bgImageV1`, поэтому в
		// список слотов его не заводим — иначе рядом с актуальным `bgImageV1`
		// появлялась вторая пустая карточка с той же подписью «Фоновое
		// изображение» и без эффекта на странице. Тенантам со старыми данными это
		// не мешает: `bgImage` в их data найдёт обычный обход
		// collectComponentImages, слоты нужны только для пустых полей, которых
		// обход не видит.
		const fields =
			version === 'v4'
				? ['renderImage', 'materialImage']
				: version === 'v3'
					? ['logoUrl']
					: version === 'v2'
						? []
						: ['bgImageV1', 'logoUrl'];
		return fields.map((field) => ({ path: [field] }));
	}
	if (key === '1:/:Message') {
		// Блок 1.1.2 показывает выполненные работы, а не логотип (19.08.2026), и
		// его пустые слоты — это фотографии проектов, по одной на карточку. Число
		// карточек задаёт тенант, поэтому список считается по данным, а не
		// объявлен константой в SLOT_KEYS: там путь — один ключ верхнего уровня,
		// а здесь их столько, сколько работ в описи. До первой правки карточек
		// четыре — столько же, сколько в стартовых данных версии.
		//
		// Ключ `logoUrl` из реестра убран вместе со слотом. У тенантов, успевших
		// залить логотип, он остаётся непустым в data и продолжает находиться
		// обычным обходом — чужие данные не трогаем.
		const cards = Array.isArray(data.cards) ? data.cards : [];
		const count = cards.length > 0 ? cards.length : 4;
		return Array.from({ length: count }, (_, index) => ({ path: ['cards', index, 'image'] }));
	}
	if (key === '1:/:PromoOffer') {
		// `image` — легаси-фолбэк из PromoOffer.svelte (`data?.imageV1 ?? data?.image`):
		// реально пишет и читает интерфейс только `imageV1`/`imageV2`, поэтому в список
		// слотов его не заводим — иначе рядом с актуальным `imageV1`/`imageV2`
		// появлялась вторая пустая карточка с той же подписью «Изображение» и без
		// эффекта на странице. Тенантам со старыми данными это не мешает: `image`
		// в их data найдёт обычный обход collectComponentImages, слоты нужны
		// только для пустых полей, которых обход не видит.
		const field = String(data.promoOfferVersion ?? 'v1') === 'v2' ? 'imageV2' : 'imageV1';
		return [{ path: [field] }];
	}
	if (key === '1:/:Stage') {
		const field = String(data.stageVersion ?? 'v1') === 'v2' ? 'bgImageV2' : 'bgImage';
		return [{ path: [field] }];
	}
	return (SLOT_KEYS[key] ?? []).map((field) => ({ path: [field] }));
}

/**
 * Ключи, которые обход `collectComponentImages` находит прямо в `data`
 * (а не через реестр слотов) и поэтому не убрать одним лишь исключением
 * из `componentImageSlots`. Список сокращённых полей, а не путей: обход
 * ищет их по буквальному ключу в JSON независимо от места хранения слота.
 *
 * Прячем только ПУСТУЮ карточку: если у тенанта в данных реально лежит
 * непустое значение по такому ключу (старые сайты до `bgImageV1`), она
 * остаётся видимой и управляемой — правило неприкосновенности чужих
 * данных то же, что и у самого поля.
 */
const EMPTY_ONLY_HIDDEN_KEYS: Record<string, string[]> = {
	'1:/:HeroMain': ['bgImage'],
	'1:/:PromoOffer': ['image']
};

export function hiddenWhenEmptyImageKeys(context: EditContext, componentType: string): string[] {
	const key = `${Number(context.templateId ?? 0)}:${normalizeSlug(context.slug)}:${componentType}`;
	return EMPTY_ONLY_HIDDEN_KEYS[key] ?? [];
}
