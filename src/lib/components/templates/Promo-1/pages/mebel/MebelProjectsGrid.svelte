<script lang="ts">
	// Артикул: 1.17.3.1 — см. docs/architecture/component-articles-map.md
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
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

	// Артикул: 1.17.3.1 — см. docs/architecture/component-articles-map.md
	import { tick } from 'svelte';
	import { projectTitle, resolveFeedProjects } from '../projects/ProjectsFeed/data';
	import { useImageEditing } from '$lib/utils/image-editing.svelte';
	const imageEditing = useImageEditing();
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import ProjectImageActions from '$lib/components/ProjectImageActions.svelte';
	import EditableField from '$lib/components/EditableField.svelte';

	let {
		data,
		editContext = null,
		isEditable = false
	}: { data: any; editContext?: any; isEditable?: boolean } = $props();

	// Projects come from the backend enrichment
	let projects = $derived(data.projects || []);
	let categorySlug = $derived(data.categorySlug);

	// Pagination
	let currentPage = $state(1);
	let gridElement = $state<HTMLElement>();
	const itemsPerPage = 6;
	let paginatedProjects = $derived(
		projects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);
	const rowProjects = $derived(
		resolveFeedProjects(
			paginatedProjects.map((project: any) => ({
				...project,
				categorySlug,
				shortDescription: project.short_description
			}))
		)
	);
	let totalPages = $derived(Math.ceil(projects.length / itemsPerPage));

	async function goToPage(next: number) {
		if (next === currentPage || next < 1 || next > totalPages) return;
		currentPage = next;
		await tick();
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		gridElement?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' });
	}

	// Reset page when projects change (e.g. category change)
	$effect(() => {
		if (projects) {
			currentPage = 1;
		}
	});
</script>

<div class="mebel-container">
	<!-- Убираем дополнительный зазор глобального scroll-padding-top, сохраняя высоту меню. -->
	<section bind:this={gridElement} class="mt-12 -scroll-mt-6" data-p1-theme="light">
		{#if projects.length === 0}
			<div class="rounded-2xl bg-surface-raised p-12 text-center shadow-sm">
				<svg
					class="mx-auto h-16 w-16 text-ink-300"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
					/>
				</svg>
				<h3 class="p1-title-sub mt-4 text-lg text-ink-900">Проектов не найдено</h3>
				<p class="mt-2 text-ink-600">В данной категории пока нет проектов</p>
				<button
					data-metrika-goal="pages_mebel_mebelprojectsgrid_open_1"
					data-goal-action="open"
					onclick={() => serviceOrderStore.open('furniture-project')}
					type="button"
					class="mt-6 inline-flex items-center gap-2 rounded-lg bg-link-500 px-6 py-3 font-medium text-on-accent transition-all hover:bg-link-600"
				>
					Заказать индивидуальный проект
				</button>
			</div>
		{:else}
			<div class="mb-7 flex items-center justify-between gap-4">
				<h2 class="text-2xl text-ink-900">Проекты категории</h2>
				<div class="hidden sm:block">
					<FeedViewToggle {view} onpick={pickView} />
				</div>
			</div>
			{#if view === 'list'}
				<FeedRows projects={rowProjects} actionsBelowTitle />
			{:else}
				<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each paginatedProjects as project (project.id)}
						<article
							class="group relative flex flex-col overflow-hidden rounded-2xl bg-surface-raised shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
						>
							<a href="/mebel/{categorySlug}/{project.slug}" class="block flex-1">
								<!-- Метки -->
								<div class="absolute top-3 left-3 z-10 flex gap-1.5">
									{#if project.is_new}
										<span
											class="rounded-full bg-cat-2-500 px-2.5 py-1 text-xs font-semibold text-on-accent shadow-md"
										>
											Новинка
										</span>
									{/if}
									{#if project.is_featured}
										<span
											class="rounded-full bg-cat-1-500 px-2.5 py-1 text-xs font-semibold text-on-accent shadow-md"
										>
											⭐ Хит
										</span>
									{/if}
								</div>

								<div class="relative block aspect-4/3 overflow-hidden bg-ink-100">
									{#if project.images?.[0]?.url || imageEditing?.editable || imageEditing?.read(['projectImages', String(project.id), '0'], '')}
										<ImageFallback
											imagePath={['projectImages', String(project.id), '0']}
											src={project.images?.[0]?.url ?? ''}
											alt={projectTitle(project.value)}
											class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
											loading="lazy"
										/>
									{:else}
										<div
											class="flex h-full w-full items-center justify-center bg-linear-to-br from-ink-100 to-ink-200"
										>
											<svg
												class="h-16 w-16 text-ink-300"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1"
													d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
										</div>
									{/if}
									<div
										class="absolute inset-0 bg-linear-to-t from-ink-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
									></div>
								</div>

								<div class="px-5 pt-5 pb-3">
									<div class="flex items-start justify-between gap-4">
										<h3
											class="p1-title-sub line-clamp-2 text-lg text-ink-900 transition-colors group-hover:text-link-600"
										>
											{projectTitle(project.value)}
										</h3>
										<svg
											class="mt-1 h-5 w-5 shrink-0 text-ink-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-link-500"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
											/>
										</svg>
									</div>
									{#if project.short_description}
										<p class="mt-2 line-clamp-1 text-xs text-ink-500">
											{project.short_description}
										</p>
									{/if}
								</div>
							</a>
							<div class="px-5 pb-5">
								<ProjectImageActions
									compact
									horizontal
									projectId={String(project.id)}
									imageUrl={project.images?.[0]?.url}
									projectName={projectTitle(project.value)}
								/>
							</div>
						</article>
					{/each}
				</div>
			{/if}

			<!-- Пагинация -->
			{#if totalPages > 1}
				<div class="mt-10 flex items-center justify-center gap-2">
					<button
						class="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-surface-raised text-ink-600 transition-all hover:bg-ink-50 disabled:opacity-30"
						disabled={currentPage === 1}
						onclick={() => goToPage(currentPage - 1)}
						data-goal-ignore="Пагинация каталога: навигация по списку проектов"
						aria-label="Предыдущая страница"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					<div class="flex gap-1">
						{#each Array.from({ length: totalPages }) as _, i}
							<button
								class="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all {currentPage ===
								i + 1
									? 'bg-link-500 text-on-accent shadow-sm'
									: 'border border-ink-200 bg-surface-raised text-ink-600 hover:bg-ink-50'}"
								onclick={() => goToPage(i + 1)}
								data-goal-ignore="Пагинация каталога: навигация по списку проектов"
							>
								{i + 1}
							</button>
						{/each}
					</div>

					<button
						class="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-surface-raised text-ink-600 transition-all hover:bg-ink-50 disabled:opacity-30"
						disabled={currentPage === totalPages}
						onclick={() => goToPage(currentPage + 1)}
						data-goal-ignore="Пагинация каталога: навигация по списку проектов"
						aria-label="Следующая страница"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			{/if}
		{/if}
	</section>
</div>

<style>
	.mebel-container {
		max-width: 1536px;
		margin-left: auto;
		margin-right: auto;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	@media (min-width: 1024px) {
		.mebel-container {
			padding-left: 360px;
		}
	}
</style>
