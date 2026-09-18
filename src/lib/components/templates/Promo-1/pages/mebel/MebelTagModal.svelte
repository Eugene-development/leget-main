<script lang="ts">
	import { tick } from 'svelte';
	import {
		createTag,
		updateTag,
		deleteTag,
		loadTagGroups,
		type ProjectTag,
		type TagGroup
	} from './tags';
	let {
		onClose,
		onChanged,
		groupSlugs = [],
		title = 'Теги мебели',
		target = 'проектов'
	}: {
		onClose: () => void;
		onChanged: () => void;
		groupSlugs?: string[];
		title?: string;
		target?: string;
	} = $props();
	let groups = $state<TagGroup[]>([]);
	let groupId = $state('');
	let name = $state('');
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');
	let nameInput = $state<HTMLInputElement>();
	let editingId = $state('');
	let deleting = $state<ProjectTag | null>(null);
	const brandRubric = $derived(
		(
			{
				'appliance-brand': '/bytovaya-tehnika',
				'plumbing-brand': '/santehnika',
				'countertop-brand': '/stoleshnica'
			} as Record<string, string>
		)[groups.find((group) => group.id === groupId)?.slug ?? '']
	);
	const currentTags = $derived(groups.find((group) => group.id === groupId)?.tags ?? []);
	const id = $props.id();

	function resetEdit() {
		editingId = '';
		name = '';
		deleting = null;
		error = '';
		success = '';
	}

	async function edit(tag: ProjectTag) {
		resetEdit();
		editingId = tag.id;
		name = tag.name;
		await tick();
		nameInput?.focus();
	}

	async function remove() {
		if (saving || !deleting) return;
		saving = true;
		error = '';
		success = '';
		const tag = deleting;
		try {
			await deleteTag(tag.id);
			groups = groups.map((group) => ({
				...group,
				tags: group.tags.filter((item) => item.id !== tag.id)
			}));
			resetEdit();
			success = `Тег «${tag.name}» удалён из справочника и ${target}.`;
			onChanged();
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Не удалось удалить тег.';
		} finally {
			saving = false;
		}
	}

	async function load() {
		loading = true;
		error = '';
		try {
			groups = (await loadTagGroups(groupSlugs.length ? undefined : 'mebel')).filter((group) =>
				groupSlugs.length
					? groupSlugs.includes(group.slug)
					: !['appliance-type', 'plumbing-type'].includes(group.slug)
			);
			groupId = groups[0]?.id ?? '';
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Не удалось загрузить группы тегов.';
		} finally {
			loading = false;
		}
	}

	function mountDialog(node: HTMLDialogElement) {
		const previousFocus = document.activeElement;
		node.showModal();
		void load();
		return {
			destroy() {
				node.close();
				if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
					previousFocus.focus();
			}
		};
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (saving || !name.trim() || !groupId) return;
		saving = true;
		error = '';
		success = '';
		try {
			const tag = editingId
				? await updateTag(editingId, name.trim())
				: await createTag(groupId, name.trim());
			groups = groups.map((group) =>
				group.id === tag.tag_group_id
					? {
							...group,
							tags: [...group.tags.filter((item) => item.id !== tag.id), tag].sort((a, b) =>
								a.name.localeCompare(b.name, 'ru')
							)
						}
					: group
			);
			editingId = '';
			onChanged();
			success = `Тег «${tag.name}» сохранён в справочнике.`;
			name = '';
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Не удалось добавить тег.';
		} finally {
			saving = false;
			await tick();
			nameInput?.focus();
		}
	}
</script>

<dialog
	use:mountDialog
	aria-labelledby={`${id}-title`}
	onkeydown={(event) => {
		if (event.key === 'Escape') event.stopPropagation();
	}}
	oncancel={(event) => {
		event.preventDefault();
		if (!saving) onClose();
	}}
	class="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-ink-200 bg-surface-raised p-6 text-ink-800 shadow-xl backdrop:bg-scrim/50"
