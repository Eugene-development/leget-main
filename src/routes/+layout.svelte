<script>
	import { page } from '$app/state';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ServiceOrderIsland from '$lib/components/ServiceOrderIsland.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{@render children()}

<!--
	/_ds — каталог дизайн-системы: карточка должна содержать блок и ничего кроме блока,
	иначе плавающая кнопка заказа попадёт в каждое превью.
-->
{#if !page.url.pathname.startsWith('/admin') && !page.url.pathname.startsWith('/_ds')}
	<ServiceOrderIsland />
{/if}
