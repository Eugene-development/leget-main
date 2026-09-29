<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
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
	let nextOffset = $state(0);
	let exhausted = $state(false);
	let autoLoadAvailable = $state(false);
	let controller: AbortController | undefined;
	let sequence = 0;
	let closing = $state(false);
	let closeFallback: ReturnType<typeof setTimeout> | undefined;
	let pendingHref: string | undefined;
	const normalized = $derived(query.trim());
	const eligible = $derived(Array.from(normalized).length >= 3);
	const hasMore = $derived(completed && !exhausted && nextOffset < total);

	function observeLoadMore(node: HTMLElement) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasMore && !loading && !error && !closing)
					void search(normalized, true);
			},
			{ root: dialog, rootMargin: '0px 0px 160px 0px' }
		);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}

	function finishClose() {
		if (!closing) return;
		clearTimeout(closeFallback);
		siteSearch.open = false;
		if (pendingHref) void goto(pendingHref);
	}

	function closeSearch() {
		if (closing) return;
		closing = true;
		// Страховка на случай, если браузер не пришлёт animationend.
		closeFallback = setTimeout(finishClose, 500);
	}

	function handleResultClick(event: MouseEvent, href: string) {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
			return;
		event.preventDefault();
		pendingHref = href;
		closeSearch();
	}

	onMount(() => {
		const previousFocus = document.activeElement;
		const previousOverflow = document.body.style.overflow;
		const previousPaddingRight = document.body.style.paddingRight;
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
		dialog.showModal();
		input.focus();
		autoLoadAvailable = typeof IntersectionObserver !== 'undefined';
		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `calc(${getComputedStyle(document.body).paddingRight} + ${scrollbarWidth}px)`;
		}
		document.body.style.overflow = 'hidden';
		return () => {
			clearTimeout(closeFallback);
			controller?.abort();
			dialog.close();
			document.body.style.overflow = previousOverflow;
			document.body.style.paddingRight = previousPaddingRight;
			if (!pendingHref && previousFocus instanceof HTMLElement && previousFocus.isConnected)
				previousFocus.focus();
		};
	});

	$effect(() => {
		const text = normalized;
		const ready = eligible;
		controller?.abort();
		sequence++;
		results = [];
		total = 0;
		nextOffset = 0;
		exhausted = false;
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
			const params = new URLSearchParams({ q: text, offset: String(append ? nextOffset : 0) });
			const response = await fetch(`/api/site-search?${params}`, {
				signal: currentController.signal
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || 'Не удалось загрузить результаты.');
			if (current !== sequence) return;
			const seen = new Set(append ? results.map((item) => item.url) : []);
			const items: Result[] = data.items
				.filter((item: Result) => item.url.startsWith('/') && !/^\/\/|[\\\x00-\x20]/.test(item.url))
				.filter((item: Result) => {
					if (seen.has(item.url)) return false;
					seen.add(item.url);
					return true;
				});
			results = append ? [...results, ...items] : items;
			nextOffset = (append ? nextOffset : 0) + data.items.length;
			exhausted = data.items.length === 0;
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
	class:closing
	aria-labelledby="site-search-title"
	class="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-ink-200 bg-surface-raised p-0 text-ink-900 shadow-xl shadow-scrim/20"
	onclose={() => (siteSearch.open = false)}
	oncancel={(event) => {
		event.preventDefault();
		closeSearch();
	}}
	onanimationend={(event) => {
		if (event.target === dialog && event.animationName.endsWith('search-dialog-exit'))
			finishClose();
	}}
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeSearch();
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
				closeSearch();
		}
	}}
>
	<div class="p-5 sm:p-8">
		<div class="mb-5 flex items-center justify-between gap-4">
			<h2 id="site-search-title" class="text-2xl">Поиск по сайту</h2>
			<button
				type="button"
				aria-label="Закрыть поиск"
				onclick={closeSearch}
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
		<label for="site-search-input" class="sr-only">Что вы ищете?</label>
		<input
			bind:this={input}
			bind:value={query}
			id="site-search-input"
			type="search"
			maxlength="120"
			autocomplete="off"
			placeholder="Что вы ищете?"
			aria-describedby="site-search-status"
			class="w-full rounded-xl border border-ink-400 bg-surface-raised px-4 py-3 text-base text-ink-900 placeholder:text-ink-600 focus:border-link-600 focus:ring-link-600"
		/>
		<div id="site-search-status" role="status" aria-live="polite" class="mt-3 text-sm text-ink-600">
			{#if !eligible}Введите не менее 3 символов.
			{:else if loading}{results.length > 0 ? 'Загружаем ещё…' : 'Ищем…'}
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
							onclick={(event) => handleResultClick(event, result.url)}
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
		{#if hasMore && autoLoadAvailable}
			<div
				use:observeLoadMore
				class="flex min-h-10 items-center justify-center py-3 text-sm text-ink-600"
				aria-hidden="true"
			>
				{#if loading}Загружаем ещё…{/if}
			</div>
		{/if}
		{#if error}
			<button
				type="button"
				onclick={() => search(normalized, results.length > 0)}
				class="mt-4 min-h-11 cursor-pointer rounded-lg border border-ink-300 px-4 text-link-700 hover:bg-ink-100"
				>Повторить поиск</button
			>
		{:else if hasMore && !autoLoadAvailable}
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
	dialog[open]:not(.closing) {
		animation: search-dialog-enter var(--ds-motion-duration-ui-slow) cubic-bezier(0.16, 1, 0.3, 1)
			both;
	}

	dialog::backdrop {
		background: color-mix(in srgb, var(--ds-scrim) 55%, transparent);
		animation: search-backdrop-enter var(--ds-motion-duration-ui) ease-out both;
	}

	dialog.closing {
		animation: search-dialog-exit var(--ds-motion-duration-ui) ease-in both;
	}

	dialog.closing::backdrop {
		animation: search-backdrop-exit var(--ds-motion-duration-ui) ease-in both;
	}

	@keyframes search-dialog-enter {
		from {
			opacity: 0;
			transform: translateY(18px) scale(0.96);
			filter: blur(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
			filter: blur(0);
		}
	}

	@keyframes search-backdrop-enter {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes search-dialog-exit {
		to {
			opacity: 0;
			transform: translateY(8px) scale(0.98);
			filter: blur(3px);
		}
	}

	@keyframes search-backdrop-exit {
		to {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		dialog[open]:not(.closing) {
			animation: search-dialog-enter-reduced 120ms ease-out both;
		}

		dialog::backdrop {
			animation-duration: 120ms;
		}

		dialog.closing {
			animation: search-dialog-exit-reduced 120ms ease-in both;
		}
	}

	@keyframes search-dialog-enter-reduced {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes search-dialog-exit-reduced {
		to {
			opacity: 0;
		}
	}
</style>
