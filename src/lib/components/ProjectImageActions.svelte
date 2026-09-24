<script lang="ts">
	import FavoriteProjectButton from './FavoriteProjectButton.svelte';

	let {
		projectId,
		imageUrl,
		projectName,
		compact = false,
		horizontal = false,
		class: className = ''
	}: {
		projectId: string;
		imageUrl?: string | null;
		projectName: string;
		compact?: boolean;
		horizontal?: boolean;
		class?: string;
	} = $props();

	let error = $state('');
	let downloading = $state(false);
	const buttonClass =
		'flex shrink-0 items-center justify-center rounded-full bg-surface-raised/90 text-ink-600 shadow-lg backdrop-blur-sm transition-[transform,background-color,color] duration-[var(--ds-motion-duration-ui)] ease-ui hover:scale-105 hover:bg-surface-raised hover:text-link-600 focus-visible:ring-2 focus-visible:ring-link-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50';

	async function download(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (!imageUrl || downloading) return;
		error = '';
		downloading = true;
		try {
			const response = await fetch(imageUrl);
			if (!response.ok) throw new Error('Image request failed');
			const blob = await response.blob();
			const objectUrl = URL.createObjectURL(blob);
			const link = document.createElement('a');
			const extension =
				blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
			link.href = objectUrl;
			link.download = `project-${projectId}.${extension}`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
		} catch {
			error = 'Не удалось скачать изображение. Попробуйте ещё раз.';
		} finally {
			downloading = false;
		}
	}

	function printImage(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (!imageUrl) return;
		error = '';
		const frame = document.createElement('iframe');
		frame.title = 'Печать изображения проекта';
		frame.setAttribute('aria-hidden', 'true');
		frame.tabIndex = -1;
		frame.style.cssText =
			'position:fixed;left:-10000px;top:0;width:800px;height:600px;border:0;pointer-events:none';
		document.body.appendChild(frame);
		const printWindow = frame.contentWindow;
		const doc = frame.contentDocument;
		if (!printWindow || !doc) {
			frame.remove();
			error = 'Не удалось подготовить изображение к печати.';
			return;
		}
		let cleanupTimer: ReturnType<typeof setTimeout> | undefined;
		const cleanup = () => {
			if (cleanupTimer) clearTimeout(cleanupTimer);
			frame.remove();
		};
		doc.title = projectName;
		const style = doc.createElement('style');
		style.textContent =
			'body{margin:0;display:grid;place-items:center;min-height:100vh}img{display:block;max-width:100%;max-height:100vh;object-fit:contain}@page{margin:10mm}';
		doc.head.appendChild(style);
		const image = doc.createElement('img');
		image.alt = projectName;
		image.onload = () => {
			try {
				printWindow.addEventListener('afterprint', cleanup, { once: true });
				cleanupTimer = setTimeout(cleanup, 60_000);
				printWindow.print();
			} catch {
				cleanup();
				error = 'Не удалось отправить изображение на печать.';
			}
		};
		image.onerror = () => {
			cleanup();
			error = 'Не удалось открыть изображение для печати.';
		};
		doc.body.appendChild(image);
		image.src = imageUrl;
	}
</script>

<div
	class="flex {horizontal ? 'flex-row' : 'flex-col'} items-center {compact
		? 'gap-1.5'
		: 'gap-2'} {className}"
>
	<FavoriteProjectButton {projectId} {compact} />
	<button
		type="button"
		onclick={download}
		data-goal-ignore="Скачивание фотографии проекта не является заявкой"
		disabled={!imageUrl || downloading}
		aria-label="Скачать изображение проекта"
		title="Скачать изображение"
		class="{buttonClass} {compact ? 'size-9' : 'size-11'}"
	>
		<svg
			class={compact ? 'size-4' : 'size-5'}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="var(--ds-icon-stroke)"
			aria-hidden="true"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"
			/></svg
		>
	</button>
	<button
		type="button"
		onclick={printImage}
		data-goal-ignore="Печать фотографии проекта не является заявкой"
		disabled={!imageUrl}
		aria-label="Распечатать изображение проекта"
		title="Распечатать изображение"
		class="{buttonClass} {compact ? 'size-9' : 'size-11'}"
	>
		<svg
			class={compact ? 'size-4' : 'size-5'}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="var(--ds-icon-stroke)"
			aria-hidden="true"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2m-12-4h12v7H6v-7Z"
			/><path stroke-linecap="round" stroke-linejoin="round" d="M18 12h.01" /></svg
		>
	</button>
	{#if error}<span
			role="alert"
			class="w-36 rounded-lg bg-surface-raised px-2 py-1 text-center text-xs text-ink-800 shadow-sm"
			>{error}</span
		>{/if}
</div>
