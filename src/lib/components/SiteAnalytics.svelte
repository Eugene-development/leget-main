<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
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
	const template = $derived((page.data as { site?: { templateId?: number } }).site?.templateId);
	const trackingEnabled = $derived(enabled && !isPrivateAnalyticsUrl(page.url));
	onMount(() =>
		installGoalTracking(
			document,
			() => ({
				counterId: yandexId,
				template: template && [1, 2, 3].includes(template) ? `Promo-${template}` : 'Test',
				enabled: trackingEnabled
			}),
			(counter, method, goal) => (window as unknown as AnalyticsWindow).ym?.(counter, method, goal)
		)
	);

	const yandexId = $derived(normalizeYandexCounterId(data?.yandexMetrica));
	const googleId = $derived(normalizeGoogleTagId(data?.googleAnalytics));
	let lastYandexHit = '';
	let lastGoogleHit = '';
	let configuredIds = '';

	function stop() {
		if (!browser) return;
		stopSiteAnalytics(window as unknown as AnalyticsWindow);
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
	onDestroy(stop);

	function ensureScript(id: string, source: string) {
		if (document.getElementById(id)) return;
		const script = document.createElement('script');
		script.id = id;
		script.async = true;
		script.src = source;
		document.head.appendChild(script);
	}

	function installYandex(counterId: string) {
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
		analyticsWindow.ym(Number(counterId), 'hit', page.url.href);
	}

	function installGoogle(tagId: string) {
		const analyticsWindow = window as unknown as AnalyticsWindow;
		analyticsWindow[`ga-disable-${tagId}`] = false;
		analyticsWindow.dataLayer ??= [];
		analyticsWindow.gtag ??= (...args: unknown[]) => analyticsWindow.dataLayer!.push(args);
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
		if (yandexId && yandexHit !== lastYandexHit) {
			installYandex(yandexId);
			lastYandexHit = yandexHit;
		}
		if (googleId && googleHit !== lastGoogleHit) {
			installGoogle(googleId);
			lastGoogleHit = googleHit;
		}
	}
	$effect(syncTracking);
	afterNavigate(syncTracking);
</script>

{#if trackingEnabled && yandexId}
	<noscript>
		<div class="pointer-events-none absolute h-px w-px overflow-hidden" aria-hidden="true">
			<img src={`https://mc.yandex.ru/watch/${yandexId}`} alt="" />
		</div>
	</noscript>
{/if}
