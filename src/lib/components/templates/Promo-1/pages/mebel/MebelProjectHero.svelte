<script lang="ts">
	// Артикул: 1.18.2.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { fly } from 'svelte/transition';
	import { invalidateAll, goto } from '$app/navigation';
	import { cubicOut } from 'svelte/easing';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { getGraphQLUrl } from '$lib/utils/config';
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
		// Паспорт сданной работы. Правится ТОЛЬКО здесь: страница `/projects`
		// эти поля показывает и не редактирует — см. ProjectsFeed/data.ts.
		completed_at: '',
		object_address: '',
		maker: '',
		hardware_brands: '',
		appliance_brands: '',
		price: '',
		old_price: '',
		is_new: false,
		is_featured: false,
		is_active: true
	});

	/** Список брендов из строки формы: «Blum, Hettich» → ['Blum', 'Hettich']. */
	function parseBrands(value: string): string[] {
		return value
			.split(',')
			.map((brand) => brand.trim())
			.filter((brand) => brand !== '');
	}

	function openEditPanel() {
		// Попытаться получить category_id из проекта или из категории
		const categoryId = project.category_id || category.id || '';
		const meta = (project.meta ?? {}) as Record<string, unknown>;
		const brands = (key: string) =>
			Array.isArray(meta[key]) ? (meta[key] as unknown[]).join(', ') : '';

		editForm = {
			id: project.id || '',
			category_id: categoryId,
			value: project.value || '',
			short_description: project.short_description || '',
			description: project.description || '',
			completed_at: project.completed_at || '',
			object_address: project.object_address || '',
			maker: typeof meta.maker === 'string' ? meta.maker : '',
			hardware_brands: brands('hardware_brands'),
			appliance_brands: brands('appliance_brands'),
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
							// Пустое поле отправляется ЯВНЫМ null, а не пропускается:
							// мутация различает «поле не прислали» и «поле очистили»,
							// и очистка даты убирает работу из ленты `/projects`.
							// Пустой строкой дату не очистить — скаляр Date её
							// не разберёт и ответит ошибкой.
							completed_at: editForm.completed_at || null,
							object_address: editForm.object_address || null,
							maker: editForm.maker || null,
							hardware_brands: parseBrands(editForm.hardware_brands),
							appliance_brands: parseBrands(editForm.appliance_brands),
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
			if (
				saved &&
				(saved.slug !== project.slug || categoryId !== (project.category_id || category.id))
			) {
				const newCat = categories.find((c: any) => c.id === categoryId);
				const catSlug = newCat?.slug || category.slug;
				setTimeout(() => {
					goto(`/mebel/${catSlug}/${saved.slug}`);
				}, 800);
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
				class="relative aspect-4/3 overflow-hidden rounded-2xl border border-ink-100 bg-surface-raised shadow-sm"
			>
				{#if images.length > 0 && images[selectedImageIndex]?.url}
					<ImageFallback
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
							<ImageFallback src={image.url} alt="" class="h-full w-full object-cover" />
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

			<div class="flex items-start justify-between gap-4">
				<h1 class="text-3xl text-ink-900 sm:text-4xl">
					{project.value}
				</h1>
				{#if isAdmin}
					<button
						type="button"
						onclick={openEditPanel}
						title="Редактировать проект"
						aria-label="Редактировать проект"
						class="mt-1 flex shrink-0 items-center gap-1.5 rounded-lg bg-cat-1-50 px-3 py-2 text-xs font-semibold text-cat-1-700 ring-1 ring-cat-1-200 transition-all hover:bg-cat-1-100 hover:ring-cat-1-300"
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
				{/if}
			</div>

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

<!-- Edit Panel -->
{#if isEditPanelOpen}
	<div
		use:portal
		class="fixed inset-0 z-[200] bg-ink-950/40 backdrop-blur-sm"
		onclick={() => (isEditPanelOpen = false)}
		role="presentation"
	></div>
	<div
		use:portal
		class="fixed top-0 right-0 z-[210] flex h-full w-full max-w-md flex-col bg-surface-raised shadow-2xl"
		in:fly={{ x: 420, duration: 350, easing: cubicOut }}
		role="dialog"
		aria-modal="true"
		aria-label="Редактировать проект"
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-ink-100 px-6 py-4">
			<h2 class="text-lg text-ink-900">Редактировать проект</h2>
			<button
				type="button"
				onclick={() => (isEditPanelOpen = false)}
				aria-label="Закрыть"
				class="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<!-- Form -->
		<div class="flex-1 space-y-5 overflow-y-auto px-6 py-5">
			<!-- Название -->
			<div>
				<label for="ep-value" class="mb-1.5 block text-sm font-semibold text-ink-700"
					>Название проекта *</label
				>
				<input
					id="ep-value"
					type="text"
					bind:value={editForm.value}
					placeholder="Название проекта"
					class="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 transition-all outline-none focus:border-link-400 focus:ring-2 focus:ring-link-100"
				/>
			</div>

			<!-- Категория -->
			<div>
				<label for="ep-category" class="mb-1.5 block text-sm font-semibold text-ink-700"
					>Категория *</label
				>
				<select
					id="ep-category"
					bind:value={editForm.category_id}
					class="w-full rounded-xl border border-ink-200 bg-surface-raised px-3.5 py-2.5 text-sm text-ink-900 transition-all outline-none focus:border-link-400 focus:ring-2 focus:ring-link-100"
				>
					{#each categories as cat}
						<option value={cat.id}>{cat.value}</option>
					{/each}
				</select>
			</div>

			<!-- Краткое описание -->
			<div>
				<label for="ep-short-desc" class="mb-1.5 block text-sm font-semibold text-ink-700"
					>Краткое описание</label
				>
				<input
					id="ep-short-desc"
					type="text"
					bind:value={editForm.short_description}
					placeholder="Краткое описание для карточки"
					class="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 transition-all outline-none focus:border-link-400 focus:ring-2 focus:ring-link-100"
				/>
			</div>

			<!-- Полное описание -->
			<div>
				<label for="ep-desc" class="mb-1.5 block text-sm font-semibold text-ink-700"
					>Полное описание</label
				>
				<textarea
					id="ep-desc"
					bind:value={editForm.description}
					rows="5"
					placeholder="Подробное описание проекта"
					class="w-full resize-none rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 transition-all outline-none focus:border-link-400 focus:ring-2 focus:ring-link-100"
				></textarea>
			</div>

			<!--
				Паспорт сданной работы.

				Единственное место на всей платформе, где эти поля правятся:
				страница «Проекты» (`/projects`, артикул 1.26.2) собрана из них,
				но редактора не имеет — там они только показываются.
			-->
			<div class="space-y-4 rounded-xl border border-ink-100 bg-ink-50 p-4">
				<div>
					<p class="text-xs font-semibold tracking-wide text-ink-400 uppercase">Паспорт работы</p>
					<p class="mt-1 text-xs text-ink-500">
						Показывается на странице «Проекты». Без даты сдачи работа туда не попадает, но в
						каталоге остаётся.
					</p>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="ep-completed" class="mb-1.5 block text-sm font-semibold text-ink-700"
							>Дата сдачи</label
						>
						<input
							id="ep-completed"
							type="date"
							bind:value={editForm.completed_at}
							class="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 transition-all outline-none focus:border-link-400 focus:ring-2 focus:ring-link-100"
						/>
					</div>
					<div>
						<label for="ep-maker" class="mb-1.5 block text-sm font-semibold text-ink-700"
							>Кто делал мебель</label
						>
						<input
							id="ep-maker"
							type="text"
							bind:value={editForm.maker}
							placeholder="Собственное производство"
							class="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 transition-all outline-none focus:border-link-400 focus:ring-2 focus:ring-link-100"
						/>
					</div>
				</div>

				<div>
					<label for="ep-address" class="mb-1.5 block text-sm font-semibold text-ink-700"
						>Адрес объекта</label
					>
					<input
						id="ep-address"
						type="text"
						bind:value={editForm.object_address}
						placeholder="Москва, Хамовники, ул. Примерная, 1"
						class="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 transition-all outline-none focus:border-link-400 focus:ring-2 focus:ring-link-100"
					/>
					<!-- Усечение делает выдача, а не форма: тенант вводит один раз
					     то, что знает, и не может случайно опубликовать больше. -->
					<p class="mt-1.5 text-xs text-ink-500">
						Храним целиком, для учёта. На сайте публикуются только первые два звена — город и район.
					</p>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="ep-hardware" class="mb-1.5 block text-sm font-semibold text-ink-700"
							>Бренды фурнитуры</label
						>
						<input
							id="ep-hardware"
							type="text"
							bind:value={editForm.hardware_brands}
							placeholder="Blum, Hettich"
							class="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 transition-all outline-none focus:border-link-400 focus:ring-2 focus:ring-link-100"
						/>
					</div>
					<div>
						<label for="ep-appliances" class="mb-1.5 block text-sm font-semibold text-ink-700"
							>Бренды техники</label
						>
						<input
							id="ep-appliances"
							type="text"
							bind:value={editForm.appliance_brands}
							placeholder="Bosch, Franke"
							class="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 transition-all outline-none focus:border-link-400 focus:ring-2 focus:ring-link-100"
						/>
					</div>
				</div>
				<p class="text-xs text-ink-500">Несколько брендов — через запятую.</p>
			</div>

			<!-- Цены -->
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="ep-price" class="mb-1.5 block text-sm font-semibold text-ink-700"
						>Цена, ₽</label
					>
					<input
						id="ep-price"
						type="number"
						bind:value={editForm.price}
						min="0"
						placeholder="0"
						class="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 transition-all outline-none focus:border-link-400 focus:ring-2 focus:ring-link-100"
					/>
				</div>
				<div>
					<label for="ep-old-price" class="mb-1.5 block text-sm font-semibold text-ink-700"
						>Старая цена, ₽</label
					>
					<input
						id="ep-old-price"
						type="number"
						bind:value={editForm.old_price}
						min="0"
						placeholder="0"
						class="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 transition-all outline-none focus:border-link-400 focus:ring-2 focus:ring-link-100"
					/>
				</div>
			</div>

			<!-- Флаги -->
			<div class="space-y-3 rounded-xl border border-ink-100 bg-ink-50 p-4">
				<p class="text-xs font-semibold tracking-wide text-ink-400 uppercase">Параметры</p>
				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={editForm.is_active}
						class="h-4 w-4 rounded text-link-500"
					/>
					<span class="text-sm font-medium text-ink-700">Активен</span>
				</label>
				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={editForm.is_new}
						class="h-4 w-4 rounded text-link-500"
					/>
					<span class="text-sm font-medium text-ink-700">Новинка</span>
				</label>
				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="checkbox"
						bind:checked={editForm.is_featured}
						class="h-4 w-4 rounded text-link-500"
					/>
					<span class="text-sm font-medium text-ink-700">Хит (избранный)</span>
				</label>
			</div>

			<!-- Ошибка / успех -->
			{#if saveError}
				<div class="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 ring-1 ring-brand-200">
					⚠️ {saveError}
				</div>
			{/if}
			{#if saveSuccess}
				<div class="rounded-xl bg-cat-2-50 px-4 py-3 text-sm text-cat-2-700 ring-1 ring-cat-2-200">
					✅ Сохранено! Обновляем страницу…
				</div>
			{/if}
		</div>

		<!-- Footer buttons -->
		<div class="flex gap-3 border-t border-ink-100 px-6 py-4">
			<button
				type="button"
				onclick={() => (isEditPanelOpen = false)}
				class="flex-1 rounded-xl border border-ink-200 py-3 text-sm font-semibold text-ink-600 transition-all hover:bg-ink-50"
			>
				Отмена
			</button>
			<button
				type="button"
				onclick={saveProject}
				disabled={isSaving || !editForm.value}
				class="flex-1 rounded-xl bg-link-500 py-3 text-sm font-semibold text-on-accent shadow-lg shadow-link-200 transition-all hover:bg-link-600 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSaving ? 'Сохраняем…' : 'Сохранить'}
			</button>
		</div>
	</div>
{/if}

<!-- Lightbox -->
{#if isLightboxOpen}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/95 backdrop-blur-xl"
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
						src={images[selectedImageIndex].url}
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
