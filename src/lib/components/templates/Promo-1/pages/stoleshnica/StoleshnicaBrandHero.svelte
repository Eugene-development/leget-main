<script lang="ts">
	// Артикулы: 1.29.2.1, 1.30.2.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const bgImage = $derived(
		data.bgImage ||
			'https://storage.yandexcloud.net/leget-main/templates/promo-1/countertops_hero.png'
	);

	const title = $derived(String(data.title || 'Бренд'));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'StoleshnicaBrandHero', updated);
		data = updated;
	}
</script>

<div class="mebel-container">
	<section class="relative overflow-hidden rounded-2xl bg-ink-900">
		<ImageFallback
			src={bgImage}
			alt={title}
			class="absolute inset-0 h-full w-full object-cover opacity-40"
		/>

		<div class="relative px-8 py-12 sm:px-12 sm:py-16">
			<nav class="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink-300">
				<a href="/" class="transition-colors hover:text-on-dark">Главная</a>
				<span>/</span>
				<a href="/stoleshnica" class="transition-colors hover:text-on-dark">Столешницы</a>
				<span>/</span>
				{#if data.brandSlug}
					<a href="/stoleshnica/{data.materialSlug}" class="transition-colors hover:text-on-dark"
						>{data.materialTitle}</a
					>
					<span>/</span>
				{/if}
				<span class="text-on-dark" aria-current="page">{title}</span>
			</nav>

			<h1 class="text-3xl text-on-dark sm:text-4xl lg:text-5xl">
				<EditableField
					fieldKey="StoleshnicaBrandHero.title"
					label="Заголовок"
					value={title}
					{isEditable}
					inline
					onSave={(v) => saveField('title', v)}
				>
					{#snippet children(val)}{val}{/snippet}
				</EditableField>
			</h1>

			{#if data.description}
				<p class="mt-4 max-w-xl text-lg text-ink-300">
					<EditableField
						fieldKey="StoleshnicaBrandHero.description"
						label="Описание"
						value={String(data.description)}
						{isEditable}
						inline
						multiline
						onSave={(v) => saveField('description', v)}
					>
						{#snippet children(val)}{val}{/snippet}
					</EditableField>
				</p>
			{/if}

			<div class="mt-8 flex flex-wrap gap-4">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-lg bg-cat-1-500 px-6 py-3 font-medium text-on-accent transition-all hover:bg-cat-1-600"
					onclick={() => serviceOrderStore.open('consultation')}
				>
					<EditableField
						fieldKey="StoleshnicaBrandHero.buttonText"
						label="Текст кнопки"
						value={String(data.buttonText || 'Подобрать столешницу')}
						{isEditable}
						inline
						onSave={(v) => saveField('buttonText', v)}
					>
						{#snippet children(val)}{val}{/snippet}
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
	</section>
</div>

<style>
	/* Полоса контента страницы бренда. Объявлена через :global так же, как у
	   StoleshnicaHero и пяти остальных Hero каталожных страниц: остальные блоки
	   страницы (Benefits, CTA) пишут `mebel-container` в разметке, но правила
	   не несут и живут этой утечкой. Устройство и план перевода на роль
	   `.p1-catalog-container` — в комментарии к ней в Promo-1/theme.css;
	   переводится страница целиком, поэтому здесь пока копия. */
	:global(.mebel-container) {
		max-width: 1536px;
		margin-left: auto;
		margin-right: auto;
		padding-left: 1rem;
		padding-right: 1rem;
		margin-top: 4rem;
	}
	@media (min-width: 1024px) {
		:global(.mebel-container) {
			padding-left: 360px;
		}
	}
</style>
