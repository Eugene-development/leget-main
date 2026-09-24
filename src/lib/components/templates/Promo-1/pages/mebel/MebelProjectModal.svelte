<script lang="ts">
	import { untrack, onDestroy, tick } from 'svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import MebelTagPicker from './MebelTagPicker.svelte';
	import ImageCropper from '$lib/components/ImageCropper.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import {
		IMAGE_TYPES,
		MAX_IMAGE_BYTES,
		MAX_PROJECT_IMAGES,
		projectInput,
		validateProject,
		type ProjectForm
	} from './project-form';
	import { ProjectRequestError, projectRequest } from './project-request';

	let {
		isOpen,
		onClose,
		onSaved,
		categories,
		initialCategoryId = ''
	}: {
		isOpen: boolean;
		onClose: () => void;
		onSaved: () => void | Promise<void>;
		categories: { id: string; value: string }[];
		initialCategoryId?: string;
	} = $props();
	const uid = $props.id();
	let isSubmitting = $state(false);
	let selectedTags = $state<string[]>([]);
	let form = $state<ProjectForm>(emptyForm());
	let errors = $state<Record<string, string>>({});
	let submitError = $state('');
	let uploadProgress = $state(0);
	let photos = $state<{ file: File; preview: string }[]>([]);
	let queue = $state<File[]>([]);
	const currentFile = $derived(queue[0] ?? null);
	let fileInput = $state<HTMLInputElement>();
	let formElement = $state<HTMLFormElement>();
	let errorSummary = $state<HTMLParagraphElement>();
	let uploaded = new Map<File, string>();

	function emptyForm(): ProjectForm {
		return {
			category_id: '',
			value: '',
			short_description: '',
			description: '',
			price: undefined,
			old_price: undefined,
			is_new: false,
			is_featured: false,
			is_active: true,
			completed_at: '',
			object_address: '',
			maker: ''
		};
	}
	function releasePhotos() {
		photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
		photos = [];
		uploaded.clear();
	}
	onDestroy(releasePhotos);
	$effect(() => {
		if (isOpen)
			untrack(() => {
				releasePhotos();
				form = emptyForm();
				form.category_id = categories.some((category) => category.id === initialCategoryId)
					? initialCategoryId
					: (categories[0]?.id ?? '');
				selectedTags = [];
				queue = [];
				errors = {};
				submitError = '';
				uploadProgress = 0;
			});
	});

	function close() {
		if (!isSubmitting && !currentFile) {
			onClose();
			releasePhotos();
		}
	}
	function portal(node: HTMLElement) {
		const previousFocus = document.activeElement;
		const previousOverflow = document.body.style.overflow;
		document.body.appendChild(node);
		document.body.style.overflow = 'hidden';
		queueMicrotask(() => node.querySelector<HTMLInputElement>('input[type="text"]')?.focus());
		return {
			destroy() {
				document.body.style.overflow = previousOverflow;
				node.remove();
				if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
					previousFocus.focus();
			}
		};
	}
	function keyboard(event: KeyboardEvent) {
		if (currentFile) return;
		if (event.key === 'Escape') {
			event.stopPropagation();
			event.preventDefault();
			close();
		}
		if (event.key !== 'Tab') return;
		const root = event.currentTarget as HTMLElement;
		const controls = [
			...root.querySelectorAll<HTMLElement>(
				'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
			)
		].filter((node) => node.getClientRects().length);
		const first = controls[0],
			last = controls.at(-1);
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last?.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first?.focus();
		}
	}
	function selectFiles(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = Array.from(input.files ?? []);
		input.value = '';
		if (!files.length || isSubmitting || currentFile) return;
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
		photos = [...photos, { file, preview: URL.createObjectURL(file) }];
		queue = queue.slice(1);
		errors.image_urls = '';
	}
	function removePhoto(index: number) {
		if (isSubmitting) return;
		const photo = photos[index];
		URL.revokeObjectURL(photo.preview);
		uploaded.delete(photo.file);
		photos = photos.filter((_, i) => i !== index);
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
		if (isSubmitting || currentFile) return;
		errors = validateProject(form, photos.length);
		for (const input of formElement?.querySelectorAll<HTMLInputElement>(
			'input[type="number"],input[type="date"]'
		) ?? []) {
			if (input.validity.badInput)
				errors[input.name] =
					input.type === 'date' ? 'Введите корректную дату.' : 'Введите корректную цену.';
		}
		if (!categories.some((category) => category.id === form.category_id))
			errors.category_id = 'Выберите доступную категорию мебели.';
		submitError = '';
		if (Object.keys(errors).length) {
			await tick();
			formElement
				?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')
				?.focus();
			return;
		}
		isSubmitting = true;
		uploadProgress = 0;
		try {
			const urls: string[] = [];
			for (const photo of photos) {
				urls.push(await upload(photo.file));
				uploadProgress = Math.round((urls.length / photos.length) * 100);
			}
			const data = await projectRequest<{ upsertMebelProject: { id: string } }>(
				`mutation UpsertMebelProject($input: UpsertMebelProjectInput!) { upsertMebelProject(input: $input) { id } }`,
				{ input: projectInput(form, selectedTags, urls) }
			);
			if (!data.upsertMebelProject?.id) throw new Error('Сервер не подтвердил сохранение проекта.');
		} catch (cause) {
			submitError =
				cause instanceof Error ? cause.message : 'Не удалось сохранить проект. Повторите попытку.';
			if (cause instanceof ProjectRequestError) {
				errors = cause.fields;
				if (errors.image_urls) uploaded.clear();
			}
			isSubmitting = false;
			await tick();
			const target = formElement?.querySelector<HTMLElement>(
				'[aria-invalid="true"], [data-invalid="true"]'
			);
			(target ?? errorSummary)?.focus();
			return;
		}
		isSubmitting = false;
		onClose();
		releasePhotos();
		// A refresh failure must not invite a second creation after the server saved the project.
		void Promise.resolve()
			.then(onSaved)
			.catch(() => {});
	}
