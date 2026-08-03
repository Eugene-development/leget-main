/**
 * Светлая/тёмная тема блока страницы.
 *
 * Состояние живёт в `data.theme` ('light' | 'dark'), как у HeroMain. Если поле
 * не задано, берётся дефолт блока: белые секции объявляют 'light', ink-секции —
 * 'dark', поэтому нетронутый блок выглядит ровно так, как его нарисовали, а
 * переключатель просто инвертирует исходный вид.
 *
 * Цвета переключаются не условиями в разметке, а семантическими классами
 * (`p1-surface`, `p1-title`, …) — см. templates/Promo-1/theme.css.
 */

import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

export type BlockTheme = 'light' | 'dark';

/** Тема блока с учётом дефолта. */
export function blockTheme(
	data: Record<string, unknown> | null | undefined,
	fallback: BlockTheme = 'light'
): BlockTheme {
	const value = data?.theme;
	return value === 'light' || value === 'dark' ? value : fallback;
}

/** Светлая ли тема у блока (для ThemeToggle). */
export function isLightBlock(
	data: Record<string, unknown> | null | undefined,
	fallback: BlockTheme = 'light'
): boolean {
	return blockTheme(data, fallback) === 'light';
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
	/** Тема блока по умолчанию, когда `data.theme` не задан. */
	fallback?: BlockTheme | (() => BlockTheme);
}): () => Promise<void> {
	return async () => {
		const context = options.getContext();
		if (!context) return;

		const type = typeof options.type === 'function' ? options.type() : options.type;
		const fallback =
			typeof options.fallback === 'function' ? options.fallback() : (options.fallback ?? 'light');

		const previous = options.getData();
		const next = {
			...previous,
			theme: isLightBlock(previous, fallback) ? 'dark' : 'light'
		};

		// Оптимистично: тема применяется сразу, откат только при ошибке сохранения.
		options.setData(next);
		try {
			await saveComponentData(context, type, next);
		} catch (err) {
			options.setData(previous);
			console.error(`Ошибка сохранения темы для ${type}:`, err);
		}
	};
}
