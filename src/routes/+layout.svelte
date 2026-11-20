<script>
	import { canonicalUrl } from '$lib/seo.js';
	import { afterNavigate, onNavigate, replaceState } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { setContext, tick } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ServiceOrderIsland from '$lib/components/ServiceOrderIsland.svelte';
	import ClientAuthModal from '$lib/components/ClientAuthModal.svelte';
	import { clientAuthModal } from '$lib/stores/client-auth.svelte';
	import SiteSearchModal from '$lib/components/SiteSearchModal.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { siteSearch } from '$lib/stores/site-search.svelte';
	import NavigationBody from '$lib/components/NavigationBody.svelte';
	import LoadingProgress from '$lib/components/LoadingProgress.svelte';

	let { children } = $props();
	let pendingContent = $state(0);
	let navigationBodies = $state(0);
	setContext('leget-navigation-body', {
		active: () => loadingPage,
		register() {
			navigationBodies += 1;
			let stopped = false;
			return () => {
				if (stopped) return;
				stopped = true;
				navigationBodies -= 1;
			};
		}
	});
	setContext('leget-content-loading', {
		start() {
			pendingContent += 1;
			let stopped = false;
			return () => {
				if (stopped) return;
				stopped = true;
				pendingContent -= 1;
			};
		}
	});
	const loadingPage = $derived(
		!!navigating.to &&
			!navigating.willUnload &&
			(navigating.from?.url.pathname !== navigating.to.url.pathname ||
				navigating.from?.url.search !== navigating.to.url.search)
	);
	const loadingWorkspace = $derived(
		/^\/(admin|cabinet|partner|crm|curator|site-settings|university\/student)(\/|$)/.test(
			navigating.to?.url.pathname ?? ''
		)
	);

	// Кабинеты отправляют гостя на главную с командой открыть вход.
	// Обрабатываем её после каждого перехода независимо от шаблона и шапки.
	afterNavigate(async () => {
		// Первый afterNavigate вызывается до завершения инициализации роутера.
		await tick();
		if (page.url.searchParams.get('auth') !== 'client-login') return;
		const url = new URL(page.url);
		url.searchParams.delete('auth');
		replaceState(url, page.state);
		if (!page.data.client) clientAuthModal.open('login');
	});

	onNavigate((navigation) => {
		if (
			loadingPage ||
			navigation.from?.url.pathname === navigation.to?.url.pathname ||
			!document.startViewTransition ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		)
			return;

		return new Promise((resolve) => {
			// Resume navigation after the old page is captured; finish after the new DOM is ready.
			const transition = document.startViewTransition(() => new Promise((done) => resolve(done)));
			transition.ready.catch(() => {});
			transition.finished.catch(() => {});
		});
	});

	afterNavigate((navigation) => {
		if (
			!navigation.from ||
			navigation.from.url.pathname === navigation.to?.url.pathname ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		)
			return;

		const region = document.querySelector('[data-smooth-navigation]');
		if (!region && document.startViewTransition) return;

		const target = region ?? document.body;
		if (target.classList.contains('page-entering')) {
			target.classList.remove('page-entering');
			void target.getBoundingClientRect();
		}
		target.classList.add('page-entering');
	});

	const seoCanonical = $derived(canonicalUrl(page.url));

	const seoPrivate = $derived(/^\/(?:admin|cabinet|partner|crm|curator|orders|site-settings|goals|_ds|favorites|selection|university\/(?:learn|student|auth|resources|interviews|certificate))(?:\/|$)/.test(page.url.pathname) || page.url.searchParams.has('draft'));
</script>

<svelte:head>
	{#if seoPrivate}
		<meta name="robots" content="noindex, nofollow" />
	{:else if page.status >= 200 && page.status < 300}
		<link rel="canonical" href={seoCanonical} />
	{/if}
<link rel="icon" href={favicon} /></svelte:head>

<LoadingProgress active={loadingPage || pendingContent > 0} />
{#if page.data.backendUnavailable}
	<aside role="status" class="offline-notice">
		Каталог временно недоступен. Информация о компании и услуги доступны.
		Пожалуйста, повторите попытку позже.
	</aside>
{/if}
<NavigationBody root delegated={navigationBodies > 0} workspace={loadingWorkspace}>
	{@render children()}
</NavigationBody>

<Toast />

{#if siteSearch.open}
	<SiteSearchModal />
{/if}

<style>
	.offline-notice {
		position: relative;
		z-index: 60;
		padding: 1rem;
		background: var(--ds-surface-raised, Canvas);
		color: var(--ds-ink-900, CanvasText);
		border-bottom: 1px solid currentColor;
		text-align: center;
	}
</style>

<!--
	Форма входа и регистрации клиента рендерится здесь, а не рядом с кнопками
	в баннере: `backdrop-blur` баннера делает его containing block'ом для
	`position: fixed`, и модалка схлопывалась внутрь узкой полосы.
-->
{#if clientAuthModal.mode}
	<ClientAuthModal onClose={() => clientAuthModal.close()} />
{/if}

<!--
	/_ds — каталог дизайн-системы: карточка должна содержать блок и ничего кроме блока,
	иначе плавающая кнопка заказа попадёт в каждое превью.
-->
{#if !page.url.pathname.startsWith('/admin') && !page.url.pathname.startsWith('/_ds') && !page.url.pathname.startsWith('/goals') && !page.url.pathname.startsWith('/site-settings') && !page.url.pathname.startsWith('/cabinet') && !page.url.pathname.startsWith('/partner') && !page.url.pathname.startsWith('/crm') && !page.url.pathname.startsWith('/university/')}
	<ServiceOrderIsland />
{/if}
