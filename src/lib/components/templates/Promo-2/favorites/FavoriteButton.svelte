<script lang="ts">
	import Heart from './Heart.svelte';
	import {
		readFavorites,
		sameFavorite,
		subscribeFavorites,
		toggleFavorite,
		type FavoriteVariant
	} from './storage';
	let { item }: { item: FavoriteVariant } = $props();
	let selected = $state(false);
	let error = $state('');
	$effect(() => {
		const sync = (items: FavoriteVariant[]) => {
			selected = items.some((entry) => sameFavorite(entry, item));
		};
		sync(readFavorites());
		return subscribeFavorites(sync);
	});
	function toggle(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		const result = toggleFavorite(item);
		selected = result.selected;
		error = result.saved
			? ''
			: 'Не удалось сохранить. Разрешите хранение данных сайта в браузере и попробуйте снова.';
	}
</script>

<button
	type="button"
	onclick={toggle}
	data-goal-ignore="Локальное избранное посетителя без отправки заявки"
	aria-label={`${selected ? 'Удалить из избранного' : 'Добавить в избранное'}: ${item.title}`}
	aria-pressed={selected}
	title={selected ? 'Удалить из избранного' : 'Добавить в избранное'}
	class="relative z-20 flex h-11 w-11 items-center justify-center rounded-full border border-border-light bg-surface/95 {selected
		? 'text-accent'
		: 'text-primary'} shadow-soft transition-colors hover:bg-surface-warm hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
>
	<Heart filled={selected} />
</button>
{#if error}<p
		role="status"
		class="absolute top-16 right-3 left-3 z-30 rounded-sm bg-surface p-3 text-sm text-primary shadow-soft"
	>
		{error}
	</p>{/if}
