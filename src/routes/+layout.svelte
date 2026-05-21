<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ServiceOrderIsland from '$lib/components/ServiceOrderIsland.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{@render children()}

<ServiceOrderIsland />

