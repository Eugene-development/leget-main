type Stamp = { goal: string; at: number };

/** Storage is optional; a broken/private browser still has an in-memory budget. */
export function createEngagementBudget(storage: () => Storage | undefined, now = Date.now) {
	const memory = new Map<string, Stamp[]>();
	return (scope: string, goal: string) => {
		let recent = memory.get(scope) ?? [];
		const key = `leget_engagement_v1:${scope}`;
		try {
			const parsed: unknown = JSON.parse(storage()?.getItem(key) ?? 'null');
			if (Array.isArray(parsed))
				recent = parsed.filter(
					(item): item is Stamp => item && typeof item.goal === 'string' && Number.isFinite(item.at)
				);
		} catch {
			/* Fall back to memory. */
		}
		const time = now();
		recent = recent.filter((item) => item.at <= time && time - item.at < 60000);
		if (recent.length >= 20 || recent.some((item) => item.goal === goal && time - item.at < 1000))
			return false;
		const next = [...recent, { goal, at: time }];
		memory.set(scope, next);
		try {
			storage()?.setItem(key, JSON.stringify(next));
		} catch {
			/* Optional storage. */
		}
		return true;
	};
}

const budgets = new WeakMap<Document, ReturnType<typeof createEngagementBudget>>();
export function documentEngagementBudget(doc: Document) {
	let budget = budgets.get(doc);
	if (!budget) {
		budget = createEngagementBudget(() => doc.defaultView?.sessionStorage);
		budgets.set(doc, budget);
	}
	return budget;
}

/** Only network/5xx failures fail open. Explicit server refusals suppress goals. */
export async function checkEngagement(
	template: string,
	goal: string,
	signal: AbortSignal,
	request = fetch
) {
	try {
		const response = await request('/antibot/engagement', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify({ template, goal }),
			signal: AbortSignal.any([signal, AbortSignal.timeout(1500)])
		});
		if (response.status >= 500) return true;
		if (!response.ok) return false;
		return await response
			.json()
			.then((body) => body?.allowed === true)
			.catch(() => false);
	} catch {
		return !signal.aborted;
	}
}
