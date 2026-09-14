<script lang="ts">
	import FavoriteProjectButton from '$lib/components/FavoriteProjectButton.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { readFavoriteProjectIds, subscribeToFavoriteProjects } from '$lib/utils/favorites';
	import {
		projectHref,
		resolveFeedProjects,
		type FeedProject
	} from '../projects/ProjectsFeed/data';
	import '../../theme.css';

	let { data }: { data: Record<string, unknown> } = $props();

	const allProjects = $derived<FeedProject[]>(resolveFeedProjects(data?.projects));
	let favoriteIds = $state<string[]>([]);

	$effect(() => {
		favoriteIds = readFavoriteProjectIds();
		return subscribeToFavoriteProjects((ids) => (favoriteIds = ids));
	});

	const favoriteProjects = $derived(
		favoriteIds
			.map((id) => allProjects.find((project) => project.id === id))
			.filter((project): project is FeedProject => project !== undefined)
	);
</script>

<section class="p1-surface-alt min-h-[55vh]">
	<div class="mx-auto max-w-7xl px-6 pt-10 pb-section-sm sm:pt-14 sm:pb-section lg:px-8">
		<div class="flex items-end justify-between gap-6">
			<div>
				<h1 class="p1-title p1-title-display text-4xl sm:text-5xl">Избранное</h1>
				<p class="p1-body mt-3 max-w-2xl text-base">
					Сохранённые проекты доступны в этом браузере.
				</p>
			</div>
			{#if favoriteProjects.length > 0}
				<span class="p1-note p1-numeric p1-muted shrink-0">{favoriteProjects.length}</span>
			{/if}
		</div>

		{#if favoriteProjects.length > 0}
			<div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each favoriteProjects as project (project.id)}
					<article
						class="p1-card p1-border p1-card-hover relative overflow-hidden rounded-2xl border shadow-sm transition-[transform,box-shadow,background-color] duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-1 hover:shadow-lg"
					>
						<FavoriteProjectButton projectId={project.id} class="absolute top-3 right-3 z-10" />
						<a
							href={projectHref(project)}
							class="group block h-full focus-visible:ring-2 focus-visible:ring-[var(--p1-field-focus)] focus-visible:outline-none focus-visible:ring-inset"
							aria-label="Смотреть проект: {project.value}"
						>
							<div class="p1-body overflow-hidden">
								<ImageFallback
									src={project.images[0]?.url ?? null}
									alt="Проект «{project.value}»"
									loading="lazy"
									class="aspect-video w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui-slow)] ease-ui group-hover:scale-105"
								/>
							</div>
							<div class="p-5">
								{#if project.categoryValue}
									<span class="p1-label p1-accent">{project.categoryValue}</span>
								{/if}
								<h2 class="p1-title p1-title-sub mt-2 text-lg">{project.value}</h2>
								{#if project.shortDescription}
									<p class="p1-body mt-2 line-clamp-2 text-sm">{project.shortDescription}</p>
								{/if}
							</div>
						</a>
					</article>
				{/each}
			</div>
		{:else}
			<div
				class="p1-card p1-border mt-8 flex flex-col items-center gap-3 rounded-2xl border px-6 py-12 text-center"
			>
				<svg
					class="p1-muted size-11 opacity-50"
					viewBox="0 0 24 24"
					fill="none"
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
				<h2 class="p1-title p1-title-sub mt-1 text-xl">Здесь пока пусто</h2>
				<p class="p1-body max-w-md text-sm leading-relaxed">
					Нажмите на сердце в карточке проекта — он появится здесь.
				</p>
				<a
					href="/projects"
					class="p1-label mt-2 inline-flex items-center rounded-lg bg-accent-surface px-5 py-3 text-on-accent transition-opacity duration-[var(--ds-motion-duration-ui)] ease-ui hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--p1-field-focus)] focus-visible:outline-none"
				>
					Смотреть проекты
				</a>
			</div>
		{/if}
	</div>
</section>
