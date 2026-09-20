export type CatalogRubric = 'mebel' | 'stoleshnica' | 'bytovaya-tehnika' | 'santehnika';

const CATALOG_RUBRICS = new Set<CatalogRubric>([
	'mebel',
	'stoleshnica',
	'bytovaya-tehnika',
	'santehnika'
]);

/**
 * Возвращает рубрику по первому сегменту реального slug.
 * Так один акцент действует и на корневой странице, и на вложенных страницах
 * категорий, проектов, материалов и брендов Promo-1.
 */
export function catalogRubricFromSlug(
	templateId: number | null | undefined,
	pageSlug: string | null | undefined
): CatalogRubric | null {
	if (Number(templateId) !== 1 || !pageSlug) return null;

	const rubric = pageSlug.replace(/^\//, '').split('/')[0] as CatalogRubric;
	return CATALOG_RUBRICS.has(rubric) ? rubric : null;
}
