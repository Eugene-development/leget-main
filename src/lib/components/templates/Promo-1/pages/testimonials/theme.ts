/**
 * Общие помощники страницы «Отзывы» (шаблон Promo-1).
 *
 * Палитра: розово-фуксиевый градиент у Hero, тёплая поверхность `--color-surface`
 * у остальных блоков (см. `src/routes/layout.css`). Токенов здесь нет — цвета
 * остаются в компонентах; общими сделаны текстуры и сценарий появления,
 * классы `tm-*` лежат в `./theme.css`.
 */

/**
 * Появление блока при попадании во вьюпорт: узел получает `.tm-visible`,
 * дальше ступени `.tm-d*` (или инлайновая `--tm-delay`) разводят элементы по времени.
 */
export function revealOnScroll(node: HTMLElement) {
	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('tm-visible');
		return;
	}

	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			node.classList.add('tm-visible');
			observer.unobserve(node);
		},
		{ threshold: 0.1 }
	);

	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}
