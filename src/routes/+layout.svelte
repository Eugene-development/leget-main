<script>
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { setContext } from 'svelte';
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
			document.startViewTransition ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		)
			return;

		const body = document.body;
		if (body.classList.contains('page-entering')) {
			body.classList.remove('page-entering');
			void body.offsetWidth;
		}
		body.classList.add('page-entering');
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<LoadingProgress active={loadingPage || pendingContent > 0} />
<NavigationBody root delegated={navigationBodies > 0} workspace={loadingWorkspace}>
	{@render children()}
</NavigationBody>

<Toast />

{#if siteSearch.open}
	<SiteSearchModal />
{/if}

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
