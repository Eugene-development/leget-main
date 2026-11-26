const STORAGE_ORIGIN = 'https://storage.yandexcloud.net';
const CHECK_TIMEOUT_MS = 8000;
const CHECK_INTERVAL_MS = 30000;

export function watchYandexImageAccess(onUnavailable: () => void): () => void {
	let lastCheck = -Infinity;
	let stopped = false;
	let check: AbortController | undefined;

	async function checkStorage(image: HTMLImageElement) {
		if (check || !navigator.onLine || performance.now() - lastCheck < CHECK_INTERVAL_MS) return;
		if (!image.closest('[data-site-template]')) return;
		const src = image.currentSrc || image.src;
		if (!src.startsWith(`${STORAGE_ORIGIN}/`)) return;

		lastCheck = performance.now();
		check = new AbortController();
		const { signal } = check;
		const timer = setTimeout(() => check?.abort(), CHECK_TIMEOUT_MS);
		try {
			// Any HTTP response proves the endpoint is reachable, even if an individual image returns 404.
			await fetch(STORAGE_ORIGIN, {
				method: 'HEAD',
				mode: 'no-cors',
				credentials: 'omit',
				cache: 'no-store',
				signal
			});
		} catch {
			if (!stopped && navigator.onLine) {
				stop();
				onUnavailable();
			}
		} finally {
			clearTimeout(timer);
			check = undefined;
		}
	}

	function onImageError(event: Event) {
		if (event.target instanceof HTMLImageElement) void checkStorage(event.target);
	}

	function stop() {
		stopped = true;
		document.removeEventListener('error', onImageError, true);
		check?.abort();
	}

	document.addEventListener('error', onImageError, true);
	// Images rendered on the server may have already failed before hydration.
	for (const image of document.querySelectorAll<HTMLImageElement>('[data-site-template] img')) {
		if (image.complete && image.naturalWidth === 0) void checkStorage(image);
	}
	return stop;
}
