/**
 * Общие помощники страницы «Рассрочка» (шаблон Promo-1).
 *
 * Палитра у блоков разная (violet/purple — Hero и CTA, red — программы и шаги),
 * поэтому дизайн-токенов здесь нет: цвета остаются в самих компонентах.
 * Общими сделаны только текстуры и сценарий появления — классы `it-*`
 * лежат в `./theme.css`, триггер добавляет функция ниже.
 */

/**
 * Появление блока при попадании во вьюпорт: узел получает `.it-visible`,
 * дальше ступени `.it-d*` (или инлайновая `--it-delay`) разводят элементы по времени.
 */
export function revealOnScroll(node: HTMLElement) {
	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('it-visible');
		return;
	}

	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			node.classList.add('it-visible');
			observer.unobserve(node);
		},
		{ threshold: 0.15 }
	);

	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}
