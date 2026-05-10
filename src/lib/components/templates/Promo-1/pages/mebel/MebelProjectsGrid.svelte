<script>
	import EditableField from '$lib/components/EditableField.svelte';

	let { data } = $props();

	// Projects come from the backend enrichment
	let projects = $derived(data.projects || []);
	let categorySlug = $derived(data.categorySlug);

	// Pagination
	let currentPage = $state(1);
	const itemsPerPage = 6;
	let paginatedProjects = $derived(
		projects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);
	let totalPages = $derived(Math.ceil(projects.length / itemsPerPage));

	// Reset page when projects change (e.g. category change)
	$effect(() => {
		if (projects) {
			currentPage = 1;
		}
	});
</script>

<div class="mebel-container">
	<section class="mt-12">
		{#if projects.length === 0}
			<div class="rounded-2xl bg-white p-12 text-center shadow-sm">
				<svg
					class="mx-auto h-16 w-16 text-slate-300"
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
				<h3 class="mt-4 text-lg font-semibold text-slate-900">Проектов не найдено</h3>
				<p class="mt-2 text-slate-600">В данной категории пока нет проектов</p>
				<button
					class="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-6 py-3 font-medium text-white transition-all hover:bg-sky-600"
				>
					Заказать индивидуальный проект
				</button>
			</div>
		{:else}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each paginatedProjects as project (project.id)}
					<article
						class="group relative overflow-hidden rounded-2xl bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
					>
						<a href="/mebel/{categorySlug}/{project.slug}" class="block h-full">
							<!-- Метки -->
							<div class="absolute top-3 left-3 z-10 flex gap-1.5">
								{#if project.is_new}
									<span
										class="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md"
									>
										Новинка
									</span>
								{/if}
								{#if project.is_featured}
									<span
										class="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md"
									>
										⭐ Хит
									</span>
								{/if}
							</div>

							<div class="relative block aspect-4/3 overflow-hidden bg-slate-100">
								{#if project.images && project.images.length > 0 && project.images[0].url}
									<img
										src={project.images[0].url}
										alt={project.value}
										class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
										loading="lazy"
									/>
								{:else}
									<div
										class="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200"
									>
										<svg
											class="h-16 w-16 text-slate-300"
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
									class="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								></div>
							</div>

							<div class="p-5">
								{#if project.short_description}
									<p class="line-clamp-1 text-xs text-slate-500">{project.short_description}</p>
								{/if}
								<div class="mt-3 flex items-start justify-between gap-4">
									<h3
										class="line-clamp-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-sky-600"
									>
										{project.value}
									</h3>
									<svg
										class="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-sky-500"
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
							</div>
						</a>
					</article>
				{/each}
			</div>

			<!-- Пагинация -->
			{#if totalPages > 1}
				<div class="mt-10 flex items-center justify-center gap-2">
					<button
						class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30"
						disabled={currentPage === 1}
						onclick={() => currentPage--}
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
									? 'bg-sky-500 text-white shadow-sm'
									: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"
								onclick={() => (currentPage = i + 1)}
							>
								{i + 1}
							</button>
						{/each}
					</div>

					<button
						class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30"
						disabled={currentPage === totalPages}
						onclick={() => currentPage++}
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
