<script lang="ts">
	import { onMount } from 'svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { galleryImageDownloadUrl } from '$lib/utils/public-media';
	import type { FavoriteKind } from '../../favorites/storage';
	import CopyPhotoLink from './CopyPhotoLink.svelte';

	let {
		photo,
		kind,
		onclose
	}: {
		photo: { image: string; title: string };
		kind: FavoriteKind;
		onclose: () => void;
	} = $props();

	let photoDialog: HTMLDialogElement;
	let savingPhoto = $state(false);
	let saveError = $state('');
	let saveController: AbortController | null = null;

	onMount(() => {
		const dialog = photoDialog;
		const previousOverflow = document.body.style.overflow;
		dialog.showModal();
		document.body.style.overflow = 'hidden';
		return () => {
			dialog.close();
			document.body.style.overflow = previousOverflow;
			saveController?.abort();
		};
	});

	function closePhoto() {
		photoDialog.close();
	}

	async function savePhoto() {
		if (savingPhoto) return;
		const controller = new AbortController();
		saveController = controller;
		savingPhoto = true;
		saveError = '';
		try {
			const response = await fetch(galleryImageDownloadUrl(photo.image, location.origin), {
				signal: controller.signal
			});
			if (!response.ok) throw new Error('Download failed');
			const blob = await response.blob();
			if (!blob.type.startsWith('image/')) throw new Error('Invalid image');
			if (controller.signal.aborted) return;
			const extension = blob.type.split('/')[1].split('+')[0].replace('jpeg', 'jpg');
			const filename =
				photo.title.replace(/[\\/:*?"<>|]/g, '-').trim() || (kind === 'kitchen' ? 'Кухня' : 'Шкаф');
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${filename}.${extension}`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			setTimeout(() => URL.revokeObjectURL(url), 60000);
		} catch {
			if (!controller.signal.aborted)
				saveError =
					'Не удалось скачать фото. Откройте оригинал и сохраните его через меню браузера.';
		} finally {
			if (saveController === controller) {
				savingPhoto = false;
				saveController = null;
			}
		}
	}
</script>

<dialog
	bind:this={photoDialog}
	{onclose}
	onclick={(event) => {
		if (event.target === photoDialog) closePhoto();
	}}
	data-goal-ignore="Закрытие просмотра фото по фону без формы"
	aria-label={`Фото ${kind === 'kitchen' ? 'кухни' : 'шкафа'}: ${photo.title}`}
	class="fixed inset-0 m-auto max-h-[95dvh] w-[calc(100%-2rem)] max-w-6xl overflow-y-auto rounded-2xl border-0 bg-surface-warm p-0 text-primary shadow-elevated backdrop:bg-primary/80"
>
	<div
		class="flex items-center justify-between gap-4 border-b border-border-light px-4 py-3 sm:px-6"
	>
		<h3 class="min-w-0 text-card-title" style="font-family: var(--font-heading);">
			{photo.title}
		</h3>
		<button
			type="button"
			onclick={closePhoto}
			data-goal-ignore="Закрытие просмотра фото без формы"
			aria-label="Закрыть фото"
			class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-light transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-accent"
		>
			<svg
				class="h-5 w-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" stroke-linecap="round" /></svg
			>
		</button>
	</div>
	<ImageFallback
		src={photo.image}
		alt={photo.title}
		imageRole="preview"
		class="mx-auto max-h-[70dvh] w-full object-contain"
	/>
	<div class="flex flex-wrap items-center justify-end gap-4 px-4 py-4 sm:px-6">
		{#if saveError}
			<p role="status" class="w-full text-sm text-secondary">{saveError}</p>
			<a
				href={photo.image}
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm text-primary underline underline-offset-4">Открыть оригинал</a
			>
		{/if}
		<CopyPhotoLink url={photo.image} />
		<button
			type="button"
			onclick={savePhoto}
			data-goal-ignore="Скачивание фотографии без формы"
			disabled={savingPhoto}
			class="min-h-11 rounded-full bg-primary px-6 py-3 text-sm text-white transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60"
			>{savingPhoto ? 'Сохранение…' : 'Сохранить'}</button
		>
	</div>
</dialog>
