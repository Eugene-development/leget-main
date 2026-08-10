<script lang="ts">
	// Артикул: 1.20.2.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

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
			'https://storage.yandexcloud.net/leget-main/templates/promo-1/appliances_hero.png'
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ByttehnikaHero', updated);
		data = updated;
	}
</script>

<div class="mebel-container">
	<section class="mebel-hero relative overflow-hidden rounded-2xl bg-ink-900">
		<img src={bgImage} alt="Hero" class="absolute inset-0 h-full w-full object-cover opacity-40" />

		<div class="relative px-8 py-16 sm:px-12 sm:py-20">
			<nav class="mb-6 flex items-center gap-2 text-sm text-ink-400">
				<a href="/" class="transition-colors hover:text-on-dark">Главная</a>
				<span>/</span>
				<span class="text-on-dark">Бытовая техника</span>
			</nav>

			<h1 class="text-3xl text-on-dark sm:text-4xl lg:text-5xl">
				<EditableField
					fieldKey="ByttehnikaHero.title"
					label="Заголовок"
					value={String(data.title || 'Бытовая техника')}
					{isEditable}
					inline
					onSave={(v) => saveField('title', v)}
				>
					{#snippet children(val)}{val}{/snippet}
				</EditableField>
			</h1>

			<p class="mt-4 max-w-xl text-lg text-ink-300">
				<EditableField
					fieldKey="ByttehnikaHero.description"
					label="Описание"
					value={String(
						data.description ||
							'Встраиваемая и отдельностоящая техника от ведущих мировых производителей. Подберём оптимальное решение с учётом ваших пожеланий и бюджета.'
					)}
					{isEditable}
					inline
					multiline
					onSave={(v) => saveField('description', v)}
				>
					{#snippet children(val)}{val}{/snippet}
				</EditableField>
			</p>

			<div class="mt-8 flex flex-wrap gap-4">
				<button
					class="inline-flex items-center gap-2 rounded-lg bg-link-500 px-6 py-3 font-medium text-on-accent transition-all hover:bg-link-600"
				>
					<EditableField
						fieldKey="ByttehnikaHero.primaryButton"
						label="Кнопка"
						value={String(data.primaryButton || 'Подобрать технику')}
						{isEditable}
						inline
						onSave={(v) => saveField('primaryButton', v)}
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
	h1 {
		font-family: inherit;
	}
</style>
