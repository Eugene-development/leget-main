<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { revealOnScroll } from './theme';
	import './theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'TestimonialsSummary', updated);
		data = updated;
	}

	const defaultStats = [
		{ value: '500+', label: 'отзывов' },
		{ value: '98%', label: 'рекомендуют друзьям' },
		{ value: '20 лет', label: 'на рынке' },
		{ value: '24 ч', label: 'ответ на обращение' }
	];

	async function updateStat(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedStats = [...stats];
		updatedStats[index] = { ...updatedStats[index], [field]: value };
		await saveField('stats', updatedStats);
	}

	const stats = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultStats)
			: defaultStats
	);

	const rating = $derived(String(data?.rating ?? '4.9'));

	/**
	 * Доля заполнения каждой из пяти звёзд. Рейтинг приходит строкой и правится
	 * вручную, поэтому парсим мягко: запятая как разделитель, мусор → 0,
	 * значение зажимаем в 0…5, чтобы разметка не поехала.
	 */
	const ratingValue = $derived(
		Math.min(5, Math.max(0, Number.parseFloat(rating.replace(',', '.')) || 0))
	);

	const starFills = $derived([0, 1, 2, 3, 4].map((i) => Math.min(1, Math.max(0, ratingValue - i))));
</script>

<!--
	Сводка перед сеткой отзывов: средняя оценка со звёздами и ключевые цифры.
	Стоит между Hero и TestimonialsGrid, поэтому фон — та же тёплая поверхность
	`--color-surface`, в цвет волны Hero (см. `--th-wave` в Hero.svelte).
	Верхняя кромка без градиента, иначе на стыке с волной появится полоса.
-->
<section class="relative isolate overflow-hidden bg-surface pt-16 pb-4 sm:pt-20">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="tm-rules"></div>
	</div>

	<div use:revealOnScroll class="tm-reveal relative mx-auto max-w-7xl px-6 lg:px-8">
		<div
			class="tm-card overflow-hidden rounded-4xl border border-ink-900/10 bg-surface-raised shadow-[0_40px_100px_-60px_rgba(24,24,27,0.45)]"
		>
			<div
				class="pointer-events-none h-px w-full bg-linear-to-r from-transparent via-cat-7-500/70 to-transparent"
				aria-hidden="true"
			></div>

			<div
				class="grid gap-10 p-8 sm:p-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-center lg:gap-14"
			>
				<!-- Средняя оценка -->
				<div class="text-center lg:text-left">
					<div class="flex items-baseline justify-center gap-2 lg:justify-start">
						<span class="text-6xl font-semibold tracking-[-0.04em] text-ink-900 tabular-nums">
							<EditableField
								fieldKey="TestimonialsSummary.rating"
								label="Средняя оценка"
								value={rating}
								{isEditable}
								inline
								onSave={(v) => saveField('rating', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</span>
						<span class="text-lg text-ink-400">/ 5</span>
					</div>

					<!-- Звёзды: серая подложка + золотой слой, обрезанный по доле заполнения -->
					<div
						class="mt-4 flex items-center justify-center gap-1 lg:justify-start"
						role="img"
						aria-label="Средняя оценка {rating} из 5"
					>
						{#each starFills as fill}
							<span class="relative block size-5">
								<svg
									class="absolute inset-0 size-5 text-ink-200"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L10 1.5z"
									/>
								</svg>
								<span class="absolute inset-0 overflow-hidden" style="width: {fill * 100}%">
									<svg
										class="size-5 text-cat-1-400"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L10 1.5z"
										/>
									</svg>
								</span>
							</span>
						{/each}
					</div>

					<EditableField
						fieldKey="TestimonialsSummary.ratingCaption"
						label="Подпись под оценкой"
						value={String(
							data?.ratingCaption ?? 'на основе отзывов покупателей за всё время работы'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('ratingCaption', v)}
						class="mt-4 block"
					>
						{#snippet children(displayValue)}
							<p class="text-sm/6 text-ink-500">{displayValue}</p>
						{/snippet}
					</EditableField>
				</div>

				<!-- Цифры -->
				<div class="lg:border-l lg:border-ink-900/10 lg:pl-14">
					<EditableField
						fieldKey="TestimonialsSummary.title"
						label="Заголовок"
						value={String(data?.title ?? 'Нам доверяют')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<h2
								class="text-2xl leading-[1.1] tracking-[-0.02em] text-pretty text-ink-900 sm:text-3xl"
							>
								{displayValue}
							</h2>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="TestimonialsSummary.subtitle"
						label="Подзаголовок"
						value={String(
							data?.subtitle ?? 'Каждый отзыв — результат работы дизайнеров, мастеров и сборщиков'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('subtitle', v)}
						class="mt-3 block"
					>
						{#snippet children(displayValue)}
							<p class="max-w-xl text-sm/6 text-ink-600">{displayValue}</p>
						{/snippet}
					</EditableField>

					<dl class="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
						{#each stats as stat, i}
							<div class="border-t border-ink-900/10 pt-4">
								<dt
									class="text-2xl font-semibold tracking-[-0.03em] text-ink-900 tabular-nums sm:text-3xl"
								>
									<EditableField
										fieldKey="TestimonialsSummary.stats.{i}.value"
										label="Значение"
										value={stat.value}
										{isEditable}
										inline
										onSave={(v) => updateStat(i, 'value', v)}
									>
										{#snippet children(val)}{val}{/snippet}
									</EditableField>
								</dt>
								<dd class="mt-1 text-[11px] font-semibold tracking-[0.16em] text-ink-500 uppercase">
									<EditableField
										fieldKey="TestimonialsSummary.stats.{i}.label"
										label="Метка"
										value={stat.label}
										{isEditable}
										inline
										onSave={(v) => updateStat(i, 'label', v)}
									>
										{#snippet children(val)}{val}{/snippet}
									</EditableField>
								</dd>
							</div>
						{/each}
					</dl>
				</div>
			</div>
		</div>
	</div>
</section>
