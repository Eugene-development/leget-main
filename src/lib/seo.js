// Keep the request origin: one application can serve unrelated subscriber domains.
// Only the canonical is cleaned; the actual visit URL remains intact for analytics.
const trackingParameters = new Set(['yclid', 'ysclid', 'ybaip', 'etext', 'gclid', 'fbclid']);

/** @param {{ href: string }} url */
export function canonicalUrl(url) {
	const canonical = new URL(url.href);
	canonical.hash = '';
	for (const name of [...canonical.searchParams.keys()]) {
		if (name.toLowerCase().startsWith('utm_') || trackingParameters.has(name.toLowerCase())) {
			canonical.searchParams.delete(name);
		}
	}
	return canonical.href;
}
