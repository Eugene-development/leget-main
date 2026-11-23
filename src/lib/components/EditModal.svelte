<script lang="ts">
	import RichTextEditor from './RichTextEditor.svelte';
	import { editStore } from '$lib/stores/edit.svelte';

	const field = $derived(editStore.activeField);
	const isSaving = $derived(editStore.isSaving);
	const saveError = $derived(editStore.saveError);
	const isDirty = $derived(field !== null && field.draft !== field.value);

	let textareaEl: HTMLTextAreaElement | null = $state(null);
	let inputEl: HTMLInputElement | null = $state(null);
	let dialogEl: HTMLDivElement | null = $state(null);
	let position = $state<{ x: number; y: number } | null>(null);
	let size = $state<{ width: number; height: number } | null>(null);
	type Operation = 'move' | 'resize';
	let drag: {
		operation: Operation;
		pointerId: number;
		x: number;
		y: number;
		bounds: DOMRect;
	} | null = null;
	let keyboardOperation = $state<Operation | null>(null);
	const keyboardHint = $props.id();
	const margin = 16;
	const keyboardDirections = {
		ArrowLeft: [-1, 0],
		ArrowRight: [1, 0],
		ArrowUp: [0, -1],
		ArrowDown: [0, 1]
	} as const;

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

	$effect(() => {
		if (!dialogEl) return;
		const observer = new ResizeObserver(keepDialogOnScreen);
		observer.observe(dialogEl);
		return () => observer.disconnect();
	});

	function moveDialog(x: number, y: number) {
		if (!dialogEl) return;
		const { width, height } = dialogEl.getBoundingClientRect();
		const maxX = document.documentElement.clientWidth - width - margin;
		const maxY = document.documentElement.clientHeight - height - margin;
		const nextX = Math.max(margin, Math.min(maxX, x));
		const nextY = Math.max(margin, Math.min(maxY, y));
		if (position?.x !== nextX || position.y !== nextY) position = { x: nextX, y: nextY };
	}

	function keepDialogOnScreen() {
		if (position) moveDialog(position.x, position.y);
	}

	function adjustDialog(operation: Operation, bounds: DOMRect, dx: number, dy: number) {
		if (operation === 'move') {
			moveDialog(bounds.left + dx, bounds.top + dy);
			return;
		}
		// The top-right handle keeps the lower-left corner anchored while resizing.
		const maxWidth = document.documentElement.clientWidth - bounds.left - margin;
		const maxHeight = bounds.bottom - margin;
		const width = Math.min(maxWidth, Math.max(320, bounds.width + dx));
		const height = Math.min(maxHeight, Math.max(160, bounds.height - dy));
		size = { width, height };
		position = { x: bounds.left, y: bounds.bottom - height };
	}

	function startDrag(
		event: PointerEvent & { currentTarget: HTMLButtonElement },
		operation: Operation
	) {
		if (!event.isPrimary || event.button !== 0 || !dialogEl) return;
		drag = {
			operation,
			pointerId: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			bounds: dialogEl.getBoundingClientRect()
		};
		keyboardOperation = null;
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function dragDialog(event: PointerEvent) {
		if (drag?.pointerId === event.pointerId)
			adjustDialog(drag.operation, drag.bounds, event.clientX - drag.x, event.clientY - drag.y);
	}

	function endDrag(event: PointerEvent) {
		if (drag?.pointerId === event.pointerId) drag = null;
	}

	function toggleKeyboardOperation(event: MouseEvent, operation: Operation) {
		if (event.detail === 0) keyboardOperation = keyboardOperation === operation ? null : operation;
	}

	function adjustWithKeyboard(event: KeyboardEvent) {
		if (!keyboardOperation || !dialogEl) return;
		if (event.key === 'Escape') {
			event.stopPropagation();
			keyboardOperation = null;
			return;
		}
		const direction = keyboardDirections[event.key as keyof typeof keyboardDirections];
		if (!direction) return;
		event.preventDefault();
		const step = event.shiftKey ? 64 : 16;
		adjustDialog(
			keyboardOperation,
			dialogEl.getBoundingClientRect(),
			direction[0] * step,
			direction[1] * step
		);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') editStore.close();
		if (field && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			e.preventDefault();
			void editStore.save();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} onresize={keepDialogOnScreen} />

{#if field}
	<div
		class="fixed bottom-4 left-4 z-[150] flex max-h-[calc(100dvh-2rem)] w-[680px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-surface-raised shadow-2xl ring-1 ring-ink-200"
		bind:this={dialogEl}
		style:left={position ? `${position.x}px` : undefined}
		style:top={position ? `${position.y}px` : undefined}
		style:bottom={position ? 'auto' : undefined}
		style:width={size ? `${size.width}px` : undefined}
		style:height={size ? `${size.height}px` : undefined}
		role="dialog"
		aria-modal="false"
		aria-label={`Редактирование: ${field.label}`}
	>
		<!-- Заголовок -->
		<div class="flex shrink-0 items-center border-b border-ink-100 pr-4">
			<button
				type="button"
				class="flex min-h-11 min-w-0 flex-1 cursor-grab touch-none items-center gap-2 px-4 py-3 text-left select-none focus-visible:ring-2 focus-visible:ring-link-500 focus-visible:outline-none focus-visible:ring-inset active:cursor-grabbing aria-pressed:bg-link-50"
				aria-label={`Переместить окно редактирования: ${field.label}`}
				aria-describedby={keyboardHint}
				aria-pressed={keyboardOperation === 'move'}
				data-goal-ignore="Перемещение окна редактора контента"
				title="Перетащите окно за заголовок"
				onpointerdown={(event) => startDrag(event, 'move')}
				onpointermove={dragDialog}
				onlostpointercapture={endDrag}
				onclick={(event) => toggleKeyboardOperation(event, 'move')}
				onkeydown={adjustWithKeyboard}
				onblur={() => (keyboardOperation = null)}
			>
				<svg
					class="size-4 shrink-0 text-ink-500"
					viewBox="0 0 16 16"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						d="M5 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2m6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2M5 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2m6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-6 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2m6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"
					/>
				</svg>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4 shrink-0 text-link-500"
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
			</button>
			<span id={keyboardHint} class="sr-only">Нажмите Enter, затем используйте стрелки.</span>
			<button
				type="button"
				class="flex w-11 shrink-0 cursor-nesw-resize touch-none items-center justify-center self-stretch text-ink-500 hover:bg-ink-100 focus-visible:ring-2 focus-visible:ring-link-500 focus-visible:outline-none focus-visible:ring-inset aria-pressed:bg-link-50"
				aria-label="Изменить размер окна"
				aria-describedby={keyboardHint}
				aria-pressed={keyboardOperation === 'resize'}
				data-goal-ignore="Изменение размера окна редактора контента"
				title="Потяните, чтобы изменить размер окна"
				onpointerdown={(event) => startDrag(event, 'resize')}
				onpointermove={dragDialog}
				onlostpointercapture={endDrag}
				onclick={(event) => toggleKeyboardOperation(event, 'resize')}
				onkeydown={adjustWithKeyboard}
				onblur={() => (keyboardOperation = null)}
			>
				<svg
					class="size-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M8 16 16 8M10 8h6v6M8 10v6h6" />
				</svg>
			</button>
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
		<div class="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
			{#if field.richText}
				{#key field.key}
					<RichTextEditor
						value={field.value}
						label={field.label}
						legacyHtml={field.legacyHtml}
						defaultFontSize={field.defaultFontSize}
						fillHeight={size !== null}
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
					class:flex-1={size !== null}
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
			<div class="mt-3 flex shrink-0 items-center gap-2">
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
