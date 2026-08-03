<script lang="ts">
	// Артикул: 1.6.1.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import BlockThemeToggle from '$lib/components/BlockThemeToggle.svelte';
	import { createThemeToggle, isLightBlock } from '$lib/utils/block-theme';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Брендовая поверхность: нейтральными токенами не описывается, поэтому
	// светлый вариант — тот же бирюзовый род цвета, но осветлённый, с тёмным текстом.
	const isLight = $derived(isLightBlock(data, 'dark'));
	const toggleTheme = createThemeToggle({
		type: 'PartnershipHero',
		fallback: 'dark',
		getData: () => data,
		setData: (next) => (data = next),
		getContext: () => editContext
	});

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'PartnershipHero', updated);
		data = updated;
	}

	const quoteName = $derived(String(data?.quoteName ?? '').trim());
	const quoteRole = $derived(String(data?.quoteRole ?? '').trim());

	/**
	 * Подпись под цитатой — одно поле `quoteAuthor`. Но на сайтах, созданных раньше,
	 * могут быть заполнены отдельные `quoteName` / `quoteRole`: в этом случае
	 * показываем их, чтобы не потерять уже введённые данные.
	 */
	const hasLegacyAuthor = $derived(Boolean(quoteName || quoteRole));
</script>

<!--
	Hero страницы «Партнёрство».

	ВНИМАНИЕ — стык секций: снизу Hero обрезан волной, её заливка обязана
	совпадать с фоном следующего блока (WhoWeInvite, `bg-slate-50` = #f8fafc).
	Цвет задан один раз переменной `--ph-wave` ниже: меняешь фон WhoWeInvite —
	меняешь и её, иначе на границе появится полоса (фон body тут другой, #faf9f7).
-->
<section
	class="ph-enter relative isolate overflow-hidden {isLight
		? 'bg-linear-to-br from-sky-50 via-cyan-50 to-teal-50'
		: 'bg-linear-to-br from-sky-600 via-cyan-600 to-teal-600'}"
>
	<BlockThemeToggle {isLight} onToggle={toggleTheme} {isEditable} {editContext} />

	<!-- Декор: техническая сетка-ромбы, световые пятна, волосяная линия сверху -->
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div
			class="absolute inset-0 {isLight ? 'opacity-20' : 'opacity-30'}"
			style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
		></div>
		<div
			class="ph-glow absolute -top-32 -left-24 size-112 {isLight ? 'bg-sky-400/15' : 'bg-white/15'}"
		></div>
		<div
			class="ph-glow absolute top-1/3 -right-24 size-96 {isLight
				? 'bg-teal-400/15'
				: 'bg-teal-300/25'}"
		></div>
		<div
			class="absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-linear-to-r from-transparent via-white/50 to-transparent"
		></div>
	</div>

	<div
		class="relative mx-auto max-w-7xl px-4 pt-20 pb-32 sm:px-6 sm:pt-28 sm:pb-40 lg:px-8 lg:pb-44"
	>
		<div class="lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
			<div>
				<EditableField
					fieldKey="PartnershipHero.badge"
					label="Бейдж"
					value={String(data?.badge ?? 'Партнёрская программа')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="ph-item inline-block"
				>
					{#snippet children(displayValue)}
						<div
							class="inline-flex items-center gap-2.5 rounded-full border {isLight
								? 'border-slate-900/15'
								: 'border-white/25'} {isLight
								? 'bg-white/70'
								: 'bg-white/12'} px-4 py-2 text-[11px] font-semibold tracking-[0.2em] {isLight
								? 'text-slate-900'
								: 'text-white'} uppercase sm:text-xs"
						>
							<svg
								class="size-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
							{displayValue}
						</div>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="PartnershipHero.title"
					label="Заголовок"
					value={String(data?.title ?? 'Растём вместе')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="ph-item ph-d1 mt-6 block"
				>
					{#snippet children(displayValue)}
						<h1
							class="text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-pretty sm:text-5xl lg:text-6xl {isLight
								? 'text-slate-900'
								: 'text-white'}"
						>
							{displayValue}
						</h1>
					{/snippet}
				</EditableField>

				<div class="ph-rule ph-d2 mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
					<span class="h-px flex-1 {isLight ? 'bg-slate-900/20' : 'bg-white/30'}"></span>
					<span
						class="size-1.5 rotate-45 border {isLight ? 'border-slate-900/40' : 'border-white/70'}"
					></span>
					<span class="h-px flex-1 {isLight ? 'bg-slate-900/20' : 'bg-white/30'}"></span>
				</div>

				<EditableField
					fieldKey="PartnershipHero.text"
					label="Описание"
					value={String(
						data?.text ??
							'Приглашаем к сотрудничеству дизайнеров интерьеров, ремонтные бригады и продавцов мебели. Выгодные условия и прозрачная система вознаграждений.'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('text', v)}
					class="ph-item ph-d3 mt-6 block"
				>
					{#snippet children(displayValue)}
						<p
							class="max-w-xl text-sm/6 sm:text-base/7 {isLight
								? 'text-slate-600'
								: 'text-cyan-50/90'}"
						>
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<div class="ph-item ph-d4 mt-10">
					<a
						href="/contact"
						class="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-sky-700 shadow-[0_20px_50px_-20px_rgba(8,47,73,0.65)] transition duration-300 hover:bg-sky-50 hover:shadow-[0_26px_60px_-18px_rgba(8,47,73,0.75)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-safe:hover:-translate-y-0.5"
					>
						<EditableField
							fieldKey="PartnershipHero.buttonText"
							label="Текст кнопки"
							value={String(data?.buttonText ?? 'Обсудить сотрудничество')}
							{isEditable}
							onSave={(v) => saveField('buttonText', v)}
							class="inline"
						>
							{#snippet children(displayValue)}
								{displayValue}
							{/snippet}
						</EditableField>
						<span
							class="transition-transform duration-300 group-hover:translate-x-1"
							aria-hidden="true">&rarr;</span
						>
					</a>
				</div>
			</div>

			<!-- Цитата: паспарту с градиентной каймой в 1px -->
			<div class="ph-card ph-d3 mt-12 lg:mt-0">
				<div
					class="rounded-4xl bg-linear-to-br from-white/50 via-white/20 to-white/40 p-px shadow-[0_50px_120px_-60px_rgba(8,47,73,0.8)]"
				>
					<!--
						Без backdrop-blur: пока на карточке висит transform от анимации
						появления, backdrop-filter сэмплит подложку внутри трансформированного
						слоя, а после её окончания — реальный фон секции. Тон карточки скакал
						в конце анимации. Полупрозрачного градиента здесь достаточно: под
						карточкой только градиент секции, размывать нечего.
					-->
					<div
						class="relative overflow-hidden rounded-[calc(var(--radius-4xl)-1px)] bg-linear-to-br {isLight
							? 'from-white/80 via-white/70 to-white/60'
							: 'from-white/20 via-white/12 to-white/5'} p-8 ring-1 ring-white/10 ring-inset sm:p-10"
					>
						<div
							class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-white/15 to-transparent"
							aria-hidden="true"
						></div>

						<div class="relative">
							<!-- Кавычка-акцент в плитке: задаёт вертикаль карточки, не наезжая на текст -->
							<div
								class="flex size-11 items-center justify-center rounded-2xl {isLight
									? 'bg-white/80'
									: 'bg-white/15'} ring-1 {isLight ? 'ring-slate-900/10' : 'ring-white/25'}"
								aria-hidden="true"
							>
								<svg
									class="size-5 {isLight ? 'text-sky-700' : 'text-white'}"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path
										d="M9.5 5.5C6.46 5.5 4 7.96 4 11v7.5h7.5V11H7.75c0-1.24 1.01-2.25 2.25-2.25V5.5zm10 0C16.46 5.5 14 7.96 14 11v7.5h7.5V11h-3.75c0-1.24 1.01-2.25 2.25-2.25V5.5z"
									/>
								</svg>
							</div>

							<EditableField
								fieldKey="PartnershipHero.quote"
								label="Цитата"
								value={String(
									data?.quote ??
										'Партнёрство открывает новые горизонты и возможности для совместного роста. Вместе мы достигнем большего.'
								)}
								{isEditable}
								multiline
								onSave={(v) => saveField('quote', v)}
								class="mt-6 block"
							>
								{#snippet children(displayValue)}
									<blockquote
										class="text-lg leading-relaxed font-medium tracking-[-0.01em] text-pretty sm:text-xl {isLight
											? 'text-slate-900'
											: 'text-white'}"
									>
										{displayValue}
									</blockquote>
								{/snippet}
							</EditableField>

							<!-- Линия-разделитель и подпись автора под цитатой -->
							<div class="mt-7 border-t {isLight ? 'border-slate-900/10' : 'border-white/15'} pt-5">
								{#if hasLegacyAuthor}
									<!--
										Совместимость: на сайтах, где уже заполнены отдельные поля
										quoteName / quoteRole, показываем их, чтобы не терять данные.
										Новая подпись — единое поле quoteAuthor ниже.
									-->
									<EditableField
										fieldKey="PartnershipHero.quoteName"
										label="Имя автора цитаты"
										value={quoteName}
										{isEditable}
										onSave={(v) => saveField('quoteName', v)}
										class="block"
									>
										{#snippet children(displayValue)}
											{#if displayValue}
												<div
													class="text-sm font-semibold {isLight ? 'text-slate-900' : 'text-white'}"
												>
													{displayValue}
												</div>
											{/if}
										{/snippet}
									</EditableField>
									<EditableField
										fieldKey="PartnershipHero.quoteRole"
										label="Должность автора"
										value={quoteRole}
										{isEditable}
										onSave={(v) => saveField('quoteRole', v)}
										class="mt-1 block"
									>
										{#snippet children(displayValue)}
											{#if displayValue}
												<div
													class="text-[11px] font-semibold tracking-[0.16em] uppercase {isLight
														? 'text-slate-500'
														: 'text-cyan-100/80'}"
												>
													{displayValue}
												</div>
											{/if}
										{/snippet}
									</EditableField>
								{:else}
									<EditableField
										fieldKey="PartnershipHero.quoteAuthor"
										label="Подпись автора цитаты"
										value={String(data?.quoteAuthor ?? 'Директор компании Иванов Иван Иванович')}
										{isEditable}
										onSave={(v) => saveField('quoteAuthor', v)}
										class="block"
									>
										{#snippet children(displayValue)}
											<div
												class="text-sm font-semibold sm:text-base {isLight
													? 'text-slate-900'
													: 'text-white'}"
											>
												{displayValue}
											</div>
										{/snippet}
									</EditableField>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!--
		Живая волна-переход в следующую секцию — РОВНО ОДИН слой в цвет фона
		WhoWeInvite, кромка остаётся единой непрерывной кривой. Второй слой той же
		заливки не годится даже как «рябь»: его гребни проступают сквозь основную
		волну бугорками. Полупрозрачный подслой для «глубины» тоже не работает:
		над градиентом секции он читается как посторонняя голубовато-зелёная полоса.

		Динамика — две вложенные трансформации, чтобы не перебивали друг друга:
		дрейф по X на пути, покачивание по Y на обёртке <g>. Путь периодичен
		(период 1440) и нарисован на удвоенную ширину viewBox, дрейф равен ровно
		периоду — цикл замыкается бесшовно, лишнее обрезает viewBox. Низ залит до
		y=140, с запасом за кромку: при покачивании вверх снизу не появляется щель.

		preserveAspectRatio="none" + фиксированная высота — чтобы на широких
		экранах не оставалось щели между волной и краем секции.
	-->
	<div class="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
		<svg
			class="ph-wave block h-16 w-full sm:h-20 lg:h-28"
			viewBox="0 0 1440 120"
			preserveAspectRatio="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g class="ph-wave-bob">
				<path
					class="ph-wave-front"
					d="M0 76C240 56 480 56 720 76C960 96 1200 96 1440 76C1680 56 1920 56 2160 76C2400 96 2640 96 2880 76V140H0Z"
				/>
			</g>
		</svg>
	</div>
</section>

<style>
	/*
		Цвет волны = фон следующей секции (WhoWeInvite, bg-slate-50).
		Держим его в одной переменной, чтобы стык правился в одном месте.
	*/
	.ph-wave {
		--ph-wave: #f8fafc;
	}

	.ph-wave-front {
		fill: var(--ph-wave);
		/* Анимируем только transform — слой уезжает в композитор, без перерисовок. */
		will-change: transform;
		/*
			Дрейф ровно на период пути: последний кадр совпадает с первым,
			шва на стыке циклов нет.
		*/
		animation: ph-wave-drift 26s linear infinite;
	}

	/*
		Покачивание по высоте живёт на обёртке: длительность не кратна дрейфу,
		поэтому гребень проходит мимо одной и той же точки на разной высоте
		и движение не выглядит закольцованным.
	*/
	.ph-wave-bob {
		will-change: transform;
		animation: ph-wave-bob 9s ease-in-out infinite alternate;
	}

	@keyframes ph-wave-drift {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-1440px);
		}
	}

	@keyframes ph-wave-bob {
		from {
			transform: translateY(-7px);
		}
		to {
			transform: translateY(7px);
		}
	}

	/* Классы глобальные: часть анимируемых узлов — обёртки <EditableField>. */

	:global(.ph-glow) {
		filter: blur(80px);
		border-radius: 9999px;
	}

	@keyframes ph-rise {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes ph-rule {
		from {
			opacity: 0;
			transform: scaleX(0.4);
		}
		to {
			opacity: 1;
			transform: scaleX(1);
		}
	}

	@keyframes ph-frame {
		from {
			opacity: 0;
			transform: scale(0.985) translateY(12px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	/* Hero над сгибом — анимация стартует сразу, без IntersectionObserver. */
	:global(.ph-enter .ph-item) {
		animation: ph-rise 780ms cubic-bezier(0.22, 1, 0.36, 1) var(--ph-delay, 0ms) backwards;
	}

	:global(.ph-enter .ph-rule) {
		animation: ph-rule 780ms cubic-bezier(0.22, 1, 0.36, 1) var(--ph-delay, 0ms) backwards;
	}

	:global(.ph-enter .ph-card) {
		animation: ph-frame 900ms cubic-bezier(0.22, 1, 0.36, 1) var(--ph-delay, 0ms) backwards;
	}

	:global(.ph-d1) {
		--ph-delay: 80ms;
	}
	:global(.ph-d2) {
		--ph-delay: 160ms;
	}
	:global(.ph-d3) {
		--ph-delay: 240ms;
	}
	:global(.ph-d4) {
		--ph-delay: 340ms;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.ph-enter .ph-item),
		:global(.ph-enter .ph-rule),
		:global(.ph-enter .ph-card) {
			animation: none;
			opacity: 1;
			transform: none;
		}

		/* Волна остаётся статичной, силуэт и стык секций не меняются. */
		.ph-wave-front,
		.ph-wave-bob {
			animation: none;
			will-change: auto;
		}
	}
</style>
