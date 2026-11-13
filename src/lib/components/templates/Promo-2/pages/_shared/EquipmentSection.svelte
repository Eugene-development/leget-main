<script lang="ts">
	import ContentText from '../../ContentText.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import { equipmentDefaults } from '../equipment/content';

	type SectionType =
		| 'EquipmentAppliances'
		| 'EquipmentWorktops'
		| 'EquipmentPlumbing'
		| 'EquipmentLighting'
		| 'EquipmentStorage';
	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		componentType
	}: PageComponentProps & { componentType: SectionType } = $props();
	const defaults = $derived(equipmentDefaults[componentType]);
	const items = $derived(
		Array.isArray(data?.items)
			? (data.items as { title: string; description: string }[])
			: 'items' in defaults
				? defaults.items
				: []
	);
	const brands = $derived(
		Array.isArray(data?.brands)
			? (data.brands as string[])
			: 'brands' in defaults
				? defaults.brands
				: []
	);
	const warm = $derived(
		componentType === 'EquipmentWorktops' || componentType === 'EquipmentLighting'
	);
</script>

<section class="relative py-section-sm lg:py-section {warm ? 'bg-surface-warm' : 'bg-surface'}">
	<div class="p2-container mx-auto">
		<div class="grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
			<h2
				class="max-w-lg text-3xl text-primary lg:text-5xl"
				style="font-family: var(--font-heading);"
			>
				<ContentText
					bind:data
					{editContext}
					{isEditable}
					{componentType}
					path={['heading']}
					fallback={defaults.heading}
					label="Заголовок раздела"
				/>
			</h2>
			<p class="max-w-2xl text-base leading-relaxed text-secondary lg:text-lg">
				<ContentText
					bind:data
					{editContext}
					{isEditable}
					{componentType}
					path={['description']}
					fallback={defaults.description}
					label="Описание раздела"
					multiline
				/>
			</p>
		</div>
		{#if componentType === 'EquipmentAppliances'}
			<p class="mt-12 text-sm text-secondary">
				<ContentText
					bind:data
					{editContext}
					{isEditable}
					{componentType}
					path={['brandsLabel']}
					fallback={equipmentDefaults.EquipmentAppliances.brandsLabel}
					label="Подпись строки брендов"
				/>
			</p>
			<ul
				class="mt-5 flex flex-wrap items-center justify-between gap-x-10 gap-y-6 border-y border-border-light py-8 lg:py-10"
			>
				{#each brands as brand, index}
					<li class="text-xl text-primary lg:text-2xl">
						<ContentText
							bind:data
							{editContext}
							{isEditable}
							{componentType}
							path={['brands', index]}
							fallback={brand}
							defaults={{ brands: [...brands] }}
							label="Название бренда"
							richText={false}
						/>
					</li>
				{/each}
			</ul>
			<p class="mt-5 text-sm leading-relaxed text-secondary">
				<ContentText
					bind:data
					{editContext}
					{isEditable}
					{componentType}
					path={['note']}
					fallback={equipmentDefaults.EquipmentAppliances.note}
					label="Примечание к брендам"
				/>
			</p>
		{:else}
			<div class="mt-12 grid gap-x-12 sm:grid-cols-2 lg:mt-16 lg:gap-x-20">
				{#each items as item, index}
					<div class="border-t border-border-light py-7 lg:py-8">
						<h3 class="text-2xl text-primary lg:text-3xl" style="font-family: var(--font-heading);">
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								{componentType}
								path={['items', index, 'title']}
								fallback={item.title}
								defaults={{ items: [...items] }}
								label="Название элемента"
							/>
						</h3>
						<p class="mt-3 max-w-lg text-sm leading-relaxed text-secondary lg:text-base">
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								{componentType}
								path={['items', index, 'description']}
								fallback={item.description}
								defaults={{ items: [...items] }}
								label="Описание элемента"
								multiline
							/>
						</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
