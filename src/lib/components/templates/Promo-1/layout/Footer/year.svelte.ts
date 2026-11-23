import { onMount } from 'svelte';

export function useCurrentYear(): () => number {
	let year = $state(new Date().getFullYear());

	onMount(() => {
		let timer: number | undefined;

		function refresh() {
			const now = new Date();
			year = now.getFullYear();
			const nextYear = new Date(year + 1, 0, 1);
			window.clearTimeout(timer);
			// Browser timers cap delays at the maximum signed 32-bit integer.
			timer = window.setTimeout(
				refresh,
				Math.min(nextYear.getTime() - now.getTime(), 2_147_483_647)
			);
		}

		refresh();
		document.addEventListener('visibilitychange', refresh);
		window.addEventListener('pageshow', refresh);

		return () => {
			window.clearTimeout(timer);
			document.removeEventListener('visibilitychange', refresh);
			window.removeEventListener('pageshow', refresh);
		};
	});

	return () => year;
}
