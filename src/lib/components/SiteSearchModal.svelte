<script lang="ts">
	import { onMount } from 'svelte';
	import { siteSearch } from '$lib/stores/site-search.svelte';

	type Result = { title: string; url: string; snippet: string };
	let dialog: HTMLDialogElement;
	let input: HTMLInputElement;
	let query = $state('');
	let results = $state<Result[]>([]);
	let total = $state(0);
	let loading = $state(false);
	let error = $state('');
	let completed = $state(false);
	let controller: AbortController | undefined;
	let sequence = 0;
	const normalized = $derived(query.trim());
	const eligible = $derived(Array.from(normalized).length >= 3);

	onMount(() => {
		const previousFocus = document.activeElement;
		const previousOverflow = document.body.style.overflow;
		dialog.showModal();
		input.focus();
		document.body.style.overflow = 'hidden';
		return () => {
			controller?.abort();
			dialog.close();
			document.body.style.overflow = previousOverflow;
			if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
		};
	});

	$effect(() => {
		const text = normalized;
		const ready = eligible;
		controller?.abort();
		sequence++;
		results = [];
		total = 0;
		error = '';
		completed = false;
		loading = ready;
		if (!ready) return;
		const timer = setTimeout(() => void search(text), 300);
		return () => {
			clearTimeout(timer);
			controller?.abort();
		};
	});

	async function search(text: string, append = false) {
		controller?.abort();
		const currentController = new AbortController();
		controller = currentController;
		const current = ++sequence;
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams({ q: text, offset: String(append ? results.length : 0) });
			const response = await fetch(`/api/site-search?${params}`, {
				signal: currentController.signal
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || 'Не удалось загрузить результаты.');
			if (current !== sequence) return;
			const items: Result[] = data.items.filter(
				(item: Result) => item.url.startsWith('/') && !/^\/\/|[\\\x00-\x20]/.test(item.url)
			);
			results = append ? [...results, ...items] : items;
			total = data.total;
			completed = true;
		} catch (cause) {
			if (current !== sequence || currentController.signal.aborted) return;
			error = cause instanceof Error ? cause.message : 'Не удалось загрузить результаты.';
		} finally {
			if (current === sequence) loading = false;
		}
	}
</script>

<dialog
	bind:this={dialog}
	aria-labelledby="site-search-title"
	class="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-ink-200 bg-surface-raised p-0 text-ink-900 shadow-xl shadow-scrim/20"
	onclose={() => (siteSearch.open = false)}
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			siteSearch.open = false;
		}
	}}
	onclick={(event) => {
		if (event.target === dialog) {
			const bounds = dialog.getBoundingClientRect();
			if (
				event.clientX < bounds.left ||
				event.clientX > bounds.right ||
				event.clientY < bounds.top ||
				event.clientY > bounds.bottom
			)
				siteSearch.open = false;
		}
	}}
>
	<div class="p-5 sm:p-8">
		<div class="mb-5 flex items-center justify-between gap-4">
			<h2 id="site-search-title" class="text-2xl">Поиск по сайту</h2>
			<button
				type="button"
				aria-label="Закрыть поиск"
				onclick={() => (siteSearch.open = false)}
				class="-mr-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-link-600"
			>
				<svg
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg
				>
			</button>
		</div>
		<label for="site-search-input" class="mb-2 block text-sm text-ink-700">Что вы ищете?</label>
		<input
			bind:this={input}
			bind:value={query}
			id="site-search-input"
			type="search"
			maxlength="120"
			autocomplete="off"
			placeholder="Например, кухня или доставка"
			aria-describedby="site-search-status"
			class="w-full rounded-xl border border-ink-400 bg-surface-raised px-4 py-3 text-base text-ink-900 placeholder:text-ink-600 focus:border-link-600 focus:ring-link-600"
		/>
		<div id="site-search-status" role="status" aria-live="polite" class="mt-3 text-sm text-ink-600">
			{#if !eligible}Введите не менее 3 символов.
			{:else if loading}Ищем…
			{:else if error}{error}
			{:else if completed && total === 0}Ничего не найдено. Попробуйте другой запрос.
			{:else if completed}Найдено страниц: {total}{/if}
		</div>
		{#if results.length > 0}
			<ol
				class="mt-5 list-decimal divide-y divide-ink-200 pl-7 marker:text-ink-600"
				aria-label="Результаты поиска"
				aria-busy={loading}
			>
				{#each results as result (result.url)}
					<li class="py-4 pl-2">
						<a
							href={result.url}
							onclick={() => (siteSearch.open = false)}
							class="block rounded-sm text-link-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-link-600"
						>
							<span class="font-medium wrap-anywhere">{result.title}</span>
						</a>
						{#if result.snippet}<p class="mt-1 text-sm leading-relaxed wrap-anywhere text-ink-700">
								{result.snippet}
							</p>{/if}
						<p class="mt-1 text-xs wrap-anywhere text-ink-600">{result.url}</p>
					</li>
				{/each}
			</ol>
		{/if}
		{#if error}
			<button
				type="button"
				onclick={() => search(normalized, results.length > 0)}
				class="mt-4 min-h-11 cursor-pointer rounded-lg border border-ink-300 px-4 text-link-700 hover:bg-ink-100"
				>Повторить поиск</button
			>
		{:else if results.length < total}
			<button
				type="button"
				disabled={loading}
				onclick={() => search(normalized, true)}
				class="mt-4 min-h-11 cursor-pointer rounded-lg border border-ink-300 px-4 text-link-700 hover:bg-ink-100 disabled:cursor-wait disabled:opacity-60"
				>Показать ещё</button
			>
		{/if}
	</div>
</dialog>

<style>
	dialog::backdrop {
		background: color-mix(in srgb, var(--ds-scrim) 55%, transparent);
	}
</style>
