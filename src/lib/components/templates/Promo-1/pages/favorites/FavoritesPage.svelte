<script lang="ts">
	// Артикул: 1.33.1.1 — см. docs/architecture/component-articles-map.md
	import FeedViewToggle from '../projects/ProjectsFeed/FeedViewToggle.svelte';
	import FeedRows from '../projects/ProjectsFeed/FeedRows.svelte';
	import { readStoredView, storeView, type FeedView } from '../projects/ProjectsFeed/data';

	let view = $state<FeedView>('tiles');
	$effect(() => {
		view = readStoredView() ?? 'tiles';
	});
	function pickView(next: FeedView) {
		view = next;
		storeView(next);
	}

	import ProjectImageActions from '$lib/components/ProjectImageActions.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { readFavoriteProjectIds, subscribeToFavoriteProjects } from '$lib/utils/favorites';
	import {
		projectHref,
		projectTitle,
		resolveFeedProjects,
		type FeedProject
	} from '../projects/ProjectsFeed/data';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(key: 'title' | 'emptyTitle' | 'emptyMessage', value: string) {
		if (!editContext) return;
		const updated = { ...data, [key]: value };
		await saveComponentData(editContext, 'FavoritesPage', updated);
		data = updated;
	}

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

<section class="p1-surface-alt min-h-[55vh]" data-p1-theme="light">
	<div class="mx-auto max-w-7xl px-6 pt-10 pb-section-sm sm:pt-14 sm:pb-section lg:px-8">
		<div class="flex items-center justify-between gap-3 sm:gap-6">
			<h1 class="p1-title p1-title-display min-w-0 text-2xl whitespace-nowrap sm:text-5xl">
				<EditableField
					fieldKey="FavoritesPage.title"
					label="Название страницы"
					value={String(data?.title ?? 'Избранное')}
					{isEditable}
					inline
					richText={false}
					onSave={(value) => saveField('title', value)}
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
				{#if favoriteProjects.length > 0}
					<span class="p1-note p1-numeric p1-muted ml-2 align-baseline sm:ml-3">
						{favoriteProjects.length}
					</span>
				{/if}
			</h1>
			{#if favoriteProjects.length > 0}
				<div class="shrink-0">
					<FeedViewToggle {view} onpick={pickView} />
				</div>
			{/if}
		</div>

		{#if favoriteProjects.length > 0}
			{#if view === 'list'}
				<FeedRows projects={favoriteProjects} actionsAtBottom />
			{:else}
				<div class="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each favoriteProjects as project (project.id)}
						<article
							class="p1-card p1-border p1-card-hover relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-[transform,box-shadow,background-color] duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-1 hover:shadow-lg"
						>
							<a
								href={projectHref(project)}
								class="group block flex-1 focus-visible:ring-2 focus-visible:ring-[var(--p1-field-focus)] focus-visible:outline-none focus-visible:ring-inset"
								aria-label="Смотреть проект: {projectTitle(project.value)}"
							>
								<div class="p1-body overflow-hidden">
									<ImageFallback
										src={project.images[0]?.url ?? null}
										alt={projectTitle(project.value)}
										loading="lazy"
										class="aspect-video w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui-slow)] ease-ui group-hover:scale-105"
									/>
								</div>
								<div class="px-5 pt-5 pb-3">
									{#if project.categoryValue}
										<span class="p1-label p1-accent">{project.categoryValue}</span>
									{/if}
									<h2 class="p1-title p1-title-sub mt-2 text-lg">
										{projectTitle(project.value)}
									</h2>
									{#if project.shortDescription}
										<p class="p1-body mt-2 line-clamp-2 text-sm">{project.shortDescription}</p>
									{/if}
								</div>
							</a>
							<div class="px-5 pb-5">
								<ProjectImageActions
									compact
									horizontal
									projectId={project.id}
									imageUrl={project.images[0]?.url}
									projectName={projectTitle(project.value)}
								/>
							</div>
						</article>
					{/each}
				</div>
			{/if}
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
				<h2 class="p1-title p1-title-sub mt-1 text-xl">
					<EditableField
						fieldKey="FavoritesPage.emptyTitle"
						label="Заголовок пустого избранного"
						value={String(data?.emptyTitle ?? 'Здесь пока пусто')}
						{isEditable}
						inline
						richText={false}
						onSave={(value) => saveField('emptyTitle', value)}
					>
						{#snippet children(displayValue)}{displayValue}{/snippet}
					</EditableField>
				</h2>
				<p class="p1-body max-w-md text-sm leading-relaxed">
					<EditableField
						fieldKey="FavoritesPage.emptyMessage"
						label="Подсказка пустого избранного"
						value={String(data?.emptyMessage ?? 'Нажмите на сердце в карточке проекта — он появится здесь.')}
						{isEditable}
						inline
						richText={false}
						onSave={(value) => saveField('emptyMessage', value)}
					>
						{#snippet children(displayValue)}{displayValue}{/snippet}
					</EditableField>
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
