<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { companyDirectoryHref, type CompanyFilter } from '$lib/partners/directory';
	import CompanyLogo from '$lib/partners/CompanyLogo.svelte';
	import type { CompanyDirectory } from '$lib/partners/types';

	let { directory, filter }: { directory: CompanyDirectory; filter: CompanyFilter | null } =
		$props();

	let grid = $state<HTMLUListElement>();
	let more = $state<HTMLDivElement>();
	let columns = $state<number | null>(null);
	let revealed = $state(0);
	let laterPages = $state<CompanyDirectory[]>([]);
	let loading = $state(false);
	let loadError = $state(false);
	let request: AbortController | null = null;

	const companies = $derived(
		Array.from(
			new Map(
				[directory, ...laterPages].flatMap((page) =>
					page.items.map((company) => [company.path, company] as const)
				)
			).values()
		)
	);
	const limit = $derived(Math.max(revealed, (columns ?? 3) * 3));
	const visible = $derived(companies.slice(0, limit));
	const current = $derived(laterPages.at(-1) ?? directory);
	const nextPage = $derived(current.page < current.lastPage ? current.page + 1 : null);
	const hasMore = $derived(visible.length < companies.length || nextPage !== null);

	$effect(() => {
		const element = grid;
		if (!element) return;
		const measure = () => {
			columns = getComputedStyle(element).gridTemplateColumns.split(/\s+/).length;
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	});

	$effect(() => {
		const sentinel = more;
		if (!sentinel) return;
		let previousScroll = window.scrollY;
		const onScroll = () => {
			const scroll = window.scrollY;
			const down = scroll > previousScroll;
			previousScroll = scroll;
			if (down && !loadError && sentinel.getBoundingClientRect().top <= window.innerHeight + 120) {
				void loadMore();
			}
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	onDestroy(() => request?.abort());

	async function loadMore() {
		if (loading || !hasMore || columns === null) return;
		loadError = false;
		const target = (Math.ceil(visible.length / columns) + 3) * columns;
		if (target <= companies.length || nextPage === null) {
			revealed = Math.min(target, companies.length);
			return;
		}

		loading = true;
		const controller = new AbortController();
		request = controller;
		try {
			const response = await fetch(companyDirectoryHref(filter, nextPage, '/api/b2b-companies'), {
				signal: controller.signal
			});
			if (!response.ok) throw new Error('Unable to load companies');
			const result: CompanyDirectory = await response.json();
			if (controller.signal.aborted) return;
			laterPages = [...laterPages, result];
			revealed = Math.min(target, companies.length);
		} catch {
			if (!controller.signal.aborted) loadError = true;
		} finally {
			request = null;
			loading = false;
		}
	}

	async function handleMore(event: MouseEvent) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		const firstNew = visible.length;
		const trigger = event.currentTarget;
		await loadMore();
		await tick();
		if (document.activeElement === trigger || document.activeElement === document.body) {
			grid?.querySelectorAll<HTMLAnchorElement>('li > a')[firstNew]?.focus();
		}
	}
</script>

<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" bind:this={grid} aria-busy={loading}>
	{#each visible as company (company.path)}
		<li class:initial={columns === null}>
			<a
				href={company.path}
				class="p1-card p1-border p1-accent-border-hover group flex h-full min-w-0 flex-col gap-2.5 rounded-2xl border p-5 transition-colors sm:p-6"
			>
				<div class="flex items-start gap-3">
					<CompanyLogo
						src={company.logoUrl}
						name={company.name}
						class="p1-surface-alt p1-border p1-body size-16"
					/>
					<div class="min-w-0 flex-1 self-center">
						<h2 class="p1-title p1-accent-hover text-xl wrap-anywhere">{company.name}</h2>
						<p class="p1-body mt-1 text-sm">
							{company.typeLabel}{company.city ? ` · ${company.city}` : ''}
						</p>
					</div>
					<svg
						class="ds-accent size-5 shrink-0"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.75"
						aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg
					>
				</div>
				<p class="p1-body line-clamp-3 text-sm leading-relaxed wrap-anywhere">
					{company.description}
				</p>
			</a>
		</li>
	{/each}
</ul>

{#if hasMore || directory.page > 1}
	<div class="p1-border mt-8 flex flex-wrap items-center gap-4 border-t pt-5 text-sm">
		{#if directory.page > 1}
			<a
				class="ds-accent underline underline-offset-4"
				href={companyDirectoryHref(filter, directory.page - 1)}
			>
				Предыдущая страница
			</a>
		{/if}
		{#if hasMore}
			<div bind:this={more} id="company-feed-more" class="flex flex-wrap items-center gap-3">
				<a
					class="ds-accent inline-flex min-h-11 items-center underline underline-offset-4"
					href={nextPage === null ? '#company-feed-more' : companyDirectoryHref(filter, nextPage)}
					aria-disabled={loading || undefined}
					data-goal-ignore="Подгрузка карточек компаний"
					onclick={handleMore}
					>{loading ? 'Загружаем компании…' : loadError ? 'Повторить загрузку' : 'Показать ещё'}</a
				>
				{#if loadError}
					<p class="p1-body" role="status">Не удалось загрузить ещё компании.</p>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Prevent a fourth row before the hydrated component can measure the grid. */
	@media (scripting: enabled) and (width < 64rem) {
		li.initial:nth-child(n + 7) {
			display: none;
		}
	}
	@media (scripting: enabled) and (width < 40rem) {
		li.initial:nth-child(n + 4) {
			display: none;
		}
	}
</style>
