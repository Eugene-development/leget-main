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
	class="p1-stage-screen p1-surface p1-title relative isolate overflow-hidden py-section-sm font-sans select-none sm:py-section"
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

	<div class="p1-stage-inner relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
		<div class="p1-stage-grid grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
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
					value={String(data?.title ?? 'Порядок работы')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="p1-title mt-4 text-3xl md:text-4xl">
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
				class="p1-stage-rail p1-border relative flex flex-col gap-5 border-l-2 border-dashed pl-6 lg:col-span-8"
			>
				{#each steps as step, i}
					<div
						class="stage-card group p1-border p1-card hover:p1-card relative rounded-3xl border p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:translate-x-1 hover:border-link-500/30"
					>
						<!-- Светящийся контур-маркер на временной линии -->
						<div
							class="p1-stage-marker absolute top-6 -left-[35px] h-4 w-4 rounded-full border-4 border-ink-700 bg-ink-950 shadow-[0_0_10px] shadow-link-400/20 transition-all duration-300 group-hover:scale-125 group-hover:border-link-400"
						></div>

						<div class="p1-stage-row flex items-start gap-5">
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
									<span class="p1-label text-link-400">Шаг {i + 1}</span>
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
	/* Посадка в экран — тот же приём, что в `Stage/v1` и `Brands/v1`, и та же
	   роль доступной высоты (`--chrome-overlay`, только хедер: баннер стоит
	   НАД ним и к пятому блоку главной давно уехал).

	   Замер до правки, 1440x900: секция 1076px против 828px под хедером —
	   шестой шаг уходил за нижний край, а порядок работ читают целиком.
	   Перебор снят тремя ступенями, а не одной: поле секции в этом режиме
	   падает до `section-2xs`, шаг столбика `gap-8` -> `gap-5`, поля карточки
	   `p-6` -> `p-5`.

	   `min-height`, а не `height`: в карточке проза, которую тенант правит
	   сам, и жёсткая высота молча резала бы её (замер на `v1` дал переполнение
	   до 41px при вдвое длинном описании). Карточки объявлены `flex: 1` при
	   штатном `min-height: auto` — свободную высоту столбика они делят поровну,
	   но ниже своего содержимого не садятся, а секция под ними растёт.

	   Содержимое карточки в этом режиме центрируется по вертикали: на высоком
	   окне ряд получает заметно больше своей меры, и прижатый кверху текст
	   оставлял бы пустое дно.

	   Гейт тот же, что у `v1`: три колонки макета (>=64rem) и окно не ниже
	   50rem. Уже или ниже блок остаётся в обычном потоке — шесть карточек
	   в столбик в короткое окно не сажаются никаким уплотнением. */
	@media (min-width: 64rem) and (min-height: 50rem) {
		.p1-stage-screen {
			display: flex;
			min-height: calc(100svh - var(--chrome-overlay));
			flex-direction: column;
			padding-block: var(--spacing-section-2xs);
		}

		.p1-stage-screen .p1-stage-inner {
			display: flex;
			flex: 1;
			flex-direction: column;
		}

		.p1-stage-screen .p1-stage-grid {
			flex: 1;
		}

		.p1-stage-screen .p1-stage-rail {
			height: 100%;
		}

		.p1-stage-screen .p1-stage-rail .stage-card {
			display: flex;
			flex: 1;
			flex-direction: column;
			justify-content: center;
		}

		/* Маркер на линии времени едет вместе с содержимым: карточка тут выше
		   своей меры, и прибитый к `top-6` кружок разошёлся бы со знаком шага
		   тем сильнее, чем выше окно. Центрируем отрицательным полем в половину
		   собственного размера (`h-4`), а не `translateY`: `transform` на этом
		   элементе занят — им работает `group-hover:scale-125`. */
		.p1-stage-screen .p1-stage-rail .p1-stage-marker {
			top: 50%;
			margin-top: -0.5rem;
		}

		/* Знак шага встаёт по центру строки, а не кверху: центр строки здесь
		   совпадает с центром карточки, то есть с маркером. Иначе у карточек
		   с описанием в две строки (шаги 1 и 4 на штатном тексте) маркер и
		   знак расходились на 15px — замер на 1440x1050. */
		.p1-stage-screen .p1-stage-rail .p1-stage-row {
			align-items: center;
		}
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
