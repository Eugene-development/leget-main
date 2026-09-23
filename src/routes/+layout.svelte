<script>
	import { page } from '$app/state';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ServiceOrderIsland from '$lib/components/ServiceOrderIsland.svelte';
	import ClientAuthModal from '$lib/components/ClientAuthModal.svelte';
	import { clientAuthModal } from '$lib/stores/client-auth.svelte';
	import SiteSearchModal from '$lib/components/SiteSearchModal.svelte';
	import { siteSearch } from '$lib/stores/site-search.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{@render children()}

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
{#if !page.url.pathname.startsWith('/admin') && !page.url.pathname.startsWith('/_ds') && !page.url.pathname.startsWith('/goals') && !page.url.pathname.startsWith('/site-settings') && !page.url.pathname.startsWith('/cabinet') && !page.url.pathname.startsWith('/university/')}
	<ServiceOrderIsland />
{/if}
