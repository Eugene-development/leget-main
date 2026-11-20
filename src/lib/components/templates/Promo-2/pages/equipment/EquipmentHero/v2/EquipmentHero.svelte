<script lang="ts">
	// Артикул: 2.17.1.2 — см. docs/architecture/component-articles-map.md
	import ContentText from '../../../../ContentText.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import { blockTheme } from '$lib/utils/block-theme';
	import '$lib/components/templates/Promo-1/theme.css';
	import { equipmentDefaults } from '../../content';
	import '../../equipment.css';

	let { data = $bindable(), editContext = null, isEditable = false }: PageComponentProps = $props();
	const defaults = equipmentDefaults.EquipmentHero;
</script>

<section class="equipment-v2 equipment-hero" data-p1-theme={blockTheme(data)}>
	<div class="equipment-hero-grid p2-container">
		<div class="equipment-hero-copy">
			<h1 class="equipment-title">
				<ContentText
					bind:data
					{editContext}
					{isEditable}
					componentType="EquipmentHero"
					path={['heading']}
					fallback={defaults.heading}
					label="Заголовок страницы"
				/>
			</h1>
			<p class="equipment-hero-subtitle">
				<ContentText
					bind:data
					{editContext}
					{isEditable}
					componentType="EquipmentHero"
					path={['subtitle']}
					fallback={defaults.subtitle}
					label="Подзаголовок"
				/>
			</p>
			<p class="equipment-copy">
				<ContentText
					bind:data
					{editContext}
					{isEditable}
					componentType="EquipmentHero"
					path={['description']}
					fallback={defaults.description}
					label="Описание"
					multiline
				/>
			</p>
		</div>
		<div class={['equipment-hero-media', { 'equipment-hero-entrance': !isEditable }]}>
			<ImageFallback
				imagePath={['image']}
				src={String(data?.image ?? defaults.image)}
				alt={String(data?.imageAlt ?? defaults.imageAlt)}
				class="h-full w-full object-cover"
				loading="eager"
				fetchpriority="high"
			/>
		</div>
	</div>
</section>
