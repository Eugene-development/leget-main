<script lang="ts">
	import { editStore } from '$lib/stores/edit.svelte';

	const field = $derived(editStore.activeField);
	const isSaving = $derived(editStore.isSaving);
	const saveError = $derived(editStore.saveError);
	const isDirty = $derived(field !== null && field.draft !== field.value);

	let textareaEl: HTMLTextAreaElement | null = $state(null);
	let inputEl: HTMLInputElement | null = $state(null);

	// Фокус при открытии
	$effect(() => {
		if (field) {
			setTimeout(() => {
				textareaEl?.focus();
				inputEl?.focus();
			}, 50);
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') editStore.close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if field}
	<!-- Модальное окно в левом нижнем углу -->
	<div
		class="fixed bottom-6 left-6 z-50 w-80 rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200"
		role="dialog"
		aria-modal="true"
		aria-label="Редактирование поля"
	>
		<!-- Заголовок -->
		<div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
			<div class="flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4 text-indigo-500"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
				</svg>
				<span class="text-sm font-semibold text-gray-800">{field.label}</span>
			</div>
			<button
				type="button"
				onclick={() => editStore.close()}
				class="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
				aria-label="Закрыть"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			</button>
		</div>

		<!-- Форма -->
		<div class="p-4">
			{#if field.multiline}
				<textarea
					bind:this={textareaEl}
					class="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
					rows={5}
					value={field.draft}
					oninput={(e) => editStore.setDraft((e.target as HTMLTextAreaElement).value)}
					placeholder="Введите текст..."
				></textarea>
			{:else}
				<input
					bind:this={inputEl}
					type="text"
					class="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
					value={field.draft}
					oninput={(e) => editStore.setDraft((e.target as HTMLInputElement).value)}
					placeholder="Введите текст..."
				/>
			{/if}

			{#if saveError}
				<p class="mt-2 text-xs text-red-500">{saveError}</p>
			{/if}

			<!-- Кнопки -->
			<div class="mt-3 flex items-center gap-2">
				<button
					type="button"
					onclick={() => editStore.save()}
					disabled={isSaving || !isDirty}
					class="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isSaving ? 'Сохранение...' : 'Сохранить'}
				</button>
				<button
					type="button"
					onclick={() => editStore.close()}
					class="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
				>
					Отмена
				</button>
			</div>
		</div>
	</div>
{/if}
