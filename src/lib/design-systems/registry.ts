/**
 * Реестр дизайн-систем на стороне фронта.
 *
 * Зеркало таблицы `design_systems` в БД (slug — общий ключ). Дублирование
 * вынужденное и того же рода, что `config/component_variants.php`: значения
 * токенов живут в CSS, который собирается на билде, а бэкенд про CSS ничего
 * не знает. Сверять по slug'у.
 *
 * Выбор владельца сайта хранится в JSON шапки лицензии под ключом `designSystem`
 * (рядом с `siteAppearance`) — отдельной колонки под него нет, см.
 * docs/architecture/design-systems.md#хранение-выбора. Читается `readDesignSystem()`,
 * применяется атрибутом `data-ds` в `hooks.server.ts`.
 *
 * ⚠️ Этот реестр — не украшение, а гейт. Система может быть заведена в БД раньше,
 * чем её CSS выкачен во фронт: сборка без `<slug>.css` отрисует такой сайт Базовой,
 * молча и полностью. Поэтому и рендер, и переключатель в настройках пропускают
 * выбор через `isKnownDesignSystem()` — предлагать можно только то, что эта
 * сборка умеет нарисовать.
 */

/** Slug Базовой. Совпадает с `DesignSystem::BASE_SLUG` в leget-api. */
export const BASE_SLUG = 'base';

export type DesignSystemEntry = {
	slug: string;
	name: string;
	/** Базовая — песочница, одна на платформу. См. design-system-base.md. */
	isBase: boolean;
	/** Есть ли строка в `design_systems`. false → стенд разработчика. */
	inDatabase: boolean;
	description: string;
};

export const DESIGN_SYSTEMS: readonly DesignSystemEntry[] = [
	{
		slug: BASE_SLUG,
		name: 'Базовая',
		isBase: true,
		inDatabase: true,
		description:
			'Песочница: легаси и версии в разработке. Значения перенесены из @theme приложения ' +
			'и Promo-1/theme.css без изменений.'
	},
	{
		slug: 'apple',
		name: 'Купертино',
		isBase: false,
		inDatabase: true,
		description:
			'Холодная почти-нейтраль, единственный хроматический интерактив — синий, подчёркнуто ' +
			'плоская иерархия: сдвиг поверхности и волосяная линия вместо тени. Выведена из внешнего ' +
			'style reference. Строка в БД есть, но версий и заявленной области у системы нет: ' +
			'она перекрашивает существующие блоки, ни одна версия под неё не отрефакторена.'
	},
	{
		slug: 'ochre',
		name: 'Охра',
		isBase: false,
		inDatabase: true,
		description:
			'Тёплый монохром на тёмном: ржаво-коричневый холст, единственный хроматический ' +
			'акцент — золото, плоские поверхности без теней, плакатная типографика. Первая ' +
			'тёмная система платформы: у неё светлый текст на тёмной поверхности, а не ' +
			'наоборот. Опубликована для Promo-1.'
	},
	{
		slug: 'graphite',
		name: 'Графит',
		isBase: false,
		inDatabase: true,
		description:
			'Холодная нейтраль, синий акцент, плотнее ритм, резче тени, быстрее движение. ' +
			'Изначально — стенд для проверки токенного слоя (чистый рескин без правок в ' +
			'компонентах); опубликована как выбираемая система для Promo-1.'
	}
] as const;

/** Есть ли такая система во фронтовом реестре. */
export function isKnownDesignSystem(slug: string): boolean {
	return DESIGN_SYSTEMS.some((system) => system.slug === slug);
}

/**
 * Slug для атрибута `data-ds`.
 *
 * Неизвестный slug откатывается на Базовую, а не оставляет документ без токенов:
 * система, которой нет в этой сборке фронта (заведена в БД, CSS ещё не выкачен),
 * не должна давать страницу без палитры.
 */
export function resolveDesignSystem(slug: string | null | undefined): string {
	return slug && isKnownDesignSystem(slug) ? slug : BASE_SLUG;
}

/** Ключ в JSON шапки лицензии, под которым лежит выбор владельца сайта. */
export const DESIGN_SYSTEM_KEY = 'designSystem';

/**
 * Выбор системы из JSON шапки лицензии, уже приведённый к slug'у, который эта
 * сборка умеет нарисовать.
 *
 * Не бросает и не пустует: у сайта, который ничего не выбирал, и у сайта,
 * выбравшего систему без CSS, результат одинаковый — Базовая. Разница между
 * этими двумя случаями видна в настройках, а не в рендере.
 */
export function readDesignSystem(headerData: unknown): string {
	const source =
		typeof headerData === 'object' && headerData !== null && !Array.isArray(headerData)
			? (headerData as Record<string, unknown>)
			: {};
	const value = source[DESIGN_SYSTEM_KEY];

	return resolveDesignSystem(typeof value === 'string' ? value : null);
}
