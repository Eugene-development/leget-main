<script lang="ts">
	import type { Snippet } from 'svelte';
	import NavigationBody from '$lib/components/NavigationBody.svelte';
	import './growth.css';
	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<main class="growth-shell growth-main">
	<NavigationBody workspace>
		<header class="crm-header"><h1>{title}</h1></header>
		{@render children()}
	</NavigationBody>
</main>
