import * as Promo1Layout from './Promo-1/layout';
import * as Promo2Layout from './Promo-2/layout';
import * as Promo3Layout from './Promo-3/layout';
import * as TestLayout from './Test/layout';
import type { TemplateLayout } from './types';

/**
 * Layout (Banner/Header/Footer) по templateId лицензии.
 *
 * Здесь подключены все четыре шаблона: какой из них нужен, известно только в
 * рантайме — templateId приходит из API вместе с данными страницы. Это дешёвая
 * часть шаблона; тяжёлое (все страницы шаблона) в маршруты страниц не попадает.
 *
 * Соответствие 1 → Promo-1, 2 → Promo-2, 3 → Promo-3, иначе Test — то же, что
 * в ComponentResolver.resolveTemplate.
 */
export function resolveLayout(templateId: number | null): TemplateLayout {
	switch (templateId) {
		case 1:
			return Promo1Layout as TemplateLayout;
		case 2:
			return Promo2Layout as TemplateLayout;
		case 3:
			return Promo3Layout as TemplateLayout;
		default:
			return TestLayout as TemplateLayout;
	}
}
