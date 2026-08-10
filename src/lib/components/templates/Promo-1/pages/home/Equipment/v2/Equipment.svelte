<script lang="ts">
	// Артикул: 1.1.4.2 — см. docs/architecture/component-articles-map.md
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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Equipment', updated);
		data = updated;
	}
</script>

<section
	class="p1-surface p1-title relative overflow-hidden py-24 font-sans select-none sm:py-32"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<!-- Вспомогательные светящиеся бэкдропы -->
	<div
		class="pointer-events-none absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-link-500/5 blur-[120px]"
	></div>
	<div
		class="pointer-events-none absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-cat-3-500/5 blur-[120px]"
	></div>

	<div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
		<!-- Заголовок -->
		<div class="mx-auto mb-16 max-w-2xl text-center lg:max-w-none lg:text-left">
			<span
				class="inline-flex items-center rounded-full border border-link-500/30 bg-link-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-link-300 uppercase backdrop-blur-md"
			>
				<EditableField
					fieldKey="Equipment.badge"
					label="Метка"
					value={String(data?.badge ?? 'Дополнительно')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</span>
			<EditableField
				fieldKey="Equipment.title"
				label="Заголовок"
				value={String(data?.title ?? 'Комплектация проектов')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="p1-title font-display mt-4 text-3xl sm:text-5xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
		</div>

		<!-- Grid Bento Layout (V2 Carbon Glassmorphism) -->
		<div class="grid gap-6 sm:gap-8 lg:grid-cols-6 lg:grid-rows-2">
			<!-- Столешницы (3 колонки) -->
			<div
				class="group p1-border p1-card hover:p1-card relative overflow-hidden rounded-3xl border shadow-lg backdrop-blur-xl transition-all duration-500 hover:border-link-500/30 lg:col-span-3"
			>
				<div class="relative aspect-video w-full overflow-hidden">
					<ImageFallback
						class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						src={String(data?.item1Image ?? '')}
						alt="Столешницы"
					/>
					<div
						class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"
					></div>
				</div>
				<div class="p-8">
					<h3 class="p1-title p1-title-sub text-xl transition-colors group-hover:text-link-300">
						<EditableField
							fieldKey="Equipment.item1Title"
							label="Заголовок"
							value={String(data?.item1Title ?? 'Столешницы')}
							{isEditable}
							inline
							onSave={(v) => saveField('item1Title', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</h3>
					<p
						class="p1-muted group-hover:p1-body mt-3 text-sm leading-relaxed transition-colors duration-300"
					>
						<EditableField
							fieldKey="Equipment.item1Description"
							label="Описание"
							value={String(
								data?.item1Description ??
									'Широкий выбор дизайнов для вашей кухни. Качественные столешницы от ведущих производителей. Большой выбор материалов и цветов'
							)}
							{isEditable}
							multiline
							inline
							onSave={(v) => saveField('item1Description', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</p>
				</div>
			</div>

			<!-- Системы выдвижения (3 колонки) -->
			<div
				class="group p1-border p1-card hover:p1-card relative overflow-hidden rounded-3xl border shadow-lg backdrop-blur-xl transition-all duration-500 hover:border-link-500/30 lg:col-span-3"
			>
				<div class="relative aspect-video w-full overflow-hidden">
					<ImageFallback
						class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						src={String(data?.item2Image ?? '')}
						alt="Системы выдвижения"
					/>
					<div
						class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"
					></div>
				</div>
				<div class="p-8">
					<h3 class="p1-title p1-title-sub text-xl transition-colors group-hover:text-link-300">
						<EditableField
							fieldKey="Equipment.item2Title"
							label="Заголовок"
							value={String(data?.item2Title ?? 'Системы выдвижения')}
							{isEditable}
							inline
							onSave={(v) => saveField('item2Title', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</h3>
					<p
						class="p1-muted group-hover:p1-body mt-3 text-sm leading-relaxed transition-colors duration-300"
					>
						<EditableField
							fieldKey="Equipment.item2Description"
							label="Описание"
							value={String(
								data?.item2Description ??
									'Современные механизмы Hettich и BLUM, обеспечивающие плавность, надежность и бесшумность. Широкий ассортимент для комфортного хранения'
							)}
							{isEditable}
							multiline
							inline
							onSave={(v) => saveField('item2Description', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</p>
				</div>
			</div>

			<!-- Бытовая техника (2 колонки) -->
			<div
				class="group p1-border p1-card hover:p1-card relative overflow-hidden rounded-3xl border shadow-lg backdrop-blur-xl transition-all duration-500 hover:border-link-500/30 lg:col-span-2"
			>
				<div class="relative aspect-square w-full overflow-hidden">
					<ImageFallback
						class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						src={String(data?.item3Image ?? '')}
						alt="Бытовая техника"
					/>
					<div
						class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"
					></div>
				</div>
				<div class="p-6">
					<h3 class="p1-title p1-title-sub text-lg transition-colors group-hover:text-link-300">
						<EditableField
							fieldKey="Equipment.item3Title"
							label="Заголовок"
							value={String(data?.item3Title ?? 'Бытовая техника')}
							{isEditable}
							inline
							onSave={(v) => saveField('item3Title', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</h3>
					<p
						class="p1-muted group-hover:p1-body mt-2 text-xs leading-relaxed transition-colors duration-300"
					>
						<EditableField
							fieldKey="Equipment.item3Description"
							label="Описание"
							value={String(
								data?.item3Description ??
									'Встраиваемая и отдельностоящая техника от проверенных производителей с гарантией'
							)}
							{isEditable}
							multiline
							inline
							onSave={(v) => saveField('item3Description', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</p>
				</div>
			</div>

			<!-- Мойки и смесители (2 колонки) -->
			<div
				class="group p1-border p1-card hover:p1-card relative overflow-hidden rounded-3xl border shadow-lg backdrop-blur-xl transition-all duration-500 hover:border-link-500/30 lg:col-span-2"
			>
				<div class="relative aspect-square w-full overflow-hidden">
					<ImageFallback
						class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						src={String(data?.item4Image ?? '')}
						alt="Мойки и смесители"
					/>
					<div
						class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"
					></div>
				</div>
				<div class="p-6">
					<h3 class="p1-title p1-title-sub text-lg transition-colors group-hover:text-link-300">
						<EditableField
							fieldKey="Equipment.item4Title"
							label="Заголовок"
							value={String(data?.item4Title ?? 'Мойки и смесители')}
							{isEditable}
							inline
							onSave={(v) => saveField('item4Title', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</h3>
					<p
						class="p1-muted group-hover:p1-body mt-2 text-xs leading-relaxed transition-colors duration-300"
					>
						<EditableField
							fieldKey="Equipment.item4Description"
							label="Описание"
							value={String(
								data?.item4Description ??
									'Качественная сантехника от ведущих мировых производителей с гарантией до 5 лет'
							)}
							{isEditable}
							multiline
							inline
							onSave={(v) => saveField('item4Description', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</p>
				</div>
			</div>

			<!-- Освещение (2 колонки) -->
			<div
				class="group p1-border p1-card hover:p1-card relative overflow-hidden rounded-3xl border shadow-lg backdrop-blur-xl transition-all duration-500 hover:border-link-500/30 lg:col-span-2"
			>
				<div class="relative aspect-square w-full overflow-hidden">
					<ImageFallback
						class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						src={String(data?.item5Image ?? '')}
						alt="Освещение"
					/>
					<div
						class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"
					></div>
				</div>
				<div class="p-6">
					<h3 class="p1-title p1-title-sub text-lg transition-colors group-hover:text-link-300">
						<EditableField
							fieldKey="Equipment.item5Title"
							label="Заголовок"
							value={String(data?.item5Title ?? 'Зональное освещение')}
							{isEditable}
							inline
							onSave={(v) => saveField('item5Title', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</h3>
					<p
						class="p1-muted group-hover:p1-body mt-2 text-xs leading-relaxed transition-colors duration-300"
					>
						<EditableField
							fieldKey="Equipment.item5Description"
							label="Описание"
							value={String(
								data?.item5Description ??
									'Комфортное освещение для создания уютной атмосферы в каждом уголке вашего дома'
							)}
							{isEditable}
							multiline
							inline
							onSave={(v) => saveField('item5Description', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* Outfit font is loaded once in Promo-1 layout/Header.svelte */

	.font-display {
		font-family: 'Outfit', sans-serif;
	}
</style>
