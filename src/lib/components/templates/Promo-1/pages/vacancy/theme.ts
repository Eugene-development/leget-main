/**
 * Общие помощники страницы «Вакансии» (шаблон Promo-1).
 *
 * Здесь только сценарий появления: классы `vc-*` лежат в `./theme.css`.
 * Цвета в помощники не выносятся — нейтраль страница берёт ролями `p1-*`,
 * акцент — шкалой `cat-4` дизайн-системы, и ни то, ни другое блоку
 * не принадлежит.
 */

/**
 * Появление блока при попадании во вьюпорт: узел получает `.vc-visible`,
 * дальше ступени `.vc-d*` (или инлайновая `--vc-delay`) разводят элементы
 * по времени. Совпадает по устройству с `guarantees/theme.ts` — сценарий
 * у страниц шаблона общий, а вот класс-префикс у каждой свой, чтобы
 * задержки соседних страниц не пересекались в одном чанке.
 */
export function revealOnScroll(node: HTMLElement) {
	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('vc-visible');
		return;
	}

	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			node.classList.add('vc-visible');
			observer.unobserve(node);
		},
		{ threshold: 0.15 }
	);

	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}
