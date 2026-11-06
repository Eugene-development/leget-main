type Control = { node: HTMLElement; scope: HTMLElement; offset: number };

const controls = new Set<Control>();
let frame = 0;
let observer: ResizeObserver | undefined;

function schedule() {
	if (!frame) frame = requestAnimationFrame(position);
}

function position() {
	frame = 0;
	const chrome = document.querySelector<HTMLElement>('[data-scroll-chrome]');
	const header = chrome ?? document.querySelector<HTMLElement>('header');
	const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom ?? 0);
	// Read all geometry before writing styles, even on pages with many blocks.
	const updates = [...controls].map((control) => {
		const { node, scope, offset } = control;
		const rect = node.getBoundingClientRect();
		const naturalTop = rect.top - offset;
		const top = (header?.contains(node) ? 0 : headerBottom) + 8;
		const next = node.getClientRects().length
			? Math.max(
					0,
					Math.min(
						top - naturalTop,
						scope.getBoundingClientRect().bottom - 8 - rect.height - naturalTop
					)
				)
			: 0;
		return { control, next };
	});
	for (const { control, next } of updates) {
		if (next === control.offset) continue;
		control.offset = next;
		control.node.style.translate = next ? `0 ${next}px` : '';
	}
}

/** Keep editor controls in their block, including overflow-hidden/clip wrappers.
 * Moving only the trigger preserves DOM/focus order and FieldToolbar's anchor;
 * the existing portalled menus follow its actual viewport position.
 */
export function componentControlsScope(node: HTMLElement) {
	return node.parentElement?.closest<HTMLElement>(
		'[data-field-toolbar-scope], section, aside, footer, header, [role="dialog"]'
	);
}

export function stickyComponentControls(node: HTMLElement) {
	const scope = componentControlsScope(node);
	if (!scope) return;
	const previousTranslate = node.style.translate;
	const control = { node, scope, offset: 0 };
	controls.add(control);
	if (!observer) {
		observer = new ResizeObserver(schedule);
		observer.observe(document.body);
		window.addEventListener('scroll', schedule, { passive: true, capture: true });
		window.addEventListener('resize', schedule);
		document.addEventListener('scroll-chrome-position', schedule, true);
	}
	observer.observe(scope);
	observer.observe(node);
	schedule();
	return {
		destroy() {
			controls.delete(control);
			observer?.unobserve(node);
			if (![...controls].some((other) => other.scope === scope)) observer?.unobserve(scope);
			node.style.translate = previousTranslate;
			if (controls.size) return;
			observer?.disconnect();
			observer = undefined;
			window.removeEventListener('scroll', schedule, true);
			window.removeEventListener('resize', schedule);
			document.removeEventListener('scroll-chrome-position', schedule, true);
			cancelAnimationFrame(frame);
			frame = 0;
		}
	};
}
