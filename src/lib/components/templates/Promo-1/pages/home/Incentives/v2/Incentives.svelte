<script lang="ts">
	// Артикул: 1.1.6.2 — см. docs/architecture/component-articles-map.md
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

	const gallery = $derived(
		Array.isArray(data?.gallery) && data.gallery.length > 0
			? (data.gallery as { src: string; alt: string; label: string }[])
			: [
					{ src: '', alt: 'Шкафы-купе', label: 'Системы раздвижения' },
					{ src: '', alt: 'Детали', label: 'Фасады' },
					{ src: '', alt: 'Кухни', label: 'Свет' },
					{ src: '', alt: 'Гардеробные', label: 'Гардеробные' }
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Incentives', updated);
		data = updated;
	}
</script>

<section
	class="p1-surface-alt p1-title relative overflow-hidden py-24 font-sans select-none sm:py-32"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid gap-16 lg:grid-cols-12 lg:items-center">
			<!-- Левая колонка: Текст (V2 Outfit style) -->
			<div class="flex flex-col justify-center text-left lg:col-span-5">
				<div class="mb-6">
					<span
						class="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-sky-600 uppercase backdrop-blur-md"
					>
						<svg
							class="h-4 w-4 text-sky-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2.5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<EditableField
							fieldKey="Incentives.badge"
							label="Метка"
							value={String(data?.badge ?? 'Выгода')}
							{isEditable}
							onSave={(v) => saveField('badge', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</span>
				</div>

				<EditableField
					fieldKey="Incentives.title"
					label="Заголовок"
					value={String(data?.title ?? 'С нами выгодно')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="p1-title font-display text-3xl leading-tight font-extrabold tracking-tight md:text-5xl"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<div class="p1-body mt-8 space-y-4 text-base leading-relaxed">
					<EditableField
						fieldKey="Incentives.text"
						label="Текст"
						value={String(data?.text ?? '')}
						{isEditable}
						multiline
						onSave={(v) => saveField('text', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<div class="p1-body font-medium">{@html displayValue}</div>
						{/snippet}
					</EditableField>
				</div>

				<div class="mt-10 flex items-center gap-3">
					<span class="h-1 w-12 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"></span>
					<span class="p1-muted font-display text-xs font-bold tracking-widest uppercase"
						>Ваш умный выбор</span
					>
				</div>
			</div>

			<!-- Правая колонка: Асимметричная мозаика (V2 Masonry Grid) -->
			<div class="grid grid-cols-2 gap-4 sm:gap-6 lg:col-span-7">
				<!-- Левый блок мозаики -->
				<div class="flex flex-col justify-center gap-4 sm:gap-6">
					{#each gallery.slice(0, 2) as item}
						<div
							class="group p1-card p1-border relative overflow-hidden rounded-3xl border shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
						>
							<div class="aspect-[4/3] w-full overflow-hidden">
								<ImageFallback
									src={item.src}
									alt={item.alt}
									class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
								/>
							</div>
							<div
								class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"
							></div>
							<!-- Стеклянный шильдик названия на V2 -->
							<div
								class="absolute right-4 bottom-4 left-4 rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-white backdrop-blur-md"
							>
								<p class="font-display text-xs font-bold tracking-wide uppercase md:text-sm">
									{item.label}
								</p>
							</div>
						</div>
					{/each}
				</div>

				<!-- Правый блок со смещением по вертикали -->
				<div class="flex flex-col gap-4 pt-10 sm:gap-6 sm:pt-16">
					{#each gallery.slice(2, 4) as item}
						<div
							class="group p1-card p1-border relative overflow-hidden rounded-3xl border shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
						>
							<div class="aspect-[4/3] w-full overflow-hidden">
								<ImageFallback
									src={item.src}
									alt={item.alt}
									class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
								/>
							</div>
							<div
								class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"
							></div>
							<!-- Стеклянный шильдик названия на V2 -->
							<div
								class="absolute right-4 bottom-4 left-4 rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-white backdrop-blur-md"
							>
								<p class="font-display text-xs font-bold tracking-wide uppercase md:text-sm">
									{item.label}
								</p>
							</div>
						</div>
					{/each}
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
