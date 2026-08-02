<script lang="ts">
	// Артикул: 2.14.5.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
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

	let visible = $state(false);
	let sectionEl: HTMLElement;

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

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => { entries.forEach((e) => { if (e.isIntersecting) visible = true; }); },
			{ threshold: 0.2, rootMargin: '0px 0px -80px 0px' }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section class="relative overflow-hidden bg-surface-warm py-section-sm lg:py-section" bind:this={sectionEl}>
	<div class="mx-auto max-w-7xl px-6 xl:px-1">
		<!-- Header -->
		<div class="mb-16 flex flex-col gap-4 opacity-0 transition-all duration-700 lg:flex-row lg:items-end lg:justify-between" class:animate-fade-up={visible}>
			<div>
				<EditableField
					fieldKey="SocialProof.label"
					label="Лейбл"
					value={String(data?.label ?? 'Отзывы клиентов')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
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
						<h2
							class="mt-3 text-4xl font-light text-primary lg:text-5xl"
							style="font-family: var(--font-heading);"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>
			</div>

			<!-- Rating summary -->
			<div class="flex items-center gap-3 border border-border-light bg-white px-6 py-4">
				<div class="flex gap-0.5">
					{#each Array(5) as _}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-accent">
							<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
						</svg>
					{/each}
				</div>
				<div>
					<div class="text-sm font-medium text-primary">4.9 / 5</div>
					<div class="text-[11px] tracking-widest text-muted uppercase">200+ отзывов</div>
				</div>
			</div>
		</div>

		<!-- Reviews grid -->
		<div class="grid gap-px bg-border-light sm:grid-cols-3">
			{#each reviews as review, i}
				<div
					class="flex flex-col gap-6 bg-white p-8 opacity-0 transition-all duration-300 hover:bg-surface-warm/30"
					class:animate-fade-up={visible}
					style="animation-delay: {0.1 + i * 0.12}s"
				>
					<!-- Stars -->
					<div class="flex gap-0.5">
						{#each Array(review.rating) as _}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="text-accent">
								<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
							</svg>
						{/each}
					</div>

					<!-- Quote line -->
					<div class="h-px w-8 bg-accent"></div>

					<p class="flex-1 text-sm leading-relaxed text-secondary italic">
						«{review.text}»
					</p>

					<!-- Author -->
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center border border-border-medium text-xs font-medium text-secondary">
							{review.initials}
						</div>
						<span class="text-sm font-medium text-primary">{review.name}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
