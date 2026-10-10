<script lang="ts">
	import { getContext, type Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
	const navigation = getContext<{ active: () => boolean } | undefined>('leget-navigation-body');
	const loading = $derived(Boolean(navigation?.active()));
</script>

{#if loading}<p class="sr-only" role="status">Обновляем данные раздела…</p>{/if}
<div
	class="hero-region"
	class:pending={loading}
	aria-busy={loading}
	inert={loading}
	data-catalog-hero
>
	{@render children()}
</div>

<style>
	.hero-region {
		display: contents;
	}
	.hero-region > :global([data-field-toolbar-scope]) {
		transition: opacity var(--ds-motion-duration-ui);
	}
	.pending > :global([data-field-toolbar-scope]) {
		opacity: 0.6;
	}
	@media (prefers-reduced-motion: reduce) {
		.hero-region > :global([data-field-toolbar-scope]) {
			transition: none;
		}
	}
</style>
