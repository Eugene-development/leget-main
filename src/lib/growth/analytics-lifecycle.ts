export type YandexMethod = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
export type AnalyticsWindow = Window & {
	ym?: YandexMethod;
	gtag?: (...args: unknown[]) => void;
	dataLayer?: unknown[][];
	__legetYandexCounters?: Record<string, boolean>;
	__legetGoogleTags?: Record<string, boolean>;
	[key: `ga-disable-${string}`]: boolean | undefined;
};

/** Capability URLs and account/CRM pages cannot be passed to third-party tags. */
export function isPrivateAnalyticsUrl(url: URL): boolean {
	if (
		/^\/(?:orders|crm|admin|cabinet|site-settings|goals|sms|selection)(?:\/|$)/.test(url.pathname)
	)
		return true;
	return [...url.searchParams.keys()].some((key) =>
		/draft|preview|token|secret|session|authorization|password/i.test(key)
	);
}

/**
 * Stop collection before an SPA URL change, including still-pending tag loads.
 * Yandex: https://yandex.ru/support/metrica/ru/code/counter-spa-setup
 * Google: https://developers.google.com/tag-platform/security/guides/privacy
 */
export function stopSiteAnalytics(target: AnalyticsWindow): void {
	const counters = Object.keys(target.__legetYandexCounters ?? {});
	if (target.ym?.a) {
		target.ym.a = target.ym.a.filter((args) => !counters.includes(String(args[0])));
	}
	for (const id of counters) {
		target.ym?.(Number(id), 'destruct');
		delete target.__legetYandexCounters?.[id];
	}
	// The Google tag checks this synchronous flag before sending or setting cookies.
	for (const id of Object.keys(target.__legetGoogleTags ?? {})) target[`ga-disable-${id}`] = true;
}
