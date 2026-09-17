<script lang="ts">
	// Артикул: 1.17.2.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelCategoryHero', updated);
		data = updated;
	}

	const categoryHeroBaseUrl = 'https://storage.yandexcloud.net/leget-main/templates/promo-1';
	const categoryHeroImages = {
		kitchens: `${categoryHeroBaseUrl}/kitchen-category-hero-v3.webp`,
		wardrobes: `${categoryHeroBaseUrl}/wardrobes-category-hero-v3.webp`,
		dressingRooms: `${categoryHeroBaseUrl}/dressing-rooms-category-hero-v3.webp`,
		hallways: `${categoryHeroBaseUrl}/hallways-category-hero-v3.webp`,
		kidsFurniture: `${categoryHeroBaseUrl}/kids-furniture-category-hero-v3.webp`,
		officeFurniture: `${categoryHeroBaseUrl}/office-furniture-category-hero-v3.webp`
	};

	// Fallback images for categories (only files published in Object Storage)
	const categoryImages: Record<string, string> = {
		kuhni: categoryHeroImages.kitchens,
		kitchens: categoryHeroImages.kitchens,
		shkafy: categoryHeroImages.wardrobes,
		wardrobes: categoryHeroImages.wardrobes,
		garderobnye: categoryHeroImages.dressingRooms,
		'dressing-rooms': categoryHeroImages.dressingRooms,
		prihozhie: categoryHeroImages.hallways,
		hallways: categoryHeroImages.hallways,
		'detskaya-mebel': categoryHeroImages.kidsFurniture,
		'kids-furniture': categoryHeroImages.kidsFurniture,
		'ofisnaya-mebel': categoryHeroImages.officeFurniture,
		'office-furniture': categoryHeroImages.officeFurniture
	};

	function getHeroImage(slug: string) {
		return categoryImages[slug] || categoryHeroImages.kitchens;
	}
</script>

<div class="mebel-container">
	<div class="relative overflow-hidden rounded-2xl bg-ink-900">
		<ImageFallback
			imagePath={['bgImage']}
			src={getHeroImage(data.categorySlug)}
			alt={data.title}
			class="absolute inset-0 h-full w-full object-cover object-top opacity-40"
		/>
		<div class="relative px-8 py-12 sm:px-12 sm:py-16">
			<!-- Breadcrumb -->
			<nav class="mb-6 flex items-center gap-2 text-sm text-ink-400">
				<a href="/" class="transition-colors hover:text-on-dark">Главная</a>
				<span>/</span>
				<a href="/mebel" class="transition-colors hover:text-on-dark">Мебель</a>
				<span>/</span>
				<span class="text-on-dark">{data.title}</span>
			</nav>

			<h1 class="text-3xl text-on-dark sm:text-4xl lg:text-5xl">
				<EditableField
					fieldKey="MebelCategoryHero.title"
					label="Заголовок"
					value={String(data.title || 'Категория')}
					{isEditable}
					inline
					onSave={(v) => saveField('title', v)}
				>
					{#snippet children(val)}
						<RichText value={val} />
					{/snippet}
				</EditableField>
			</h1>

			{#if data.description}
				<div class="mt-4 max-w-xl text-lg text-ink-300">
					<EditableField
						fieldKey="MebelCategoryHero.description"
						label="Описание"
						value={String(data.description)}
						{isEditable}
						inline
						multiline
						onSave={(v) => saveField('description', v)}
					>
						{#snippet children(val)}
							<RichText value={val} />
						{/snippet}
					</EditableField>
				</div>
			{/if}

			<div class="mt-8 flex flex-wrap gap-4">
				<button
					class="inline-flex items-center gap-2 rounded-lg bg-link-500 px-6 py-3 font-medium text-on-accent transition-all hover:bg-link-600"
				>
					<EditableField
						fieldKey="MebelCategoryHero.buttonText"
						label="Текст кнопки"
						value={String(data.buttonText || 'Создать проект')}
						{isEditable}
						inline
						onSave={(v) => saveField('buttonText', v)}
					>
						{#snippet children(val)}
							<RichText value={val} />
						{/snippet}
					</EditableField>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 8l4 4m0 0l-4 4m4-4H3"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>

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
