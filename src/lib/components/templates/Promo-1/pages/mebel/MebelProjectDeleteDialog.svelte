<script lang="ts">
	import { tick } from 'svelte';
	import { projectRequest } from './project-request';

	let {
		projectId,
		projectName,
		onClose,
		onDeleted
	}: {
		projectId: string;
		projectName: string;
		onClose: () => void;
		onDeleted: () => void;
	} = $props();
	const uid = $props.id();
	let deleting = $state(false);
	let error = $state('');
	let errorElement = $state<HTMLParagraphElement>();

	function close() {
		if (!deleting) onClose();
	}
	function mountDialog(node: HTMLDialogElement) {
		const previousFocus = document.activeElement;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		node.showModal();
		return {
			destroy() {
				node.close();
				document.body.style.overflow = previousOverflow;
				if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
					previousFocus.focus();
			}
		};
	}
	async function remove(event: SubmitEvent) {
		event.preventDefault();
		if (deleting) return;
		deleting = true;
		error = '';
		try {
			const result = await projectRequest<{ deleteMebelProject: { id: string } }>(
				`mutation DeleteMebelProject($id: ID!) { deleteMebelProject(id: $id) { id } }`,
				{ id: projectId },
				'Не удалось удалить проект. Проверьте права доступа и повторите попытку.'
			);
			if (result.deleteMebelProject?.id !== projectId)
				throw new Error('Сервер не подтвердил удаление проекта.');
		} catch (cause) {
			error =
				cause instanceof Error ? cause.message : 'Не удалось удалить проект. Повторите попытку.';
			deleting = false;
			await tick();
			errorElement?.focus();
			return;
		}
		deleting = false;
		onClose();
		onDeleted();
	}
</script>

<dialog
	use:mountDialog
	aria-labelledby={`${uid}-title`}
	aria-describedby={`${uid}-description`}
	onkeydown={(event) => {
		if (event.key === 'Escape') event.stopPropagation();
	}}
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
	class="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-ink-200 bg-surface-raised p-6 text-ink-800 shadow-2xl backdrop:bg-scrim/60"
>
	<form onsubmit={remove} aria-busy={deleting}>
		<h2 id={`${uid}-title`} class="text-xl">Удалить проект?</h2>
		<p class="mt-3 text-sm font-medium wrap-anywhere">{projectName}</p>
		<p id={`${uid}-description`} class="mt-2 text-sm text-ink-600">
			Проект исчезнет с сайта. Запись в базе, фотографии и теги сохранятся.
		</p>
		{#if error}<p
				bind:this={errorElement}
				tabindex="-1"
				role="alert"
				class="mt-4 text-sm text-cat-6-600"
			>
				{error}
			</p>{/if}
		<div class="mt-6 flex flex-wrap justify-end gap-3">
			<button
				type="button"
				onclick={close}
				disabled={deleting}
				class="min-h-11 rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-500 disabled:opacity-50"
				>Отмена</button
			>
			<button
				type="submit"
				disabled={deleting}
				class="min-h-11 rounded-lg bg-cat-6-600 px-4 py-2 text-sm font-medium text-on-accent hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-500 disabled:opacity-50"
				>{deleting ? 'Удаляем…' : 'Удалить проект'}</button
			>
		</div>
	</form>
</dialog>
