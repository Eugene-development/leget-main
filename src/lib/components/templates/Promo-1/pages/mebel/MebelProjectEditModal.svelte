<script lang="ts">
	import { onDestroy, untrack, tick } from 'svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import ImageCropper from '$lib/components/ImageCropper.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import MebelTagPicker from './MebelTagPicker.svelte';
	import ProjectModelField from './ProjectModelField.svelte';
	import { createModelUploader, readProjectModel } from './project-model';
	import { ProjectRequestError, projectRequest } from './project-request';
	import {
		IMAGE_TYPES,
		MAX_IMAGE_BYTES,
		MAX_PROJECT_IMAGES,
		loadProjectEditForm,
		projectUpdateInput,
		validateProjectUpdate,
		type ProjectEditData,
		type ProjectUpdateInput,
		type SavedProject
	} from './project-form';

	let {
		project,
		categoryId = '',
		categories,
		onClose,
		onSaved
	}: {
		project: ProjectEditData;
		categoryId?: string;
		categories: { id: string; value: string; slug?: string }[];
		onClose: () => void;
		onSaved: (saved: SavedProject, input: ProjectUpdateInput) => void;
	} = $props();
	const uid = $props.id();
	let form = $state(untrack(() => loadProjectEditForm(project, categoryId)));
	let selectedTags = $state<string[]>(untrack(() => (project.tags ?? []).map((tag) => tag.id)));
	const tagsKnown = untrack(() => Array.isArray(project.tags));
	type EditablePhoto = { url: string; preview: string; file?: File };
	let photos = $state<EditablePhoto[]>(
		untrack(() =>
			(project.images ?? []).flatMap((image) =>
				typeof image.url === 'string' && image.url ? [{ url: image.url, preview: image.url }] : []
			)
		)
	);
	let photosDirty = $state(false);
	let queue = $state<File[]>([]);
	const currentFile = $derived(queue[0] ?? null);
	const newPhotoCount = $derived(photos.filter((photo) => photo.file).length);
	let uploadProgress = $state(0);
	let fileInput = $state<HTMLInputElement>();
	let uploaded = new Map<File, string>();
	let saving = $state(false);
	let modelFile = $state<File | null>(null);
	let modelRemoved = $state(false);
	let modelValidating = $state(false);
	const currentModel = $derived(readProjectModel(project.meta));
	const uploadModel = createModelUploader();
	let errors = $state<Record<string, string>>({});
	let saveError = $state('');
	let formElement = $state<HTMLFormElement>();
	let errorSummary = $state<HTMLParagraphElement>();

	function releasePreviews() {
		photos.forEach((photo) => {
			if (photo.file) URL.revokeObjectURL(photo.preview);
		});
		uploaded.clear();
	}
	onDestroy(releasePreviews);

	function close() {
		if (!saving && !currentFile && !modelValidating) onClose();
	}
	function mountDialog(node: HTMLDialogElement) {
		const previousFocus = document.activeElement;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		node.showModal();
		node.querySelector<HTMLInputElement>('input[name="value"]')?.focus();
		return {
			destroy() {
				node.close();
				document.body.style.overflow = previousOverflow;
				if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
					previousFocus.focus();
			}
		};
	}
	async function focusError() {
		await tick();
		(
			formElement?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]') ??
			errorSummary
		)?.focus();
	}
	function selectFiles(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = Array.from(input.files ?? []);
		input.value = '';
		if (!files.length || saving || currentFile) return;
		if (photos.length + files.length > MAX_PROJECT_IMAGES) {
			errors.image_urls = `Можно добавить ещё ${MAX_PROJECT_IMAGES - photos.length} фото. Всего — не больше восьми.`;
			return;
		}
		if (
			files.some(
				(file) => !IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES || file.size === 0
			)
		) {
			errors.image_urls = 'Выберите JPEG, PNG или WebP размером до 10 МБ каждый.';
			return;
		}
		errors.image_urls = '';
		queue = files;
	}
	function cropped(file: File) {
		if (file.size > MAX_IMAGE_BYTES) {
			errors.image_urls = 'Фотография после обработки превышает 10 МБ.';
			return;
		}
		photos = [...photos, { file, url: '', preview: URL.createObjectURL(file) }];
		photosDirty = true;
		queue = queue.slice(1);
		errors.image_urls = '';
	}
	function removePhoto(index: number) {
		if (saving) return;
		const photo = photos[index];
		if (photo.file) {
			URL.revokeObjectURL(photo.preview);
			uploaded.delete(photo.file);
		}
		photos = photos.filter((_, photoIndex) => photoIndex !== index);
		photosDirty = true;
		errors.image_urls = '';
	}
	async function upload(file: File): Promise<string> {
		const cached = uploaded.get(file);
		if (cached) return cached;
		const result = await projectRequest<{
			generateUploadUrl: { uploadUrl: string; objectUrl: string };
		}>(
			`mutation ProjectPhotoUpload($filename: String!, $mimeType: String!, $folder: String) { generateUploadUrl(filename: $filename, mimeType: $mimeType, folder: $folder) { uploadUrl objectUrl } }`,
			{ filename: file.name, mimeType: file.type, folder: 'mebel' }
		);
		const info = result.generateUploadUrl;
		if (!info?.uploadUrl || !info.objectUrl)
			throw new Error('Не удалось получить адрес загрузки фотографии.');
		let response: Response;
		try {
			response = await fetch(info.uploadUrl, {
				method: 'PUT',
				headers: { 'Content-Type': file.type },
				body: file
			});
		} catch {
			throw new Error(
				'Не удалось загрузить фотографию. Проверьте подключение и повторите сохранение.'
			);
		}
		if (!response.ok) throw new Error('Не удалось загрузить фотографию. Повторите сохранение.');
		uploaded.set(file, info.objectUrl);
		return info.objectUrl;
	}
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (saving || currentFile || modelValidating) return;
		errors = validateProjectUpdate(form);
		if (photosDirty && photos.length === 0) errors.image_urls = 'Добавьте хотя бы одну фотографию.';
		if (!categories.some((category) => category.id === form.category_id))
			errors.category_id = 'Выберите доступную категорию мебели.';
		for (const input of formElement?.querySelectorAll<HTMLInputElement>(
			'input[type="number"],input[type="date"]'
		) ?? []) {
			if (input.validity.badInput)
				errors[input.name] =
					input.type === 'date' ? 'Введите корректную дату.' : 'Введите корректную цену.';
		}
		saveError = errors.id ?? '';
		if (Object.values(errors).some(Boolean)) {
			await focusError();
			return;
		}
		saving = true;
		uploadProgress = 0;
		let input: ProjectUpdateInput;
		let saved: SavedProject;
		try {
			let imageUrls: string[] | undefined;
			if (photosDirty) {
				imageUrls = [];
				let uploadedCount = 0;
				for (const photo of photos) {
					if (photo.file) {
						imageUrls.push(await upload(photo.file));
						uploadedCount++;
						uploadProgress = Math.round((uploadedCount / newPhotoCount) * 100);
					} else {
						imageUrls.push(photo.url);
					}
				}
			}
			input = projectUpdateInput(form, selectedTags, tagsKnown, imageUrls);
			const modelInput = modelFile
				? { model_url: await uploadModel(modelFile) }
				: modelRemoved
					? { model_url: null }
					: {};
			const result = await projectRequest<{ upsertMebelProject: SavedProject }>(
				`mutation UpdateMebelProject($input: UpsertMebelProjectInput!) { upsertMebelProject(input: $input) { id value slug meta } }`,
				{ input: { ...input, ...modelInput } }
			);
			saved = result.upsertMebelProject;
			if (!saved?.id || saved.id !== form.id || !saved.slug)
				throw new Error('Сервер не подтвердил обновление проекта.');
		} catch (cause) {
			saveError =
				cause instanceof Error
					? cause.message
					: 'Не удалось сохранить изменения. Повторите попытку.';
			if (cause instanceof ProjectRequestError) {
				errors = cause.fields;
				if (errors.image_urls) uploaded.clear();
			}
			saving = false;
			await focusError();
			return;
		}
		saving = false;
		onClose();
		releasePreviews();
		onSaved(saved, input);
	}
