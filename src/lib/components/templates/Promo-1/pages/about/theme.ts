/**
 * Общие помощники страницы «О компании» (шаблон Promo-1).
 *
 * Палитра: тёмный slate с красным акцентом у Hero, WhyUs и CTA; светлые секции
 * между ними. Токенов здесь нет — цвета остаются в компонентах; общими сделаны
 * текстуры и сценарий появления, классы `ab-*` лежат в `./theme.css`.
 *
 * Ритм поверхностей закреплён за порядком блоков и завязан на волну Hero:
 *   Hero (ink) → Text (slate-50) → Statistics (slate-50) → Mission (white)
 *   → Values (slate-50) → WhyUs (ink) → AboutCTA (red)
 */

/**
 * Появление блока при попадании во вьюпорт: узел получает `.ab-visible`,
 * дальше ступени `.ab-d*` (или инлайновая `--ab-delay`) разводят элементы по времени.
 */
export function revealOnScroll(node: HTMLElement) {
	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('ab-visible');
		return;
	}

	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			node.classList.add('ab-visible');
			observer.unobserve(node);
		},
		{ threshold: 0.15 }
	);

	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}
