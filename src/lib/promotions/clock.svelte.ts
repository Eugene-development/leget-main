/** Shared expiry clock for SSR and open pages, including a tab resumed after suspension. */
export function usePromotionClock(deadlines: () => (number | null)[]): () => number {
	let now = $state(Date.now());

	$effect(() => {
		const refresh = () => (now = Date.now());
		const next = Math.min(
			...deadlines().filter((date): date is number => date !== null && date > now)
		);
		const timeout = Number.isFinite(next)
			? window.setTimeout(refresh, Math.min(2_147_483_647, Math.max(0, next - Date.now())))
			: undefined;
		document.addEventListener('visibilitychange', refresh);
		window.addEventListener('pageshow', refresh);
		return () => {
			window.clearTimeout(timeout);
			document.removeEventListener('visibilitychange', refresh);
			window.removeEventListener('pageshow', refresh);
		};
	});

	return () => now;
}
