/**
 * Общие помощники страницы «Гарантии» (шаблон Promo-1).
 *
 * Палитра у блоков разная (тёмный slate + emerald/cyan у Hero и CTA, red —
 * у списка «что покрывает» и шагов), поэтому дизайн-токенов здесь нет:
 * цвета остаются в компонентах. Общими сделаны только текстуры и сценарий
 * появления — классы `gt-*` лежат в `./theme.css`.
 */

/**
 * Появление блока при попадании во вьюпорт: узел получает `.gt-visible`,
 * дальше ступени `.gt-d*` (или инлайновая `--gt-delay`) разводят элементы по времени.
 */
export function revealOnScroll(node: HTMLElement) {
	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('gt-visible');
		return;
	}

	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			node.classList.add('gt-visible');
			observer.unobserve(node);
		},
		{ threshold: 0.15 }
	);

	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}
