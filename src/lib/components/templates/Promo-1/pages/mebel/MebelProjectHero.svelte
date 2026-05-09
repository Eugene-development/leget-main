<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

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

	// Локальное состояние
	let selectedImageIndex = $state(0);
	let isLightboxOpen = $state(false);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelProjectHero', updated);
		data = updated;
	}

	import { formatPrice } from '$lib/utils/format';

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

<div class="mebel-container">
	<div class="lg:grid lg:grid-cols-2 lg:gap-12">
		<!-- Галерея -->
		<div>
			<div class="relative aspect-4/3 overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
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
						class="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
						</svg>
					</button>
				{:else}
					<div class="flex h-full w-full items-center justify-center bg-slate-50">
						<svg class="h-20 w-20 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
				{/if}

				<!-- Метки -->
				<div class="absolute left-4 top-4 flex gap-2">
					{#if project.is_new}
						<span class="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-md">Новинка</span>
					{/if}
					{#if project.is_featured}
						<span class="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md">Хит</span>
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
							class="relative aspect-4/3 overflow-hidden rounded-xl border-2 transition-all {selectedImageIndex === index ? 'border-sky-500' : 'border-transparent hover:border-slate-200'}"
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

			<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">
				{project.value}
			</h1>

			<div class="mt-6 flex items-baseline gap-4">
				{#if project.price}
					<span class="text-3xl font-bold text-slate-900">{formatPrice(project.price)} ₽</span>
					{#if project.old_price && project.old_price > project.price}
						<span class="text-xl text-slate-400 line-through">{formatPrice(project.old_price)} ₽</span>
					{/if}
				{:else}
					<span class="text-2xl font-bold text-slate-900">По запросу</span>
				{/if}
			</div>

			<!-- Кнопки -->
			<div class="mt-8 flex flex-col gap-4 sm:flex-row">
				<button class="flex-1 rounded-xl bg-sky-500 px-8 py-4 font-bold text-white shadow-lg shadow-sky-200 transition-all hover:bg-sky-600 hover:shadow-xl">
					Создать проект в этом стиле
				</button>
				<a href="tel:+79154000020" class="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-100 px-8 py-4 font-bold text-slate-700 transition-all hover:border-sky-500 hover:text-sky-600">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
					</svg>
					Позвонить
				</a>
			</div>

			<!-- Особенности -->
			<div class="mt-10 grid grid-cols-2 gap-4">
				<div class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-50">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<div class="text-sm">
						<div class="font-bold text-slate-900">Бесплатный замер</div>
						<div class="text-slate-500">Выезд специалиста</div>
					</div>
				</div>
				<div class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-50">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>
					<div class="text-sm">
						<div class="font-bold text-slate-900">Гарантия 5 лет</div>
						<div class="text-slate-500">На все изделия</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Lightbox -->
{#if isLightboxOpen}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl"
		onclick={() => (isLightboxOpen = false)}
		role="dialog"
		aria-modal="true"
	>
		<div class="relative max-h-screen max-w-screen-xl p-4" onclick={(e) => e.stopPropagation()}>
			<img
				src={images[selectedImageIndex].url}
				alt=""
				class="max-h-[85vh] w-auto rounded-lg shadow-2xl"
				in:fly={{ y: 20, duration: 400, easing: cubicOut }}
			/>
			
			<!-- Навигация -->
			{#if selectedImageIndex > 0}
				<button
					type="button"
					onclick={() => selectedImageIndex--}
					aria-label="Предыдущее изображение"
					title="Назад"
					class="absolute left-8 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
				>
					<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
			{/if}
			
			{#if selectedImageIndex < images.length - 1}
				<button
					type="button"
					onclick={() => selectedImageIndex++}
					aria-label="Следующее изображение"
					title="Вперёд"
					class="absolute right-8 top-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
				>
					<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
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
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
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
