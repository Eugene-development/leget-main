/** Reveal each element when it reaches the viewport, independently of its section. */
export function reveal(node: HTMLElement, animation: string) {
	const show = () => {
		// Long lists used to stagger from the start of the section; keep the delay short
		// now that each item has its own trigger.
		const delay = Number.parseFloat(getComputedStyle(node).animationDelay);
		if (Number.isFinite(delay) && delay > 0.2) node.style.animationDelay = '0.2s';
		node.classList.add(animation);
	};

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
		node.classList.remove('opacity-0');
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			if (entries.some((entry) => entry.isIntersecting)) {
				show();
				observer.disconnect();
			}
		},
		{ rootMargin: '10000px 0px -48px 0px' }
	);
	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}
