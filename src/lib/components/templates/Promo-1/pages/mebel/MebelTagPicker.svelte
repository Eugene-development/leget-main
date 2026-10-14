<script lang="ts">
	import { withPromoMotion } from '$lib/motion/transition';

	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { loadTagGroups, type TagGroup } from './tags';

	let {
		selected = $bindable([]),
		disabled = false,
		groupSlugs = [],
		helpText = 'Бренды из техники, сантехники, освещения и столешниц добавляются автоматически. В проекте эти теги ведут на страницы брендов.'
	}: {
		selected: string[];
		disabled?: boolean;
		groupSlugs?: string[];
		helpText?: string;
	} = $props();
	const id = $props.id();
	let open = $state(false);
	let groups = $state<TagGroup[]>([]);
	let loading = $state(false);
	let error = $state('');
	let search = $state('');
	let expandedGroups = $state<Record<string, boolean>>({});
	let reducedMotion = $state(false);
	const query = $derived(search.trim().toLocaleLowerCase('ru'));
	const visibleGroups = $derived(
		groups.map((group) => ({
			...group,
			tags: group.tags.filter((tag) => tag.name.toLocaleLowerCase('ru').includes(query))
		}))
	);

	$effect(() => {
		query;
		expandedGroups = {};
	});

	function mountDialog(node: HTMLDialogElement) {
		const previousFocus = document.activeElement;
		const previousOverflow = document.body.style.overflow;
		document.body.appendChild(node);
		document.body.style.overflow = 'hidden';
		node.showModal();
		return {
			destroy() {
				node.close();
				node.remove();
				document.body.style.overflow = previousOverflow;
				if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
					previousFocus.focus();
			}
		};
	}

	onMount(() => {
		const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
		const updateMotion = () => (reducedMotion = preference.matches);
		updateMotion();
		preference.addEventListener('change', updateMotion);
		void load();
		return () => preference.removeEventListener('change', updateMotion);
	});

	async function load() {
		if (loading) return;
		loading = true;
		error = '';
		try {
			groups = (await loadTagGroups(groupSlugs.length ? undefined : 'mebel')).filter((group) =>
				groupSlugs.length
					? groupSlugs.includes(group.slug)
					: !['appliance-type', 'plumbing-type', 'lighting-type'].includes(group.slug)
			);
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Не удалось загрузить теги.';
		} finally {
			loading = false;
		}
	}

	const p1_slide = withPromoMotion(slide);
</script>

<div class="space-y-3">
	<button
		type="button"
		{disabled}
		aria-haspopup="dialog"
		data-goal-ignore="Выбор тегов в редакторе каталога"
		aria-controls={id}
		onclick={() => {
			search = '';
			expandedGroups = {};
			open = true;
		}}
		class="min-h-11 rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-800 hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-500 disabled:opacity-50"
	>
		Выбрать теги{selected.length ? ` · ${selected.length}` : ''}
	</button>
	{#if open}
		<dialog
			{id}
			use:mountDialog
			aria-labelledby={`${id}-title`}
			oncancel={(event) => {
				event.preventDefault();
				event.stopPropagation();
				open = false;
			}}
			onkeydown={(event) => event.stopPropagation()}
			class="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-2xl border border-ink-200 bg-surface-raised p-0 text-ink-800 shadow-xl backdrop:bg-scrim/50"
		>
			<div class="flex max-h-[calc(100dvh-2rem)] flex-col">
				<header
					class="flex shrink-0 items-center justify-between gap-4 border-b border-ink-200 px-5 py-4"
				>
					<h2 id={`${id}-title`} class="text-xl">Выбрать теги</h2>
					<button
						type="button"
						onclick={() => (open = false)}
						aria-label="Закрыть выбор тегов"
						data-goal-ignore="Закрытие выбора тегов в редакторе каталога"
						class="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-link-500"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg
						>
					</button>
				</header>
				<div class="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-5" aria-busy={loading}>
					{#if loading}
						<p role="status" class="text-sm text-ink-600">Загружаем теги…</p>
					{:else if error}
						<p role="alert" class="text-sm text-ink-800">{error}</p>
						<button
							type="button"
							onclick={load}
							data-goal-ignore="Повторная загрузка справочника тегов"
							class="min-h-11 text-sm text-link-700 underline">Повторить загрузку</button
						>
					{:else}
						<label class="block text-sm">
							<span class="sr-only">Поиск тега</span>
							<input
								type="search"
								bind:value={search}
								placeholder="Поиск тега"
								class="min-h-11 w-full rounded-lg border border-ink-300 bg-surface-raised px-3 text-ink-800 placeholder:text-ink-500 focus-visible:outline-link-500"
							/>
						</label>
						<div class="space-y-5">
							{#each visibleGroups as group (group.id)}
								{@const expanded = expandedGroups[group.id] ?? !!query}
								<div class="min-w-0 border-b border-ink-200 pb-2">
									<button
										type="button"
										aria-expanded={expanded}
										aria-controls={`${id}-group-${group.id}`}
										data-goal-ignore="Раскрытие группы тегов в редакторе каталога"
										onclick={() => (expandedGroups[group.id] = !expanded)}
										class="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-left text-sm font-semibold hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-link-500"
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.8"
											aria-hidden="true"
											class="shrink-0 transition-transform duration-200 motion-reduce:transition-none"
											class:rotate-90={expanded}><path d="m9 5 7 7-7 7" /></svg
										>
										{group.name}
									</button>
									{#if expanded}
										<div
											id={`${id}-group-${group.id}`}
											transition:p1_slide={{ duration: reducedMotion ? 0 : 220, easing: cubicOut }}
											inert={!expanded}
										>
											<fieldset {disabled} aria-label={group.name} class="min-w-0 pt-2">
												{#if group.tags.length}
													<div class="grid gap-x-4 sm:grid-cols-2">
														{#each group.tags as tag (tag.id)}
															<label
																class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-ink-50"
															>
																<input
																	type="checkbox"
																	value={tag.id}
																	checked={selected.includes(tag.id)}
																	onchange={(event) => {
																		selected = event.currentTarget.checked
																			? [...selected, tag.id]
																			: selected.filter((id) => id !== tag.id);
																	}}
																	class="size-4 shrink-0 rounded border-ink-400 text-link-600 focus:ring-link-500"
																/>
																<span class="min-w-0 text-sm wrap-anywhere"
																	>{tag.name}{#if tag.href}<span
																			class="mt-0.5 block text-xs text-ink-500">{tag.href}</span
																		>{/if}</span
																>
															</label>
														{/each}
													</div>
												{:else}
													<p class="text-sm text-ink-600">
														{query ? 'Ничего не найдено' : 'Теги ещё не добавлены'}
													</p>
												{/if}
											</fieldset>
										</div>
									{/if}
								</div>
							{/each}
						</div>
						<p class="text-xs text-ink-600">
							{helpText}
						</p>
					{/if}
				</div>
				<footer
					class="flex shrink-0 items-center justify-between gap-4 border-t border-ink-200 px-5 py-4"
				>
					<p class="text-sm text-ink-600" aria-live="polite">Выбрано тегов: {selected.length}</p>
					<button
						type="button"
						onclick={() => (open = false)}
						data-goal-ignore="Завершение выбора тегов в редакторе каталога"
						class="min-h-11 rounded-lg bg-link-600 px-5 py-2 text-sm font-medium text-on-accent hover:bg-link-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-500"
						>Готово</button
					>
				</footer>
			</div>
		</dialog>
	{/if}
</div>
