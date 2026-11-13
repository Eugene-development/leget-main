<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import ImageCropper from '$lib/components/ImageCropper.svelte';
	import {
		loadCatalogProducts,
		saveCatalogProduct,
		deleteCatalogProduct,
		uploadCatalogPhoto,
		CATALOG_PHOTO_MAX_BYTES,
		type CatalogProduct,
		type ProductKind,
		type CatalogProductInput
	} from './product-catalog';

	let {
		licenseId,
		kind,
		onclose,
		onchanged
	}: {
		licenseId: string;
		kind: ProductKind;
		onclose: () => void;
		onchanged: (items: CatalogProduct[]) => void;
	} = $props();
	const uid = $props.id();
	const copy = $derived(
		kind === 'wardrobe'
			? {
					heading: 'Управление шкафами',
					add: 'Добавить шкаф',
					save: 'Сохранить шкаф',
					remove: 'Удалить шкаф',
					loading: 'Загружаем шкафы…',
					list: 'Список шкафов',
					empty: 'Шкафов пока нет. Добавьте первый товар.',
					select: 'Выберите шкаф из списка или добавьте новый.',
					edit: 'Редактирование шкафа',
					create: 'Новый шкаф',
					nameRequired: 'Введите название шкафа.',
					photoRequired: 'Добавьте фотографию шкафа.',
					photo: 'Фотография шкафа',
					shown: 'Шкаф сохранён и показан в галерее.',
					hidden: 'Шкаф сохранён и скрыт из галереи.',
					deleted: 'Шкаф удалён из каталога.',
					statusShown: 'Показан',
					statusHidden: 'Скрыт'
				}
			: {
					heading: 'Управление кухнями',
					add: 'Добавить кухню',
					save: 'Сохранить кухню',
					remove: 'Удалить кухню',
					loading: 'Загружаем кухни…',
					list: 'Список кухонь',
					empty: 'Кухонь пока нет. Добавьте первый товар.',
					select: 'Выберите кухню из списка или добавьте новую.',
					edit: 'Редактирование кухни',
					create: 'Новая кухня',
					nameRequired: 'Введите название кухни.',
					photoRequired: 'Добавьте фотографию кухни.',
					photo: 'Фотография кухни',
					shown: 'Кухня сохранена и показана в галерее.',
					hidden: 'Кухня сохранена и скрыта из галереи.',
					deleted: 'Кухня удалена из каталога.',
					statusShown: 'Показана',
					statusHidden: 'Скрыта'
				}
	);
	let products = $state<CatalogProduct[]>([]);
	let loading = $state(true);
	let busy = $state(false);
	let error = $state('');
	let notice = $state('');
	let form = $state<CatalogProductInput | null>(null);
	let original = $state('');
	let file = $state<File | null>(null);
	let preview = $state('');
	let pendingFile = $state<File | null>(null);
	let deleteConfirm = $state(false);
	let titleInput = $state<HTMLInputElement>();
	let fileInput = $state<HTMLInputElement>();
	const dirty = $derived(form !== null && (JSON.stringify(form) !== original || file !== null));
	let disposed = false;

	function releasePreview() {
		if (preview) URL.revokeObjectURL(preview);
		preview = '';
		file = null;
		if (fileInput) fileInput.value = '';
	}
	onDestroy(() => {
		disposed = true;
		pendingFile = null;
		releasePreview();
	});
	onMount(() => {
		void load();
	});

	async function load() {
		loading = true;
		error = '';
		try {
			const items = await loadCatalogProducts(licenseId, kind);
			if (disposed) return;
			products = items;
		} catch (cause) {
			if (!disposed) error = message(cause);
		} finally {
			if (!disposed) loading = false;
		}
	}
	function message(cause: unknown) {
		return cause instanceof Error
			? cause.message
			: 'Не удалось выполнить действие. Повторите попытку.';
	}
	function canLeave() {
		return (
			!busy &&
			!pendingFile &&
			(!dirty || window.confirm('Изменения не сохранены. Закрыть без сохранения?'))
		);
	}
	function close() {
		if (canLeave()) onclose();
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
	async function select(product?: CatalogProduct) {
		if (!canLeave()) return;
		releasePreview();
		form = product
			? { ...product }
			: {
					title: '',
					description: '',
					image: '',
					isActive: true,
					sortOrder: Math.max(0, ...products.map((item) => item.sortOrder)) + 1
				};
		original = JSON.stringify(form);
		deleteConfirm = false;
		error = '';
		notice = '';
		await tick();
		titleInput?.focus();
	}
	function chooseFile(event: Event) {
		const selected = (event.currentTarget as HTMLInputElement).files?.[0];
		if (fileInput) fileInput.value = '';
		if (!selected || busy || pendingFile) return;
		if (
			!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type) ||
			selected.size === 0 ||
			selected.size > 10 * 1024 * 1024
		) {
			error = 'Выберите JPEG, PNG или WebP размером до 10 МБ.';
			if (fileInput) fileInput.value = '';
			return;
		}
		pendingFile = selected;
		error = '';
	}
	function cropped(processed: File) {
		if (disposed || !pendingFile) return;
		pendingFile = null;
		if (
			processed.type !== 'image/webp' ||
			processed.size === 0 ||
			processed.size > CATALOG_PHOTO_MAX_BYTES
		) {
			error = 'Не удалось подготовить фотографию в WebP размером до 2 МБ. Попробуйте другой файл.';
			return;
		}
		releasePreview();
		file = processed;
		preview = URL.createObjectURL(processed);
		error = '';
	}
	function publish() {
		products = [...products].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
		onchanged(products.filter((item) => item.isActive));
	}
	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (!form || busy || pendingFile) return;
		if (!form.title.trim()) {
			error = copy.nameRequired;
			titleInput?.focus();
			return;
		}
		if (!form.image && !file) {
			error = copy.photoRequired;
			fileInput?.focus();
			return;
		}
		busy = true;
		error = '';
		notice = '';
		try {
			// Retain an uploaded URL after a failed save, so a retry does not re-upload.
			if (file) {
				form.image = await uploadCatalogPhoto(licenseId, file);
				releasePreview();
			}
			const saved = await saveCatalogProduct(licenseId, kind, {
				...form,
				title: form.title.trim()
			});
			products = [...products.filter((item) => item.id !== saved.id), saved];
			form = { ...saved };
			original = JSON.stringify(form);
			deleteConfirm = false;
			publish();
			notice = saved.isActive ? copy.shown : copy.hidden;
		} catch (cause) {
			error = message(cause);
		} finally {
			busy = false;
		}
	}
	async function remove() {
		if (!form?.id || busy || pendingFile) return;
		busy = true;
		error = '';
		try {
			const id = form.id;
			await deleteCatalogProduct(licenseId, kind, id);
			products = products.filter((item) => item.id !== id);
			releasePreview();
			form = null;
			original = '';
			deleteConfirm = false;
			publish();
			notice = copy.deleted;
		} catch (cause) {
			error = message(cause);
		} finally {
			busy = false;
		}
	}
