/**
 * Светлая/тёмная тема блока страницы.
 *
 * Состояние живёт в `data.theme` ('light' | 'dark'), как у HeroMain. Если поле
 * не задано, берётся дефолт блока: белые секции объявляют 'light', ink-секции —
 * 'dark', поэтому нетронутый блок выглядит ровно так, как его нарисовали, а
 * переключатель просто инвертирует исходный вид.
 *
 * Ключ можно заменить (`key`): layout-компоненты делят один blob на несколько
 * блоков, и баннер хранит свою тему в `bannerTheme` — рядом с `bannerVersion`.
 *
 * Цвета переключаются не условиями в разметке, а семантическими классами
 * (`p1-surface`, `p1-title`, …) — см. templates/Promo-1/theme.css.
 */

import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

export type BlockTheme = 'light' | 'dark';

/**
 * Тема блока с учётом дефолта.
 *
 * `key` нужен layout-компонентам: баннер, хэдер и меню делят один blob
 * `headerData` (см. saveLayoutData), поэтому голое поле `theme` там означало бы
 * «тема хэдера целиком», а не тема конкретной полосы. Баннер хранит свою тему
 * в `bannerTheme` — рядом со своей же версией `bannerVersion`. У page-блоков,
 * у которых blob свой, ключ остаётся общим (`theme`).
 */
export function blockTheme(
	data: Record<string, unknown> | null | undefined,
	fallback: BlockTheme = 'light',
	key: string = 'theme'
): BlockTheme {
	const value = data?.[key];
	return value === 'light' || value === 'dark' ? value : fallback;
}

/** Светлая ли тема у блока (для ThemeToggle). */
export function isLightBlock(
	data: Record<string, unknown> | null | undefined,
	fallback: BlockTheme = 'light',
	key: string = 'theme'
): boolean {
	return blockTheme(data, fallback, key) === 'light';
}

/**
 * Обработчик переключения темы блока: оптимистичное обновление с откатом.
 *
 * Данные компонента нельзя передать значением (нужен write-back в `data`
 * вызывающего), поэтому принимаем геттер и сеттер:
 *
 * ```ts
 * const toggleTheme = createThemeToggle({
 *   type: 'Hero',
 *   fallback: 'dark',
 *   getData: () => data,
 *   setData: (next) => (data = next),
 *   getContext: () => editContext
 * });
 * ```
 */
export function createThemeToggle(options: {
	/**
	 * Тип компонента для upsert (совпадает с ключом в карте страницы).
	 * Функцию передавайте там, где значение приходит пропсом (VersionSwitcher):
	 * литерал захватил бы только начальное значение.
	 */
	type: string | (() => string);
	getData: () => Record<string, unknown>;
	setData: (next: Record<string, unknown>) => void;
	getContext: () => EditContext | null;
	/** Тема блока по умолчанию, когда поле темы не задано. */
	fallback?: BlockTheme | (() => BlockTheme);
	/** Ключ темы в data. По умолчанию `theme` — см. blockTheme(). */
	key?: string;
	/**
	 * Как сохранять. По умолчанию — `saveComponentData` (page-блок пишет свой
	 * blob). Layout-компоненты пишут общий blob лицензии и передают сюда
	 * `saveLayoutData`: у баннера тема живёт в `headerData`, рядом с версией.
	 */
	save?: (context: EditContext, type: string, next: Record<string, unknown>) => Promise<unknown>;
}): () => Promise<void> {
	return async () => {
		const context = options.getContext();
		if (!context) return;

		const type = typeof options.type === 'function' ? options.type() : options.type;
		const fallback =
			typeof options.fallback === 'function' ? options.fallback() : (options.fallback ?? 'light');
		const key = options.key ?? 'theme';
		const save = options.save ?? ((ctx, t, next) => saveComponentData(ctx, t, next));

		const previous = options.getData();
		const next = {
			...previous,
			[key]: isLightBlock(previous, fallback, key) ? 'dark' : 'light'
		};

		// Оптимистично: тема применяется сразу, откат только при ошибке сохранения.
		options.setData(next);
		try {
			await save(context, type, next);
		} catch (err) {
			options.setData(previous);
			console.error(`Ошибка сохранения темы для ${type}:`, err);
		}
	};
}
