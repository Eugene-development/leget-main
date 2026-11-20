<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import ContentText from '../../ContentText.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import ImagePickerDialog from '$lib/components/ImagePickerDialog.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import { equipmentDefaults } from '../equipment/content';
	import { blockTheme } from '$lib/utils/block-theme';
	import { setComponentImage } from '$lib/utils/component-images';
	import { editableText } from '$lib/utils/editable-text';
	import { editStore } from '$lib/stores/edit.svelte';
	import { saveComponentData } from '$lib/utils/page-edit';
	import { richTextToPlainText } from '$lib/utils/rich-text';
	import '$lib/components/templates/Promo-1/theme.css';
	import '../equipment/equipment.css';

	type SectionType =
		| 'EquipmentAppliances'
		| 'EquipmentWorktops'
		| 'EquipmentPlumbing'
		| 'EquipmentLighting'
		| 'EquipmentStorage';
	type EquipmentItem = { title: string; description: string; image?: string };
	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		variant = 'v1',
		componentType
	}: PageComponentProps & { componentType: SectionType; variant?: 'v1' | 'v2' } = $props();
	const defaults = $derived(equipmentDefaults[componentType]);
	const items: readonly EquipmentItem[] = $derived(
		Array.isArray(data?.items)
			? (data.items as EquipmentItem[])
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
	const disclosureName = $props.id();
	let editingImageIndex = $state<number | null>(null);
	const editingItem = $derived(editingImageIndex === null ? null : items[editingImageIndex]);
	const canEditImages = $derived(isEditable && !!editContext);

	function imageLabel(item: EquipmentItem, index: number) {
		const title = richTextToPlainText(editableText(item.title)).trim();
		return title ? `Фото материала «${title}»` : `Фото материала ${index + 1}`;
	}

	async function saveItemImage(url: string) {
		const index = editingImageIndex;
		if (!isEditable || !editContext || index === null || !items[index]) {
			throw new Error('Редактирование изображения недоступно');
		}
		const next = setComponentImage({ ...data, items }, ['items', index, 'image'], url);
		await saveComponentData(editContext, componentType, next);
		data = next;
		editingImageIndex = null;
	}

	function openBrandEditor() {
		if (!isEditable || !editContext) return;
		const context = editContext;
		editStore.open({
			key: `${componentType}.addBrands`,
			label: 'Добавить бренды (по одному на строку)',
			value: '',
			multiline: true,
			richText: false,
			async onSave(value) {
				const knownNames = new SvelteSet(
					brands.map((brand) => editableText(brand).trim().toLowerCase())
				);
				const additions = [];
				for (const line of value.split(/\r?\n/)) {
					const name = line.trim();
					const key = name.toLowerCase();
					if (!name || knownNames.has(key)) continue;
					knownNames.add(key);
					additions.push(name);
				}
				if (!additions.length) return;
				const updated = { ...data, brands: [...brands, ...additions] };
				await saveComponentData(context, componentType, updated);
				data = updated;
			}
		});
	}
</script>

{#if editContext && isEditable && editingImageIndex !== null && editingItem}
	<ImagePickerDialog
		{editContext}
		currentImage={editingItem.image ?? ''}
		defaultImage={editingItem.image ?? ''}
		folder="components/equipmentworktops"
		title={imageLabel(editingItem, editingImageIndex)}
		cropUploads
		aspectRatio={2}
		cropMaxWidth={1600}
		cropMaxHeight={800}
		cropOutputMimeType="image/webp"
		onApprove={saveItemImage}
		onRemove={() => saveItemImage('')}
		onClose={() => (editingImageIndex = null)}
	/>
{/if}

{#snippet worktopImage(item: EquipmentItem, index: number)}
	<ImageFallback
		imagePath={['items', index, 'image']}
		imageDefaults={{ items }}
		src={item.image}
		alt={imageLabel(item, index)}
		onImageEdit={() => (editingImageIndex = index)}
		class="h-full w-full object-cover"
		loading="lazy"
	/>
{/snippet}

<!-- Оба варианта редактируют одни и те же поля и используют полный массив при правке. -->
{#snippet heading()}
	<ContentText
		bind:data
		{editContext}
		{isEditable}
		{componentType}
		path={['heading']}
		fallback={defaults.heading}
		label="Заголовок раздела"
	/>
{/snippet}

{#snippet description()}
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
{/snippet}

{#snippet brandsLabel()}
	<ContentText
		bind:data
		{editContext}
		{isEditable}
		{componentType}
		path={['brandsLabel']}
		fallback={equipmentDefaults.EquipmentAppliances.brandsLabel}
		label="Подпись строки брендов"
	/>
{/snippet}

{#snippet brandName(brand: string, index: number)}
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
{/snippet}

{#snippet brandsNote()}
	<ContentText
		bind:data
		{editContext}
		{isEditable}
		{componentType}
		path={['note']}
		fallback={equipmentDefaults.EquipmentAppliances.note}
		label="Примечание к брендам"
	/>
{/snippet}

{#snippet addBrandsButton()}
	<button
		type="button"
		class="inline-flex min-h-11 items-center rounded-md border border-ink-200 bg-surface-raised px-4 py-2 text-sm font-medium text-ink-800 hover:bg-link-50 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
		aria-haspopup="dialog"
		data-goal-ignore="Добавление названий брендов в редакторе компонента"
		onclick={openBrandEditor}
	>
		Добавить бренды
	</button>
{/snippet}

{#snippet itemTitle(item: (typeof items)[number], index: number)}
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
{/snippet}

{#snippet itemDescription(item: (typeof items)[number], index: number)}
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
{/snippet}

{#if variant === 'v2'}
	{@const lighting = componentType === 'EquipmentLighting'}
	<div
		class={['equipment-v2 equipment-section', { 'equipment-warm': warm && !lighting }]}
		data-p1-theme={blockTheme(data, lighting ? 'dark' : 'light')}
	>
		<section class="p2-container" aria-labelledby={`${disclosureName}-title`}>
			<div class="equipment-intro">
				<h2 class="equipment-title" id={`${disclosureName}-title`}>{@render heading()}</h2>
				<p class="equipment-copy">{@render description()}</p>
			</div>

			{#if componentType === 'EquipmentAppliances'}
				<div class="equipment-brand-showcase">
					<p class="equipment-brand-label">{@render brandsLabel()}</p>
					{#if brands.length}
						<ul class="equipment-brands" role="list">
							{#each brands as brand, index (index)}
								<li>{@render brandName(brand, index)}</li>
							{/each}
						</ul>
					{/if}
					<p class="equipment-note">{@render brandsNote()}</p>
					{#if isEditable && editContext}
						<div class="px-4 pb-4 sm:px-8">{@render addBrandsButton()}</div>
					{/if}
				</div>
			{:else if items.length}
				{#if lighting && !isEditable}
					<div class="equipment-lighting">
						<div class="equipment-light-scene" aria-hidden="true">
							<div class="equipment-light-cabinets"></div>
							<div class="equipment-light-counter"></div>
						</div>
						<div class="equipment-disclosures">
							{#each items as item, index (index)}
								{#if editableText(item.title, '').trim()}
									<details name={disclosureName} open={index === 0}>
										<summary>
											<span>{@render itemTitle(item, index)}</span>
											<span class="equipment-expand" aria-hidden="true"></span>
										</summary>
										<p class="equipment-copy">{@render itemDescription(item, index)}</p>
									</details>
								{:else}
									<div class="equipment-disclosure-static">
										<p class="equipment-copy">{@render itemDescription(item, index)}</p>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{:else}
					<ul
						class={[
							'equipment-items',
							{
								'equipment-materials': componentType === 'EquipmentWorktops',
								'equipment-plumbing': componentType === 'EquipmentPlumbing',
								'equipment-storage': componentType === 'EquipmentStorage'
							}
						]}
						role="list"
					>
						{#each items as item, index (index)}
							<li>
								{#if componentType === 'EquipmentWorktops'}
									<div
										class={['equipment-swatch', { 'equipment-swatch-motion': !isEditable }]}
										aria-hidden={item.image || canEditImages ? undefined : true}
									>
										{#if item.image || canEditImages}
											{@render worktopImage(item, index)}
										{/if}
									</div>
								{/if}
								<h3 class="equipment-item-title">{@render itemTitle(item, index)}</h3>
								<p class="equipment-copy">{@render itemDescription(item, index)}</p>
							</li>
						{/each}
					</ul>
				{/if}
			{/if}
		</section>
	</div>
{:else}
	<section class="relative py-section-sm lg:py-section {warm ? 'bg-surface-warm' : 'bg-surface'}">
		<div class="p2-container mx-auto">
			<div class="grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
				<h2
					class="max-w-lg text-section-title text-primary"
					style="font-family: var(--font-heading);"
				>
					{@render heading()}
				</h2>
				<p class="max-w-2xl text-prose text-secondary">
					{@render description()}
				</p>
			</div>
			{#if componentType === 'EquipmentAppliances'}
				<p class="mt-12 text-prose text-secondary">{@render brandsLabel()}</p>
				<ul
					class="mt-5 flex flex-wrap items-center justify-between gap-x-10 gap-y-6 border-y border-border-light py-8 lg:py-10"
				>
					{#each brands as brand, index (index)}
						<li class="text-prose text-primary">{@render brandName(brand, index)}</li>
					{/each}
				</ul>
				<p class="mt-5 text-prose text-secondary">{@render brandsNote()}</p>
				{#if isEditable && editContext}
					<div class="mt-4">{@render addBrandsButton()}</div>
				{/if}
			{:else}
				<div class="mt-12 grid gap-x-12 sm:grid-cols-2 lg:mt-16 lg:gap-x-20">
					{#each items as item, index (index)}
						<div class="border-t border-border-light py-7 lg:py-8">
							{#if componentType === 'EquipmentWorktops' && (item.image || canEditImages)}
								<div class="mb-4 aspect-[2/1] w-full text-secondary">
									{@render worktopImage(item, index)}
								</div>
							{/if}
							<h3
								class="text-card-title text-primary"
								style="font-family: var(--font-heading);"
							>
								{@render itemTitle(item, index)}
							</h3>
							<p class="mt-3 max-w-lg text-prose text-secondary">
								{@render itemDescription(item, index)}
							</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>
{/if}
