type Landing = { key: string; url: string; referrer: string };

/** Document lifetime only: no persistent claim that a visitor is human. */
export function createVisitGate(
	doc: Document,
	clock = {
		now: () => performance.now(),
		set: (fn: () => void, ms: number) => setTimeout(fn, ms),
		clear: (id: ReturnType<typeof setTimeout>) => clearTimeout(id)
	}
) {
	let ready = false;
	let elapsed = 0;
	let visibleSince: number | null = null;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let landing: Landing | null = null;
	let lastHit = '';
	const subscribers = new Set<() => void>();
	const signals = [
		'click',
		'pointerdown',
		'touchstart',
		'keydown',
		'scroll',
		'pointermove',
		'mousemove',
		'wheel'
	];
	function pause() {
		if (timer !== undefined) clock.clear(timer);
		timer = undefined;
		if (visibleSince !== null) elapsed += Math.max(0, clock.now() - visibleSince);
		visibleSince = null;
	}
	function confirm() {
		if (ready) return;
		ready = true;
		pause();
		for (const fn of subscribers) fn();
	}
	function visibility() {
		pause();
		if (ready || doc.visibilityState === 'hidden' || !subscribers.size) return;
		visibleSince = clock.now();
		timer = clock.set(confirm, Math.max(0, 8000 - elapsed));
	}
	function activate(event: Event) {
		if (event.isTrusted !== true || doc.visibilityState === 'hidden') return false;
		confirm();
		return true;
	}
	return {
		get ready() {
			return ready;
		},
		get lastHit() {
			return lastHit;
		},
		get key() {
			return landing?.key;
		},
		sent(url: string) {
			lastHit = url;
		},
		activate,
		remember(key: string, url: string, referrer: string) {
			if (landing?.key !== key) {
				landing = { key, url, referrer };
				lastHit = '';
			}
			return landing;
		},
		reset() {
			pause();
			ready = false;
			elapsed = 0;
			landing = null;
			lastHit = '';
			visibility();
		},
		subscribe(fn: () => void) {
			subscribers.add(fn);
			if (subscribers.size === 1) {
				for (const signal of signals)
					doc.addEventListener(signal, activate, { capture: true, passive: true });
				doc.addEventListener('visibilitychange', visibility);
				visibility();
			}
			return () => {
				subscribers.delete(fn);
				if (subscribers.size) return;
				pause();
				for (const signal of signals) doc.removeEventListener(signal, activate, true);
				doc.removeEventListener('visibilitychange', visibility);
			};
		}
	};
}

const gates = new WeakMap<Document, ReturnType<typeof createVisitGate>>();
export function documentVisitGate(doc: Document) {
	let gate = gates.get(doc);
	if (!gate) {
		gate = createVisitGate(doc);
		gates.set(doc, gate);
	}
	return gate;
}
