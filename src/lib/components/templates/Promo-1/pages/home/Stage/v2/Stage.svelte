<script lang="ts">
	// Артикул: 1.1.5.2 — см. docs/architecture/component-articles-map.md
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

	const steps = $derived(
		Array.isArray(data?.steps) && data.steps.length > 0
			? (data.steps as { title: string; description: string }[])
			: [
					{
						title: 'Консультация',
						description:
							'Наш менеджер даст консультацию по материалам и возможным решениям в проектировании мебели'
					},
					{
						title: 'Замер',
						description:
							'Организуем проектный замер помещения с обозначением углов, коммуникаций и розеток'
					},
					{
						title: 'Проект',
						description:
							'Дизайнер составит проект мебели с учётом всех ваших пожеланий и размеров помещения'
					},
					{
						title: 'Договор',
						description:
							'Поможем комфортно заключить договор с указанием всех условий выполнения вашего проекта'
					},
					{
						title: 'Изготовление',
						description:
							'Фабрика изготовит заказ на высокотехнологичном оборудовании под контролем технологов'
					},
					{
						title: 'Сборка',
						description:
							'Профессиональные сборщики компании качественно выполнят монтаж и установку мебели'
					}
				]
	);

	const activeBgImage = $derived(String(data?.bgImageV2 ?? data?.bgImage ?? ''));

	// SVG иконки для каждого шага
	const icons = [
		'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
		'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
		'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
		'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
		'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
		'M5 13l4 4L19 7'
	];

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Stage', updated);
		data = updated;
	}

	async function saveStepField(index: number, field: 'title' | 'description', value: string) {
		if (!editContext) return;
		const updatedSteps = [...steps];
		updatedSteps[index] = { ...updatedSteps[index], [field]: value };
		const updated = { ...data, steps: updatedSteps };
		await saveComponentData(editContext, 'Stage', updated);
		data = updated;
	}
</script>

<section
	class="p1-surface p1-title relative isolate overflow-hidden py-24 font-sans select-none sm:py-32"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<!-- Фоновая картинка с глубоким оверлеем -->
	<ImageFallback
		src={activeBgImage}
		alt="Интерьер с мебелью"
		class="absolute inset-0 -z-20 h-full w-full scale-105 object-cover"
	/>
	<div
		class="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/40"
	></div>

	<div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
			<!-- Левая колонка: Прогресс и заголовок -->
			<div
				class="p1-card p1-border sticky top-8 flex flex-col items-start rounded-3xl border p-8 text-left shadow-2xl backdrop-blur-md lg:col-span-4"
			>
				<span
					class="inline-flex items-center gap-2 rounded-full border border-link-500/30 bg-link-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-link-300 uppercase"
				>
					<EditableField
						fieldKey="Stage.badge"
						label="Метка"
						value={String(data?.badge ?? 'Это важно')}
						{isEditable}
						onSave={(v) => saveField('badge', v)}
						class="inline"
					>
						{#snippet children(displayValue)}{displayValue}{/snippet}
					</EditableField>
				</span>

				<EditableField
					fieldKey="Stage.title"
					label="Заголовок"
					value={String(data?.title ?? 'Наша работа')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="p1-title font-display mt-4 text-3xl leading-tight tracking-tight md:text-4xl"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Stage.description"
					label="Описание"
					value={String(
						data?.description ??
							'Мы поддержим вас на всех этапах работы над мебельным проектом: от первой консультации до дня финальной сборки.'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="p1-body mt-6 text-sm leading-relaxed md:text-base">{displayValue}</p>
					{/snippet}
				</EditableField>
			</div>

			<!-- Правая колонка: Staggered Timeline (Второй вариант) -->
			<div
				class="p1-border relative flex flex-col gap-8 border-l-2 border-dashed pl-6 lg:col-span-8"
			>
				{#each steps as step, i}
					<div
						class="stage-card group p1-border p1-card hover:p1-card relative rounded-3xl border p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:translate-x-1 hover:border-link-500/30"
					>
						<!-- Светящийся контур-маркер на временной линии -->
						<div
							class="absolute top-6 -left-[35px] h-4 w-4 rounded-full border-4 border-ink-700 bg-ink-950 shadow-[0_0_10px_rgba(56,189,248,0.2)] transition-all duration-300 group-hover:scale-125 group-hover:border-link-400"
						></div>

						<div class="flex items-start gap-5">
							<!-- Анимированная иконка шага -->
							<div
								class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-link-500 to-cat-4-600 text-on-accent shadow-lg transition-transform duration-300 group-hover:scale-105"
							>
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d={icons[i % icons.length]}
									/>
								</svg>
							</div>

							<div>
								<div class="flex items-center gap-3">
									<span class="font-display text-xs font-black text-link-400">Шаг {i + 1}</span>
									<span class="h-1.5 w-1.5 rounded-full bg-ink-600"></span>
									<h3
										class="p1-title p1-title-sub text-lg transition-colors duration-300 group-hover:text-link-300"
									>
										<EditableField
											fieldKey={`Stage.steps.${i}.title`}
											label="Заголовок"
											value={step.title}
											{isEditable}
											inline
											onSave={(v) => saveStepField(i, 'title', v)}
											class="inline"
										>
											{#snippet children(displayValue)}{displayValue}{/snippet}
										</EditableField>
									</h3>
								</div>
								<p
									class="p1-muted group-hover:p1-body mt-2 text-xs leading-relaxed transition-colors duration-300 md:text-sm"
								>
									<EditableField
										fieldKey={`Stage.steps.${i}.description`}
										label="Описание"
										value={step.description}
										{isEditable}
										multiline
										inline
										onSave={(v) => saveStepField(i, 'description', v)}
										class="inline"
									>
										{#snippet children(displayValue)}{displayValue}{/snippet}
									</EditableField>
								</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	/* Outfit font is loaded once in Promo-1 layout/Header.svelte */

	.font-display {
		font-family: 'Outfit', sans-serif;
	}

	.stage-card {
		animation: stage-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	.stage-card:nth-child(1) {
		animation-delay: 0.1s;
	}
	.stage-card:nth-child(2) {
		animation-delay: 0.2s;
	}
	.stage-card:nth-child(3) {
		animation-delay: 0.3s;
	}
	.stage-card:nth-child(4) {
		animation-delay: 0.4s;
	}
	.stage-card:nth-child(5) {
		animation-delay: 0.5s;
	}
	.stage-card:nth-child(6) {
		animation-delay: 0.6s;
	}

	@keyframes stage-fade-in {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