</script>

{#snippet fieldError(field: string)}
	{#if errors[field]}<p
			id={`${uid}-${field}-error`}
			class="text-cat-6-700 mt-1.5 text-xs"
			role="alert"
		>
			{errors[field]}
		</p>{/if}
{/snippet}

{#if isOpen}
	<div
		use:portal
		role="dialog"
		aria-modal="true"
		aria-labelledby={`${uid}-title`}
		tabindex="-1"
		onkeydown={keyboard}
		class="fixed inset-0 z-[200] flex items-center justify-center bg-scrim/60 p-3 sm:p-6"
	>
		<form
			bind:this={formElement}
			onsubmit={submit}
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
			novalidate
			aria-busy={isSubmitting}
			class="flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-ink-200 bg-surface-raised text-ink-800 shadow-2xl"
		>
			<header
				class="flex shrink-0 items-center justify-between gap-4 border-b border-ink-200 px-5 py-4 sm:px-7"
			>
				<div>
					<h2 id={`${uid}-title`} class="text-2xl">Добавить проект</h2>
				</div>
				<button
					type="button"
					onclick={close}
					disabled={isSubmitting}
					aria-label="Закрыть форму проекта"
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
					disabled={isSubmitting}
					class="grid min-w-0 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8"
				>
					<div class="min-w-0 space-y-5">
						<div class="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
							<div>
								<label for={`${uid}-name`} class="field-label">Номер проекта *</label><input
									id={`${uid}-name`}
									name="value"
									required
									type="text"
									bind:value={form.value}
									maxlength="255"
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
									placeholder="Основное для карточки проекта"
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
									disabled={isSubmitting}
									onchange={(value) => (form.description = value)}
								/>

								{@render fieldError('description')}
							</div>
						</div>
						<div class="grid gap-4 sm:grid-cols-2">
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
									placeholder="До скидки, если была"
									aria-invalid={!!errors.old_price}
									aria-describedby={errors.old_price ? `${uid}-old_price-error` : undefined}
									class="field"
								/>{@render fieldError('old_price')}
							</div>
						</div>
						<div class="flex flex-wrap gap-x-5 gap-y-1 border-y border-ink-200 py-2">
							<label class="check-label"
								><input type="checkbox" bind:checked={form.is_active} />Активен</label
							>
							<label class="check-label"
								><input type="checkbox" bind:checked={form.is_featured} />В избранном</label
							>
							<label class="check-label"
								><input type="checkbox" bind:checked={form.is_new} />Новинка</label
							>
						</div>
						<MebelTagPicker bind:selected={selectedTags} disabled={isSubmitting} />
						{@render fieldError('tag_ids')}
						<section
							class="space-y-4 border-t border-ink-200 pt-5"
							aria-labelledby={`${uid}-passport-title`}
						>
							<div>
								<h3 id={`${uid}-passport-title`} class="p1-title-sub text-base">Паспорт работы</h3>
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
						</section>
					</div>
					<div class="min-w-0 lg:border-l lg:border-ink-200 lg:pl-7">
						<div class="mb-1 flex items-center justify-between">
							<p class="text-sm font-semibold">Фотографии *</p>
							<span class="text-xs text-ink-600">{photos.length} / 8</span>
						</div>
						<p class="mb-4 text-xs text-ink-600">
							Первое фото — обложка. JPEG, PNG или WebP, до 10 МБ каждое.
						</p>
						<div class="grid grid-cols-2 gap-3">
							{#each photos as photo, index (photo.preview)}
								<div
									class="relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-200 bg-ink-50"
								>
									<ImageFallback
										imageRole="preview"
										src={photo.preview}
										alt={`Фото проекта ${index + 1}`}
										class="h-full w-full object-cover"
									/>{#if index === 0}<span
											class="absolute bottom-1 left-1 rounded bg-scrim/75 px-2 py-1 text-[11px] text-on-dark"
											>Обложка</span
										>{/if}<button
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
							disabled={photos.length >= 8 || !!currentFile}
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
						<div id={`${uid}-photos-help`}>
							{@render fieldError('image_urls')}{#if photos.length === 0 && !errors.image_urls}<p
									class="mt-2 text-xs text-ink-600"
								>
									Добавьте хотя бы одну фотографию.
								</p>{/if}
						</div>
					</div>
				</fieldset>
			</div>
			<footer class="shrink-0 border-t border-ink-200 bg-ink-50 px-5 py-4 sm:px-7">
				{#if submitError}<p role="alert" class="text-cat-6-700 mb-3 text-sm">
						{submitError} Введённые данные сохранены в форме.
					</p>{/if}
				<div class="flex flex-wrap items-center justify-between gap-3">
					<p role="status" class="text-xs text-ink-600">
						{isSubmitting
							? uploadProgress < 100
								? `Загрузка фотографий · ${uploadProgress}%`
								: 'Сохраняем проект…'
							: 'Поля со звёздочкой обязательны'}
					</p>
					<div class="ml-auto flex gap-3">
						<button type="button" onclick={close} disabled={isSubmitting} class="secondary-button"
							>Отмена</button
						><button type="submit" disabled={isSubmitting || !!currentFile} class="primary-button"
							>{isSubmitting ? 'Сохранение…' : 'Сохранить проект'}</button
						>
					</div>
				</div>
			</footer>
		</form>
	</div>
{/if}
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
