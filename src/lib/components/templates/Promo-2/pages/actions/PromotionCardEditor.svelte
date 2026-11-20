<script lang="ts">
	import { untrack } from 'svelte';
	import RichText from '$lib/components/RichText.svelte';
	import {
		parsePromotionTime,
		promotionDeadline,
		promotionTimeInput,
		type PromotionCard,
		type PromotionCardFields
	} from './promotion-cards';

	let {
		mode,
		card,
		categories,
		onSave,
		onClose
	}: {
		mode: 'add' | 'edit' | 'remove';
		card?: PromotionCard;
		categories: { key: string; label: string }[];
		onSave: (values: PromotionCardFields) => Promise<void>;
		onClose: (saved?: boolean) => void;
	} = $props();
	const dialogId = $props.id();
	const initialDeadline = untrack(() => (card ? promotionTimeInput(promotionDeadline(card)) : ''));
	let deadlineInput = $state(initialDeadline);
	let categoryInput = $state(untrack(() => card?.category ?? categories[0]?.key ?? 'all'));
	let titleInput = $state('');
	let saving = $state(false);
	let saveError = $state('');
	const dialogInput =
		'min-h-11 w-full rounded-sm border border-ink-300 bg-surface-raised px-3 py-2 text-sm text-ink-900 focus:border-link-600 focus:ring-link-600';

	function mountDialog(dialog: HTMLDialogElement) {
		dialog.showModal();
		dialog.querySelector<HTMLElement>('[data-promotion-initial-focus]')?.focus();
		return () => dialog.close();
	}

	async function saveManagement(event: SubmitEvent) {
		event.preventDefault();
		if (saving) return;
		saveError = '';
		const title = titleInput.trim();
		if (mode === 'add' && !title) {
			saveError = 'Введите название акции.';
			return;
		}
		const deadline = deadlineInput ? parsePromotionTime(deadlineInput) : null;
		if (mode !== 'remove' && deadlineInput && deadline === null) {
			saveError = 'Укажите действительную дату и время окончания.';
			return;
		}
		const expiresAt =
			mode === 'add' || deadlineInput !== initialDeadline
				? deadline === null
					? null
					: new Date(deadline).toISOString()
				: undefined;
		saving = true;
		try {
			await onSave({ title, category: categoryInput, expiresAt });
			onClose(true);
		} catch (cause) {
			saveError = cause instanceof Error ? cause.message : 'Не удалось сохранить изменения.';
		} finally {
			saving = false;
		}
	}
</script>

<dialog
	{@attach mountDialog}
	aria-labelledby={dialogId}
	oncancel={(event) => {
		event.preventDefault();
		if (!saving) onClose();
	}}
	class="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-ink-200 bg-surface-raised p-5 text-ink-900 shadow-elevated backdrop:bg-scrim/60 sm:p-6"
>
	<form onsubmit={saveManagement} aria-busy={saving}>
		<h2 id={dialogId} class="text-xl">
			{mode === 'add' ? 'Новая акция' : mode === 'edit' ? 'Настройки акции' : 'Удалить акцию?'}
		</h2>
		{#if card}
			<p class="mt-2 text-sm wrap-anywhere text-ink-700">
				<RichText value={card.title} />
			</p>
		{/if}
		{#if mode !== 'remove'}
			<fieldset disabled={saving} class="mt-5 grid gap-4">
				{#if mode === 'add'}
					<label class="grid gap-1.5 text-sm font-medium">
						Название
						<input
							type="text"
							class={dialogInput}
							bind:value={titleInput}
							data-promotion-initial-focus
							required
						/>
					</label>
				{/if}
				<label class="grid gap-1.5 text-sm font-medium">
					Категория
					<select class={dialogInput} bind:value={categoryInput}>
						{#if !categories.some((filter) => filter.key === categoryInput)}
							<option value={categoryInput}>Без категории</option>
						{/if}
						{#each categories as filter (filter.key)}
							<option value={filter.key}>{filter.label}</option>
						{/each}
					</select>
				</label>
				<label class="grid gap-1.5 text-sm font-medium">
					Дата и время окончания (мск)
					<input
						type="datetime-local"
						class={dialogInput}
						bind:value={deadlineInput}
						data-promotion-initial-focus={mode === 'edit' ? '' : undefined}
					/>
					<span class="text-xs font-normal text-ink-700">
						Оставьте поле пустым, если срок не ограничен.
					</span>
				</label>
			</fieldset>
		{/if}
		{#if saveError}
			<p role="alert" class="mt-4 text-sm text-cat-6-600">{saveError}</p>
		{/if}
		<div class="mt-6 flex flex-wrap justify-end gap-3">
			<button
				type="button"
				disabled={saving}
				data-promotion-initial-focus={mode === 'remove' ? '' : undefined}
				data-goal-ignore="Отмена изменений акции в редакторе сайта"
				onclick={() => onClose()}
				class="min-h-11 rounded-sm border border-ink-300 px-4 py-2 text-sm hover:bg-ink-50 disabled:opacity-50"
				>Отмена</button
			>
			<button
				type="submit"
				disabled={saving}
				data-goal-ignore="Сохранение изменений акции в редакторе сайта"
				class="min-h-11 rounded-sm px-4 py-2 text-sm font-medium disabled:opacity-50 {mode ===
				'remove'
					? 'bg-cat-6-600 text-on-accent'
					: 'bg-primary text-inverse'}"
			>
				{saving ? 'Сохраняем…' : mode === 'remove' ? 'Удалить акцию' : 'Сохранить'}
			</button>
		</div>
	</form>
</dialog>
