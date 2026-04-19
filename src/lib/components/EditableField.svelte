<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * EditableField — универсальная обёртка для inline-редактирования.
	 *
	 * Показывает иконку карандаша (сверху справа) только когда isEditable=true.
	 * При клике на карандаш поле становится активным для редактирования.
	 * При изменении текста появляется кнопка «Сохранить».
	 * При нажатии на «Сохранить» вызывает onSave(newValue).
	 */

	interface Props {
		/** Текущее значение поля */
		value: string;
		/** Разрешено ли редактирование (пользователь авторизован) */
		isEditable?: boolean;
		/** Тип поля: однострочный или многострочный */
		multiline?: boolean;
		/** Callback при сохранении */
		onSave: (value: string) => Promise<void>;
		/** CSS-класс для контейнера */
		class?: string;
		/** Содержимое для отображения в режиме просмотра */
		children?: Snippet;
	}

	let {
		value,
		isEditable = false,
		multiline = false,
		onSave,
		class: className = '',
		children
	}: Props = $props();

	let isEditing = $state(false);
	// eslint-disable-next-line svelte/reactivity -- intentional: draft is a local copy, synced via $effect below
	let draft = $state('');
	let isSaving = $state(false);
	let saveError = $state('');
	let hovered = $state(false);

	// Синхронизируем draft с внешним value когда не редактируем
	$effect(() => {
		if (!isEditing) {
			draft = value;
		}
	});

	const isDirty = $derived(draft !== value);

	function startEdit() {
		draft = value;
		isEditing = true;
		saveError = '';
	}

	function cancelEdit() {
		draft = value;
		isEditing = false;
		saveError = '';
	}

	async function handleSave() {
		if (!isDirty || isSaving) return;
		isSaving = true;
		saveError = '';
		try {
			await onSave(draft);
			isEditing = false;
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Ошибка сохранения';
		} finally {
			isSaving = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') cancelEdit();
		if (e.key === 'Enter' && !multiline && isDirty) {
			e.preventDefault();
			handleSave();
		}
	}

	// Ref для фокуса при входе в режим редактирования
	let inputEl: HTMLInputElement | null = $state(null);
	let textareaEl: HTMLTextAreaElement | null = $state(null);

	$effect(() => {
		if (isEditing) {
			// Фокус через tick чтобы элемент успел отрендериться
			setTimeout(() => {
				inputEl?.focus();
				textareaEl?.focus();
			}, 0);
		}
	});
</script>

<div
	class="editable-field-wrapper relative inline-block {className}"
	role="group"
	onmouseenter={() => { hovered = true; }}
	onmouseleave={() => { hovered = false; }}
>
	<!-- Иконка карандаша — видна при наведении когда isEditable и не в режиме редактирования -->
	{#if isEditable && !isEditing}
		<button
			type="button"
			onclick={startEdit}
			class="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-gray-200 transition-opacity hover:bg-indigo-50 hover:ring-indigo-400"
			style="opacity: {hovered ? 1 : 0}; pointer-events: {hovered ? 'auto' : 'none'};"
			title="Редактировать"
			aria-label="Редактировать поле"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-3.5 w-3.5 text-gray-500"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
				/>
			</svg>
		</button>
	{/if}

	<!-- Режим просмотра -->
	{#if !isEditing}
		{@render children?.()}
	{:else}
		<!-- Режим редактирования -->
		<div class="relative">
			{#if multiline}
				<textarea
					bind:this={textareaEl}
					class="w-full resize-none rounded-lg border border-indigo-400 bg-white/95 px-3 py-2 text-inherit font-inherit leading-inherit shadow-lg ring-2 ring-indigo-200 focus:outline-none"
					rows={4}
					bind:value={draft}
					onkeydown={handleKeydown}
				></textarea>
			{:else}
				<input
					bind:this={inputEl}
					type="text"
					class="w-full rounded-lg border border-indigo-400 bg-white/95 px-3 py-2 text-inherit font-inherit shadow-lg ring-2 ring-indigo-200 focus:outline-none"
					bind:value={draft}
					onkeydown={handleKeydown}
				/>
			{/if}

			{#if saveError}
				<p class="mt-1 text-xs text-red-500">{saveError}</p>
			{/if}

			<div class="mt-2 flex items-center gap-2">
				{#if isDirty}
					<button
						type="button"
						onclick={handleSave}
						disabled={isSaving}
						class="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-60"
					>
						{isSaving ? 'Сохранение...' : 'Сохранить'}
					</button>
				{/if}
				<button
					type="button"
					onclick={cancelEdit}
					class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-gray-400"
				>
					Отмена
				</button>
			</div>
		</div>
	{/if}
</div>
