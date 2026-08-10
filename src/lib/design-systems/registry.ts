/**
 * Реестр дизайн-систем на стороне фронта.
 *
 * Зеркало таблицы `design_systems` в БД (slug — общий ключ). Дублирование
 * вынужденное и того же рода, что `config/component_variants.php`: значения
 * токенов живут в CSS, который собирается на билде, а бэкенд про CSS ничего
 * не знает. Сверять по slug'у.
 *
 * ⚠️ Выбор системы пользователем **пока нигде не хранится** — колонки под него
 * нет (открытый вопрос в docs/architecture/design-systems.md). Поэтому здесь
 * только справочник и утилита применения атрибута; кто и когда её вызовет,
 * появится вместе с хранением выбора.
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
		slug: 'graphite',
		name: 'Графит',
		isBase: false,
		inDatabase: false,
		description:
			'Проверка абстракции: чистый рескин на одних значениях токенов, без единой правки ' +
			'в компонентах. Пользователю не предлагается, строки в БД нет.'
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
