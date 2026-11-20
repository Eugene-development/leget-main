<script lang="ts">
	import NavigationBody from '$lib/components/NavigationBody.svelte';
	import type { Snippet } from 'svelte';
	let { site, children }: { site: string; children: Snippet } = $props();
</script>

<main class="growth-main">
	<NavigationBody workspace>
		{#if !site}
			<h1>Выберите рабочий сайт</h1>
			<p>Владелец сайта назначает доступ к его CRM.</p>
		{:else}
			{@render children()}
		{/if}
	</NavigationBody>
</main>
