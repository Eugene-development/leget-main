<script lang="ts">
	// Артикул: 2.9.2.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
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

<section bind:this={sectionEl} class="bg-surface-warm px-6 py-section-sm lg:py-section xl:px-1">
	<div class="mx-auto max-w-screen-xl">
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
							{displayValue}
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
							{displayValue}
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
							{displayValue}
						</p>
					{/snippet}
				</EditableField>
			</div>
		</div>

		{#if items.length > 3}
			<div class="mb-4 flex items-center justify-end gap-6">
				<span class="text-[10px] tracking-[0.2em] text-secondary/50 uppercase">Листайте вправо</span
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
		{/if}

		<div class="relative">
			<div
				bind:this={scrollContainer}
				class="no-scrollbar -mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-8 overflow-x-auto scroll-smooth px-6 pb-12 lg:mx-0 lg:scroll-pl-0 lg:px-0"
			>
				{#each items as project, i}
					<div
						class="group relative aspect-[4/3] min-w-[85vw] snap-start overflow-hidden rounded-2xl bg-white opacity-0 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-elevated md:min-w-[45vw] lg:min-w-[calc(50%-16px)]"
						class:animate-fade-up={visible}
						style="animation-delay: {0.1 + i * 0.05}s"
					>
						<ImageFallback
							loading="lazy"
							src={project.image}
							alt={project.title}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
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
