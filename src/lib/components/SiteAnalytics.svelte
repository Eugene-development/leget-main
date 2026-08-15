<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { normalizeGoogleTagId, normalizeYandexCounterId } from '$lib/site-settings/analytics';

	type YandexMethod = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
	type GoogleMethod = (...args: unknown[]) => void;
	type AnalyticsWindow = Window & {
		ym?: YandexMethod;
		gtag?: GoogleMethod;
		dataLayer?: unknown[][];
		__legetYandexCounters?: Record<string, boolean>;
		__legetGoogleTags?: Record<string, boolean>;
	};

	let { data = null }: { data?: Record<string, unknown> | null } = $props();

	const yandexId = $derived(normalizeYandexCounterId(data?.yandexMetrica));
	const googleId = $derived(normalizeGoogleTagId(data?.googleAnalytics));

	function ensureScript(id: string, source: string) {
		if (document.getElementById(id)) return;
		const script = document.createElement('script');
		script.id = id;
		script.async = true;
		script.src = source;
		document.head.appendChild(script);
	}

	function installYandex(counterId: string) {
		const analyticsWindow = window as AnalyticsWindow;
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
				clickmap: true,
				trackLinks: true,
				accurateTrackBounce: true,
				webvisor: true
			});
			analyticsWindow.__legetYandexCounters[counterId] = true;
		} else {
			analyticsWindow.ym(Number(counterId), 'hit', window.location.href);
		}
	}

	function installGoogle(tagId: string) {
		const analyticsWindow = window as AnalyticsWindow;
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
		analyticsWindow.gtag('config', tagId);
	}

	afterNavigate(() => {
		if (yandexId) installYandex(yandexId);
		if (googleId) installGoogle(googleId);
	});
</script>

{#if yandexId}
	<noscript>
		<div class="pointer-events-none absolute h-px w-px overflow-hidden" aria-hidden="true">
			<img src={`https://mc.yandex.ru/watch/${yandexId}`} alt="" />
		</div>
	</noscript>
{/if}
