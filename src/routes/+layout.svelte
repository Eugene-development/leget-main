<script>
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ServiceOrderIsland from '$lib/components/ServiceOrderIsland.svelte';
	import ClientAuthModal from '$lib/components/ClientAuthModal.svelte';
	import { clientAuthModal } from '$lib/stores/client-auth.svelte';
	import SiteSearchModal from '$lib/components/SiteSearchModal.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { siteSearch } from '$lib/stores/site-search.svelte';

	let { children } = $props();

	onNavigate((navigation) => {
		if (
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

{@render children()}

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
