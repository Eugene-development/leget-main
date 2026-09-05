<script lang="ts">
	// Артикул: 1.31.2.1 — см. docs/architecture/component-articles-map.md
	//
	// Шапка страницы бренда (/santehnika/{brand}). Заголовок и описание
	// приезжают из справочника: RenderPage кладёт в `data` строку бренда, как
	// MebelCategoryHero получает свою категорию. Правки инлайн сохраняются в
	// блок страницы и с этого момента побеждают справочник — так же, как у
	// остальных блоков рубрики.
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
		data.bgImage || 'https://storage.yandexcloud.net/leget-main/templates/promo-1/plumbing_hero.png'
	);

	const title = $derived(String(data.title || 'Бренд'));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'SantehnikaBrandHero', updated);
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
			<nav class="mb-6 flex items-center gap-2 text-sm text-ink-400">
				<a href="/" class="transition-colors hover:text-on-dark">Главная</a>
				<span>/</span>
				<a href="/santehnika" class="transition-colors hover:text-on-dark">Сантехника</a>
				<span>/</span>
				<span class="text-on-dark">{title}</span>
			</nav>

			<h1 class="text-3xl text-on-dark sm:text-4xl lg:text-5xl">
				<EditableField
					fieldKey="SantehnikaBrandHero.title"
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
						fieldKey="SantehnikaBrandHero.description"
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
					class="inline-flex items-center gap-2 rounded-lg bg-link-500 px-6 py-3 font-medium text-on-accent transition-all hover:bg-link-600"
					onclick={() => serviceOrderStore.open('consultation')}
				>
					<EditableField
						fieldKey="SantehnikaBrandHero.buttonText"
						label="Текст кнопки"
						value={String(data.buttonText || 'Подобрать комплект')}
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
	   SantehnikaHero и остальных Hero каталожных страниц: прочие блоки страницы
	   (Benefits, CTA) пишут `mebel-container` в разметке, но правила не несут
	   и живут этой утечкой. Устройство и план перевода на роль
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
