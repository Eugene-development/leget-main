<script lang="ts">
	// Артикул: 3.9.5.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'SocialProof', updated);
		data = updated;
	}

	const defaultReviews = [
		{
			name: 'Анна К.',
			initials: 'АК',
			text: 'Заказывали кухню — результат превзошёл ожидания. Всё точно по размерам, качество фурнитуры отличное. Установили за один день!',
			rating: 5
		},
		{
			name: 'Дмитрий М.',
			initials: 'ДМ',
			text: 'Шкаф-купе сделали за 12 дней. Очень доволен качеством и тем, что цена не изменилась с момента заказа. Рекомендую!',
			rating: 5
		},
		{
			name: 'Елена С.',
			initials: 'ЕС',
			text: 'Оформили рассрочку без проблем. Гардеробная получилась именно такой, как на 3D-визуализации. Спасибо команде!',
			rating: 5
		}
	];

	const reviews = $derived(
		Array.isArray(data?.reviews) && (data.reviews as unknown[]).length > 0
			? (data.reviews as typeof defaultReviews)
			: defaultReviews
	);
</script>

<section class="relative py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<!-- Header -->
		<div class="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
			<div>
				<EditableField
					fieldKey="SocialProof.label"
					label="Лейбл"
					value={String(data?.label ?? 'Отзывы клиентов')}
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
					fieldKey="SocialProof.title"
					label="Заголовок"
					value={String(data?.title ?? 'Нам доверяют сотни клиентов')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="font-display mt-3 text-4xl text-white lg:text-5xl">
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>
			</div>

			<!-- Rating badge -->
			<div
				class="inline-flex items-center gap-3 rounded-2xl border border-surface-700/50 bg-surface-800/30 px-6 py-4"
			>
				<div class="flex gap-0.5">
					{#each Array(5) as _}
						<svg class="size-4 text-accent-500" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
							/>
						</svg>
					{/each}
				</div>
				<div>
					<div class="font-display text-lg font-bold text-accent-500">4.9</div>
					<div class="text-xs text-surface-300">200+ отзывов</div>
				</div>
			</div>
		</div>

		<!-- Reviews grid -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
			{#each reviews as review}
				<div
					class="group relative rounded-2xl border border-surface-700/50 bg-surface-800/30 p-8 transition-all duration-500 hover:border-accent-500/20 hover:bg-surface-800/60"
				>
					<!-- Top accent line -->
					<div
						class="absolute -top-px left-8 h-px w-16 bg-linear-to-r from-transparent via-accent-500/60 to-transparent"
					></div>

					<!-- Stars -->
					<div class="mb-4 flex gap-0.5">
						{#each Array(review.rating) as _}
							<svg class="size-4 text-accent-500" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
								/>
							</svg>
						{/each}
					</div>

					<!-- Quote mark -->
					<div class="font-display mb-4 text-4xl leading-none text-accent-500/20">"</div>

					<p class="flex-1 text-sm leading-relaxed text-surface-300 italic">
						{review.text}
					</p>

					<!-- Author -->
					<div class="mt-6 flex items-center gap-3">
						<div
							class="font-display flex size-10 items-center justify-center rounded-full border border-accent-500/30 bg-accent-500/10 text-sm font-bold text-accent-500"
						>
							{review.initials}
						</div>
						<span class="text-sm font-semibold text-white">{review.name}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
