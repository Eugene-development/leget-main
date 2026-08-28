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
		folder = 'bg',
		title = 'Фоновое изображение',
		cropUploads = true,
		previewFit = 'cover',
		maxUploadBytes = 10 * 1024 * 1024,
		cropMaxWidth = 4096,
		cropMaxHeight = 4096,
		cropOutputMimeType = 'image/jpeg',
		cropOutputQuality = 0.95,
		cropMaxOutputBytes = null,
		onApprove,
		onRemove = null,
		onClose
	}: {
		editContext: EditContext;
		currentImage?: string;
		defaultImage?: string;
		aspectRatio?: number;
		/** Папка внутри бакета. Например: bg, logos или имя компонента. */
		folder?: string;
		title?: string;
		cropUploads?: boolean;
		previewFit?: 'cover' | 'contain';
		/** Максимальный размер исходного файла до обработки. */
		maxUploadBytes?: number;
		cropMaxWidth?: number;
		cropMaxHeight?: number;
		cropOutputMimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
		cropOutputQuality?: number;
		cropMaxOutputBytes?: number | null;
		onApprove: (url: string) => void | Promise<void>;
		onRemove?: (() => void | Promise<void>) | null;
		onClose: () => void;
	} = $props();

	const allowedUploadTypes = [
		'image/jpeg',
		'image/png',
		'image/webp',
		'image/svg+xml',
		'image/gif',
		'image/avif'
	];
	const allowedExtensionsByType: Record<string, string[]> = {
		'image/jpeg': ['jpg', 'jpeg'],
		'image/png': ['png'],
		'image/webp': ['webp'],
		'image/svg+xml': ['svg'],
		'image/gif': ['gif'],
		'image/avif': ['avif']
	};

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
	let fileInput = $state<HTMLInputElement>();

	// Cropper state — файл ожидает кадрирования перед загрузкой
	let cropFile = $state<File | null>(null);

	// Thumbnail strip
	let thumbStrip = $state<HTMLDivElement>();

	/**
	 * Picker может открываться из SideDrawer. У drawer есть transform/backdrop-filter
	 * и overflow-контейнер, поэтому вложенный `position: fixed` становится привязанным
	 * к панели и обрезается ею. Портал возвращает модалку в viewport и отдельный
	 * stacking context; фокус уходит из родительской focus trap в дочерний диалог.
	 */
	function portal(node: HTMLElement) {
		const previousFocus =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		document.body.appendChild(node);
		queueMicrotask(() => {
			const dialog = node.matches('[role="dialog"]')
				? node
				: node.querySelector<HTMLElement>('[role="dialog"]');
			dialog?.focus();
		});

		return {
			destroy() {
				node.parentNode?.removeChild(node);
				previousFocus?.focus();
			}
		};
	}

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
			// Фоны образуют переиспользуемую галерею. Папка logos, напротив, общая
			// для всех логотипов лицензии: показывать её целиком в picker означает
			// смешивать изображения других брендов и прошлых замен. В режиме логотипа
			// начинаем только с текущего значения и не запрашиваем историю бакета.
			const files = folder === 'logos' ? [] : await listBucketFiles(folder, 100);
			let allImages: BucketFile[] = [];

			if (folder === 'logos') {
				const activeLogo = currentImage || defaultImage;
				if (activeLogo) {
					allImages = [
						{
							key: 'current',
							url: activeLogo,
							size: null,
							lastModified: null
						}
					];
				}
			} else {
				allImages = [...files];
			}

			if (folder !== 'logos' && defaultImage) {
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
			await onApprove(selectedImage.url);
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Ошибка сохранения';
		} finally {
			isSaving = false;
		}
	}

	async function handleRemove() {
		if (!onRemove || !currentImage || isSaving) return;
		isSaving = true;
		saveError = '';
		try {
			await onRemove();
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Ошибка удаления изображения';
		} finally {
			isSaving = false;
		}
	}

	// ─── Upload ─────────────────────────────────────────────────────────────────

	/** Шаг 1: пользователь выбрал файл → открываем кроппер */
	function handleUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		uploadError = '';

		if (!allowedUploadTypes.includes(file.type)) {
			uploadError = 'Неподдерживаемый формат изображения';
			if (fileInput) fileInput.value = '';
			return;
		}
		if (file.size === 0) {
			uploadError = 'Выбран пустой файл';
			if (fileInput) fileInput.value = '';
			return;
		}
		const extension = file.name.toLowerCase().match(/\.([^.]+)$/)?.[1] ?? '';
		if (!allowedExtensionsByType[file.type]?.includes(extension)) {
			uploadError = 'Расширение файла не соответствует формату изображения';
			if (fileInput) fileInput.value = '';
			return;
		}

		if (file.size > maxUploadBytes) {
			uploadError = `Файл больше ${formatSize(maxUploadBytes)}`;
			if (fileInput) fileInput.value = '';
			return;
		}

		if (cropUploads) {
			cropFile = file;
		} else {
			void uploadFile(file);
		}
		if (fileInput) fileInput.value = '';
	}

	/** Шаг 2: пользователь обрезал изображение → загружаем результат */
	async function handleCropDone(croppedFile: File) {
		cropFile = null;
		if (cropMaxOutputBytes && croppedFile.size > cropMaxOutputBytes) {
			uploadError = `После обработки файл больше ${formatSize(cropMaxOutputBytes)}. Выберите меньшую область.`;
			return;
		}
		await uploadFile(croppedFile);
	}

	async function uploadFile(file: File) {
		uploadError = '';
		isUploading = true;
		uploadProgress = 0;

		try {
			// 1. Получаем pre-signed URL
			const token = localStorage.getItem('auth_token');
			if (!token) throw new Error('Сессия истекла. Войдите снова и повторите загрузку.');
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
						mutation GenerateUploadUrl($filename: String!, $mimeType: String!, $folder: String, $licenseId: ID) {
							generateUploadUrl(filename: $filename, mimeType: $mimeType, folder: $folder, licenseId: $licenseId) {
								uploadUrl
								objectUrl
							}
						}
					`,
					variables: {
						filename: file.name,
						mimeType: file.type,
						folder,
						licenseId: editContext.licenseId
					}
				})
			});

			if (!gqlRes.ok) throw new Error(`Не удалось подготовить загрузку (HTTP ${gqlRes.status})`);
			const gqlData = await gqlRes.json();
			if (gqlData.errors?.length) throw new Error(gqlData.errors[0]?.message);

			const { uploadUrl, objectUrl } = gqlData.data.generateUploadUrl;

			// 2. Загружаем через XHR для отображения прогресса
			await new Promise<void>((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.open('PUT', uploadUrl);
				xhr.setRequestHeader('Content-Type', file.type);
				xhr.upload.onprogress = (ev) => {
					if (ev.lengthComputable) {
						uploadProgress = Math.round((ev.loaded / ev.total) * 100);
					}
				};
				xhr.onload = () =>
					xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`));
				xhr.onerror = () => reject(new Error('Upload error'));
				xhr.send(file);
			});

			// 3. Добавляем новое изображение в начало списка и выбираем его
			const newFile: BucketFile = {
				key: objectUrl.split('/').slice(-2).join('/'),
				url: objectUrl,
				size: file.size,
				lastModified: new Date().toISOString()
			};
			images = folder === 'logos' ? [newFile] : [newFile, ...images];
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