</script>

{#snippet fieldError(field: string)}
	{#if errors[field]}<p
			id={`${uid}-${field}-error`}
			role="alert"
			class="text-cat-6-700 mt-1.5 text-xs"
		>
			{errors[field]}
		</p>{/if}
{/snippet}

<dialog
	use:mountDialog
	aria-labelledby={`${uid}-title`}
	onkeydown={(event) => {
		if (event.key === 'Escape') event.stopPropagation();
	}}
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
	class="m-auto max-h-[94dvh] w-[calc(100%-1.5rem)] max-w-6xl overflow-hidden rounded-2xl border border-ink-200 bg-surface-raised p-0 text-ink-800 shadow-2xl backdrop:bg-scrim/60 sm:w-[calc(100%-3rem)]"
>
	<form
		bind:this={formElement}
		onsubmit={submit}
		novalidate
		aria-busy={saving}
		class="flex max-h-[94dvh] flex-col"
		oninput={(event) => {
			const target = event.target;
			if (
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				target instanceof HTMLSelectElement
			) {
				if (target.name) errors[target.name] = '';
			}
		}}
	>
		<header
			class="flex shrink-0 items-center justify-between gap-4 border-b border-ink-200 px-5 py-4 sm:px-7"
		>
			<div>
				<h2 id={`${uid}-title`} class="text-2xl">Редактировать проект</h2>
				<p class="mt-1 text-sm text-ink-600">
					Описание, характеристики и паспорт выполненной работы
				</p>
			</div>
			<button
				type="button"
				onclick={close}
				disabled={saving}
				aria-label="Закрыть форму редактирования"
				class="icon-button"
				><svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg
				></button
			>
		</header>
		<div class="min-h-0 overflow-y-auto overscroll-contain">
			<fieldset
				disabled={saving}
				class="grid min-w-0 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8"
			>
				<div class="min-w-0 space-y-5">
					<div class="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
						<div>
							<label for={`${uid}-name`} class="field-label">Номер проекта *</label><input
								id={`${uid}-name`}
								name="value"
								type="text"
								required
								maxlength="255"
								bind:value={form.value}
								placeholder="Например, 124"
								aria-invalid={!!errors.value}
								aria-describedby={errors.value ? `${uid}-value-error` : undefined}
								class="field"
							/>{@render fieldError('value')}
						</div>
						<div>
							<label for={`${uid}-category`} class="field-label">Категория *</label><select
								id={`${uid}-category`}
								name="category_id"
								required
								bind:value={form.category_id}
								aria-invalid={!!errors.category_id}
								aria-describedby={errors.category_id ? `${uid}-category_id-error` : undefined}
								class="field"
								><option value="" disabled>Выберите категорию</option
								>{#each categories as category (category.id)}<option value={category.id}
										>{category.value}</option
									>{/each}</select
							>{@render fieldError('category_id')}
						</div>
					</div>
					<div class="grid grid-cols-1 gap-4">
						<div>
							<label for={`${uid}-short`} class="field-label">Краткое описание</label><textarea
								id={`${uid}-short`}
								name="short_description"
								rows="2"
								maxlength="1000"
								bind:value={form.short_description}
								aria-invalid={!!errors.short_description}
								aria-describedby={errors.short_description
									? `${uid}-short_description-error`
									: undefined}
								class="field resize-y"
							></textarea>{@render fieldError('short_description')}
						</div>
						<div>
							<p class="field-label">Полное описание</p>
							<RichTextEditor
								--rich-text-min-height="120px"
								value={form.description}
								label="Полное описание"
								invalid={!!errors.description}
								describedBy={errors.description ? `${uid}-description-error` : undefined}
								legacyHtml
								autofocus={false}
								disabled={saving}
								onchange={(value) => (form.description = value)}
							/>

							{@render fieldError('description')}
						</div>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for={`${uid}-price`} class="field-label">Цена, ₽</label><input
								id={`${uid}-price`}
								name="price"
								type="number"
								min="0"
								max="9999999999.99"
								step="0.01"
								bind:value={form.price}
								placeholder="Не указана"
								aria-invalid={!!errors.price}
								aria-describedby={errors.price ? `${uid}-price-error` : undefined}
								class="field"
							/>{@render fieldError('price')}
						</div>
						<div>
							<label for={`${uid}-old-price`} class="field-label">Старая цена, ₽</label><input
								id={`${uid}-old-price`}
								name="old_price"
								type="number"
								min="0"
								max="9999999999.99"
								step="0.01"
								bind:value={form.old_price}
								placeholder="Не указана"
								aria-invalid={!!errors.old_price}
								aria-describedby={errors.old_price ? `${uid}-old_price-error` : undefined}
								class="field"
							/>{@render fieldError('old_price')}
						</div>
					</div>
					<div class="border-y border-ink-200 py-3">
						<label class="flex min-h-11 cursor-pointer items-center justify-between gap-4">
							<span class="text-sm font-medium">Показывать проект на сайте</span>
							<span class="flex shrink-0 items-center gap-3">
								<span aria-hidden="true" class="text-xs text-ink-600"
									>{form.is_active ? 'Включён' : 'Отключён'}</span
								>
								<span class="relative inline-flex h-7 w-12">
									<input
										type="checkbox"
										role="switch"
										name="is_active"
										bind:checked={form.is_active}
										aria-describedby={`${uid}-visibility-help`}
										class="peer sr-only"
									/>
									<span
										aria-hidden="true"
										class="absolute inset-0 rounded-full bg-ink-300 transition-colors peer-checked:bg-link-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-link-500 peer-disabled:opacity-50 motion-reduce:transition-none"
									></span>
									<span
										aria-hidden="true"
										class="pointer-events-none absolute top-1 left-1 size-5 rounded-full bg-surface-raised shadow-sm transition-transform peer-checked:translate-x-5 peer-disabled:opacity-50 motion-reduce:transition-none"
									></span>
								</span>
							</span>
						</label>
						<p id={`${uid}-visibility-help`} class="mt-1 text-xs text-ink-600">
							{form.is_active
								? 'После сохранения проект будет виден посетителям.'
								: 'После сохранения проект будет скрыт. Данные и фотографии сохранятся.'}
						</p>
					</div>
					<div class="flex flex-wrap gap-x-5 gap-y-1">
						<label class="check-label"
							><input type="checkbox" bind:checked={form.is_featured} />Хит (избранный)</label
						>
						<label class="check-label"
							><input type="checkbox" bind:checked={form.is_new} />Новинка</label
						>
					</div>
					<MebelTagPicker bind:selected={selectedTags} disabled={saving} />
					{@render fieldError('tag_ids')}
				</div>
				<div
					class="min-w-0 space-y-4 border-t border-ink-200 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
				>
					<section class="border-b border-ink-200 pb-5" aria-labelledby={`${uid}-photos-title`}>
						<div class="mb-1 flex items-center justify-between gap-3">
							<h3 id={`${uid}-photos-title`} class="p1-title-sub text-base">Фотографии</h3>
							<span class="text-xs text-ink-600">{photos.length} / 8</span>
						</div>
						<p class="mb-4 text-xs text-ink-600">
							Первое фото — обложка. JPEG, PNG или WebP, до 10 МБ каждое.
						</p>
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
							{#each photos as photo, index (photo.preview)}
								<div
									class="relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-200 bg-ink-50"
								>
									<ImageFallback
										imageRole="preview"
										src={photo.preview}
										alt={`Фото проекта ${index + 1}`}
										class="h-full w-full object-cover"
									/>
									{#if index === 0}<span
											class="absolute bottom-1 left-1 rounded bg-scrim/75 px-2 py-1 text-[11px] text-on-dark"
											>Обложка</span
										>{/if}
									<button
										type="button"
										onclick={() => removePhoto(index)}
										aria-label={`Удалить фото ${index + 1}`}
										class="absolute top-1 right-1 flex size-11 items-center justify-center rounded-full bg-surface-raised text-ink-800 shadow-sm hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-link-500"
										><svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg
										></button
									>
								</div>
							{/each}
						</div>
						<input
							bind:this={fileInput}
							type="file"
							accept="image/jpeg,image/png,image/webp"
							multiple
							onchange={selectFiles}
							class="hidden"
							tabindex="-1"
							aria-label="Файлы фотографий проекта"
						/>
						<button
							type="button"
							onclick={() => fileInput?.click()}
							disabled={photos.length >= MAX_PROJECT_IMAGES || !!currentFile}
							data-invalid={!!errors.image_urls}
							aria-describedby={`${uid}-photos-help`}
							class="mt-3 flex min-h-16 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-300 px-3 py-4 text-sm font-medium text-link-700 hover:border-link-500 hover:bg-link-50 disabled:opacity-50"
							><svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg
							>Добавить фото</button
						>
						<div id={`${uid}-photos-help`}>{@render fieldError('image_urls')}</div>
					</section>
					<ProjectModelField
						bind:file={modelFile}
						bind:removed={modelRemoved}
						bind:validating={modelValidating}
						current={currentModel}
						disabled={saving}
						error={errors.model_url ?? ''}
					/>
					<div>
						<h3 class="p1-title-sub text-base">Паспорт работы</h3>
						<p class="mt-1 text-xs text-ink-600">
							Показывается на странице «Проекты». Дата сдачи необязательна.
						</p>
					</div>
					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for={`${uid}-completed`} class="field-label">Дата сдачи</label><input
								id={`${uid}-completed`}
								name="completed_at"
								type="date"
								min="1000-01-01"
								max="9999-12-31"
								bind:value={form.completed_at}
								aria-invalid={!!errors.completed_at}
								aria-describedby={errors.completed_at ? `${uid}-completed_at-error` : undefined}
								class="field"
							/>{@render fieldError('completed_at')}
						</div>
						<div>
							<label for={`${uid}-maker`} class="field-label">Кто делал мебель</label><input
								id={`${uid}-maker`}
								name="maker"
								type="text"
								maxlength="255"
								bind:value={form.maker}
								placeholder="Собственное производство"
								aria-invalid={!!errors.maker}
								aria-describedby={errors.maker ? `${uid}-maker-error` : undefined}
								class="field"
							/>{@render fieldError('maker')}
						</div>
					</div>
					<div>
						<label for={`${uid}-address`} class="field-label">Адрес объекта</label><input
							id={`${uid}-address`}
							name="object_address"
							type="text"
							maxlength="255"
							bind:value={form.object_address}
							placeholder="Город, район, улица и дом"
							aria-invalid={!!errors.object_address}
							aria-describedby={`${uid}-address-help ${errors.object_address ? `${uid}-object_address-error` : ''}`}
							class="field"
						/>{@render fieldError('object_address')}
						<p id={`${uid}-address-help`} class="mt-1.5 text-xs text-ink-600">
							Храним адрес целиком. В ленте проектов показываем город и район.
						</p>
					</div>
				</div>
			</fieldset>
		</div>
		<footer class="shrink-0 border-t border-ink-200 bg-ink-50 px-5 py-4 sm:px-7">
			{#if saveError}<p
					bind:this={errorSummary}
					tabindex="-1"
					role="alert"
					class="text-cat-6-700 mb-3 text-sm"
				>
					{saveError} Изменения остаются в форме.
				</p>{/if}
			<div class="flex flex-wrap items-center justify-between gap-3">
				<p role="status" class="text-xs text-ink-600">
					{saving && photosDirty && newPhotoCount > 0 && uploadProgress < 100
						? `Загрузка фотографий · ${uploadProgress}%`
						: saving
							? 'Сохраняем изменения…'
							: 'Поля со звёздочкой обязательны'}
				</p>
				<div class="ml-auto flex gap-3">
					<button
						type="button"
						onclick={close}
						disabled={saving || !!currentFile}
						class="secondary-button">Отмена</button
					><button type="submit" disabled={saving || !!currentFile} class="primary-button"
						>{saving ? 'Сохранение…' : 'Сохранить изменения'}</button
					>
				</div>
			</div>
		</footer>
	</form>
</dialog>

{#if currentFile}
	{#key currentFile}<ImageCropper
			imageFile={currentFile}
			maxOutputBytes={MAX_IMAGE_BYTES}
			onCrop={cropped}
			onCancel={() => (queue = queue.slice(1))}
		/>{/key}
{/if}

<style>
	.field-label {
		display: block;
		margin-bottom: 0.375rem;
		font-size: var(--text-sm);
		font-weight: 500;
	}
	.field {
		width: 100%;
		min-height: 44px;
		border: 1px solid var(--color-ink-300);
		border-radius: var(--radius-lg);
		background: var(--color-surface-raised);
		padding: 0.625rem 0.75rem;
		color: var(--color-ink-800);
		font-size: var(--text-sm);
	}
	.field::placeholder {
		color: var(--color-ink-500);
	}
	.field:focus-visible {
		outline: 2px solid var(--color-link-500);
		outline-offset: 2px;
	}
	.field[aria-invalid='true'] {
		border-color: var(--color-cat-6-600);
	}
	.check-label {
		display: flex;
		min-height: 44px;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--text-sm);
		cursor: pointer;
	}
	.check-label input {
		accent-color: var(--color-link-600);
	}
	.primary-button,
	.secondary-button,
	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		border-radius: var(--radius-lg);
		padding: 0.625rem 1rem;
		font-size: var(--text-sm);
		font-weight: 500;
		cursor: pointer;
	}
	.primary-button {
		background: var(--color-link-600);
		color: var(--color-on-accent);
	}
	.primary-button:hover {
		background: var(--color-link-700);
	}
	.secondary-button {
		border: 1px solid var(--color-ink-300);
		background: var(--color-surface-raised);
	}
	.secondary-button:hover,
	.icon-button:hover {
		background: var(--color-ink-100);
	}
	.icon-button {
		width: 44px;
		flex-shrink: 0;
		padding: 0;
	}
	button:focus-visible {
		outline: 2px solid var(--color-link-500);
		outline-offset: 2px;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
