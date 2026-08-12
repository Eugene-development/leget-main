<script lang="ts">
	// Артикул: 1.1.8.2 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Нейтральная палитра — из классов p1-*; акценты от темы не зависят.
	const isLight = $derived(isLightBlock(data, 'dark'));

	const brands = $derived(
		Array.isArray(data?.brands) && data.brands.length > 0
			? (data.brands as { name: string; logo: string; country: string; description: string }[])
			: [
					{
						name: 'BLUM',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/blum-Logo.png',
						country: 'Австрия',
						description: 'Компания BLUM занимается производством премиальной мебельной фурнитуры'
					},
					{
						name: 'Hettich',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/hettich-Logo.png',
						country: 'Германия',
						description:
							'Бренд, специализирующийся на производстве мебельной фурнитуры высокого класса'
					},
					{
						name: 'FGV',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/FGV-Logo.png',
						country: 'Италия',
						description:
							'Компания, специализирующаяся на производстве систем выдвижения и мебельных петель'
					},
					{
						name: 'Egger',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/egger-Logo.png',
						country: 'Австрия',
						description:
							'Производство плитных материалов различной толщины для каркасов и мебельных фасадов'
					},
					{
						name: 'Renolit',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/Renolit_logo.svg.png',
						country: 'Германия',
						description:
							'Высококачественные полимерные пленки и термопластик для фасадов различного цвета'
					},
					{
						name: 'GTV',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/GTV-Logo.png',
						country: 'Польша',
						description:
							'Доступная и качественная мебельная фурнитура и освещение с доставкой по всему миру'
					}
				]
	);

	const partners = $derived(
		Array.isArray(data?.partners) && data.partners.length > 0
			? (data.partners as { name: string; logo: string; url: string }[])
			: [
					{ name: 'ЗОВ', logo: 'https://zov.com.by/images/logo3.png', url: 'https://zov.top/' },
					{
						name: 'Стильные кухни',
						logo: 'https://avatars.mds.yandex.net/i?id=ada48033e9cfa95f38d69fc9ae7b5bcc25b72f13-5037427-images-thumbs&n=13',
						url: 'https://www.stilkuhni.ru/'
					},
					{
						name: 'Мария',
						logo: 'https://avatars.mds.yandex.net/i?id=b761d395235060d89bd5d574233ee6bca202edcb-2037526-images-thumbs&n=13',
						url: 'https://www.marya.ru/'
					},
					{
						name: 'Мистер Дорс',
						logo: 'https://avatars.mds.yandex.net/i?id=cf4673eacc853d6f062852c16c8f10af8dd28ace-7909006-images-thumbs&n=13',
						url: 'https://www.mrdoors.ru/'
					},
					{
						name: 'Кухонный двор',
						logo: 'https://avatars.mds.yandex.net/i?id=a74ec62d72576744e414d4b9ac3b0455aa296a51-4477047-images-thumbs&n=13',
						url: 'https://www.kuxni.net/'
					},
					{
						name: 'Аристо',
						logo: 'https://www.aristo.ru/include/logo_header.png',
						url: 'https://www.aristo.ru'
					}
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Brands', updated);
		data = updated;
	}
</script>

<section
	class="p1-surface p1-title relative overflow-hidden py-section-xs font-sans select-none sm:py-section"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<!-- Вспомогательные светящиеся бэкдропы -->
	<div
		class="pointer-events-none absolute top-10 left-10 h-96 w-96 rounded-full bg-link-500/5 blur-3xl"
	></div>
	<div
		class="pointer-events-none absolute right-10 bottom-10 h-96 w-96 rounded-full bg-cat-3-600/5 blur-3xl"
	></div>

	<div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
		<!-- Заголовок -->
		<div class="mx-auto max-w-2xl text-center">
			<span
				class="inline-flex items-center gap-2 rounded-full border border-link-500/30 bg-link-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-link-300 uppercase"
			>
				<EditableField
					fieldKey="Brands.badge"
					label="Метка"
					value={String(data?.badge ?? 'Материалы')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</span>
			<EditableField
				fieldKey="Brands.title"
				label="Заголовок"
				value={String(data?.title ?? 'Бренды, говорящие о качестве')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="p1-title font-display mt-4 text-3xl sm:text-4xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
		</div>

		<!-- Карточки брендов (V2 Carbon Dark Glassmorphism) -->
		<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each brands as brand}
				<div
					class="group p1-border p1-card hover:p1-card rounded-3xl border p-6 transition-all duration-300 hover:border-link-500/30 hover:shadow-2xl hover:shadow-link-500/5"
				>
					<div class="flex items-center gap-4">
						<div
							class="p1-card p1-border group-hover:p1-card rounded-2xl border p-2.5 transition-all duration-300 group-hover:border-link-500/20"
						>
							<ImageFallback
								class="h-8 w-auto brightness-0 invert filter"
								src={brand.logo}
								alt={brand.name}
							/>
						</div>
						<div>
							<h3
								class="p1-title p1-title-sub transition-colors duration-300 group-hover:text-link-300"
							>
								{brand.name}
							</h3>
							<p
								class="p1-muted group-hover:p1-muted text-xs font-semibold tracking-wider uppercase transition-colors duration-300"
							>
								{brand.country}
							</p>
						</div>
					</div>
					<p
						class="p1-muted group-hover:p1-body mt-4 text-sm leading-relaxed transition-colors duration-300"
					>
						{brand.description}
					</p>
				</div>
			{/each}
		</div>

		<!-- Партнёры-производители -->
		<div class="p1-border mt-16 border-t pt-12">
			<p class="p1-muted text-center text-xs font-bold tracking-widest uppercase">
				<EditableField
					fieldKey="Brands.partnersLabel"
					label="Подпись партнёров"
					value={String(data?.partnersLabel ?? 'Наши партнёры-производители')}
					{isEditable}
					onSave={(v) => saveField('partnersLabel', v)}
					inline
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</p>

			<!-- Минималистичная карусель партнеров на V2 -->
			<div class="mt-10 grid grid-cols-3 items-center gap-8 sm:grid-cols-6">
				{#each partners as partner}
					<a
						href={partner.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex items-center justify-center"
					>
						<ImageFallback
							class="h-10 w-auto opacity-40 brightness-0 grayscale invert filter transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0 group-hover:filter"
							src={partner.logo}
							alt={partner.name}
						/>
					</a>
				{/each}
			</div>

			{#if data?.partnersNote}
				<div class="mt-12 text-center">
					<p
						class="p1-border p1-card p1-body inline-flex items-center gap-2 rounded-full border px-6 py-2 text-xs font-semibold tracking-wider uppercase backdrop-blur-md"
					>
						{String(data.partnersNote)}
					</p>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	/* Outfit font is loaded once in Promo-1 layout/Header.svelte */

	.font-display {
		font-family: 'Outfit', sans-serif;
	}
</style>
