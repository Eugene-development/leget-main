<script lang="ts">
	import { tick } from 'svelte';
	import { createTag, loadTagGroups, type TagGroup } from './tags';
	let { onClose }: { onClose: () => void } = $props();
	let groups = $state<TagGroup[]>([]);
	let groupId = $state('');
	let name = $state('');
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');
	let nameInput = $state<HTMLInputElement>();
	const id = $props.id();

	async function load() {
		loading = true;
		error = '';
		try {
			groups = await loadTagGroups();
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
			const tag = await createTag(groupId, name.trim());
			success = `Тег «${tag.name}» доступен для выбора в проектах.`;
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
			<h2 id={`${id}-title`} class="text-xl">Добавить тег</h2>
			<p class="mt-2 text-sm text-ink-600">
				Выберите группу и укажите название. Тег появится в общем справочнике мебели.
			</p>
		</div>
		<button
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
		<button type="button" onclick={load} class="min-h-11 text-link-700 underline"
			>Повторить загрузку</button
		>
	{:else if !loading}
		<form onsubmit={save} class="space-y-4">
			<fieldset disabled={saving} class="space-y-4">
				<label class="block text-sm font-medium"
					>Группа тегов
					<select
						bind:value={groupId}
						required
						class="mt-1 min-h-11 w-full rounded-lg border border-ink-300 bg-surface-raised px-3 text-ink-800 focus-visible:outline-link-500"
					>
						{#each groups as group (group.id)}<option value={group.id}>{group.name}</option>{/each}
					</select>
				</label>
				<label class="block text-sm font-medium"
					>Название тега
					<input
						bind:this={nameInput}
						bind:value={name}
						required
						maxlength="120"
						class="mt-1 min-h-11 w-full rounded-lg border border-ink-300 bg-surface-raised px-3 text-ink-800 focus-visible:outline-link-500"
					/>
				</label>
			</fieldset>
			{#if success}<p role="status" class="text-sm text-ink-700">{success}</p>{/if}
			<div class="flex flex-wrap justify-end gap-3 pt-2">
				<button
					type="button"
					onclick={onClose}
					disabled={saving}
					class="min-h-11 rounded-lg border border-ink-300 px-4 text-sm hover:bg-ink-50 disabled:opacity-50"
					>Закрыть</button
				>
				<button
					type="submit"
					disabled={saving || !name.trim() || !groupId}
					class="min-h-11 rounded-lg bg-link-600 px-4 text-sm font-medium text-on-accent hover:bg-link-700 disabled:opacity-50"
					>{saving ? 'Добавляем…' : 'Добавить тег'}</button
				>
			</div>
		</form>
	{/if}
</dialog>
