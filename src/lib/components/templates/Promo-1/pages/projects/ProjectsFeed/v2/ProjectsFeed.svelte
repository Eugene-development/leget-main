<script lang="ts">
	// Артикул: 1.26.2.2 — см. docs/architecture/component-articles-map.md
	//
	// Вариант 2: лента открывается ПЛИТКОЙ. Во всём остальном совпадает с
	// вариантом 1 — см. ../Feed.svelte и шапку v1.
	import Feed from '../Feed.svelte';

	let { data = $bindable() }: { data: Record<string, unknown> } = $props();
</script>

<Feed bind:data defaultView="tiles" />
