<script lang="ts">
	import ContentText from '$lib/components/templates/Promo-2/ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 2.9.2.1 — см. docs/architecture/component-articles-map.md
	import ProductCatalogModal from '../_shared/ProductCatalogModal.svelte';
	import GalleryPhotoDialog from '../_shared/GalleryPhotoDialog.svelte';
	import GalleryScrollButton from '../_shared/GalleryScrollButton.svelte';
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
		await saveComponentData(editContext, 'KitchensGallery', updated);
		data = updated;
	}

	// Catalog rows supplied by RenderPage; an empty collection stays empty.
	const items = $derived(Array.isArray(data?.items) ? (data.items as CatalogProduct[]) : []);
	let managingProducts = $state(false);
	function productsChanged(next: CatalogProduct[]) {
		data = { ...data, items: next };
	}

	let selectedPhoto = $state<{ image: string; title: string } | null>(null);

	function openPhoto(event: MouseEvent, project: CatalogProduct) {
		const image =
			event.currentTarget instanceof HTMLElement
				? event.currentTarget.parentElement?.querySelector('img')
				: null;
		if (!image?.currentSrc) return;
		selectedPhoto = { image: image.currentSrc, title: project.title };
	}

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

<section bind:this={sectionEl} class="bg-surface-warm py-section-sm lg:py-section">
	<div class="p2-container mx-auto">
		<div class="mb-10 text-center">
			<div class="opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
				<EditableField
					fieldKey="KitchensGallery.label"
					label="Лейбл"
					value={editableText(data?.label, 'Галерея')}
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
					fieldKey="KitchensGallery.heading"
					label="Заголовок"
					value={editableText(data?.heading, 'Наши гарнитуры')}
					{isEditable}
					onSave={(v) => saveField('heading', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="mb-6 text-section-title text-primary uppercase"
							style="font-family: var(--font-heading);"
						>
							<RichText value={displayValue} />
						</h2>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="KitchensGallery.description"
					label="Описание"
					value={String(
						data?.description === undefined
							? 'Ознакомьтесь с вариантами решений для вашей кухни.'
							: (data.description ?? '')
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="mx-auto max-w-2xl text-prose font-light text-secondary">
							<RichText value={displayValue} />
						</p>
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
					Управлять кухнями
				</button>
			</div>
		{/if}
		{#if items.length === 0}
			<p class="py-12 text-center text-secondary">
				<ContentText
					bind:data
					{editContext}
					{isEditable}
					componentType="KitchensGallery"
					path={['copy', 'body1']}
					fallback={'Кухонь пока нет.'}
					label="Кухонь пока нет."
					multiline
				/>{isEditable ? ' Добавьте товары через «Управлять кухнями».' : ''}
			</p>
		{/if}
		{#if items.length > 3}
			<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
				{#if canScrollLeft}
					<GalleryScrollButton direction="left" {isEditable} onclick={scrollLeft}>
						<ContentText
							bind:data
							{editContext}
							{isEditable}
							componentType="KitchensGallery"
							path={['copy', 'scrollLeftText']}
							fallback={'Листайте влево'}
							label="Листайте влево"
						/>
					</GalleryScrollButton>
				{/if}
				<GalleryScrollButton direction="right" {isEditable} onclick={scrollRight}>
					<ContentText
						bind:data
						{editContext}
						{isEditable}
						componentType="KitchensGallery"
						path={['copy', 'scrollRightText']}
						fallback={'Листайте вправо'}
						label="Листайте вправо"
					/>
				</GalleryScrollButton>
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
						class="group relative aspect-[4/3] min-w-[85vw] snap-start overflow-hidden rounded-2xl bg-white opacity-0 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-elevated md:min-w-[45vw] lg:min-w-[calc(50%-16px)]"
						class:animate-fade-up={visible}
						style="animation-delay: {0.1 + i * 0.05}s"
					>
						<ImageFallback
							imageRole="preview"
							loading="lazy"
							src={project.image}
							alt={project.title}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
						<div class="absolute top-4 right-4 z-20">
							<FavoriteButton item={favoriteVariant('kitchen', project)} />
						</div>
						{#if !isEditable}
							<button
								type="button"
								onclick={(event) => openPhoto(event, project)}
								data-goal-ignore="Просмотр фотографии кухни без формы"
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
							<h3 class="mb-2 text-card-title text-primary" style="font-family: var(--font-heading);">
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
		kind="kitchen"
		onclose={() => (managingProducts = false)}
		onchanged={productsChanged}
	/>
{/if}

{#if selectedPhoto}
	<GalleryPhotoDialog
		photo={selectedPhoto}
		kind="kitchen"
		onclose={() => (selectedPhoto = null)}
	/>
{/if}
