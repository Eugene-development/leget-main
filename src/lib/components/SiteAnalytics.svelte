<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import { documentVisitGate } from '$lib/antibot/visit-gate';
	import { documentEngagementBudget, checkEngagement } from '$lib/antibot/engagement';
	import { page } from '$app/state';
	import { installGoalTracking } from '$lib/yandex-direct/tracking';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { normalizeGoogleTagId, normalizeYandexCounterId } from '$lib/site-settings/analytics';

	import {
		isPrivateAnalyticsUrl,
		stopSiteAnalytics,
		type AnalyticsWindow
	} from '$lib/growth/analytics-lifecycle';

	let {
		data = null,
		enabled = true
	}: { data?: Record<string, unknown> | null; enabled?: boolean } = $props();
	type AnalyticsSite = { templateId?: number | null };
	const siteData = $derived(
		page.data as { pageData?: { site?: AnalyticsSite | null }; site?: AnalyticsSite | null }
	);
	// Public pages use renderPage; calculator/university expose site directly.
	const template = $derived(siteData.pageData?.site?.templateId ?? siteData.site?.templateId);
	const trackingEnabled = $derived(enabled && !isPrivateAnalyticsUrl(page.url));
	const protectedAnalytics = () => env.PUBLIC_ANTIBOT_ENABLED !== 'false';
	let visitGate: ReturnType<typeof documentVisitGate> | undefined;
	let unsubscribeVisit: (() => void) | undefined;
	let pendingGoals = new AbortController();
	onMount(() => {
		visitGate = documentVisitGate(document);
		const takeBudget = documentEngagementBudget(document);
		syncTracking();
		const remove = installGoalTracking(
			document,
			() => ({
				counterId: yandexId,
				template: template && [1, 2, 3].includes(template) ? `Promo-${template}` : 'Test',
				enabled: trackingEnabled
			}),
			(counter, method, goal) => (window as unknown as AnalyticsWindow).ym?.(counter, method, goal),
			(event, goalTemplate, goal, deliver) => {
				if (!protectedAnalytics()) {
					deliver();
					return;
				}
				if (!visitGate?.activate(event)) return;
				// Activate/init synchronously so the very first CTA isn't lost.
				syncTracking();
				if (!takeBudget(`${page.url.host}:${yandexId}`, goal)) return;
				const signal = pendingGoals.signal;
				const context = `${page.url.host}:${yandexId}:${template}`;
				void checkEngagement(goalTemplate, goal, signal).then((allowed) => {
					if (
						allowed &&
						!signal.aborted &&
						trackingEnabled &&
						context === `${page.url.host}:${yandexId}:${template}`
					) {
						try {
							deliver();
						} catch {
							/* Analytics never blocks the UI. */
						}
					}
				});
			}
		);
		return () => {
			remove();
			unsubscribeVisit?.();
			unsubscribeVisit = undefined;
		};
	});

	const yandexId = $derived(normalizeYandexCounterId(data?.yandexMetrica));
	const googleId = $derived(normalizeGoogleTagId(data?.googleAnalytics));
	let lastYandexHit = '';
	let lastGoogleHit = '';
	let configuredIds = '';

	function stop(resetVisit = true) {
		if (!browser) return;
		pendingGoals.abort();
		pendingGoals = new AbortController();
		unsubscribeVisit?.();
		unsubscribeVisit = undefined;
		if (resetVisit) visitGate?.reset();
		if (resetVisit) stopSiteAnalytics(window as unknown as AnalyticsWindow);
		lastYandexHit = '';
		lastGoogleHit = '';
		configuredIds = '';
	}

	// Synchronous teardown runs before pushState and third-party history observers.
	beforeNavigate((navigation) => {
		const destination = navigation.to?.url;
		const privateDestination = Boolean(destination && isPrivateAnalyticsUrl(destination));
		const target = window as unknown as AnalyticsWindow;
		const hasLoadedTags =
			Object.keys(target.__legetYandexCounters ?? {}).length > 0 ||
			Object.keys(target.__legetGoogleTags ?? {}).length > 0;
		if (!destination || !enabled || privateDestination) stop();
		// A clean document also clears automatic history/referrer observers inside
		// downloaded third-party libraries, which have no complete unload API.
		if (destination && privateDestination && hasLoadedTags && !navigation.willUnload) {
			navigation.cancel();
			window.location.assign(destination.href);
		}
	});
	onDestroy(() => stop(false));

	function ensureScript(id: string, source: string) {
		if (document.getElementById(id)) return;
		const script = document.createElement('script');
		script.id = id;
		script.async = true;
		script.src = source;
		document.head.appendChild(script);
	}

	function installYandex(counterId: string, url: string, referrer: string) {
		const analyticsWindow = window as unknown as AnalyticsWindow;
		analyticsWindow.ym ??= Object.assign(
			(...args: unknown[]) => {
				analyticsWindow.ym!.a ??= [];
				analyticsWindow.ym!.a!.push(args);
			},
			{ l: Date.now() }
		);
		ensureScript('leget-yandex-metrica', 'https://mc.yandex.ru/metrika/tag.js');

		analyticsWindow.__legetYandexCounters ??= {};
		if (!analyticsWindow.__legetYandexCounters[counterId]) {
			analyticsWindow.ym(Number(counterId), 'init', {
				defer: true,
				clickmap: true,
				trackLinks: true,
				accurateTrackBounce: true,
				webvisor: true
			});
			analyticsWindow.__legetYandexCounters[counterId] = true;
		}
		analyticsWindow.ym(Number(counterId), 'hit', url, { referer: referrer });
	}

	function installGoogle(tagId: string) {
		const analyticsWindow = window as unknown as AnalyticsWindow;
		analyticsWindow[`ga-disable-${tagId}`] = false;
		analyticsWindow.dataLayer ??= [];
		// gtag.js recognizes Arguments as commands; plain arrays use another protocol.
		analyticsWindow.gtag ??= function () {
			analyticsWindow.dataLayer!.push(arguments);
		};
		ensureScript(
			`leget-google-tag-${tagId}`,
			`https://www.googletagmanager.com/gtag/js?id=${tagId}`
		);

		analyticsWindow.__legetGoogleTags ??= {};
		if (!analyticsWindow.__legetGoogleTags[tagId]) {
			analyticsWindow.gtag('js', new Date());
			analyticsWindow.__legetGoogleTags[tagId] = true;
		}
		analyticsWindow.gtag('config', tagId, { page_location: page.url.href });
	}

	function syncTracking() {
		if (!browser) return;
		if (!trackingEnabled) {
			stop();
			return;
		}
		const ids = `${yandexId ?? ''}:${googleId ?? ''}`;
		if (configuredIds && configuredIds !== ids) stop();
		configuredIds = ids;
		const yandexHit = `${yandexId}:${page.url.href}`;
		const googleHit = `${googleId}:${page.url.href}`;
		if (yandexId && visitGate) {
			const key = `${page.url.host}:${yandexId}`;
			if (visitGate.key && visitGate.key !== key) {
				stop();
				configuredIds = ids;
			}
			const landing = visitGate.remember(key, page.url.href, isSafeReferrer(document.referrer));
			lastYandexHit = visitGate.lastHit ? `${yandexId}:${visitGate.lastHit}` : '';
			if (protectedAnalytics() && !unsubscribeVisit)
				unsubscribeVisit = visitGate.subscribe(syncTracking);
			if ((!protectedAnalytics() || visitGate.ready) && yandexHit !== lastYandexHit) {
				if (!lastYandexHit) installYandex(yandexId, landing.url, landing.referrer);
				if (lastYandexHit || landing.url !== page.url.href)
					installYandex(yandexId, page.url.href, visitGate.lastHit || landing.url);
				lastYandexHit = yandexHit;
				visitGate.sent(page.url.href);
			}
		}
		if (googleId && googleHit !== lastGoogleHit) {
			installGoogle(googleId);
			lastGoogleHit = googleHit;
		}
	}
	function isSafeReferrer(value: string) {
		try {
			return isPrivateAnalyticsUrl(new URL(value)) ? '' : value;
		} catch {
			return '';
		}
	}
	$effect(syncTracking);
	afterNavigate(syncTracking);
</script>
