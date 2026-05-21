<script lang="ts">
	import { fly } from 'svelte/transition';
	import { invalidateAll, goto } from '$app/navigation';
	import { cubicOut } from 'svelte/easing';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { auth } from '$lib/stores/auth';
	import { browser } from '$app/environment';
	import { getGraphQLUrl } from '$lib/utils/config';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Данные из API
	const project = $derived(data.project || {});
	const category = $derived(data.category || {});
	const images = $derived(project.images || []);
	const categories = $derived(data.categories || []);

	// Авторизация
	let isAdmin = $derived(browser ? $auth.isAuthenticated : false);

	// Локальное состояние галереи
	let selectedImageIndex = $state(0);
	let isLightboxOpen = $state(false);

	// Панель редактирования
	let isEditPanelOpen = $state(false);
	let isSaving = $state(false);
	let saveError = $state('');
	let saveSuccess = $state(false);

	let editForm = $state({
		id: '',
		category_id: '',
		value: '',
		short_description: '',
		description: '',
		price: '',
		old_price: '',
		is_new: false,
		is_featured: false,
		is_active: true
	});

	function openEditPanel() {
		// Попытаться получить category_id из проекта или из категории
		const categoryId = project.category_id || category.id || '';
		editForm = {
			id: project.id || '',
			category_id: categoryId,
			value: project.value || '',
			short_description: project.short_description || '',
			description: project.description || '',
			price: project.price != null ? String(project.price) : '',
			old_price: project.old_price != null ? String(project.old_price) : '',
			is_new: project.is_new || false,
			is_featured: project.is_featured || false,
			is_active: project.is_active !== false
		};
		saveError = '';
		saveSuccess = false;
		isEditPanelOpen = true;
	}

	async function saveProject() {
		if (!editForm.value) return;
		// Если category_id не установлен (старый кеш), использовать category.id
		const categoryId = editForm.category_id || category.id || '';
		if (!categoryId) {
			saveError = 'Не удалось определить категорию. Обновите страницу и попробуйте снова.';
			return;
		}
		isSaving = true;
		saveError = '';
		saveSuccess = false;
		try {
			const token = localStorage.getItem('auth_token');
			const res = await fetch(getGraphQLUrl(), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
					'X-Forwarded-Host': window.location.hostname
				},
				body: JSON.stringify({
					query: `mutation UpsertMebelProject($input: UpsertMebelProjectInput!) {
						upsertMebelProject(input: $input) { id value slug }
					}`,
					variables: {
						input: {
							id: editForm.id || undefined,
							category_id: categoryId,
							value: editForm.value,
							short_description: editForm.short_description || null,
							description: editForm.description || null,
							price: editForm.price ? parseFloat(editForm.price) : null,
							old_price: editForm.old_price ? parseFloat(editForm.old_price) : null,
							is_new: editForm.is_new,
							is_featured: editForm.is_featured,
							is_active: editForm.is_active
						}
					}
				})
			});
			const result = await res.json();
			if (result.errors?.length) throw new Error(result.errors[0].message);
			saveSuccess = true;
			// Если изменилась категория или slug — перенаправляем
			const saved = result.data?.upsertMebelProject;
			if (saved && (saved.slug !== project.slug || categoryId !== (project.category_id || category.id))) {
				const newCat = categories.find((c: any) => c.id === categoryId);
				const catSlug = newCat?.slug || category.slug;
				setTimeout(() => { goto(`/mebel/${catSlug}/${saved.slug}`); }, 800);
			} else {
				setTimeout(() => invalidateAll(), 800);
			}
		} catch (e: any) {
			saveError = e.message || 'Ошибка сохранения';
		} finally {
			isSaving = false;
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

	// Закрытие панели по Escape
	$effect(() => {
		if (isEditPanelOpen) {
			const handleKey = (e: KeyboardEvent) => {
				if (e.key === 'Escape') isEditPanelOpen = false;
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

<div class="mebel-container">
	<div class="lg:grid lg:grid-cols-2 lg:gap-12">
		<!-- Галерея -->
		<div>
			<div
				class="relative aspect-4/3 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
			>
				{#if images.length > 0 && images[selectedImageIndex]?.url}
					<img
						src={images[selectedImageIndex].url}
						alt={project.value}
						class="h-full w-full object-cover transition-all duration-500"
					/>

					<!-- Кнопка увеличения -->
					<button
						type="button"
						onclick={() => (isLightboxOpen = true)}
						aria-label="Открыть галерею"
						title="Открыть галерею"
						class="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
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
					<div class="flex h-full w-full items-center justify-center bg-slate-50">
						<svg
							class="h-20 w-20 text-slate-200"
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

				<!-- Метки -->
				<div class="absolute top-4 left-4 flex gap-2">
					{#if project.is_new}
						<span
							class="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-md"
							>Новинка</span
						>
					{/if}
					{#if project.is_featured}
						<span class="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md"
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
								? 'border-sky-500'
								: 'border-transparent hover:border-slate-200'}"
						>
							<img src={image.url} alt="" class="h-full w-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Информация -->
		<div class="mt-8 lg:mt-0">
			<!-- Хлебные крошки -->
			<nav class="mb-6 flex items-center gap-2 text-sm text-slate-400">
				<a href="/" class="hover:text-slate-600">Главная</a>
				<span>/</span>
				<a href="/mebel" class="hover:text-slate-600">Мебель</a>
				{#if category.slug}
					<span>/</span>
					<a href="/mebel/{category.slug}" class="hover:text-slate-600">{category.value}</a>
				{/if}
			</nav>

			<div class="flex items-start justify-between gap-4">
				<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">
					{project.value}
				</h1>
				{#if isAdmin}
					<button
						type="button"
						onclick={openEditPanel}
						title="Редактировать проект"
						aria-label="Редактировать проект"
						class="shrink-0 mt-1 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 transition-all hover:bg-amber-100 hover:ring-amber-300"
					>
						<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						Редактировать
					</button>
				{/if}
			</div>

			<!-- Кнопки -->
			<div class="mt-8 flex flex-col gap-4 sm:flex-row">
				<button
					class="flex-1 rounded-xl bg-sky-500 px-8 py-4 font-bold text-white shadow-lg shadow-sky-200 transition-all hover:bg-sky-600 hover:shadow-xl"
				>
					Создать проект и узнать цену
				</button>
				<a
					href="tel:+79154000020"
					class="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-100 px-8 py-4 font-bold text-slate-700 transition-all hover:border-sky-500 hover:text-sky-600"
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
					class="flex items-center gap-3 rounded-2xl border border-slate-50 bg-white p-4 shadow-sm"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
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
						<div class="font-bold text-slate-900">Бесплатный замер</div>
						<div class="text-slate-500">Выезд специалиста</div>
					</div>
				</div>
				<div
					class="flex items-center gap-3 rounded-2xl border border-slate-50 bg-white p-4 shadow-sm"
				>
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
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
						<div class="font-bold text-slate-900">Гарантия 5 лет</div>
						<div class="text-slate-500">На все изделия</div>
					</div>
				</div>
				<div
					class="flex items-center gap-3 rounded-2xl border border-slate-50 bg-white p-4 shadow-sm"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"
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
						<div class="font-bold text-slate-900">Доставка и монтаж</div>
						<div class="text-slate-500">Установка под ключ</div>
					</div>
				</div>
				<div
					class="flex items-center gap-3 rounded-2xl border border-slate-50 bg-white p-4 shadow-sm"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600"
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
						<div class="font-bold text-slate-900">Рассрочка 0%</div>
						<div class="text-slate-500">До 12 месяцев</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Edit Panel -->
{#if isEditPanelOpen}
	<div
		class="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-sm"
		onclick={() => (isEditPanelOpen = false)}
		role="presentation"
	></div>
	<aside
		class="fixed right-0 top-0 z-[91] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
		in:fly={{ x: 420, duration: 350, easing: cubicOut }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
			<h2 class="text-lg font-bold text-slate-900">Редактировать проект</h2>
			<button
				type="button"
				onclick={() => (isEditPanelOpen = false)}
				aria-label="Закрыть"
				class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Form -->
		<div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
			<!-- Название -->
			<div>
				<label for="ep-value" class="mb-1.5 block text-sm font-semibold text-slate-700">Название проекта *</label>
				<input
					id="ep-value"
					type="text"
					bind:value={editForm.value}
					placeholder="Название проекта"
					class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
				/>
			</div>

			<!-- Категория -->
			<div>
				<label for="ep-category" class="mb-1.5 block text-sm font-semibold text-slate-700">Категория *</label>
				<select
					id="ep-category"
					bind:value={editForm.category_id}
					class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white"
				>
					{#each categories as cat}
						<option value={cat.id}>{cat.value}</option>
					{/each}
				</select>
			</div>

			<!-- Краткое описание -->
			<div>
				<label for="ep-short-desc" class="mb-1.5 block text-sm font-semibold text-slate-700">Краткое описание</label>
				<input
					id="ep-short-desc"
					type="text"
					bind:value={editForm.short_description}
					placeholder="Краткое описание для карточки"
					class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
				/>
			</div>

			<!-- Полное описание -->
			<div>
				<label for="ep-desc" class="mb-1.5 block text-sm font-semibold text-slate-700">Полное описание</label>
				<textarea
					id="ep-desc"
					bind:value={editForm.description}
					rows="5"
					placeholder="Подробное описание проекта"
					class="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
				></textarea>
			</div>

			<!-- Цены -->
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="ep-price" class="mb-1.5 block text-sm font-semibold text-slate-700">Цена, ₽</label>
					<input
						id="ep-price"
						type="number"
						bind:value={editForm.price}
						min="0"
						placeholder="0"
						class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
					/>
				</div>
				<div>
					<label for="ep-old-price" class="mb-1.5 block text-sm font-semibold text-slate-700">Старая цена, ₽</label>
					<input
						id="ep-old-price"
						type="number"
						bind:value={editForm.old_price}
						min="0"
						placeholder="0"
						class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
					/>
				</div>
			</div>

			<!-- Флаги -->
			<div class="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Параметры</p>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" bind:checked={editForm.is_active} class="h-4 w-4 rounded text-sky-500" />
					<span class="text-sm font-medium text-slate-700">Активен</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" bind:checked={editForm.is_new} class="h-4 w-4 rounded text-sky-500" />
					<span class="text-sm font-medium text-slate-700">Новинка</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" bind:checked={editForm.is_featured} class="h-4 w-4 rounded text-sky-500" />
					<span class="text-sm font-medium text-slate-700">Хит (избранный)</span>
				</label>
			</div>

			<!-- Ошибка / успех -->
			{#if saveError}
				<div class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
					⚠️ {saveError}
				</div>
			{/if}
			{#if saveSuccess}
				<div class="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
					✅ Сохранено! Обновляем страницу…
				</div>
			{/if}
		</div>

		<!-- Footer buttons -->
		<div class="flex gap-3 border-t border-slate-100 px-6 py-4">
			<button
				type="button"
				onclick={() => (isEditPanelOpen = false)}
				class="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
			>
				Отмена
			</button>
			<button
				type="button"
				onclick={saveProject}
				disabled={isSaving || !editForm.value}
				class="flex-1 rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition-all hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isSaving ? 'Сохраняем…' : 'Сохранить'}
			</button>
		</div>
	</aside>
{/if}

<!-- Lightbox -->
{#if isLightboxOpen}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl"
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
			<div class="relative flex items-center justify-center w-[90vw] h-[85vh] max-w-5xl overflow-hidden rounded-xl bg-slate-900/50 shadow-2xl">
				<img
					src={images[selectedImageIndex].url}
					alt=""
					class="h-full w-full object-cover"
					in:fly={{ y: 20, duration: 400, easing: cubicOut }}
				/>
			</div>

			<!-- Навигация -->
			{#if selectedImageIndex > 0}
				<button
					type="button"
					onclick={() => selectedImageIndex--}
					aria-label="Предыдущее изображение"
					title="Назад"
					class="absolute top-1/2 left-8 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
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
					class="absolute top-1/2 right-8 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
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
				class="absolute top-8 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
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
