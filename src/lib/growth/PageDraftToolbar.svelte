<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import type { EditContext } from '$lib/utils/page-edit';
	import {
		draftSession,
		draftSaving,
		isDraftUrl,
		publicationRequest,
		publishedUrl,
		readPublication,
		waitForDraftSaves,
		type PageDraft,
		type PublicationState
	} from './drafts';

	let { context }: { context: EditContext } = $props();
	let publicationState = $state<PublicationState | null>(null);
	let busy = $state(false);
	let failure = $state('');
	let notice = $state('');
	let showHistory = $state(false);
	let confirmAction = $state<{ kind: 'publish' | 'discard' | 'restore'; revision?: string } | null>(
		null
	);
	let previewLink = $state('');
	let toolbarElement = $state<HTMLElement>();
	const active = $derived(
		$draftSession?.licenseId === context.licenseId ? $draftSession.draft : null
	);

	onMount(() => {
		let stopped = false;
		const root = document.documentElement;
		const previousSpace = root.style.getPropertyValue('--leget-publication-space');
		const measure = () =>
			root.style.setProperty(
				'--leget-publication-space',
				`${(toolbarElement?.getBoundingClientRect().height ?? 0) + 24}px`
			);
		const observer = new ResizeObserver(measure);
		if (toolbarElement) observer.observe(toolbarElement);
		measure();
		readPublication(context)
			.then((value) => {
				if (stopped) return;
				publicationState = value;
				if (isDraftUrl() && value.draft)
					draftSession.set({ licenseId: context.licenseId, draft: value.draft });
			})
			.catch((error) => {
				if (!stopped) failure = error.message;
			});
		return () => {
			stopped = true;
			draftSession.set(null);
			observer.disconnect();
			if (previousSpace) root.style.setProperty('--leget-publication-space', previousSpace);
			else root.style.removeProperty('--leget-publication-space');
		};
	});

	async function run(action: () => Promise<void>) {
		if (busy) return;
		busy = true;
		failure = '';
		notice = '';
		try {
			await waitForDraftSaves();
			await action();
		} catch (error) {
			failure = error instanceof Error ? error.message : 'Не удалось выполнить действие.';
		} finally {
			busy = false;
		}
	}
	function navigate(token?: string) {
		const url = publishedUrl();
		if (token) url.searchParams.set('draft', token);
		window.location.assign(url.href);
	}
	async function begin() {
		await run(async () => {
			const draft = await publicationRequest<PageDraft>(context, '/drafts', { slug: context.slug });
			navigate(draft.previewToken);
		});
	}
	async function share() {
		if (!active) return;
		await run(async () => {
			const current = $draftSession!.draft;
			const result = await publicationRequest<PageDraft>(context, `/drafts/${current.id}/preview`, {
				version: current.version
			});
			const url = publishedUrl();
			url.searchParams.set('draft', result.previewToken!);
			url.searchParams.set('preview', '1');
			previewLink = url.href;
			// New capabilities revoke older links. Keep the editor on the current one.
			const editorUrl = publishedUrl();
			editorUrl.searchParams.set('draft', result.previewToken!);
			replaceState(editorUrl, page.state);
			draftSession.set({ licenseId: context.licenseId, draft: result });
			try {
				await navigator.clipboard.writeText(url.href);
				notice = 'Ссылка скопирована. Она действует 2 часа.';
			} catch {
				notice = 'Ссылка готова. Она действует 2 часа.';
			}
		});
	}
	async function confirm() {
		if (!confirmAction) return;
		const action = confirmAction;
		await run(async () => {
			if (action.kind === 'restore') {
				await publicationRequest(context, `/revisions/${action.revision}/restore`, {
					liveHash: publicationState?.liveHash
				});
			} else {
				const current = $draftSession?.draft;
				if (!current) throw new Error('Откройте черновик перед продолжением.');
				await publicationRequest(context, `/drafts/${current.id}/${action.kind}`, {
					version: current.version
				});
			}
			draftSession.set(null);
			navigate();
		});
	}
</script>

<aside
	bind:this={toolbarElement}
	aria-label="Публикация страницы"
	class="fixed right-3 bottom-3 left-3 z-[120] max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-xl border border-ink-200 bg-surface-raised p-3 text-ink-950 shadow-[0_6px_24px] shadow-ink-950/15 sm:left-auto sm:w-[420px]"
