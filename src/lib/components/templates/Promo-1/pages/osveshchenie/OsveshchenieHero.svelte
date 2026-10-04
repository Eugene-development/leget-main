<script lang="ts">
	// Артикул: 1.35.2.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
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

	const defaultBgImage =
		'https://storage.yandexcloud.net/leget-main/templates/promo-1/lighting_hero.png';
	const unavailableDefaultBgImage =
		'https://storage.yandexcloud.net/leget-main/templates/promo-1/lighting_hero_20260924.png';
	// Старый стартовый файл недоступен; обновляем данные до SSR и после их загрузки клиентом.
	function restoreDefaultImage() {
		if (!data.bgImage || data.bgImage === unavailableDefaultBgImage) data.bgImage = defaultBgImage;
	}
	restoreDefaultImage();
	$effect.pre(restoreDefaultImage);
	const bgImage = $derived(data.bgImage || defaultBgImage);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'OsveshchenieHero', updated);
		data = updated;
	}
</script>

<div class="p1-catalog-container mt-16">
	<section class="relative overflow-hidden rounded-3xl bg-ink-900" data-p1-theme="dark">
		<ImageFallback
			imagePath={['bgImage']}
			src={bgImage}
			alt="Подвесные светильники и бра с тёплым светом"
			class="absolute inset-0 h-full w-full object-cover opacity-40"
		/>

		<div class="relative px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
			<nav class="p1-muted mb-8 flex items-center gap-2 text-sm" aria-label="Навигационная цепочка">
				<a href="/" class="transition-colors hover:text-on-dark">Главная</a>
				<span aria-hidden="true">/</span>
				<span class="p1-title" aria-current="page">Освещение</span>
			</nav>

			<h1 class="p1-title max-w-3xl text-3xl text-balance sm:text-4xl lg:text-5xl">
				<EditableField
					fieldKey="OsveshchenieHero.title"
					label="Заголовок"
					value={String(data.title || 'Освещение')}
					{isEditable}
					inline
					onSave={(value) => saveField('title', value)}
				>
					{#snippet children(value)}<RichText {value} />{/snippet}
				</EditableField>
			</h1>

			<p class="p1-body mt-5 max-w-2xl text-lg leading-relaxed">
				<EditableField
					fieldKey="OsveshchenieHero.description"
					label="Описание"
					value={String(
						data.description ||
							'Подберём светильники для разных зон дома: общий, рабочий и акцентный свет.'
					)}
					{isEditable}
					inline
					multiline
					onSave={(value) => saveField('description', value)}
				>
					{#snippet children(value)}<RichText {value} />{/snippet}
				</EditableField>
			</p>

			<button
				type="button"
				data-metrika-goal="pages_osveshchenie_osveshcheniehero_open_1"
				data-goal-label="Подобрать освещение — страница освещения"
				data-goal-action="open"
				onclick={() => serviceOrderStore.open('consultation')}
				class="mt-9 inline-flex min-h-11 items-center rounded-lg bg-link-700 px-6 py-3 font-medium text-on-accent transition-colors hover:bg-link-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-500"
			>
				<EditableField
					fieldKey="OsveshchenieHero.buttonText"
					label="Текст кнопки"
					value={String(data.buttonText || 'Подобрать освещение')}
					{isEditable}
					inline
					onSave={(value) => saveField('buttonText', value)}
				>
					{#snippet children(value)}<RichText {value} />{/snippet}
				</EditableField>
			</button>
		</div>
	</section>
</div>
