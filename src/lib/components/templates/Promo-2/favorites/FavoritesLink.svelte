<script lang="ts">
	import Heart from './Heart.svelte';
	import { readFavorites, subscribeFavorites } from './storage';
	let { onclick }: { onclick?: () => void } = $props();
	let count = $state(0);
	$effect(() => {
		count = readFavorites().length;
		return subscribeFavorites((items) => {
			count = items.length;
		});
	});
</script>

<a
	href="/favorites"
	{onclick}
	data-goal-ignore="Переход в избранное без формы"
	aria-label={`Избранное${count ? `, сохранено: ${count}` : ''}`}
	title="Избранное"
	class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-light text-[#b8860b] transition-colors hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
>
	<Heart filled={count > 0} />
	{#if count > 0}<span
			class="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#b8860b] px-1 text-xs text-white tabular-nums"
			aria-hidden="true">{count}</span
		>{/if}
</a>
