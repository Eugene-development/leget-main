<script lang="ts">
	// Артикул: 2.10.2.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
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

	const defaultItems = [
		{ title: 'Шкаф/гардеробная', description: 'Индивидуальное наполнение, фасады крашеные', image: 'https://storage.yandexcloud.net/zovtop/wardrobes/hbhfbvjkfnvkdfjv.webp' },
		{ title: 'Шкаф/гардеробная', description: 'Индивидуальное наполнение, фасады крашеные', image: 'https://storage.yandexcloud.net/zovtop/wardrobes/djfnbksdlgkmbkldg.webp' },
		{ title: 'Шкаф/гардеробная', description: 'Индивидуальное наполнение, фасады крашеные', image: 'https://storage.yandexcloud.net/zovtop/wardrobes/dfmklefmvkdkff.webp' },
		{ title: 'Шкаф/гардеробная', description: 'Индивидуальное наполнение, фасады крашеные', image: 'https://storage.yandexcloud.net/zovtop/wardrobes/jfgnbjkfgbmfgkl.webp' }
	];

	const items = $derived(
		Array.isArray(data?.items) && (data.items as unknown[]).length > 0
			? (data.items as typeof defaultItems)
			: defaultItems
	);

	let visible = $state(false);
	let sectionEl: HTMLElement;
	let scrollContainer: HTMLElement;

	function scrollRight() {
		if (scrollContainer) {
			const scrollAmount = scrollContainer.offsetWidth * 0.8;
			scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		}
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section bind:this={sectionEl} class="bg-white px-6 py-section-sm xl:px-1 lg:py-section">
	<div class="mx-auto max-w-screen-xl">
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
							{displayValue}
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
							class="mb-6 text-3xl font-light tracking-wide text-primary uppercase lg:text-4xl"
							style="font-family: var(--font-heading);"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>
			</div>
		</div>

		{#if items.length > 3}
			<div class="mb-4 flex items-center justify-end gap-6">
				<span class="text-[10px] tracking-[0.2em] text-secondary/50 uppercase">Листайте вправо</span>
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
		{/if}

		<div class="relative">
			<div
				bind:this={scrollContainer}
				class="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth px-6 pb-12 scroll-pl-6 lg:mx-0 lg:px-0 lg:scroll-pl-0"
			>
				{#each items as project, i}
					<div
						class="group relative aspect-[4/3] min-w-[85vw] snap-start overflow-hidden rounded-2xl bg-surface-warm shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-elevated opacity-0 md:min-w-[45vw] lg:min-w-[calc(50%-16px)]"
						class:animate-fade-up={visible}
						style="animation-delay: {0.1 + i * 0.1}s"
					>
						<img loading="lazy"
							src={project.image}
							alt={project.title}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105">
						<div class="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/5"></div>
						<div class="absolute right-0 bottom-0 left-0 translate-y-full bg-white/90 p-6 backdrop-blur-md transition-transform duration-500 group-hover:translate-y-0">
							<h3
								class="mb-2 text-lg font-light tracking-wide text-primary"
								style="font-family: var(--font-heading);"
							>
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
