<script lang="ts">
	// Артикул: 1.18.2.1 — см. docs/architecture/component-articles-map.md
	import MebelProjectEditModal from './MebelProjectEditModal.svelte';
	import MebelProjectDeleteDialog from './MebelProjectDeleteDialog.svelte';
	import type { SavedProject, ProjectUpdateInput } from './project-form';
	import { useImageEditing } from '$lib/utils/image-editing.svelte';
	const imageEditing = useImageEditing();
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import FavoriteProjectButton from '$lib/components/FavoriteProjectButton.svelte';
	import { fly } from 'svelte/transition';
	import { invalidateAll, goto } from '$app/navigation';
	import { cubicOut } from 'svelte/easing';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { sitePhoneHref } from '$lib/utils/site-phone';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		sitePhone = null
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
		sitePhone?: string | null;
	} = $props();

	const phoneHref = $derived(sitePhoneHref(sitePhone));

	// Данные из API
	const project = $derived(data.project || {});
	const category = $derived(data.category || {});
	const images = $derived(project.images || []);
	const categories = $derived(data.categories || []);

	// Кнопка правки проекта — часть интерфейса редактора, а не отдельное право:
	// раньше она стояла на голом $auth.isAuthenticated и появлялась у любого
	// вошедшего пользователя платформы на ЧУЖОМ сайте. isEditable уже означает
	// «владелец этой лицензии в браузере» (см. PageRenderer.svelte).
	let isAdmin = $derived(isEditable);

	// Локальное состояние галереи
	let selectedImageIndex = $state(0);
	let isLightboxOpen = $state(false);

	let isEditPanelOpen = $state(false);
	let refreshError = $state('');
	let isDeleteDialogOpen = $state(false);
	let deletedProjectId = $state('');
	const isDeleted = $derived(!!project.id && deletedProjectId === String(project.id));
	const categoryHref = $derived(
		category.slug ? `/mebel/${encodeURIComponent(category.slug)}` : '/mebel'
	);

	function openEditPanel() {
		refreshError = '';
		isEditPanelOpen = true;
	}

	/**
	 * Панель редактирования должна жить на верхнем уровне документа: иначе любой
	 * stacking context страницы может запереть fixed-слои под sticky-меню.
	 */
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.parentNode?.removeChild(node);
			}
		};
	}

	async function projectDeleted() {
		deletedProjectId = String(project.id);
		isLightboxOpen = false;
		refreshError = '';
		try {
			await goto(categoryHref, { invalidateAll: true });
		} catch {
			refreshError = 'Проект удалён. Не удалось открыть категорию — перейдите по ссылке ниже.';
		}
	}

	async function projectSaved(saved: SavedProject, input: ProjectUpdateInput) {
		const oldCategoryId = project.category_id || category.id;
		const oldSlug = project.slug;
		const newCategory = categories.find((item: any) => item.id === input.category_id);
		const { maker, hardware_brands, appliance_brands, tag_ids, ...fields } = input;
		data = {
			...data,
			project: {
				...project,
				...fields,
				...saved,
				meta: { ...(project.meta ?? {}), maker, hardware_brands, appliance_brands },
				...(tag_ids ? { tags: tag_ids.map((id) => ({ id })) } : {})
			},
			category: newCategory ?? category
		};
		try {
			const catSlug =
				newCategory?.slug || (input.category_id === oldCategoryId ? category.slug : '');
			if (!input.is_active) {
				await goto(catSlug ? `/mebel/${encodeURIComponent(catSlug)}` : '/mebel');
			} else if (input.category_id !== oldCategoryId || saved.slug !== oldSlug) {
				await goto(
					catSlug
						? `/mebel/${encodeURIComponent(catSlug)}/${encodeURIComponent(saved.slug)}`
						: '/mebel'
				);
			} else {
				await invalidateAll();
			}
		} catch {
			refreshError =
				'Изменения сохранены, но страницу не удалось обновить. Обновите её в браузере.';
		}
	}

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelProjectHero', updated);
		data = updated;
	}

	// Закрытие лайтбокса по Escape
	$effect(() => {
		if (isLightboxOpen) {
			const handleKey = (e: KeyboardEvent) => {
				if (e.key === 'Escape') isLightboxOpen = false;
				if (e.key === 'ArrowLeft' && selectedImageIndex > 0) selectedImageIndex--;
				if (e.key === 'ArrowRight' && selectedImageIndex < images.length - 1) selectedImageIndex++;
			};
			window.addEventListener('keydown', handleKey);
			document.body.style.overflow = 'hidden';
			return () => {
				window.removeEventListener('keydown', handleKey);
				document.body.style.overflow = '';
			};
		}
	});
</script>