>
	<div class="mb-5 flex items-start justify-between gap-4">
		<div>
			<h2 id={`${id}-title`} class="text-xl">{title}</h2>
			<p class="mt-2 text-sm text-ink-600">
				Теги брендов появляются автоматически. Их названия меняются на странице бренда. Остальные
				теги можно добавить здесь.
			</p>
		</div>
		<button
			data-goal-ignore="Управление справочником тегов в редакторе"
			type="button"
			onclick={onClose}
			disabled={saving}
			aria-label="Закрыть форму тегов"
			class="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-ink-100 focus-visible:outline-link-500 disabled:opacity-50"
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
	</div>
	{#if loading}<p role="status">Загружаем группы…</p>{/if}
	{#if error}<p role="alert" class="mb-4 text-sm">{error}</p>{/if}
	{#if !loading && !groups.length}
		<button
			data-goal-ignore="Управление справочником тегов в редакторе"
			type="button"
			onclick={load}
			class="min-h-11 text-link-700 underline">Повторить загрузку</button
		>
	{:else if !loading}
		<form onsubmit={save} class="space-y-4">
			<fieldset disabled={saving} class="space-y-4">
				<label class="block text-sm font-medium"
					>Группа тегов
					<select
						bind:value={groupId}
						onchange={resetEdit}
						required
						class="mt-1 min-h-11 w-full rounded-lg border border-ink-300 bg-surface-raised px-3 text-ink-800 focus-visible:outline-link-500"
					>
						{#each groups as group (group.id)}<option value={group.id}>{group.name}</option>{/each}
					</select>
				</label>
				{#if brandRubric && !editingId}
					<p class="text-sm text-ink-600">
						Создайте бренд в его рубрике — тег появится здесь автоматически. <a
							href={brandRubric}
							class="text-link-700 underline">Открыть рубрику</a
						>
					</p>
				{:else}
					<label class="block text-sm font-medium"
						>{editingId ? 'Новое название тега' : 'Название нового тега'}
						<input
							bind:this={nameInput}
							bind:value={name}
							required
							maxlength="120"
							class="mt-1 min-h-11 w-full rounded-lg border border-ink-300 bg-surface-raised px-3 text-ink-800 focus-visible:outline-link-500"
						/>
					</label>
				{/if}
			</fieldset>
			{#if success}<p role="status" class="text-sm text-ink-700">{success}</p>{/if}
			<div class="flex flex-wrap justify-end gap-3 pt-2">
				{#if editingId}<button
						data-goal-ignore="Управление справочником тегов в редакторе"
						type="button"
						onclick={resetEdit}
						disabled={saving}
						class="min-h-11 px-3 text-sm text-link-700 underline">Отменить изменение</button
					>{/if}
				<button
					data-goal-ignore="Управление справочником тегов в редакторе"
					type="button"
					onclick={onClose}
					disabled={saving}
					class="min-h-11 rounded-lg border border-ink-300 px-4 text-sm hover:bg-ink-50 disabled:opacity-50"
					>Закрыть</button
				>
				<button
					data-goal-ignore="Управление справочником тегов в редакторе"
					type="submit"
					disabled={saving || !name.trim() || !groupId || (!!brandRubric && !editingId)}
					class="min-h-11 rounded-lg bg-link-600 px-4 text-sm font-medium text-on-accent hover:bg-link-700 disabled:opacity-50"
					>{saving ? 'Сохраняем…' : editingId ? 'Сохранить название' : 'Добавить тег'}</button
				>
			</div>
		</form>
		<section class="mt-6 border-t border-ink-200 pt-4" aria-label="Теги выбранной группы">
			<p class="mb-2 text-sm font-medium">Теги в группе · {currentTags.length}</p>
			{#if !currentTags.length}<p class="text-sm text-ink-600">
					В этой группе пока нет тегов.
				</p>{/if}
			<ul class="divide-y divide-ink-200">
				{#each currentTags as tag (tag.id)}
					<li class="py-2">
						<div class="flex flex-wrap items-center gap-x-3">
							<span class="min-w-0 flex-1 text-sm wrap-anywhere">{tag.name}</span>
							{#if tag.managed}
								{#if tag.href}<a
										href={tag.href}
										class="min-h-11 content-center text-sm text-link-700 underline">К бренду</a
									>{/if}
							{:else}
								<button
									data-goal-ignore="Управление справочником тегов в редакторе"
									type="button"
									onclick={() => edit(tag)}
									disabled={saving}
									aria-label={`Изменить тег «${tag.name}»`}
									class="min-h-11 px-2 text-sm text-link-700 underline disabled:opacity-50"
									>Изменить</button
								>
								<button
									data-goal-ignore="Управление справочником тегов в редакторе"
									type="button"
									onclick={() => {
										resetEdit();
										deleting = tag;
									}}
									disabled={saving}
									aria-label={`Удалить тег «${tag.name}»`}
									class="min-h-11 px-2 text-sm text-ink-700 underline disabled:opacity-50"
									>Удалить</button
								>
							{/if}
						</div>
						{#if deleting?.id === tag.id}
							<div
								class="mt-2 rounded-lg bg-ink-50 p-3"
								role="group"
								aria-label="Подтверждение удаления"
							>
								<p class="text-sm">
									Удалить тег «{tag.name}» из общего справочника и всех {target}? Бренды и проекты
									сохранятся. Отменить удаление нельзя.
								</p>
								<div class="mt-2 flex flex-wrap gap-3">
									<button
										data-goal-ignore="Управление справочником тегов в редакторе"
										type="button"
										onclick={remove}
										disabled={saving}
										class="min-h-11 rounded-lg bg-ink-800 px-3 text-sm text-on-dark disabled:opacity-50"
										>{saving ? 'Удаляем…' : 'Удалить тег'}</button
									>
									<button
										data-goal-ignore="Управление справочником тегов в редакторе"
										type="button"
										onclick={resetEdit}
										disabled={saving}
										class="min-h-11 px-3 text-sm text-link-700 underline">Отмена</button
									>
								</div>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</dialog>
