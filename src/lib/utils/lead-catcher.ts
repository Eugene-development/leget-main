export const LEAD_CATCHER_DELAY = 15_000;
export const LEAD_CATCHER_COOLDOWN = 24 * 60 * 60 * 1000;

/** One browser-app session; survives Svelte route and Banner variant changes. No visitor data. */
const visits = new Map<string, { started: number; shown: boolean }>();
export function createLeadCatcherGate(
	site: string,
	storage: Pick<Storage, 'getItem' | 'setItem'> | null,
	now = Date.now
) {
	let visit = visits.get(site);
	if (!visit) {
		visit = { started: now(), shown: false };
		visits.set(site, visit);
	}
	const state = visit;
	const key = `leget:lead-catcher:${site}:shown-at`;
	return {
		claim() {
			if (now() - state.started < LEAD_CATCHER_DELAY) return false;
			try {
				if (!storage) throw new Error('Storage unavailable');
				const raw = storage.getItem(key);
				const shown = Number(raw);
				if (raw !== null && Number.isFinite(shown) && now() - shown < LEAD_CATCHER_COOLDOWN)
					return false;
				storage.setItem(key, String(now()));
			} catch {
				if (state.shown) return false;
			}
			state.shown = true;
			return true;
		}
	};
}

export function isTopExit(
	event: { relatedTarget: EventTarget | null; clientY: number },
	previousY: number | null
) {
	return (
		event.relatedTarget === null &&
		event.clientY <= 0 &&
		previousY !== null &&
		previousY > event.clientY
	);
}

export function leadCatcherPolicy(value: unknown): string {
	if (typeof value !== 'string') return '';
	const trimmed = value.trim();
	// Only same-site paths: no script URLs or links to an unrelated tenant's policy.
	return /^\/(?!\/)[^\s\\]*$/.test(trimmed) ? trimmed : '';
}
