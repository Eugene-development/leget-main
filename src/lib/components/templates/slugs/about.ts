import { aboutMap as promo1 } from '../Promo-1/pages/about/map';
import { aboutMap as promo2 } from '../Promo-2/pages/about/map';
import { aboutMap as promo3 } from '../Promo-3/pages/about/map';
import { aboutMap as test } from '../Test/pages/about/map';
import type { ComponentMapsByTemplate } from '../types';

/**
 * Карты блоков «/about» по шаблонам. Ключ — templateId, `0` — фолбэк (Test).
 * Страница есть во всех четырёх шаблонах, поэтому заполнены все ключи.
 */
export const aboutMaps: ComponentMapsByTemplate = {
	1: promo1,
	2: promo2,
	3: promo3,
	0: test
};
