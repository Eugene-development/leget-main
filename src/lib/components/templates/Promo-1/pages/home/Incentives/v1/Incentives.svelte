<script lang="ts">
	// Артикул: 1.1.6.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import {
		INCENTIVES_DEFAULT_TEXT,
		INCENTIVES_DEFAULT_TITLE,
		resolveIncentivesGallery
	} from '../data';
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

	const gallery = $derived(resolveIncentivesGallery(data?.gallery));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Incentives', updated);
		data = updated;
	}

	async function saveGalleryLabel(index: number, value: string) {
		if (!editContext) return;
		const updatedGallery = gallery.map((item, itemIndex) =>
			itemIndex === index ? { ...item, label: value } : item
		);
		const updated = { ...data, gallery: updatedGallery };
		await saveComponentData(editContext, 'Incentives', updated);
		data = updated;
	}
</script>

<!-- Преимущества (Incentives) -->
<section
	class="p1-surface relative overflow-hidden py-section-sm sm:py-section"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid gap-16 lg:grid-cols-2 lg:gap-24">
			<!-- Текст -->
			<!-- Метки над заголовком у блока нет: пилюля «Выгода» удалена 12.08.2026
			     во всех трёх версиях сразу. Ключ `badge` в данных остаётся —
			     переименование или удаление ключа обнулило бы поле у тенантов,
			     которые его уже правили. -->
			<div class="flex flex-col justify-center lg:py-8">
				<EditableField
					fieldKey="Incentives.title"
					label="Заголовок"
					value={String(data?.title ?? INCENTIVES_DEFAULT_TITLE)}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="p1-title text-3xl sm:text-5xl">{displayValue}</h2>
					{/snippet}
				</EditableField>

				<div class="p1-body mt-8 space-y-2 text-base leading-7">
					<EditableField
						fieldKey="Incentives.text"
						label="Текст"
						value={String(data?.text ?? INCENTIVES_DEFAULT_TEXT)}
						{isEditable}
						multiline
						onSave={(v) => saveField('text', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							{@html displayValue}
						{/snippet}
					</EditableField>
				</div>

				<div class="mt-8 h-px w-24 bg-linear-to-r from-link-300 to-cat-5-300"></div>
			</div>

			<!-- Галерея -->
			<div class="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
				<div class="space-y-4 sm:space-y-6 lg:space-y-8">
					{#each gallery.slice(0, 2) as item, index}
						<div
							class="group p1-card p1-border relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-500 hover:shadow-xl hover:ring-ink-300"
						>
							<div class="aspect-4/3 w-full overflow-hidden">
								<ImageFallback
									src={item.src}
									alt={item.alt}
									class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
								/>
							</div>
							<div
								class="absolute inset-0 bg-linear-to-t from-scrim/60 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-70"
							></div>
							<div class="absolute right-6 bottom-6 left-6 text-on-dark">
								<EditableField
									fieldKey={`Incentives.gallery.${index}.label`}
									label={`Подпись карточки ${index + 1}`}
									value={item.label}
									{isEditable}
									onSave={(value) => saveGalleryLabel(index, value)}
									class="block"
								>
									{#snippet children(displayValue)}
										<p class="text-lg leading-tight font-bold break-words">{displayValue}</p>
									{/snippet}
								</EditableField>
							</div>
						</div>
					{/each}
				</div>

				<div class="space-y-4 pt-8 sm:space-y-6 sm:pt-12 lg:space-y-8">
					{#each gallery.slice(2, 4) as item, index}
						<div
							class="group p1-card p1-border relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-500 hover:shadow-xl hover:ring-ink-300"
						>
							<div class="aspect-4/3 w-full overflow-hidden">
								<ImageFallback
									src={item.src}
									alt={item.alt}
									class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
								/>
							</div>
							<div
								class="absolute inset-0 bg-linear-to-t from-scrim/60 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-70"
							></div>
							<div class="absolute right-6 bottom-6 left-6 text-on-dark">
								<EditableField
									fieldKey={`Incentives.gallery.${index + 2}.label`}
									label={`Подпись карточки ${index + 3}`}
									value={item.label}
									{isEditable}
									onSave={(value) => saveGalleryLabel(index + 2, value)}
									class="block"
								>
									{#snippet children(displayValue)}
										<p class="text-lg leading-tight font-bold break-words">{displayValue}</p>
									{/snippet}
								</EditableField>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