</script>

<dialog
	use:mountDialog
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
	aria-labelledby={`${uid}-heading`}
	data-goal-ignore="Редактор товаров владельца сайта"
	class="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-1rem)] max-w-5xl overflow-y-auto rounded-2xl border border-border-light bg-surface-warm p-0 text-primary shadow-elevated backdrop:bg-primary/70"
>
	<header class="flex items-center justify-between gap-4 border-b border-border-light p-5 sm:px-7">
		<div>
			<h2
				id={`${uid}-heading`}
				class="text-xl sm:text-2xl"
				style="font-family: var(--font-heading)"
			>
				{copy.heading}
			</h2>
		</div>
		<button
			type="button"
			onclick={close}
			disabled={busy}
			aria-label={`Закрыть: ${copy.heading}`}
			data-goal-ignore="Закрытие редактора товаров"
			class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-light hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg
			>
		</button>
	</header>
	{#if error}
		<div class="mx-5 mt-4 border border-border-light p-3 text-sm" role="alert">
			{error}
			{#if !form && !loading}<button
					type="button"
					onclick={load}
					data-goal-ignore="Повтор загрузки товаров"
					class="ml-2 underline underline-offset-4">Повторить загрузку</button
				>{/if}
		</div>
	{/if}
	{#if notice}<p class="mx-5 mt-4 text-sm text-secondary" role="status">{notice}</p>{/if}
	{#if loading}
		<p class="p-8 text-secondary" role="status">{copy.loading}</p>
	{:else}
		<div class="grid md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]">
			<aside
				class="border-b border-border-light p-5 md:border-r md:border-b-0"
				aria-label={copy.list}
			>
				<div class="mb-4 flex items-center justify-between gap-3">
					<p class="text-sm text-secondary">Всего: {products.length}</p>
					<button
						type="button"
						onclick={() => select()}
						disabled={busy}
						data-goal-ignore="Добавление товара владельцем"
						class="min-h-11 rounded-lg bg-primary px-4 text-sm text-on-dark disabled:opacity-50"
						>{copy.add}</button
					>
				</div>
				<div class="max-h-52 overflow-y-auto md:max-h-[55dvh]">
					{#each products as product (product.id)}
						<button
							type="button"
							onclick={() => select(product)}
							disabled={busy}
							aria-pressed={form?.id === product.id}
							data-goal-ignore="Выбор товара для редактирования"
							class="flex w-full items-center gap-3 border-b border-border-light px-2 py-3 text-left transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
							class:bg-surface={form?.id === product.id}
						>
							<ImageFallback
								src={product.image}
								alt=""
								imageRole="preview"
								class="h-14 w-16 shrink-0 rounded-md object-cover"
							/>
							<span class="min-w-0"
								><span class="block truncate font-medium">{product.title}</span><span
									class="text-xs text-secondary"
									>{product.isActive ? copy.statusShown : copy.statusHidden} · Порядок: {product.sortOrder}</span
								></span
							>
						</button>
					{:else}<p class="py-6 text-sm text-secondary">
							{copy.empty}
						</p>{/each}
				</div>
			</aside>
			<div class="min-w-0 p-5 sm:p-7">
				{#if form}
					<form onsubmit={save} class="space-y-5" aria-label={form.id ? copy.edit : copy.create}>
						<fieldset disabled={busy} class="space-y-5 disabled:opacity-60">
							<div>
								<label for={`${uid}-title`} class="mb-2 block text-sm font-medium">Название</label
								><input
									bind:this={titleInput}
									id={`${uid}-title`}
									bind:value={form.title}
									required
									maxlength="255"
									class="w-full rounded-lg border border-border-light bg-surface px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-accent"
								/>
							</div>
							<div>
								<label for={`${uid}-description`} class="mb-2 block text-sm font-medium"
									>Описание</label
								><textarea
									id={`${uid}-description`}
									bind:value={form.description}
									maxlength="1000"
									rows="3"
									class="w-full resize-y rounded-lg border border-border-light bg-surface px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-accent"
								></textarea>
							</div>
							<div>
								<label for={`${uid}-photo`} class="mb-2 block text-sm font-medium">Фотография</label
								>
								{#if preview || form.image}<ImageFallback
										src={preview || form.image}
										alt={form.title || copy.photo}
										imageRole="preview"
										class="mb-3 aspect-[4/3] max-h-52 w-full rounded-lg object-cover"
									/>{/if}
								<input
									bind:this={fileInput}
									id={`${uid}-photo`}
									type="file"
									accept="image/jpeg,image/png,image/webp"
									onchange={chooseFile}
									aria-describedby={`${uid}-photo-help`}
									class="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-border-light file:bg-surface file:px-3 file:py-2 file:text-primary"
								/>
								<p id={`${uid}-photo-help`} class="mt-2 text-xs text-secondary">
									JPEG, PNG или WebP, до 10 МБ. После выбора откроется кадрирование. Фото
									автоматически сжимается и сохраняется в WebP до 2 МБ.
								</p>
							</div>
							<div class="flex flex-wrap items-end gap-5">
								<div>
									<label for={`${uid}-order`} class="mb-2 block text-sm font-medium">Порядок</label
									><input
										id={`${uid}-order`}
										type="number"
										min="0"
										max="1000000"
										step="1"
										required
										bind:value={form.sortOrder}
										class="w-28 rounded-lg border border-border-light bg-surface px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-accent"
									/>
								</div>
								<label class="flex min-h-11 items-center gap-2 text-sm"
									><input
										type="checkbox"
										bind:checked={form.isActive}
										class="accent-accent"
									/>Показывать в галерее</label
								>
							</div>
						</fieldset>
						<div class="flex flex-wrap items-center gap-3 border-t border-border-light pt-5">
							<button
								type="submit"
								disabled={busy || !dirty}
								data-goal-ignore="Сохранение товара владельцем"
								class="min-h-11 rounded-lg bg-primary px-5 text-sm text-on-dark disabled:opacity-50"
								>{busy ? 'Сохраняем…' : copy.save}</button
							>
							{#if form.id}<button
									type="button"
									onclick={() => {
										deleteConfirm = true;
									}}
									disabled={busy}
									data-goal-ignore="Запрос удаления товара"
									class="min-h-11 px-3 text-sm underline underline-offset-4 disabled:opacity-50"
									>{copy.remove}</button
								>{/if}
						</div>
						{#if deleteConfirm}
							<div role="alert" class="border border-border-light p-4 text-sm">
								<p>Удалить «{form.title}» из каталога этого сайта?</p>
								<div class="mt-3 flex flex-wrap gap-3">
									<button
										type="button"
										onclick={remove}
										disabled={busy}
										data-goal-ignore="Подтверждение удаления товара"
										class="min-h-11 rounded-lg bg-primary px-4 text-on-dark disabled:opacity-50"
										>Да, удалить</button
									><button
										type="button"
										onclick={() => {
											deleteConfirm = false;
										}}
										disabled={busy}
										data-goal-ignore="Отмена удаления товара"
										class="min-h-11 px-4 underline underline-offset-4">Отмена</button
									>
								</div>
							</div>
						{/if}
					</form>
				{:else}<p class="py-10 text-secondary">{copy.select}</p>{/if}
			</div>
		</div>
	{/if}
	{#if pendingFile}
		{#key pendingFile}
			<ImageCropper
				imageFile={pendingFile}
				aspectRatio={4 / 3}
				maxOutputWidth={2560}
				maxOutputHeight={2560}
				outputMimeType="image/webp"
				outputQuality={0.85}
				maxOutputBytes={CATALOG_PHOTO_MAX_BYTES}
				onCrop={cropped}
				onCancel={() => (pendingFile = null)}
			/>
		{/key}
	{/if}
</dialog>
