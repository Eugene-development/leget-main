<script lang="ts">
	import RichTextEditor from './RichTextEditor.svelte';
	import { editStore } from '$lib/stores/edit.svelte';

	const field = $derived(editStore.activeField);
	const isSaving = $derived(editStore.isSaving);
	const saveError = $derived(editStore.saveError);
	const isDirty = $derived(field !== null && field.draft !== field.value);

	let textareaEl: HTMLTextAreaElement | null = $state(null);
	let inputEl: HTMLInputElement | null = $state(null);

	$effect(() => {
		const key = field?.key;
		if (!key) return;
		const previous = document.activeElement;
		const timer = setTimeout(() => {
			textareaEl?.focus();
			inputEl?.focus();
		}, 0);
		return () => {
			clearTimeout(timer);
			if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
		};
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') editStore.close();
		if (field && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			e.preventDefault();
			void editStore.save();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if field}
	<!-- Модальное окно в левом нижнем углу -->
	<div
		class="fixed bottom-4 left-4 z-[150] max-h-[calc(100dvh-2rem)] w-[min(680px,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-surface-raised shadow-2xl ring-1 ring-ink-200"
		role="dialog"
		aria-modal="false"
		aria-label={`Редактирование: ${field.label}`}
	>
		<!-- Заголовок -->
		<div class="flex items-center justify-between border-b border-ink-100 px-4 py-3">
			<div class="flex items-center gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4 text-link-500"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					{#if field.kind === 'image'}
						<path
							d="M10 4v12M4 10h12"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					{:else}
						<path
							d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
						/>
					{/if}
				</svg>
				<span class="text-sm font-semibold text-ink-800">{field.label}</span>
			</div>
			<button
				type="button"
				onclick={() => editStore.close()}
				disabled={isSaving}
				class="rounded-lg p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-600"
				aria-label="Закрыть"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		</div>

		<!-- Форма -->
		<div class="p-4">
			{#if field.richText}
				{#key field.key}
					<RichTextEditor
						value={field.value}
						label={field.label}
						legacyHtml={field.legacyHtml}
						disabled={isSaving}
						onchange={(value) => editStore.setDraft(value)}
					/>
				{/key}
			{:else if field.multiline}
				<textarea
					bind:this={textareaEl}
					aria-label={field.label}
					disabled={isSaving}
					class="w-full resize-none rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 transition focus:border-link-400 focus:ring-2 focus:ring-link-100 focus:outline-none"
					rows={5}
					value={field.draft}
					oninput={(e) => editStore.setDraft((e.target as HTMLTextAreaElement).value)}
					placeholder="Введите текст..."
				></textarea>
			{:else}
				<input
					bind:this={inputEl}
					aria-label={field.label}
					disabled={isSaving}
					type="text"
					class="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 transition focus:border-link-400 focus:ring-2 focus:ring-link-100 focus:outline-none"
					value={field.draft}
					oninput={(e) => editStore.setDraft((e.target as HTMLInputElement).value)}
					placeholder="Введите текст..."
				/>
			{/if}

			{#if saveError}
				<p role="alert" class="mt-2 text-xs text-cat-6-500">{saveError}</p>
			{/if}

			<!-- Кнопки -->
			<div class="mt-3 flex items-center gap-2">
				<button
					type="button"
					onclick={() => editStore.save()}
					disabled={isSaving || !isDirty}
					class="flex-1 rounded-xl bg-link-600 px-4 py-2 text-sm font-semibold text-on-dark transition hover:bg-link-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isSaving ? 'Сохранение...' : 'Сохранить'}
				</button>
				<button
					type="button"
					onclick={() => editStore.close()}
					disabled={isSaving}
					class="rounded-xl border border-ink-200 bg-surface-raised px-4 py-2 text-sm font-medium text-ink-600 transition hover:border-ink-300 hover:bg-ink-50"
				>
					Отмена
				</button>
			</div>
		</div>
	</div>
{/if}