>
	<div class="flex flex-wrap items-center gap-2">
		<p class="mr-auto text-sm font-medium">
			{active ? 'Черновик страницы' : 'Страница опубликована'}
		</p>
		{#if active}<span aria-live="polite" class="text-xs text-ink-600"
				>{$draftSaving ? 'Сохраняем…' : 'Правки сохранены'}</span
			>{/if}
	</div>
	<p class="mt-1 text-xs text-ink-600">
		{active
			? 'Посетители увидят изменения после публикации. Шапка и подвал изменятся на всём сайте.'
			: 'Обычные правки сохраняются сразу. Черновик позволяет подготовить изменения заранее.'}
	</p>
	<div class="mt-3 flex flex-wrap gap-2">
		{#if active}
			<button
				type="button"
				onclick={() => (confirmAction = { kind: 'publish' })}
				disabled={busy || $draftSaving}
				data-goal-ignore="Редактор: публикация страницы"
				class="min-h-11 rounded-lg bg-link-600 px-3 py-2 text-sm text-on-accent disabled:opacity-50"
				>Опубликовать</button
			>
			<button
				type="button"
				onclick={share}
				disabled={busy || $draftSaving}
				data-goal-ignore="Редактор: ссылка предпросмотра"
				class="min-h-11 rounded-lg border border-ink-200 px-3 py-2 text-sm disabled:opacity-50"
				>Предпросмотр</button
			>
			<button
				type="button"
				onclick={() => run(async () => navigate())}
				disabled={busy || $draftSaving}
				data-goal-ignore="Редактор: выход из черновика"
				class="min-h-11 rounded-lg border border-ink-200 px-3 py-2 text-sm">Закрыть черновик</button
			>
			<button
				type="button"
				onclick={() => (confirmAction = { kind: 'discard' })}
				disabled={busy || $draftSaving}
				data-goal-ignore="Редактор: удаление черновика"
				class="min-h-11 px-2 py-2 text-sm text-ink-600">Удалить</button
			>
		{:else}
			<button
				type="button"
				onclick={begin}
				disabled={busy || !publicationState}
				data-goal-ignore="Редактор: начало черновика"
				class="min-h-11 rounded-lg bg-link-600 px-3 py-2 text-sm text-on-accent disabled:opacity-50"
				>{publicationState?.draft ? 'Продолжить черновик' : 'Создать черновик'}</button
			>
		{/if}
		<button
			type="button"
			onclick={() => (showHistory = !showHistory)}
			aria-expanded={showHistory}
			data-goal-ignore="Редактор: история публикаций"
			class="min-h-11 rounded-lg border border-ink-200 px-3 py-2 text-sm">История</button
		>
	</div>
	{#if previewLink}<a
			href={previewLink}
			target="_blank"
			rel="noreferrer"
			class="mt-2 flex min-h-11 items-center text-sm break-all text-link-600"
			>Открыть предпросмотр</a
		>{/if}
	{#if notice}<p class="mt-2 text-xs text-ink-600" role="status">{notice}</p>{/if}
	{#if failure}<p class="mt-2 text-sm text-ink-950" role="alert">{failure}</p>{/if}
	{#if confirmAction}
		<div class="mt-3 border-t border-ink-200 pt-3" role="group" aria-label="Подтверждение действия">
			<p class="text-sm">
				{confirmAction.kind === 'publish'
					? 'Опубликовать все правки этой страницы?'
					: confirmAction.kind === 'discard'
						? 'Удалить сохранённый черновик?'
						: 'Восстановить эту версию страницы? Шапка и подвал тоже вернутся к этому состоянию.'}
			</p>
			<div class="mt-2 flex gap-2">
				<button
					type="button"
					onclick={confirm}
					disabled={busy}
					data-goal-ignore="Редактор: подтверждение публикации"
					class="min-h-11 rounded-lg bg-link-600 px-3 py-2 text-sm text-on-accent"
					>{busy ? 'Выполняем…' : 'Подтвердить'}</button
				>
				<button
					type="button"
					onclick={() => (confirmAction = null)}
					disabled={busy}
					data-goal-ignore="Редактор: отмена действия публикации"
					class="min-h-11 rounded-lg border border-ink-200 px-3 py-2 text-sm">Отмена</button
				>
			</div>
		</div>
	{/if}
	{#if showHistory}
		<div class="mt-3 max-h-52 overflow-y-auto border-t border-ink-200 pt-3">
			{#if !publicationState?.revisions.length}<p class="text-xs text-ink-600">
					История появится после первой публикации черновика.
				</p>{/if}
			{#each publicationState?.revisions ?? [] as revision (revision.id)}
				<div class="flex items-center gap-2 border-b border-ink-100 py-2 text-xs">
					<p class="mr-auto">
						{new Date(revision.created_at).toLocaleString('ru-RU')}<br />{revision.action ===
						'publish'
							? 'Публикация'
							: revision.action === 'restore'
								? 'Восстановление'
								: 'До изменений'}
					</p>
					<button
						type="button"
						onclick={() => (confirmAction = { kind: 'restore', revision: revision.id })}
						disabled={busy || Boolean(publicationState?.draft)}
						data-goal-ignore="Редактор: восстановление версии"
						class="min-h-11 rounded-lg border border-ink-200 px-2 py-2 disabled:opacity-50"
						>Восстановить</button
					>
				</div>
			{/each}
			{#if publicationState?.draft}<p class="mt-2 text-xs text-ink-600">
					Перед восстановлением опубликуйте или удалите черновик.
				</p>{/if}
		</div>
	{/if}
</aside>
