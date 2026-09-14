<script lang="ts">
	import {
		readFavoriteProjectIds,
		subscribeToFavoriteProjects,
		toggleFavoriteProject
	} from '$lib/utils/favorites';

	let {
		projectId,
		class: className = ''
	}: {
		projectId: string;
		class?: string;
	} = $props();

	let isFavorite = $state(false);

	$effect(() => {
		const sync = (ids: string[]) => (isFavorite = ids.includes(String(projectId)));
		sync(readFavoriteProjectIds());
		return subscribeToFavoriteProjects(sync);
	});

	function toggle(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		isFavorite = toggleFavoriteProject(projectId);
	}
</script>

<button
	type="button"
	onclick={toggle}
	aria-label={isFavorite ? 'Удалить проект из избранного' : 'Добавить проект в избранное'}
	title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
	aria-pressed={isFavorite}
	class="flex size-11 shrink-0 items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition-[transform,background-color,color] duration-[var(--ds-motion-duration-ui)] ease-ui hover:scale-105 focus-visible:ring-2 focus-visible:ring-link-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 {isFavorite
		? 'bg-link-500 text-on-accent'
		: 'bg-surface-raised/90 text-ink-600 hover:bg-surface-raised hover:text-link-600'} {className}"
>
	<svg
		class="size-5"
		viewBox="0 0 24 24"
		fill={isFavorite ? 'currentColor' : 'none'}
		stroke="currentColor"
		stroke-width="var(--ds-icon-stroke)"
		aria-hidden="true"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
		/>
	</svg>
</button>
