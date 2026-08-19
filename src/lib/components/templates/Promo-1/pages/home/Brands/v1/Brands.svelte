<script lang="ts">
	// Артикул: 1.1.8.1 — см. docs/architecture/component-articles-map.md
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
	const isLight = $derived(isLightBlock(data, 'light'));

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

<!--
	Бренды материалов (Brands), версия 1 — «логотипная стена».

	Несущая идея: чужой знак здесь не иконка при тексте, а само содержание.
	Поэтому карточки и тени убраны совсем — ячейки разделены волосяной сеткой,
	а все двенадцать логотипов поставлены в слот одной оптической меры
	(`p1-logo-slot`) и приведены к нейтрали ролью `p1-logo`. До 19.08.2026 знаки
	стояли без слота: замер дал ширины от 32 до 140px при одной высоте, и колонка
	с названием начиналась в каждой карточке на своей широте.
-->
<section class="p1-surface py-section-xs sm:py-section" data-p1-theme={isLight ? 'light' : 'dark'}>
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<!--
				Метка берёт роль `p1-label`, а не пилюлю `bg-link-100 / text-link-700`,
				как было до 19.08.2026. Шкала `link` системная, но абсолютная: замер
				на инвертированном блоке давал ту же светло-синюю плашку на почти
				чёрной поверхности — светлый островок, не зависящий от темы блока.
			-->
			<span class="p1-label p1-muted uppercase">
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
					<h2 class="p1-title mt-3 text-3xl sm:text-4xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
		</div>

		<!-- Стена: ячейки стоят на поверхности секции, зазор в пиксель играет линией -->
		<div
			class="p1-line p1-border mt-12 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3"
		>
			{#each brands as brand}
				<div class="group p1-surface flex flex-col items-center px-6 py-10 text-center">
					<div class="p1-logo-slot p1-body justify-center self-center [--p1-logo-slot:56px]">
						<ImageFallback class="p1-logo" src={brand.logo} alt={brand.name} />
					</div>
					<h3 class="p1-title p1-title-sub mt-7">{brand.name}</h3>
					<span class="p1-label p1-muted mt-1 uppercase">{brand.country}</span>
					<p class="p1-body mt-3 max-w-[34ch] text-sm">{brand.description}</p>
				</div>
			{/each}
		</div>

		<!-- Партнёры-производители: тот же слот и та же роль, ступень мельче -->
		<div class="mt-16">
			<p class="p1-label p1-muted text-center uppercase">
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
			<div class="mt-8 grid grid-cols-3 gap-x-8 gap-y-10 sm:grid-cols-6">
				{#each partners as partner}
					<a
						href={partner.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group p1-logo-slot p1-body justify-center [--p1-logo-slot:32px]"
						aria-label={partner.name}
					>
						<ImageFallback class="p1-logo" src={partner.logo} alt={partner.name} />
					</a>
				{/each}
			</div>

			{#if data?.partnersNote}
				<p class="p1-muted mt-10 text-center text-sm">
					{String(data.partnersNote)}
				</p>
			{/if}
		</div>
	</div>
</section>
