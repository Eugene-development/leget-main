<script lang="ts">
	// Артикул: 2.10.2.1 — см. docs/architecture/component-articles-map.md
	import ProductCatalogModal from '../_shared/ProductCatalogModal.svelte';
	import type { CatalogProduct } from '../_shared/product-catalog';
	import FavoriteButton from '../../favorites/FavoriteButton.svelte';
	import { favoriteVariant } from '../../favorites/storage';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { onMount } from 'svelte';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'WardrobesGallery', updated);
		data = updated;
	}

	const items = $derived(Array.isArray(data?.items) ? (data.items as CatalogProduct[]) : []);
	let managingProducts = $state(false);
	function productsChanged(next: CatalogProduct[]) {
		data = { ...data, items: next };
	}

	let selectedPhoto = $state<{ image: string; title: string } | null>(null);
	let photoDialog: HTMLDialogElement;
	let savingPhoto = $state(false);
	let saveError = $state('');
	let saveController: AbortController | null = null;

	function openPhoto(event: MouseEvent, project: CatalogProduct) {
		const image =
			event.currentTarget instanceof HTMLElement
				? event.currentTarget.parentElement?.querySelector('img')
				: null;
		if (!image?.currentSrc) return;
		selectedPhoto = { image: image.currentSrc, title: project.title };
		saveError = '';
		photoDialog.showModal();
	}

	function closePhoto() {
		if (photoDialog.open) photoDialog.close();
		saveController?.abort();
		saveController = null;
		savingPhoto = false;
		selectedPhoto = null;
	}

	async function savePhoto() {
		if (!selectedPhoto || savingPhoto) return;
		const photo = selectedPhoto;
		const controller = new AbortController();
		saveController = controller;
		savingPhoto = true;
		saveError = '';
		try {
			const response = await fetch(`/api/gallery-image?url=${encodeURIComponent(photo.image)}`, {
				signal: controller.signal
			});
			if (!response.ok) throw new Error('Download failed');
			const blob = await response.blob();
			if (!blob.type.startsWith('image/')) throw new Error('Invalid image');
			if (controller.signal.aborted) return;
			const extension = blob.type.split('/')[1].split('+')[0].replace('jpeg', 'jpg');
			const filename = photo.title.replace(/[\\/:*?"<>|]/g, '-').trim() || 'Шкаф';
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${filename}.${extension}`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			setTimeout(() => URL.revokeObjectURL(url), 60000);
		} catch {
			if (!controller.signal.aborted)
				saveError =
					'Не удалось скачать фото. Откройте оригинал и сохраните его через меню браузера.';
		} finally {
			if (saveController === controller) {
				savingPhoto = false;
				saveController = null;
			}
		}
	}

	$effect(() => {
		if (!selectedPhoto) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previousOverflow;
			saveController?.abort();
		};
	});

	let visible = $state(false);
	let canScrollLeft = $state(false);
	let sectionEl: HTMLElement;
	let scrollContainer: HTMLElement;

	function scrollLeft() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: -scrollContainer.offsetWidth * 0.8, behavior: 'smooth' });
		}
	}

	function scrollRight() {
		if (scrollContainer) {
			const scrollAmount = scrollContainer.offsetWidth * 0.8;
			scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		}
	}

	onMount(() => {
		let inViewport = false;
		let pointerDown = false;
		let autoScrollTimer: ReturnType<typeof setTimeout>;

		function restartAutoScroll() {
			clearTimeout(autoScrollTimer);
			autoScrollTimer = setTimeout(() => {
				if (
					inViewport &&
					!document.hidden &&
					!pointerDown &&
					!isEditable &&
					!selectedPhoto &&
					!managingProducts
				) {
					const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
					if (maxScroll > 1) {
						if (scrollContainer.scrollLeft >= maxScroll - 1) {
							scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
						} else {
							scrollRight();
						}
					}
				}
				restartAutoScroll();
			}, 4000);
		}

		function pauseForPointer() {
			pointerDown = true;
			clearTimeout(autoScrollTimer);
		}

		function resumeAfterPointer() {
			if (!pointerDown) return;
			pointerDown = false;
			restartAutoScroll();
		}

		scrollContainer.addEventListener('scroll', restartAutoScroll, { passive: true });
		sectionEl.addEventListener('wheel', restartAutoScroll, { passive: true });
		sectionEl.addEventListener('keydown', restartAutoScroll);
		sectionEl.addEventListener('pointerdown', pauseForPointer, { passive: true });
		window.addEventListener('pointerup', resumeAfterPointer);
		window.addEventListener('pointercancel', resumeAfterPointer);
		document.addEventListener('visibilitychange', restartAutoScroll);
		restartAutoScroll();

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					inViewport = entry.isIntersecting;
					if (entry.isIntersecting) visible = true;
					restartAutoScroll();
				});
			},
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => {
			observer.disconnect();
			clearTimeout(autoScrollTimer);
			scrollContainer.removeEventListener('scroll', restartAutoScroll);
			sectionEl.removeEventListener('wheel', restartAutoScroll);
			sectionEl.removeEventListener('keydown', restartAutoScroll);
			sectionEl.removeEventListener('pointerdown', pauseForPointer);
			window.removeEventListener('pointerup', resumeAfterPointer);
			window.removeEventListener('pointercancel', resumeAfterPointer);
			document.removeEventListener('visibilitychange', restartAutoScroll);
		};
	});
</script>

<section bind:this={sectionEl} class="bg-white py-section-sm lg:py-section">
	<div class="p2-container mx-auto">
		<div class="mb-10 text-center">
			<div class="opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
				<EditableField
					fieldKey="WardrobesGallery.label"
					label="Лейбл"
					value={String(data?.label ?? 'Галерея')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">
							<RichText value={displayValue} />
						</div>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="WardrobesGallery.heading"
					label="Заголовок"
					value={String(data?.heading ?? 'Наши шкафы и гардеробные')}
					{isEditable}
					onSave={(v) => saveField('heading', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="mb-6 text-3xl text-primary uppercase lg:text-4xl"
							style="font-family: var(--font-heading);"
						>
							<RichText value={displayValue} />
						</h2>
					{/snippet}
				</EditableField>
			</div>
		</div>

		{#if isEditable && editContext?.licenseId}
			<div class="mb-6 flex justify-end">
				<button
					type="button"
					onclick={() => (managingProducts = true)}
					data-goal-ignore="Управление товарами владельцем сайта"
					class="min-h-11 rounded-lg border border-border-light bg-surface-warm px-5 py-2 text-sm text-primary transition-colors hover:bg-primary hover:text-on-dark focus-visible:outline-2 focus-visible:outline-accent"
				>
					Управлять шкафами
				</button>
			</div>
		{/if}
		{#if items.length === 0}
			<p class="py-12 text-center text-secondary">
				Шкафов пока нет.{isEditable ? ' Добавьте товары через «Управлять шкафами».' : ''}
			</p>
		{/if}
		{#if items.length > 3}
			<div class="mb-4 flex flex-wrap items-center justify-between gap-4">
				{#if canScrollLeft}
					<div class="flex items-center gap-6">
						<button
							type="button"
							onclick={scrollLeft}
							data-goal-ignore="Прокрутка галереи влево"
							class="group hidden h-10 w-10 items-center justify-center rounded-full border border-border-light bg-white/80 text-primary shadow-soft transition-all duration-300 hover:bg-primary hover:text-white lg:flex"
							aria-label="Листать влево"
						>
							<svg
								class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 5l-7 7 7 7" />
							</svg>
						</button>
						<span class="text-[10px] tracking-[0.2em] text-secondary/50 uppercase"
							>Листайте влево</span
						>
					</div>
				{/if}
				<div class="ml-auto flex items-center gap-6">
					<span class="text-[10px] tracking-[0.2em] text-secondary/50 uppercase"
						>Листайте вправо</span
					>
					<button
						onclick={scrollRight}
						class="group hidden h-10 w-10 items-center justify-center rounded-full border border-border-light bg-white/80 text-primary shadow-soft transition-all duration-300 hover:bg-primary hover:text-white lg:flex"
						aria-label="Листать вправо"
					>
						<svg
							class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>
			</div>
		{/if}

		<div class="relative">
			<div
				bind:this={scrollContainer}
				onscroll={() => (canScrollLeft = scrollContainer.scrollLeft > 1)}
				class="no-scrollbar -mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-8 overflow-x-auto scroll-smooth px-6 pb-12 lg:mx-0 lg:scroll-pl-0 lg:px-0"
			>
				{#each items as project, i (project.id)}
					<div
						class="group relative aspect-[4/3] min-w-[85vw] snap-start overflow-hidden rounded-2xl bg-surface-warm opacity-0 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-elevated md:min-w-[45vw] lg:min-w-[calc(50%-16px)]"
						class:animate-fade-up={visible}
						style="animation-delay: {0.1 + i * 0.1}s"
					>
						<ImageFallback
							imageRole="preview"
							loading="lazy"
							src={project.image}
							alt={project.title}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
						<div class="absolute top-4 right-4 z-20">
							<FavoriteButton item={favoriteVariant('wardrobe', project)} />
						</div>
						{#if !isEditable}
							<button
								type="button"
								onclick={(event) => openPhoto(event, project)}
								data-goal-ignore="Просмотр фотографии шкафа без формы"
								aria-label={`Открыть фото: ${project.title}`}
								class="absolute inset-0 z-10 cursor-zoom-in rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent"
							></button>
						{/if}
						<div
							class="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/5"
						></div>
						<div
							class="absolute right-0 bottom-0 left-0 translate-y-full bg-white/90 p-6 backdrop-blur-md transition-transform duration-500 group-hover:translate-y-0"
						>
							<h3 class="mb-2 text-lg text-primary" style="font-family: var(--font-heading);">
								{project.title}
							</h3>
							<p class="text-sm text-secondary">{project.description}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

{#if managingProducts && isEditable && editContext?.licenseId}
	<ProductCatalogModal
		licenseId={editContext.licenseId}
		kind="wardrobe"
		onclose={() => (managingProducts = false)}
		onchanged={productsChanged}
	/>
{/if}

<dialog
	bind:this={photoDialog}
	onclose={closePhoto}
	onclick={(event) => {
		if (event.target === photoDialog) closePhoto();
	}}
	data-goal-ignore="Закрытие просмотра фото по фону без формы"
	aria-label={selectedPhoto ? `Фото шкафа: ${selectedPhoto.title}` : 'Фото шкафа'}
	class="fixed inset-0 m-auto max-h-[95dvh] w-[calc(100%-2rem)] max-w-6xl overflow-y-auto rounded-2xl border-0 bg-surface-warm p-0 text-primary shadow-elevated backdrop:bg-primary/80"
>
	<div
		class="flex items-center justify-between gap-4 border-b border-border-light px-4 py-3 sm:px-6"
	>
		<h3 class="min-w-0 text-lg" style="font-family: var(--font-heading);">
			{selectedPhoto?.title ?? ''}
		</h3>
		<button
			type="button"
			onclick={closePhoto}
			data-goal-ignore="Закрытие просмотра фото без формы"
			aria-label="Закрыть фото"
			class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-light transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-accent"
		>
			<svg
				class="h-5 w-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" stroke-linecap="round" /></svg
			>
		</button>
	</div>
	{#if selectedPhoto}
		<ImageFallback
			imageRole="preview"
			src={selectedPhoto.image}
			alt={selectedPhoto.title}
			class="mx-auto max-h-[70dvh] w-full object-contain"
		/>
		<div class="flex flex-wrap items-center justify-end gap-4 px-4 py-4 sm:px-6">
			{#if saveError}
				<p role="status" class="w-full text-sm text-secondary">{saveError}</p>
				<a
					href={selectedPhoto.image}
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm text-primary underline underline-offset-4">Открыть оригинал</a
				>
			{/if}
			<button
				type="button"
				onclick={savePhoto}
				data-goal-ignore="Скачивание фотографии шкафа без формы"
				disabled={savingPhoto}
				class="min-h-11 rounded-full bg-primary px-6 py-3 text-sm text-white transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60"
				>{savingPhoto ? 'Сохранение…' : 'Сохранить'}</button
			>
		</div>
	{/if}
</dialog>
