<script lang="ts">
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
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

	// Fallback images for categories
	const categoryImages = {
		kitchens: '/kuhni_hero.png',
		wardrobes: '/wardrobe_project_no_text.png',
		'dressing-rooms': '/dressing_room_hero.png',
		hallways: '/hallway_hero.png',
		'kids-furniture': '/kids_furniture_hero.png',
		'office-furniture': '/office_furniture_hero.png'
	};

	function getHeroImage(slug) {
		return (
			categoryImages[slug] || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200'
		);
	}
</script>

<div class="mebel-container">
	<div class="relative overflow-hidden rounded-2xl bg-slate-900">
		<img
			src={getHeroImage(data.categorySlug)}
			alt={data.title}
			class="absolute inset-0 h-full w-full object-cover opacity-40"
		/>
		<div class="relative px-8 py-12 sm:px-12 sm:py-16">
			<!-- Breadcrumb -->
			<nav class="mb-6 flex items-center gap-2 text-sm text-slate-400">
				<a href="/" class="transition-colors hover:text-white">Главная</a>
				<span>/</span>
				<a href="/mebel" class="transition-colors hover:text-white">Мебель</a>
				<span>/</span>
				<span class="text-white">{data.title}</span>
			</nav>

			<h1 class="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
				<EditableField
					fieldKey="MebelCategoryHero.title"
					label="Заголовок"
					value={String(data.title || 'Категория')}
					{isEditable}
					inline
					onSave={(v) => saveField('title', v)}
				>
					{#snippet children(val)}
						{val}
					{/snippet}
				</EditableField>
			</h1>

			{#if data.description}
				<div class="mt-4 max-w-xl text-lg text-slate-300">
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
							{val}
						{/snippet}
					</EditableField>
				</div>
			{/if}

			<div class="mt-8 flex flex-wrap gap-4">
				<button
					class="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-6 py-3 font-medium text-white transition-all hover:bg-sky-600"
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
							{val}
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
