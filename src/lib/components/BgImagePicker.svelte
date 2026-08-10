<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import ImageCropper from '$lib/components/ImageCropper.svelte';
	import {
		listBucketFiles,
		saveComponentData,
		type BucketFile,
		type EditContext
	} from '$lib/utils/page-edit';
	import { getGraphQLUrl } from '$lib/utils/config';

	let {
		editContext,
		currentImage = '',
		defaultImage = '',
		aspectRatio = 16 / 9,
		onApprove,
		onClose
	}: {
		editContext: EditContext;
		currentImage?: string;
		defaultImage?: string;
		aspectRatio?: number;
		onApprove: (url: string) => void;
		onClose: () => void;
	} = $props();

	// ─── State ──────────────────────────────────────────────────────────────────
	let images = $state<BucketFile[]>([]);
	let isLoading = $state(true);
	let loadError = $state('');
	let selectedIndex = $state(0);
	let isSaving = $state(false);
	let saveError = $state('');

	// Upload state
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let uploadError = $state('');
	let fileInput: HTMLInputElement;

	// Cropper state — файл ожидает кадрирования перед загрузкой
	let cropFile = $state<File | null>(null);

	// Thumbnail strip
	let thumbStrip = $state<HTMLDivElement>();

	// ─── Derived ────────────────────────────────────────────────────────────────
	const selectedImage = $derived(images[selectedIndex] ?? null);
	const previewUrl = $derived(selectedImage?.url ?? currentImage);

	// ─── Load images ────────────────────────────────────────────────────────────
	onMount(async () => {
		await loadImages();
	});

	async function loadImages() {
		isLoading = true;
		loadError = '';
		try {
			const files = await listBucketFiles('bg', 100);
			let allImages = [...files];
			if (defaultImage) {
				const hasDefault = files.some((f) => f.url === defaultImage);
				if (!hasDefault) {
					allImages.unshift({
						key: 'default',
						url: defaultImage,
						size: null,
						lastModified: null
					});
				}
			}
			images = allImages;
			// Pre-select currently active image if present in list
			const activeIdx = allImages.findIndex((f) => f.url === currentImage);
			selectedIndex = activeIdx >= 0 ? activeIdx : 0;
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Ошибка загрузки';
		} finally {
			isLoading = false;
		}
	}

	// ─── Navigation ─────────────────────────────────────────────────────────────
	function prev() {
		if (images.length === 0) return;
		selectedIndex = (selectedIndex - 1 + images.length) % images.length;
		scrollThumb(selectedIndex);
	}

	function next() {
		if (images.length === 0) return;
		selectedIndex = (selectedIndex + 1) % images.length;
		scrollThumb(selectedIndex);
	}

	function selectIndex(idx: number) {
		selectedIndex = idx;
		scrollThumb(idx);
	}

	function scrollThumb(idx: number) {
		if (!thumbStrip) return;
		const thumb = thumbStrip.children[idx] as HTMLElement | undefined;
		thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
	}

	// ─── Keyboard ───────────────────────────────────────────────────────────────
	function handleKeydown(e: KeyboardEvent) {
		// Когда открыт кроппер — ImageCropper сам обрабатывает Escape
		if (cropFile) return;
		if (e.key === 'Escape') onClose();
		if (e.key === 'ArrowLeft') prev();
		if (e.key === 'ArrowRight') next();
		if (e.key === 'Enter' && images.length > 0) handleApprove();
	}

	// ─── Approve ────────────────────────────────────────────────────────────────
	async function handleApprove() {
		if (!selectedImage || isSaving) return;
		isSaving = true;
		saveError = '';
		try {
			onApprove(selectedImage.url);
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Ошибка сохранения';
			isSaving = false;
		}
	}

	// ─── Upload ─────────────────────────────────────────────────────────────────

	/** Шаг 1: пользователь выбрал файл → открываем кроппер */
	function handleUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		uploadError = '';
		// Передаём файл кропперу вместо немедленной загрузки
		cropFile = file;
		if (fileInput) fileInput.value = '';
	}

	/** Шаг 2: пользователь обрезал изображение → загружаем результат */
	async function handleCropDone(croppedFile: File) {
		cropFile = null;
		uploadError = '';
		isUploading = true;
		uploadProgress = 0;

		try {
			// 1. Получаем pre-signed URL
			const token = localStorage.getItem('auth_token');
			const apiUrl = getGraphQLUrl();

			const gqlRes = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					query: `
						mutation GenerateUploadUrl($filename: String!, $mimeType: String!, $folder: String) {
							generateUploadUrl(filename: $filename, mimeType: $mimeType, folder: $folder) {
								uploadUrl
								objectUrl
							}
						}
					`,
					variables: {
						filename: croppedFile.name,
						mimeType: 'image/jpeg',
						folder: 'bg'
					}
				})
			});

			const gqlData = await gqlRes.json();
			if (gqlData.errors?.length) throw new Error(gqlData.errors[0]?.message);

			const { uploadUrl, objectUrl } = gqlData.data.generateUploadUrl;

			// 2. Загружаем через XHR для отображения прогресса
			await new Promise<void>((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.open('PUT', uploadUrl);
				xhr.setRequestHeader('Content-Type', 'image/jpeg');
				xhr.upload.onprogress = (ev) => {
					if (ev.lengthComputable) {
						uploadProgress = Math.round((ev.loaded / ev.total) * 100);
					}
				};
				xhr.onload = () =>
					xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`));
				xhr.onerror = () => reject(new Error('Upload error'));
				xhr.send(croppedFile);
			});

			// 3. Добавляем новое изображение в начало списка и выбираем его
			const newFile: BucketFile = {
				key: objectUrl.split('/').slice(-2).join('/'),
				url: objectUrl,
				size: croppedFile.size,
				lastModified: new Date().toISOString()
			};
			images = [newFile, ...images];
			selectedIndex = 0;
		} catch (err) {
			uploadError = err instanceof Error ? err.message : 'Ошибка загрузки файла';
		} finally {
			isUploading = false;
			uploadProgress = 0;
		}
	}

	/** Пользователь отменил кадрирование */
	function handleCropCancel() {
		cropFile = null;
	}

	function formatSize(bytes: number | null): string {
		if (!bytes) return '';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- ImageCropper — рендерится поверх picker (z-index:300 > backdrop z-index:200) -->
{#if cropFile}
	<div style="position:fixed;inset:0;z-index:300;">
		<ImageCropper
			imageFile={cropFile}
			{aspectRatio}
			onCrop={handleCropDone}
			onCancel={handleCropCancel}
		/>
	</div>
{/if}

<!-- Backdrop -->
<div
	class="picker-backdrop"
	role="dialog"
	aria-modal="true"
	aria-label="Выбор фонового изображения"
	tabindex="-1"
	transition:fade={{ duration: 200 }}
>
	<!-- Modal -->
	<div class="picker-modal" transition:fly={{ y: 24, duration: 250 }}>
		<!-- Header -->
		<div class="picker-header">
			<div class="picker-header-left">
				<svg class="picker-header-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<div>
					<h2 class="picker-title">Фоновое изображение</h2>
					<p class="picker-subtitle">
						{#if images.length > 0}
							{selectedIndex + 1} из {images.length}
						{:else if isLoading}
							Загрузка...
						{:else}
							Нет загруженных изображений
						{/if}
					</p>
				</div>
			</div>

			<div class="picker-header-right">
				<!-- Upload button -->
				<label class="btn-upload" title="Загрузить новое изображение">
					{#if isUploading}
						<div class="spinner-sm"></div>
						{uploadProgress}%
					{:else}
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
							/>
						</svg>
						Загрузить
					{/if}
					<input
						bind:this={fileInput}
						type="file"
						accept="image/*"
						class="sr-only"
						disabled={isUploading}
						onchange={handleUpload}
					/>
				</label>

				<!-- Close -->
				<button type="button" class="btn-close" onclick={onClose} aria-label="Закрыть">
					<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Upload error -->
		{#if uploadError}
			<div class="error-bar">{uploadError}</div>
		{/if}

		<!-- Upload progress bar -->
		{#if isUploading}
			<div class="progress-bar-track">
				<div class="progress-bar-fill" style="width:{uploadProgress}%"></div>
			</div>
		{/if}

		<!-- Main viewer -->
		<div class="picker-viewer">
			{#if isLoading}
				<div class="state-center">
					<div class="spinner"></div>
					<p>Загрузка изображений...</p>
				</div>
			{:else if loadError}
				<div class="state-center state-error">
					<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="state-icon">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<p>{loadError}</p>
					<button type="button" class="btn-retry" onclick={loadImages}>Повторить</button>
				</div>
			{:else if images.length === 0}
				<div class="state-center">
					<svg
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						class="state-icon state-empty-icon"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					<p class="state-empty-text">Изображений пока нет</p>
					<p class="state-empty-hint">Нажмите «Загрузить» чтобы добавить первое фото</p>
				</div>
			{:else}
				<!-- Slide preview -->
				<div class="slide-area">
					<!-- Prev arrow -->
					<button
						type="button"
						class="nav-arrow nav-arrow-left"
						onclick={prev}
						aria-label="Предыдущее изображение"
						disabled={images.length <= 1}
					>
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					<!-- Current image -->
					{#key selectedIndex}
						<img
							src={previewUrl}
							alt="Предпросмотр фона"
							class="slide-image"
							transition:fade={{ duration: 150 }}
						/>
					{/key}

					<!-- Next arrow -->
					<button
						type="button"
						class="nav-arrow nav-arrow-right"
						onclick={next}
						aria-label="Следующее изображение"
						disabled={images.length <= 1}
					>
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>

					<!-- Image meta badge -->
					{#if selectedImage}
						<div class="slide-badge">
							{#if selectedImage.size}
								<span>{formatSize(selectedImage.size)}</span>
							{/if}
							{#if selectedImage.url === currentImage}
								<span class="badge-active">● Текущее</span>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Thumbnail strip -->
				<div class="thumb-strip" bind:this={thumbStrip}>
					{#each images as img, i}
						<button
							type="button"
							class="thumb {i === selectedIndex ? 'thumb-active' : ''}"
							onclick={() => selectIndex(i)}
							aria-label="Изображение {i + 1}"
							title="Изображение {i + 1}"
						>
							<img src={img.url} alt="Миниатюра {i + 1}" class="thumb-img" loading="lazy" />
							{#if img.url === currentImage}
								<span class="thumb-current-dot"></span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="picker-footer">
			{#if saveError}
				<p class="footer-error">{saveError}</p>
			{/if}
			<div class="footer-actions">
				<button type="button" class="btn-cancel" onclick={onClose}> Отмена </button>
				<button
					type="button"
					class="btn-approve"
					onclick={handleApprove}
					disabled={isSaving || images.length === 0 || !selectedImage}
				>
					{#if isSaving}
						<div class="spinner-sm"></div>
					{:else}
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					{/if}
					Утвердить
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	/* ── Backdrop ── */
	.picker-backdrop {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
	}

	/* ── Modal ── */
	.picker-modal {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 900px;
		max-height: 92vh;
		border-radius: 1.25rem;
		overflow: hidden;
		background: #0f172a;
		box-shadow:
			0 32px 80px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(255, 255, 255, 0.06);
	}

	/* ── Header ── */
	.picker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: #1e293b;
		border-bottom: 1px solid rgba(255, 255, 255, 0.07);
		flex-shrink: 0;
	}

	.picker-header-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.picker-header-icon {
		width: 1.5rem;
		height: 1.5rem;
		color: #38bdf8;
		flex-shrink: 0;
	}

	.picker-title {
		font-size: 0.9375rem;
		font-weight: 700;
		color: #f1f5f9;
		margin: 0;
	}

	.picker-subtitle {
		font-size: 0.75rem;
		color: #64748b;
		margin: 0;
	}

	.picker-header-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* ── Upload button ── */
	.btn-upload {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.4rem 0.875rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #bae6fd;
		border: 1px solid rgba(56, 189, 248, 0.3);
		background: rgba(56, 189, 248, 0.08);
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-upload:hover {
		background: rgba(56, 189, 248, 0.16);
		border-color: rgba(56, 189, 248, 0.5);
	}

	.btn-upload svg {
		width: 1rem;
		height: 1rem;
	}

	/* ── Close ── */
	.btn-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		border: none;
		background: transparent;
		color: #64748b;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-close:hover {
		background: rgba(255, 255, 255, 0.08);
		color: #f1f5f9;
	}

	.btn-close svg {
		width: 1.125rem;
		height: 1.125rem;
	}

	/* ── Error / progress bars ── */
	.error-bar {
		padding: 0.5rem 1.25rem;
		background: rgba(239, 68, 68, 0.15);
		border-bottom: 1px solid rgba(239, 68, 68, 0.3);
		font-size: 0.8125rem;
		color: #fca5a5;
		flex-shrink: 0;
	}

	.progress-bar-track {
		height: 3px;
		background: rgba(255, 255, 255, 0.06);
		flex-shrink: 0;
	}

	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #38bdf8, #818cf8);
		transition: width 0.2s;
	}

	/* ── Viewer ── */
	.picker-viewer {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	/* ── States ── */
	.state-center {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 3rem 1.5rem;
		color: #64748b;
		font-size: 0.9375rem;
	}

	.state-error {
		color: #fca5a5;
	}

	.state-icon {
		width: 3rem;
		height: 3rem;
		opacity: 0.4;
	}

	.state-empty-icon {
		width: 4rem;
		height: 4rem;
	}

	.state-empty-text {
		font-size: 1rem;
		font-weight: 600;
		color: #94a3b8;
		margin: 0;
	}

	.state-empty-hint {
		font-size: 0.8125rem;
		color: #475569;
		margin: 0;
	}

	.btn-retry {
		margin-top: 0.25rem;
		padding: 0.375rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #fca5a5;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-retry:hover {
		background: rgba(239, 68, 68, 0.25);
	}

	/* ── Slide area ── */
	.slide-area {
		position: relative;
		flex: 1;
		min-height: 0;
		background: #020617;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.slide-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* ── Nav arrows ── */
	.nav-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		border: none;
		background: rgba(15, 23, 42, 0.7);
		color: #f1f5f9;
		cursor: pointer;
		transition: all 0.2s;
		backdrop-filter: blur(4px);
	}

	.nav-arrow:hover:not(:disabled) {
		background: rgba(56, 189, 248, 0.25);
		color: #38bdf8;
		transform: translateY(-50%) scale(1.1);
	}

	.nav-arrow:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.nav-arrow svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	.nav-arrow-left {
		left: 0.75rem;
	}
	.nav-arrow-right {
		right: 0.75rem;
	}

	/* ── Slide badge ── */
	.slide-badge {
		position: absolute;
		bottom: 0.75rem;
		right: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		background: rgba(15, 23, 42, 0.75);
		backdrop-filter: blur(6px);
		font-size: 0.75rem;
		color: #94a3b8;
		pointer-events: none;
	}

	.badge-active {
		color: #34d399;
		font-weight: 700;
	}

	/* ── Thumbnail strip ── */
	.thumb-strip {
		display: flex;
		gap: 0.375rem;
		padding: 0.625rem 0.875rem;
		overflow-x: auto;
		background: #1e293b;
		flex-shrink: 0;
		scrollbar-width: thin;
		scrollbar-color: #334155 transparent;
	}

	.thumb {
		flex-shrink: 0;
		width: 4rem;
		height: 2.75rem;
		border-radius: 0.375rem;
		overflow: hidden;
		border: 2px solid transparent;
		cursor: pointer;
		position: relative;
		transition: all 0.15s;
		background: #0f172a;
		padding: 0;
	}

	.thumb:hover {
		border-color: rgba(56, 189, 248, 0.5);
	}
	.thumb-active {
		border-color: #38bdf8 !important;
	}

	.thumb-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.thumb-current-dot {
		position: absolute;
		top: 3px;
		right: 3px;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #34d399;
		border: 1px solid rgba(0, 0, 0, 0.4);
	}

	/* ── Footer ── */
	.picker-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 0.875rem 1.25rem;
		background: #1e293b;
		border-top: 1px solid rgba(255, 255, 255, 0.07);
		flex-shrink: 0;
		flex-wrap: wrap;
	}

	.footer-error {
		flex: 1;
		font-size: 0.8125rem;
		color: #fca5a5;
		margin: 0;
	}

	.footer-actions {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.btn-cancel {
		padding: 0.5rem 1.125rem;
		border-radius: 0.625rem;
		font-size: 0.875rem;
		font-weight: 600;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: transparent;
		color: #94a3b8;
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-cancel:hover {
		background: rgba(255, 255, 255, 0.06);
		color: #f1f5f9;
	}

	.btn-approve {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1.375rem;
		border-radius: 0.625rem;
		font-size: 0.875rem;
		font-weight: 700;
		border: none;
		background: linear-gradient(135deg, #0ea5e9, #6366f1);
		color: #fff;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
	}

	.btn-approve:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.btn-approve:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		transform: none;
	}

	.btn-approve svg {
		width: 1rem;
		height: 1rem;
	}

	/* ── Spinners ── */
	.spinner {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		border: 3px solid rgba(56, 189, 248, 0.2);
		border-top-color: #38bdf8;
		animation: spin 0.7s linear infinite;
	}

	.spinner-sm {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-top-color: #fff;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
