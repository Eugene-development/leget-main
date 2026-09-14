<script lang="ts">
	import { loadTagGroups, type TagGroup } from './tags';

	let {
		selected = $bindable([]),
		disabled = false
	}: {
		selected: string[];
		disabled?: boolean;
	} = $props();
	const id = $props.id();
	let open = $state(false);
	let groups = $state<TagGroup[]>([]);
	let loading = $state(false);
	let error = $state('');
	let search = $state('');
	const query = $derived(search.trim().toLocaleLowerCase('ru'));
	const visibleGroups = $derived(
		groups.map((group) => ({
			...group,
			tags: group.tags.filter((tag) => tag.name.toLocaleLowerCase('ru').includes(query))
		}))
	);

	async function load() {
		loading = true;
		error = '';
		try {
			groups = await loadTagGroups();
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Не удалось загрузить теги.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-3">
	<button
		type="button"
		{disabled}
		aria-expanded={open}
		aria-controls={id}
		onclick={() => {
			open = !open;
			if (open) void load();
		}}
		class="min-h-11 rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-800 hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-500 disabled:opacity-50"
	>
		{open ? 'Скрыть теги' : 'Выбрать теги'}{selected.length ? ` · ${selected.length}` : ''}
	</button>
	{#if open}
		<div
			{id}
			class="space-y-4 rounded-xl border border-ink-200 bg-surface-raised p-4 text-ink-800"
			aria-busy={loading}
		>
			<p class="text-sm text-ink-600">
				Отметьте подходящие теги. В каждой группе можно выбрать несколько.
			</p>
			{#if loading}
				<p role="status" class="text-sm text-ink-600">Загружаем теги…</p>
			{:else if error}
				<p role="alert" class="text-sm text-ink-800">{error}</p>
				<button type="button" onclick={load} class="min-h-11 text-sm text-link-700 underline"
					>Повторить загрузку</button
				>
			{:else}
				<label class="block text-sm">
					<span class="mb-1 block font-medium">Поиск тегов</span>
					<input
						type="search"
						bind:value={search}
						placeholder="Название бренда или материала"
						class="min-h-11 w-full rounded-lg border border-ink-300 bg-surface-raised px-3 text-ink-800 placeholder:text-ink-500 focus-visible:outline-link-500"
					/>
				</label>
				<div class="max-h-80 space-y-5 overflow-y-auto overscroll-contain">
					{#each visibleGroups as group (group.id)}
						<fieldset {disabled} class="min-w-0">
							<legend class="mb-2 text-sm font-semibold">{group.name}</legend>
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
											<span class="min-w-0 text-sm wrap-anywhere">{tag.name}</span>
										</label>
									{/each}
								</div>
							{:else}
								<p class="text-sm text-ink-600">
									{query ? 'Ничего не найдено' : 'Теги ещё не добавлены'}
								</p>
							{/if}
						</fieldset>
					{/each}
				</div>
				<p class="text-xs text-ink-600">
					Новые теги можно добавить через шестерёнку в блоке «Категории мебели».
				</p>
			{/if}
		</div>
	{/if}
</div>