{#if isDeleted}
	<div class="mebel-container py-10">
		<p role="status" class="text-ink-800">
			{refreshError || 'Проект удалён. Возвращаемся в категорию…'}
		</p>
		<a href={categoryHref} class="mt-4 inline-flex min-h-11 items-center text-link-700 underline"
			>Вернуться в категорию</a
		>
	</div>
{:else}
	<div class="mebel-container">
		<div class="lg:grid lg:grid-cols-2 lg:gap-12">
			<!-- Галерея -->
			<div>
				<div
					class="relative aspect-4/3 overflow-hidden rounded-2xl border border-ink-100 bg-surface-raised shadow-sm"
				>
					{#if images[selectedImageIndex]?.url || imageEditing?.editable || imageEditing?.read(['projectImages', String(project.id), String(selectedImageIndex)], '')}
						<ImageFallback
							imagePath={['projectImages', String(project.id), String(selectedImageIndex)]}
							src={images[selectedImageIndex]?.url ?? ''}
							alt={project.value}
							class="h-full w-full object-cover transition-all duration-500"
						/>

						<!-- Кнопка увеличения -->
						<button
							type="button"
							onclick={() => (isLightboxOpen = true)}
							aria-label="Открыть галерею"
							title="Открыть галерею"
							class="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised/90 text-ink-700 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-surface-raised"
						>
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
								/>
							</svg>
						</button>
					{:else}
						<div class="flex h-full w-full items-center justify-center bg-ink-50">
							<svg
								class="h-20 w-20 text-ink-200"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1"
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
					{/if}

					<FavoriteProjectButton
						projectId={String(project.id ?? '')}
						class="absolute top-4 right-4 z-10"
					/>

					<!-- Метки -->
					<div class="absolute top-4 left-4 flex gap-2">
						{#if project.is_new}
							<span
								class="rounded-full bg-cat-2-500 px-3 py-1 text-xs font-bold text-on-accent shadow-md"
								>Новинка</span
							>
						{/if}
						{#if project.is_featured}
							<span
								class="rounded-full bg-cat-1-500 px-3 py-1 text-xs font-bold text-on-accent shadow-md"
								>Хит</span
							>
						{/if}
					</div>
				</div>

				<!-- Миниатюры -->
				{#if images.length > 1}
					<div class="mt-4 grid grid-cols-4 gap-3">
						{#each images.slice(0, 8) as image, index}
							<button
								type="button"
								onclick={() => (selectedImageIndex = index)}
								aria-label={`Выбрать изображение ${index + 1}`}
								class="relative aspect-4/3 overflow-hidden rounded-xl border-2 transition-all {selectedImageIndex ===
								index
									? 'border-link-500'
									: 'border-transparent hover:border-ink-200'}"
							>
								<ImageFallback
									imagePath={['projectImages', String(project.id), String(index)]}
									src={image.url}
									alt=""
									class="h-full w-full object-cover"
								/>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Информация -->
			<div class="mt-8 lg:mt-0">
				<!-- Хлебные крошки -->
				<nav class="mb-6 flex items-center gap-2 text-sm text-ink-400">
					<a href="/" class="hover:text-ink-600">Главная</a>
					<span>/</span>
					<a href="/mebel" class="hover:text-ink-600">Мебель</a>
					{#if category.slug}
						<span>/</span>
						<a href="/mebel/{category.slug}" class="hover:text-ink-600">{category.value}</a>
					{/if}
				</nav>

				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<h1 class="text-3xl text-ink-900 sm:text-4xl">
						{project.value}
					</h1>
					{#if isAdmin}
						<div class="flex shrink-0 items-center gap-2">
							<button
								type="button"
								onclick={openEditPanel}
								title="Редактировать проект"
								aria-label="Редактировать проект"
								class="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-cat-1-50 px-3 py-2 text-xs font-semibold text-cat-1-700 ring-1 ring-cat-1-200 transition-all hover:bg-cat-1-100 hover:ring-cat-1-300"
							>
								<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
								Редактировать
							</button>

							<button
								type="button"
								onclick={() => (isDeleteDialogOpen = true)}
								disabled={!project.id || project.can_delete === false}
								aria-label="Удалить проект"
								title={project.can_delete === false
									? 'Общий проект каталога недоступен для удаления'
									: 'Удалить проект'}
								class="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-cat-6-300 bg-cat-6-50 px-3 py-2 text-xs font-semibold text-cat-6-600 hover:bg-cat-6-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-500 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
									><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" /></svg
								>
								Удалить
							</button>
						</div>
					{/if}
				</div>

				{#if refreshError}<p role="status" class="mt-4 text-sm text-ink-700">{refreshError}</p>{/if}

				<!-- Кнопки -->
				<div class="mt-8 flex flex-col gap-4 sm:flex-row">
					<button
						class="flex-1 rounded-xl bg-link-500 px-8 py-4 font-bold text-on-accent shadow-lg shadow-link-200 transition-all hover:bg-link-600 hover:shadow-xl"
					>
						Создать проект и узнать цену
					</button>
					<a
						href={phoneHref}
						class="flex items-center justify-center gap-2 rounded-xl border-2 border-ink-100 px-8 py-4 font-bold text-ink-700 transition-all hover:border-link-500 hover:text-link-600"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
							/>
						</svg>
						Позвонить
					</a>
				</div>

				<!-- Особенности -->
				<div class="mt-10 grid grid-cols-2 gap-4">
					<div
						class="flex items-center gap-3 rounded-2xl border border-ink-50 bg-surface-raised p-4 shadow-sm"
					>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-cat-2-50 text-cat-2-600"
						>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<div class="text-sm">
							<div class="font-bold text-ink-900">Бесплатный замер</div>
							<div class="text-ink-500">Выезд специалиста</div>
						</div>
					</div>
					<div
						class="flex items-center gap-3 rounded-2xl border border-ink-50 bg-surface-raised p-4 shadow-sm"
					>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-link-50 text-link-600"
						>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>
						<div class="text-sm">
							<div class="font-bold text-ink-900">Гарантия 5 лет</div>
							<div class="text-ink-500">На все изделия</div>
						</div>
					</div>
					<div
						class="flex items-center gap-3 rounded-2xl border border-ink-50 bg-surface-raised p-4 shadow-sm"
					>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-cat-1-50 text-cat-1-600"
						>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
								/>
							</svg>
						</div>
						<div class="text-sm">
							<div class="font-bold text-ink-900">Доставка и монтаж</div>
							<div class="text-ink-500">Установка под ключ</div>
						</div>
					</div>
					<div
						class="flex items-center gap-3 rounded-2xl border border-ink-50 bg-surface-raised p-4 shadow-sm"
					>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-cat-10-50 text-cat-10-600"
						>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div class="text-sm">
							<div class="font-bold text-ink-900">Рассрочка 0%</div>
							<div class="text-ink-500">До 12 месяцев</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if isEditPanelOpen && isEditable}
	<MebelProjectEditModal
		{project}
		categoryId={category.id ?? ''}
		{categories}
		onClose={() => (isEditPanelOpen = false)}
		onSaved={projectSaved}
	/>
{/if}

{#if isDeleteDialogOpen && isEditable && !isDeleted}
	<MebelProjectDeleteDialog
		projectId={String(project.id)}
		projectName={String(project.value ?? '')}
		onClose={() => (isDeleteDialogOpen = false)}
		onDeleted={projectDeleted}
	/>
{/if}

<!-- Lightbox -->
{#if isLightboxOpen}
	<div
		use:portal
		class="fixed inset-0 z-[200] flex items-center justify-center bg-ink-950/95 backdrop-blur-xl"
		onclick={(e) => {
			if (e.target === e.currentTarget) isLightboxOpen = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				isLightboxOpen = false;
			}
		}}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div class="relative max-h-screen max-w-screen-xl p-4">
			<div
				class="relative flex h-[85vh] w-[90vw] max-w-5xl items-center justify-center overflow-hidden rounded-xl bg-ink-900/50 shadow-2xl"
			>
				<div class="h-full w-full" in:fly={{ y: 20, duration: 400, easing: cubicOut }}>
					<ImageFallback
						imagePath={['projectImages', String(project.id), String(selectedImageIndex)]}
						src={images[selectedImageIndex]?.url ?? ''}
						alt=""
						class="h-full w-full object-cover"
					/>
				</div>
			</div>

			<!-- Навигация -->
			{#if selectedImageIndex > 0}
				<button
					type="button"
					onclick={() => selectedImageIndex--}
					aria-label="Предыдущее изображение"
					title="Назад"
					class="absolute top-1/2 left-8 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-on-dark/10 text-on-dark backdrop-blur hover:bg-on-dark/20"
				>
					<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>
			{/if}

			{#if selectedImageIndex < images.length - 1}
				<button
					type="button"
					onclick={() => selectedImageIndex++}
					aria-label="Следующее изображение"
					title="Вперёд"
					class="absolute top-1/2 right-8 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-on-dark/10 text-on-dark backdrop-blur hover:bg-on-dark/20"
				>
					<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>
			{/if}

			<!-- Закрыть -->
			<button
				type="button"
				onclick={() => (isLightboxOpen = false)}
				aria-label="Закрыть галерею"
				title="Закрыть"
				class="absolute top-8 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-on-dark/10 text-on-dark backdrop-blur hover:bg-on-dark/20"
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2.5"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	.mebel-container {
		max-width: 1536px;
		margin-left: auto;
		margin-right: auto;
		padding-left: 1rem;
		padding-right: 1rem;
		margin-top: 4rem;
	}

	@media (min-width: 1024px) {
		.mebel-container {
			padding-left: 360px;
		}
	}
</style>
