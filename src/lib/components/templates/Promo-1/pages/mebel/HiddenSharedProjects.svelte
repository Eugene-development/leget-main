<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { projectRequest } from './project-request';
	import { setSharedProjectVisibility } from './project-visibility';

	let { licenseId, categoryId }: { licenseId: string; categoryId: string } = $props();
	let projects = $state<{ id: string; value: string }[]>([]);
	let loading = $state(true);
	let pendingId = $state('');
	let error = $state('');
	let notice = $state('');
	let summary = $state<HTMLElement>();
	let alive = true;

	onMount(() => {
		void load();
		return () => {
			alive = false;
		};
	});

	async function load() {
		loading = true;
		error = '';
		try {
			const result = await projectRequest<{
				hiddenSharedProjects: { id: string; value: string }[];
			}>(
				`query HiddenSharedProjects($licenseId: ID!, $categoryId: ID!) {
					hiddenSharedProjects(licenseId: $licenseId, categoryId: $categoryId) { id value }
				}`,
				{ licenseId, categoryId },
				'Не удалось загрузить скрытые проекты. Повторите попытку.'
			);
			if (!Array.isArray(result.hiddenSharedProjects))
				throw new Error('Сервер не вернул список скрытых проектов. Повторите попытку.');
			if (alive) projects = result.hiddenSharedProjects;
		} catch (cause) {
			if (alive)
				error = cause instanceof Error ? cause.message : 'Не удалось загрузить скрытые проекты.';
		} finally {
			if (alive) loading = false;
		}
	}

	async function restore(id: string) {
		if (pendingId) return;
		pendingId = id;
		error = '';
		notice = '';
		try {
			await setSharedProjectVisibility(id, licenseId, true);
		} catch (cause) {
			if (alive) {
				error =
					cause instanceof Error ? cause.message : 'Не удалось показать проект. Повторите попытку.';
				pendingId = '';
			}
			return;
		}
		if (!alive) return;
		projects = projects.filter((project) => project.id !== id);
		notice = 'Проект снова доступен посетителям сайта.';
		await tick();
		summary?.focus();
		try {
			await invalidateAll();
		} catch {
			if (alive) notice = 'Проект показан на сайте. Обновите страницу, чтобы увидеть его в списке.';
		} finally {
			if (alive) pendingId = '';
		}
	}
</script>

<details class="mb-6 rounded-xl border border-ink-200 bg-surface-raised p-4 text-ink-800">
	<summary
		bind:this={summary}
		class="min-h-11 cursor-pointer py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-500"
	>
		Скрытые общие проекты{loading ? '' : ` (${projects.length})`}
	</summary>
	<p class="mt-2 text-sm text-ink-600">
		Эти проекты скрыты только на вашем сайте. Их можно вернуть в каталог.
	</p>
	{#if loading}
		<p class="mt-4 text-sm" role="status">Загрузка скрытых проектов…</p>
	{:else if projects.length}
		<ul class="mt-4 divide-y divide-ink-200">
			{#each projects as project (project.id)}
				<li class="flex flex-wrap items-center justify-between gap-3 py-3">
					<span class="min-w-0 flex-1 basis-48 wrap-anywhere">{project.value}</span>
					<button
						type="button"
						onclick={() => restore(project.id)}
						disabled={!!pendingId}
						data-goal-ignore="Редактор: восстановление общего проекта на сайте"
						aria-label={`Показать на сайте проект ${project.value}`}
						class="min-h-11 rounded-lg border border-link-300 px-4 py-2 text-sm font-medium text-link-700 hover:bg-link-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-500 disabled:opacity-50"
					>
						{pendingId === project.id ? 'Сохранение…' : 'Показать на сайте'}
					</button>
				</li>
			{/each}
		</ul>
	{:else if !error}
		<p class="mt-4 text-sm text-ink-600">В этой категории нет скрытых общих проектов.</p>
	{/if}
	{#if error}
		<p role="alert" class="mt-3 text-sm text-cat-6-600">{error}</p>
		<button
			type="button"
			onclick={load}
			disabled={loading || !!pendingId}
			data-goal-ignore="Редактор: повторная загрузка скрытых проектов"
			class="mt-2 min-h-11 rounded-lg border border-ink-300 px-4 py-2 text-sm hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-500 disabled:opacity-50"
			>Обновить список</button
		>
	{/if}
	<p role="status" class="mt-2 text-sm text-ink-600">{notice}</p>
</details>
