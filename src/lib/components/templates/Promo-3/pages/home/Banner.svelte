<script lang="ts">
	// Артикул: 3.1.3.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
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
		await saveComponentData(editContext, 'Banner', updated);
		data = updated;
	}

	const defaultFeatures = [
		'Профессиональная 3D-раскладка',
		'Расчёт количества материалов',
		'Подбор затирки и аксессуаров',
		'Консультация дизайнера'
	];

	const features = $derived(
		Array.isArray(data?.features) && (data.features as unknown[]).length > 0
			? (data.features as string[])
			: defaultFeatures
	);
</script>

<section class="relative overflow-hidden py-24 lg:py-32">
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
		<div class="size-[600px] rounded-full bg-accent-500/5 blur-3xl"></div>
	</div>

	<div class="relative px-10 lg:px-24 xl:px-32">
		<div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
			<!-- Left: image -->
			<div class="relative">
				<div class="relative aspect-[4/3] overflow-hidden rounded-2xl">
					<img
						loading="lazy"
						src={String(data?.image ?? '')}
						alt={String(data?.heading ?? '')}
						class="size-full object-cover"
					/>
					<div class="absolute inset-0 rounded-2xl ring-1 ring-white/10 ring-inset"></div>
				</div>
				<!-- Floating card -->
				<div
					class="absolute -right-4 -bottom-6 rounded-xl border border-surface-600 bg-surface-800/90 p-5 shadow-2xl backdrop-blur-xl lg:-right-8"
				>
					<div class="flex items-center gap-3">
						<div class="flex size-12 items-center justify-center rounded-lg bg-accent-500/10">
							<span class="text-2xl">✨</span>
						</div>
						<div>
							<div class="text-sm font-bold text-white">
								{String(data?.floatingTitle ?? '3D-визуализация')}
							</div>
							<div class="text-xs text-surface-300">
								{String(data?.floatingSubtitle ?? 'Бесплатно для заказов')}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right: content -->
			<div>
				<EditableField
					fieldKey="Banner.label"
					label="Лейбл"
					value={String(data?.label ?? 'Для дизайнеров')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase"
							>{displayValue}</span
						>
					{/snippet}
				</EditableField>
				<EditableField
					fieldKey="Banner.heading"
					label="Заголовок"
					value={String(data?.heading ?? 'Визуализируйте пространство до покупки')}
					{isEditable}
					onSave={(v) => saveField('heading', v)}
					class="mt-4 block"
				>
					{#snippet children(displayValue)}
						<h2 class="font-display mt-4 text-4xl text-white lg:text-5xl">{displayValue}</h2>
					{/snippet}
				</EditableField>
				<EditableField
					fieldKey="Banner.description"
					label="Описание"
					value={String(
						data?.description ??
							'Наши специалисты создадут 3D-раскладку плитки в вашем интерьере. Увидьте результат до начала ремонта и будьте уверены в выборе.'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="mt-6 text-lg leading-relaxed text-surface-300">{displayValue}</p>
					{/snippet}
				</EditableField>

				<ul class="mt-8 flex flex-col gap-4">
					{#each features as feature}
						<li class="flex items-center gap-3">
							<div class="flex size-6 items-center justify-center rounded-full bg-accent-500/10">
								<svg viewBox="0 0 12 12" class="size-3 fill-accent-500"
									><path
										d="M10.28 2.28L3.989 8.575 1.695 6.28A.751.751 0 00.633 7.345l2.83 2.83a.75.75 0 001.06 0l6.88-6.83a.751.751 0 00-1.123-1.065z"
									/></svg
								>
							</div>
							<span class="text-sm text-surface-200">{feature}</span>
						</li>
					{/each}
				</ul>

				<EditableField
					fieldKey="Banner.ctaText"
					label="Кнопка"
					value={String(data?.ctaText ?? 'Заказать визуализацию')}
					{isEditable}
					onSave={(v) => saveField('ctaText', v)}
				>
					{#snippet children(displayValue)}
						<a
							href={String(data?.ctaLink ?? '/contacts')}
							class="mt-10 inline-flex items-center gap-3 rounded-xl bg-accent-500 px-8 py-4 text-sm font-bold tracking-wide text-surface-900 uppercase transition-all duration-300 hover:bg-accent-400 hover:shadow-2xl hover:shadow-accent-500/30"
						>
							{displayValue}
						</a>
					{/snippet}
				</EditableField>
			</div>
		</div>
	</div>
</section>