<!-- Оба полноэкранных слоя портируются в body. Кроппер с z-index:300 остаётся
     поверх picker с z-index:200 даже когда владелец живёт внутри sticky/drawer. -->
{#if cropFile}
	<div use:portal style="position:fixed;inset:0;z-index:300;">
		<ImageCropper
			imageFile={cropFile}
			{aspectRatio}
			maxOutputWidth={cropMaxWidth}
			maxOutputHeight={cropMaxHeight}
			outputMimeType={cropOutputMimeType}
			outputQuality={cropOutputQuality}
			maxOutputBytes={cropMaxOutputBytes}
			onCrop={handleCropDone}
			onCancel={handleCropCancel}
		/>
	</div>
{/if}

<!-- Backdrop -->
<div
	use:portal
	class="picker-backdrop"
	role="dialog"
	aria-modal="true"
	aria-label={`Выбор: ${title.toLocaleLowerCase('ru-RU')}`}
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
					<h2 class="picker-title">{title}</h2>
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
						accept={allowedUploadTypes.join(',')}
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
				<div class="progress-bar-fill" style={`transform: scaleX(${uploadProgress / 100})`}></div>
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
							alt={`Предпросмотр: ${title.toLocaleLowerCase('ru-RU')}`}
							class="slide-image {previewFit === 'contain' ? 'slide-image-contain' : ''}"
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
				{#if onRemove && currentImage}
					<button type="button" class="btn-remove" onclick={handleRemove} disabled={isSaving}>
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.75"
								d="M6 7h12m-9 0V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m-7 0 .7 12h6.6L16 7M10 10.5v5m4-5v5"
							/>
						</svg>
						Удалить
					</button>
				{/if}
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
	/*
	 * Цвет здесь берётся из токенов через `var(--color-*)`: утилит в этом файле
	 * нет — модалка написана обычным CSS, — но ключи @theme лежат в :root, и
	 * смена дизайн-системы перекрашивает её наравне с разметкой на классах.
	 * Полупрозрачные значения — доля одного токена через `color-mix`, как в
	 * ImageFallback: `rgba()` с сырыми каналами вернуло бы хардкод обратно.
	 */

	/* ── Backdrop ── */
	.picker-backdrop {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: color-mix(in oklab, var(--color-scrim) 75%, transparent);
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
		border-radius: 1rem;
		overflow: hidden;
		background: var(--color-ink-900);
		box-shadow:
			0 32px 80px color-mix(in oklab, var(--color-scrim) 60%, transparent),
			0 0 0 1px color-mix(in oklab, var(--color-on-dark) 6%, transparent);
	}

	/* ── Header ── */
	.picker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: var(--color-ink-800);
		border-bottom: 1px solid color-mix(in oklab, var(--color-on-dark) 7%, transparent);
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
		color: var(--color-link-400);
		flex-shrink: 0;
	}

	.picker-title {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-ink-100);
		margin: 0;
	}

	.picker-subtitle {
		font-size: 0.75rem;
		color: var(--color-ink-500);
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
		color: var(--color-link-200);
		border: 1px solid color-mix(in oklab, var(--color-link-400) 30%, transparent);
		background: color-mix(in oklab, var(--color-link-400) 8%, transparent);
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-upload:hover {
		background: color-mix(in oklab, var(--color-link-400) 16%, transparent);
		border-color: color-mix(in oklab, var(--color-link-400) 50%, transparent);
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
		color: var(--color-ink-500);
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-close:hover {
		background: color-mix(in oklab, var(--color-on-dark) 8%, transparent);
		color: var(--color-ink-100);
	}

	.btn-close svg {
		width: 1.125rem;
		height: 1.125rem;
	}

	/* ── Error / progress bars ── */
	.error-bar {
		padding: 0.5rem 1.25rem;
		background: color-mix(in oklab, var(--color-cat-6-500) 15%, transparent);
		border-bottom: 1px solid color-mix(in oklab, var(--color-cat-6-500) 30%, transparent);
		font-size: 0.8125rem;
		color: var(--color-cat-6-300);
		flex-shrink: 0;
	}

	.progress-bar-track {
		height: 3px;
		background: color-mix(in oklab, var(--color-on-dark) 6%, transparent);
		flex-shrink: 0;
	}

	.progress-bar-fill {
		width: 100%;
		height: 100%;
		/* Был градиент sky-400 → indigo-400; обе точки — интерактивная роль системы,
		   поэтому теперь одна заливка, а не градиент из токена в себя же. */
		background: var(--color-link-400);
		transform-origin: left center;
		transition: transform 0.2s;
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
		color: var(--color-ink-500);
		font-size: 0.9375rem;
	}

	.state-error {
		color: var(--color-cat-6-300);
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
		color: var(--color-ink-400);
		margin: 0;
	}

	.state-empty-hint {
		font-size: 0.8125rem;
		color: var(--color-ink-600);
		margin: 0;
	}

	.btn-retry {
		margin-top: 0.25rem;
		padding: 0.375rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		background: color-mix(in oklab, var(--color-cat-6-500) 15%, transparent);
		border: 1px solid color-mix(in oklab, var(--color-cat-6-500) 30%, transparent);
		color: var(--color-cat-6-300);
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-retry:hover {
		background: color-mix(in oklab, var(--color-cat-6-500) 25%, transparent);
	}

	/* ── Slide area ── */
	.slide-area {
		position: relative;
		flex: 1;
		min-height: 0;
		background: var(--color-ink-950);
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

	.slide-image-contain {
		object-fit: contain;
		padding: 2rem;
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
		background: color-mix(in oklab, var(--color-ink-900) 70%, transparent);
		color: var(--color-ink-100);
		cursor: pointer;
		transition: all 0.2s;
		backdrop-filter: blur(4px);
	}

	.nav-arrow:hover:not(:disabled) {
		background: color-mix(in oklab, var(--color-link-400) 25%, transparent);
		color: var(--color-link-400);
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
		background: color-mix(in oklab, var(--color-ink-900) 75%, transparent);
		backdrop-filter: blur(6px);
		font-size: 0.75rem;
		color: var(--color-ink-400);
		pointer-events: none;
	}

	.badge-active {
		color: var(--color-cat-2-400);
		font-weight: 700;
	}

	/* ── Thumbnail strip ── */
	.thumb-strip {
		display: flex;
		gap: 0.375rem;
		padding: 0.625rem 0.875rem;
		overflow-x: auto;
		background: var(--color-ink-800);
		flex-shrink: 0;
		scrollbar-width: thin;
		scrollbar-color: var(--color-ink-700) transparent;
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
		background: var(--color-ink-900);
		padding: 0;
	}

	.thumb:hover {
		border-color: color-mix(in oklab, var(--color-link-400) 50%, transparent);
	}
	.thumb-active {
		border-color: var(--color-link-400) !important;
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
		background: var(--color-cat-2-400);
		border: 1px solid color-mix(in oklab, var(--color-scrim) 40%, transparent);
	}

	/* ── Footer ── */
	.picker-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 0.875rem 1.25rem;
		background: var(--color-ink-800);
		border-top: 1px solid color-mix(in oklab, var(--color-on-dark) 7%, transparent);
		flex-shrink: 0;
		flex-wrap: wrap;
	}

	.footer-error {
		flex: 1;
		font-size: 0.8125rem;
		color: var(--color-cat-6-300);
		margin: 0;
	}

	.footer-actions {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.btn-cancel {
		padding: 0.5rem 1.125rem;
		border-radius: 0.75rem;
		font-size: 0.875rem;
		font-weight: 600;
		border: 1px solid color-mix(in oklab, var(--color-on-dark) 12%, transparent);
		background: transparent;
		color: var(--color-ink-400);
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-cancel:hover {
		background: color-mix(in oklab, var(--color-on-dark) 6%, transparent);
		color: var(--color-ink-100);
	}

	.btn-remove {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		border-radius: 0.75rem;
		font-size: 0.875rem;
		font-weight: 600;
		border: 1px solid color-mix(in oklab, var(--color-cat-6-400) 30%, transparent);
		background: color-mix(in oklab, var(--color-cat-6-500) 8%, transparent);
		color: var(--color-cat-6-300);
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-remove:hover:not(:disabled) {
		background: color-mix(in oklab, var(--color-cat-6-500) 16%, transparent);
		border-color: color-mix(in oklab, var(--color-cat-6-400) 55%, transparent);
		color: var(--color-cat-6-100);
	}

	.btn-remove:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.btn-remove svg {
		width: 1rem;
		height: 1rem;
	}

	.btn-approve {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1.375rem;
		border-radius: 0.75rem;
		font-size: 0.875rem;
		font-weight: 700;
		border: none;
		/* Был градиент sky-500 → indigo-500 — см. progress-bar-fill. */
		background: var(--color-link-500);
		color: var(--color-on-dark);
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 14px color-mix(in oklab, var(--color-link-500) 30%, transparent);
	}

	.btn-approve:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 20px color-mix(in oklab, var(--color-link-500) 40%, transparent);
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
		border: 3px solid color-mix(in oklab, var(--color-link-400) 20%, transparent);
		border-top-color: var(--color-link-400);
		animation: spin 0.7s linear infinite;
	}

	.spinner-sm {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		border: 2px solid color-mix(in oklab, var(--color-on-dark) 20%, transparent);
		border-top-color: var(--color-on-dark);
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
