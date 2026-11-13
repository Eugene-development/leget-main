<script lang="ts">
	// Артикул: 2.17.1.1 — см. docs/architecture/component-articles-map.md
	import ContentText from '../../ContentText.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import { equipmentDefaults } from './content';
	let { data = $bindable(), editContext = null, isEditable = false }: PageComponentProps = $props();
	const defaults = equipmentDefaults.EquipmentHero;
</script>

<section class="relative overflow-hidden bg-surface-warm">
	<div
		class="p2-container mx-auto grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24"
	>
		<div>
			<h1
				class="text-5xl text-primary md:text-6xl lg:text-7xl"
				style="font-family: var(--font-heading);"
			>
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
			<p
				class="mt-6 max-w-lg text-2xl text-secondary md:text-3xl"
				style="font-family: var(--font-heading);"
			>
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
			<div class="my-8 h-px w-16 bg-accent" aria-hidden="true"></div>
			<p class="max-w-xl text-base leading-relaxed text-secondary lg:text-lg">
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
		<div class="aspect-[4/3] overflow-hidden lg:aspect-[5/6]">
			<ImageFallback
				imagePath={['image']}
				src={String(data?.image ?? defaults.image)}
				alt={String(data?.imageAlt ?? defaults.imageAlt)}
				class="h-full w-full object-cover"
			/>
		</div>
	</div>
</section>
