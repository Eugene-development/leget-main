<script lang="ts">
	// Артикул: 2.1.2.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'HomeStyles', updated);
		data = updated;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	const defaultStyles = [
		{
			title: 'Современный',
			description: 'Чистые линии, минималистичные формы и функциональность мебели',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/sovremjknvndgvhj.jpg'
		},
		{
			title: 'Классический',
			description: 'Элегантность мебельных традиций с вниманием к каждой детали фасада',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/claskjdgnbkdgmj.jpg'
		},
		{
			title: 'Лофт',
			description: 'Индустриальный шик: бетон, металл и брутальные формы для смелых интерьеров',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/loftelkjbngrtobnhekrjthbn.jpg'
		}
	];

	const styles = $derived(
		Array.isArray(data?.styles)
			? (data.styles as { title: string; description: string; image: string }[])
			: defaultStyles
	);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.25, rootMargin: '0px 0px -100px 0px' }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section class="relative z-10 mt-16 px-6 lg:mt-48 xl:px-1" bind:this={sectionEl}>
	<div class="mx-auto max-w-screen-xl">
		<!-- Section Header -->
		<div class="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
			<div class="opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
				<EditableField
					fieldKey="HomeStyles.label"
					label="Лейбл"
					value={String(data?.label ?? 'Коллекции')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span
						>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="HomeStyles.heading"
					label="Заголовок"
					value={String(data?.heading ?? 'Найдите свой стиль')}
					{isEditable}
					onSave={(v) => saveField('heading', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="mt-3 text-4xl text-primary lg:text-5xl"
							style="font-family: var(--font-heading);"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>
			</div>

			<a
				href={String(data?.allLink ?? '/styles')}
				class="group flex items-center gap-2 text-sm text-secondary transition-colors duration-300 hover:text-secondary"
			>
				<EditableField
					fieldKey="HomeStyles.allLinkText"
					label="Текст ссылки"
					value={String(data?.allLinkText ?? 'Все стили')}
					{isEditable}
					onSave={(v) => saveField('allLinkText', v)}
				>
					{#snippet children(displayValue)}
						{displayValue}
					{/snippet}
				</EditableField>
				<svg
					class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
					/>
				</svg>
			</a>
		</div>

		<!-- Styles Grid -->
		<div class="grid gap-6 md:grid-cols-3">
			{#each styles as style, i}
				<a
					href={String(data?.allLink ?? '/styles')}
					class="group relative overflow-hidden bg-white shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated"
					style="animation-delay: {0.2 + i * 0.15}s"
				>
					<!-- Image -->
					<div class="relative aspect-[4/3] overflow-hidden">
						<ImageFallback
							loading="lazy"
							src={style.image}
							alt={style.title}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
						></div>
					</div>

					<!-- Content -->
					<div class="p-6 lg:p-8">
						<h3 class="text-2xl text-primary lg:text-3xl" style="font-family: var(--font-heading);">
							{style.title}
						</h3>
						<p class="mt-2 text-sm leading-relaxed text-secondary">
							{style.description}
						</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>
