<script lang="ts">
	// Артикул: 2.9.2.1 — см. docs/architecture/component-articles-map.md
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

	const defaultItems = [
		{
			title: 'Бостон',
			description: 'Крашеные фасады',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/cam-1-1600x0.webp'
		},
		{
			title: 'Эйвон',
			description: 'Фасады в термопластике',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/jnvjkfnvrgejkvnfdf.webp'
		},
		{
			title: 'Каселла',
			description: 'Фасады ЛМДФ Тимбер',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/jgkfbniregbnjgrbn.webp'
		},
		{
			title: 'Рокко',
			description: 'Фасады ЛМДФ Тимбер и краска',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/guvbhubnnuk.webp'
		},
		{
			title: 'Мари',
			description: 'Фасады МДФ крашеный по системе Пазл',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/jbjnjknkjnkj.webp'
		},
		{
			title: 'Фабиана',
			description: 'Фасады шпон дуба и крашеный МДФ',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/khjnhbujbghbhg.webp'
		},
		{
			title: 'Лия',
			description: 'Фасады МДФ крашеный',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/kjbndkgjbnkgjbngj.webp'
		},
		{
			title: 'Флавио',
			description: 'Фасады МДФ крашеный и ЛМДФ Тимбер',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/nbkjgfnbjkgfbmjg.webp'
		},
		{
			title: 'Мармо',
			description: 'Фасады ЛМДФ SUPRAMAT',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/kdmvflkdlfcfdld.webp'
		},
		{
			title: 'Этна',
			description: 'Фасады МДФ термопластик',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/ghghbghgvhgvgh.webp'
		},
		{
			title: 'Трент',
			description: 'Фасады МДФ термопластик 22мм',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/fdjnvkfjdnvkjfd.webp'
		},
		{
			title: 'Амато',
			description: 'Массив дуба',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/jnkmfvjkemdfvkf.webp'
		},
		{
			title: 'Ливон',
			description: 'Фасады МДФ термопластик 22мм',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/dfjkvnkdfvmkjdfvmk.webp'
		},
		{
			title: 'Нордик',
			description: 'Фасады МДФ Fenix и Массив дуба',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/nffvdkvnfdjkgfk.webp'
		},
		{
			title: 'Флитвуд',
			description: 'Фасады ЛМДФ SUPRAMAT',
			image: 'https://storage.yandexcloud.net/zovtop/kitchens/jhbhbjhbjhbkmkl.webp'
		}
	];

	const items = $derived(
		Array.isArray(data?.items) && (data.items as unknown[]).length > 0
			? (data.items as typeof defaultItems)
			: defaultItems
	);

	let selectedPhoto = $state<{ image: string; title: string } | null>(null);
	let photoDialog: HTMLDialogElement;
	let savingPhoto = $state(false);
	let saveError = $state('');
	let saveController: AbortController | null = null;

	function openPhoto(event: MouseEvent, project: (typeof defaultItems)[number]) {
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
			const filename = photo.title.replace(/[\\/:*?"<>|]/g, '-').trim() || 'Кухня';
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
				if (inViewport && !document.hidden && !pointerDown && !isEditable && !selectedPhoto) {
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
					fieldKey="KitchensGallery.heading"
					label="Заголовок"
					value={String(data?.heading ?? 'Наши гарнитуры')}
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

				<EditableField
					fieldKey="KitchensGallery.description"
					label="Описание"
					value={String(data?.description ?? 'Ознакомьтесь с вариантами решений для вашей кухни.')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="mx-auto max-w-2xl text-lg leading-relaxed font-light text-secondary">
							<RichText value={displayValue} />
						</p>
					{/snippet}
				</EditableField>
			</div>
		</div>

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
				{#each items as project, i}
					<div
						class="group relative aspect-[4/3] min-w-[85vw] snap-start overflow-hidden rounded-2xl bg-white opacity-0 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-elevated md:min-w-[45vw] lg:min-w-[calc(50%-16px)]"
						class:animate-fade-up={visible}
						style="animation-delay: {0.1 + i * 0.05}s"
					>
						<ImageFallback
							imagePath={['items', i, 'image']}
							imageDefaults={{ items }}
							loading="lazy"
							src={project.image}
							alt={project.title}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
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

<dialog
	bind:this={photoDialog}
	onclose={closePhoto}
	onclick={(event) => {
		if (event.target === photoDialog) closePhoto();
	}}
	data-goal-ignore="Закрытие просмотра фото по фону без формы"
	aria-label={selectedPhoto ? `Фото кухни: ${selectedPhoto.title}` : 'Фото кухни'}
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
		<img
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
				data-goal-ignore="Скачивание фотографии кухни без формы"
				disabled={savingPhoto}
				class="min-h-11 rounded-full bg-primary px-6 py-3 text-sm text-white transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60"
				>{savingPhoto ? 'Сохранение…' : 'Сохранить'}</button
			>
		</div>
	{/if}
</dialog>
