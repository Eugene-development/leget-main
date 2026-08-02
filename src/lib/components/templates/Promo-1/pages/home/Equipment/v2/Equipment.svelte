<script lang="ts">
	// Артикул: 1.1.4.2 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Equipment', updated);
		data = updated;
	}
</script>

<section class="relative overflow-hidden bg-slate-950 py-24 sm:py-32 font-sans select-none text-white">
	<!-- Вспомогательные светящиеся бэкдропы -->
	<div class="absolute left-1/4 top-1/4 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none"></div>
	<div class="absolute right-1/4 bottom-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none"></div>

	<div class="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
		<!-- Заголовок -->
		<div class="mx-auto mb-16 max-w-2xl text-center lg:max-w-none lg:text-left">
			<span class="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300 backdrop-blur-md">
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
					<h2 class="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl font-display leading-tight">{displayValue}</h2>
				{/snippet}
			</EditableField>
		</div>

		<!-- Grid Bento Layout (V2 Carbon Glassmorphism) -->
		<div class="grid gap-6 sm:gap-8 lg:grid-cols-6 lg:grid-rows-2">
			
			<!-- Столешницы (3 колонки) -->
			<div class="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 shadow-lg backdrop-blur-xl transition-all duration-500 hover:border-sky-500/30 hover:bg-slate-900/60 lg:col-span-3">
				<div class="aspect-video w-full overflow-hidden relative">
					<ImageFallback class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={String(data?.item1Image ?? '')} alt="Столешницы" />
					<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
				</div>
				<div class="p-8">
					<h3 class="text-xl font-bold text-white transition-colors group-hover:text-sky-300">
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
					<p class="mt-3 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
						<EditableField
							fieldKey="Equipment.item1Description"
							label="Описание"
							value={String(data?.item1Description ?? 'Широкий выбор дизайнов для вашей кухни. Качественные столешницы от ведущих производителей. Большой выбор материалов и цветов')}
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
			<div class="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 shadow-lg backdrop-blur-xl transition-all duration-500 hover:border-sky-500/30 hover:bg-slate-900/60 lg:col-span-3">
				<div class="aspect-video w-full overflow-hidden relative">
					<ImageFallback class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={String(data?.item2Image ?? '')} alt="Системы выдвижения" />
					<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
				</div>
				<div class="p-8">
					<h3 class="text-xl font-bold text-white transition-colors group-hover:text-sky-300">
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
					<p class="mt-3 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
						<EditableField
							fieldKey="Equipment.item2Description"
							label="Описание"
							value={String(data?.item2Description ?? 'Современные механизмы Hettich и BLUM, обеспечивающие плавность, надежность и бесшумность. Широкий ассортимент для комфортного хранения')}
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
			<div class="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 shadow-lg backdrop-blur-xl transition-all duration-500 hover:border-sky-500/30 hover:bg-slate-900/60 lg:col-span-2">
				<div class="aspect-square w-full overflow-hidden relative">
					<ImageFallback class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={String(data?.item3Image ?? '')} alt="Бытовая техника" />
					<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
				</div>
				<div class="p-6">
					<h3 class="text-lg font-bold text-white transition-colors group-hover:text-sky-300">
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
					<p class="mt-2 text-xs leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
						<EditableField
							fieldKey="Equipment.item3Description"
							label="Описание"
							value={String(data?.item3Description ?? 'Встраиваемая и отдельностоящая техника от проверенных производителей с гарантией')}
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
			<div class="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 shadow-lg backdrop-blur-xl transition-all duration-500 hover:border-sky-500/30 hover:bg-slate-900/60 lg:col-span-2">
				<div class="aspect-square w-full overflow-hidden relative">
					<ImageFallback class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={String(data?.item4Image ?? '')} alt="Мойки и смесители" />
					<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
				</div>
				<div class="p-6">
					<h3 class="text-lg font-bold text-white transition-colors group-hover:text-sky-300">
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
					<p class="mt-2 text-xs leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
						<EditableField
							fieldKey="Equipment.item4Description"
							label="Описание"
							value={String(data?.item4Description ?? 'Качественная сантехника от ведущих мировых производителей с гарантией до 5 лет')}
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
			<div class="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 shadow-lg backdrop-blur-xl transition-all duration-500 hover:border-sky-500/30 hover:bg-slate-900/60 lg:col-span-2">
				<div class="aspect-square w-full overflow-hidden relative">
					<ImageFallback class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={String(data?.item5Image ?? '')} alt="Освещение" />
					<div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
				</div>
				<div class="p-6">
					<h3 class="text-lg font-bold text-white transition-colors group-hover:text-sky-300">
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
					<p class="mt-2 text-xs leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
						<EditableField
							fieldKey="Equipment.item5Description"
							label="Описание"
							value={String(data?.item5Description ?? 'Комфортное освещение для создания уютной атмосферы в каждом уголке вашего дома')}
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
