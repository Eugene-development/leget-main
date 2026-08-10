<script lang="ts">
	// Артикул: 1.1.1.4 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import { fade, fly } from 'svelte/transition';

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
		await saveComponentData(editContext, 'HeroMain', updated);
		data = updated;
	}

	const isLight = $derived(data?.theme === 'light');

	// ─── Состояния интерактива мудборда ──────────────────────────────────────────
	let activeSwatchIndex = $state(0);
	let hoveredCardId = $state<string | null>(null);

	const palettes = [
		{
			name: 'Warm Oak',
			colors: ['#D6C5B3', '#8C7A6B', '#4A3E3D', '#1C1917'],
			accent: 'text-cat-1-500',
			bgGlow: 'rgba(217, 119, 6, 0.12)'
		},
		{
			name: 'Nordic Slate',
			colors: ['#E2E8F0', '#94A3B8', '#475569', '#0F172A'],
			accent: 'text-link-400',
			bgGlow: 'rgba(56, 189, 248, 0.12)'
		},
		{
			name: 'Forest Emerald',
			colors: ['#D1FAE5', '#34D399', '#065F46', '#022C22'],
			accent: 'text-cat-2-400',
			bgGlow: 'rgba(52, 211, 153, 0.12)'
		},
		{
			name: 'Luxury Obsidian',
			colors: ['#F3F4F6', '#9CA3AF', '#374151', '#030712'],
			accent: 'text-cat-6-400',
			bgGlow: 'rgba(251, 113, 133, 0.12)'
		}
	];

	const activePalette = $derived(palettes[activeSwatchIndex]);

	// Бренды по умолчанию
	const brands = $derived(
		Array.isArray(data?.brands)
			? (data.brands as { name: string; logo: string; url: string }[])
			: [
					{
						name: 'Hettich',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/hettich-Logo.png',
						url: 'https://www.hettich.com'
					},
					{
						name: 'Egger',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/egger-Logo.png',
						url: 'https://www.egger.com'
					},
					{
						name: 'Аристо',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/aristo-Logo.png',
						url: 'https://www.aristo.ru'
					},
					{
						name: 'Blum',
						logo: 'https://storage.yandexcloud.net/novostroy/logo/blum-Logo.png',
						url: 'https://www.blum.com'
					}
				]
	);
</script>

<!-- Jost/Playfair fonts are loaded once in Promo-1 layout/Header.svelte -->

<!-- lg:h-full — ровно высота .hero-wrapper (100dvh − banner − header).
     Раньше здесь было min-h-[100vh−header]: на 36px (высота баннера) выше
     контейнера, из-за чего низ секции всегда обрезался overflow-hidden. -->
<section
	class="font-sans-premium relative flex min-h-0 w-full items-center justify-start overflow-hidden transition-all duration-500 lg:h-full {isLight
		? 'bg-ink-100 text-ink-900'
		: 'bg-scrim text-on-dark'}"
>
	<!-- Задний технологичный план (Бруталистские оси координат и градиентная точка) -->
	<div class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
		<!-- Осевая разметка -->
		<div
			class="absolute inset-y-0 left-1/2 w-px {isLight ? 'bg-ink-300/40' : 'bg-ink-800/30'}"
		></div>
		<div
			class="absolute inset-x-0 top-1/2 h-px {isLight ? 'bg-ink-300/40' : 'bg-ink-800/30'}"
		></div>

		<!-- Координатных меток сетки здесь больше нет: обе жили на absolute-углах
		     (left-8/top-8 и right-8/bottom-8) и накладывались на реальный контент —
		     верхняя на шапку, нижняя на логотипы брендов. Теперь они внутри
		     .hero-head и .hero-partners соответственно (см. ниже). -->

		<!-- Динамический блик мудборда -->
		<div
			class="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full opacity-60 blur-[130px] transition-all duration-1000"
			style="background-color: {activePalette.bgGlow};"
		></div>
	</div>

	<div
		class="hero-shell relative z-10 mx-auto flex min-h-0 w-full max-w-screen-2xl flex-col justify-between px-4 pt-6 pb-24 sm:px-6 sm:py-8 md:px-8 lg:h-full lg:px-12 xl:px-16"
	>
		<!-- Шапка -->
		<div class="hero-head flex w-full items-center justify-between pb-6">
			<!-- Координатная метка сетки. Вынесена из фонового слоя в шапку:
			     правая часть строки остаётся свободной, а ml-auto держит её справа. -->
			<div
				class="pointer-events-none ml-auto font-mono text-[9px] tracking-widest uppercase opacity-25 select-none"
			>
				LEGET // GRID_SYSTEM_V4
			</div>
		</div>

		<!-- Асимметричный Бруталистский Грид -->
		<div
			class="hero-grid my-auto grid grid-cols-1 items-center gap-12 py-4 sm:py-6 lg:grid-cols-12"
		>
			<!-- Левая колонка: Архитектурная журнальная верстка -->
			<div
				class="flex flex-col items-start border-l-2 pl-6 select-none sm:pl-8 lg:col-span-5 {isLight
					? 'border-ink-300'
					: 'border-ink-800'}"
			>
				<!-- Хэдер компании с кодом ревизии -->
				<div class="mb-4">
					<EditableField
						fieldKey="HeroMain.companyName"
						label="Название компании"
						value={String(data?.companyName ?? '')}
						{isEditable}
						onSave={(v) => saveField('companyName', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<div
								class="font-mono text-xs tracking-[0.3em] uppercase {isLight
									? 'text-ink-500'
									: 'text-ink-400'}"
							>
								{displayValue} // EDIT.04
							</div>
						{/snippet}
					</EditableField>
				</div>

				<!-- Заголовок: Экстремально жирная журнальная антиква -->
				<EditableField
					fieldKey="HeroMain.title"
					label="Заголовок"
					value={String(data?.title ?? '')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block w-full"
				>
					{#snippet children(displayValue)}
						<h1
							class="hero-title font-display mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl {isLight
								? 'text-scrim'
								: 'text-on-dark'}"
						>
							{displayValue}
						</h1>
					{/snippet}
				</EditableField>

				<!-- Описание в бруталистской верстке (чуть шире межстрочный интервал) -->
				<EditableField
					fieldKey="HeroMain.description"
					label="Описание"
					value={String(data?.description ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block w-full max-w-lg"
				>
					{#snippet children(displayValue)}
						<p
							class="hero-desc font-sans-premium mb-8 text-sm leading-relaxed font-light md:text-base {isLight
								? 'text-ink-600'
								: 'text-ink-300'}"
						>
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<!-- Бруталистская кнопка с прямыми углами и резкой тенью -->
				<div class="hero-cta mb-8 flex w-full items-center sm:w-auto">
					<EditableField
						fieldKey="HeroMain.buttonText"
						label="Текст кнопки"
						value={String(data?.buttonText ?? 'Дизайн-проект с расчётом стоимости')}
						{isEditable}
						onSave={(v) => saveField('buttonText', v)}
						class="block w-full sm:w-auto"
					>
						{#snippet children(displayValue)}
							<button
								type="button"
								onclick={() => serviceOrderStore.open('design-project')}
								class="relative w-full cursor-pointer rounded-none border-2 px-8 py-4 font-mono text-xs tracking-wider uppercase transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 sm:w-auto {isLight
									? 'border-scrim bg-scrim text-on-dark shadow-[4px_4px_0px] shadow-ink-400'
									: 'border-on-dark bg-surface-raised text-scrim shadow-[4px_4px_0px] shadow-on-dark/15'}"
							>
								{displayValue}
							</button>
						{/snippet}
					</EditableField>
				</div>

				<!-- Переключатель палитр холста -->
				<div class="flex flex-col gap-2.5">
					<span class="font-mono text-[10px] tracking-wider uppercase opacity-50"
						>Палитра холста: {activePalette.name}</span
					>
					<div class="flex items-center gap-2">
						{#each palettes as pal, idx}
							<button
								type="button"
								onclick={() => (activeSwatchIndex = idx)}
								aria-label="Палитра: {pal.name}"
								aria-pressed={activeSwatchIndex === idx}
								class="flex cursor-pointer items-center justify-center rounded-full border p-[2px] transition-all duration-200 {activeSwatchIndex ===
								idx
									? isLight
										? 'border-scrim'
										: 'border-on-dark'
									: 'border-transparent hover:scale-105'}"
							>
								<div class="flex h-5 w-5 overflow-hidden rounded-full">
									<div class="h-full w-1/2" style="background-color: {pal.colors[2]}"></div>
									<div class="h-full w-1/2" style="background-color: {pal.colors[3]}"></div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Правая колонка: Свободный творческий мудборд (Moodboard Canvas) -->
			<div
				class="hero-mock relative flex h-[480px] w-full items-center justify-center sm:h-[520px] lg:col-span-7"
			>
				<div class="relative h-full w-full max-w-lg sm:max-w-xl">
					<!-- КАРТОЧКА 1: Архитектурный план (Сзади) -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="absolute top-[8%] left-[6%] aspect-[4/3] w-[68%] origin-top-left scale-95 rounded-xl border p-4 font-mono shadow-2xl backdrop-blur-md transition-all duration-500 select-none {hoveredCardId ===
						'blueprint'
							? 'z-40 border-cat-4-500'
							: 'z-10'} {isLight
							? 'border-ink-200 bg-surface-raised/70 text-ink-500'
							: 'border-ink-800 bg-ink-950/70 text-ink-400'}"
						style="transform: rotate(-6deg) {hoveredCardId === 'blueprint' ? 'scale(1.02)' : ''};"
						onmouseenter={() => (hoveredCardId = 'blueprint')}
						onmouseleave={() => (hoveredCardId = null)}
					>
						<div class="mb-3 flex justify-between border-b border-ink-700/20 pb-1 text-[8px]">
							<span>DWG_LAYOUT_REVISION_1</span>
							<span>SCALE 1:20</span>
						</div>
						<!-- Стилизованный чертеж мебели -->
						<div
							class="relative flex h-[80%] flex-1 items-center justify-center overflow-hidden rounded-lg border border-dashed border-ink-700/20"
						>
							<svg class="h-full w-full opacity-35" viewBox="0 0 100 100" fill="none">
								<rect
									x="10"
									y="20"
									width="80"
									height="60"
									stroke="currentColor"
									stroke-width="0.5"
								/>
								<line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="0.5" />
								<line x1="36" y1="20" x2="36" y2="80" stroke="currentColor" stroke-width="0.5" />
								<line x1="64" y1="20" x2="64" y2="80" stroke="currentColor" stroke-width="0.5" />
								<circle cx="50" cy="50" r="1.5" fill="currentColor" />
							</svg>
							<span class="absolute right-2 bottom-2 text-[7px] tracking-widest opacity-40"
								>LEGET CABINET</span
							>
						</div>
					</div>

					<!-- КАРТОЧКА 2: Живой рендер кухни (В центре) -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="absolute top-[18%] right-[8%] aspect-[4/3] w-[58%] overflow-hidden rounded-xl border p-1.5 shadow-2xl transition-all duration-500 {hoveredCardId ===
						'render'
							? 'z-40 scale-[1.03] border-link-400'
							: 'z-20'} {isLight
							? 'border-ink-200 bg-surface-raised'
							: 'border-ink-800 bg-ink-900'}"
						style="transform: rotate(3deg);"
						onmouseenter={() => (hoveredCardId = 'render')}
						onmouseleave={() => (hoveredCardId = null)}
					>
						<div class="relative h-full w-full overflow-hidden rounded-lg bg-ink-950">
							<img
								src="https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg"
								alt="LEGET Premium Kitchen"
								class="h-full w-full object-cover grayscale-[20%] transition-transform duration-700 hover:scale-105"
							/>
							<!-- Тег поверх изображения -->
							<div
								class="absolute bottom-2.5 left-2.5 rounded bg-scrim/60 px-2 py-1 font-mono text-[8px] tracking-wider text-on-dark backdrop-blur-md"
							>
								CONCEPT_04_SLATE
							</div>
						</div>
					</div>

					<!-- КАРТОЧКА 3: Натуральный Шпон (Снизу слева) -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="absolute bottom-[8%] left-[10%] aspect-square w-[42%] rounded-xl border p-2.5 shadow-2xl transition-all duration-500 {hoveredCardId ===
						'material'
							? 'z-40 scale-[1.03] border-cat-2-400'
							: 'z-30'} {isLight
							? 'border-ink-200 bg-surface-raised'
							: 'border-zinc-850 bg-ink-950'}"
						style="transform: rotate(-10deg);"
						onmouseenter={() => (hoveredCardId = 'material')}
						onmouseleave={() => (hoveredCardId = null)}
					>
						<!-- Премиум текстура дуба -->
						<div class="h-[78%] w-full overflow-hidden rounded-lg border border-ink-800 bg-ink-900">
							<div
								class="h-full w-full bg-cover"
								style="background-image: url('https://storage.yandexcloud.net/novostroy/bg/hero-3.jpg');"
							></div>
						</div>
						<div class="mt-2 flex items-center justify-between">
							<span class="font-mono text-[8px] tracking-wider uppercase">Veneer Oak</span>
							<span class="h-2 w-2 rounded-full" style="background-color: {activePalette.colors[1]}"
							></span>
						</div>
					</div>

					<!-- КАРТОЧКА 4: Палитра и Цвета (Снизу справа) -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="absolute right-[10%] bottom-[16%] w-[38%] rounded-xl border p-3.5 shadow-2xl transition-all duration-500 {hoveredCardId ===
						'colors'
							? 'z-40 scale-[1.03] border-cat-1-400'
							: 'z-35'} {isLight
							? 'border-ink-200 bg-surface-raised'
							: 'border-zinc-850 bg-ink-950'}"
						style="transform: rotate(8deg);"
						onmouseenter={() => (hoveredCardId = 'colors')}
						onmouseleave={() => (hoveredCardId = null)}
					>
						<div
							class="mb-2.5 flex items-center justify-between border-b border-ink-700/20 pb-1.5 font-mono text-[8px]"
						>
							<span>SWATCHES</span>
							<span class="text-[7px]">VER_4</span>
						</div>
						<div class="flex flex-col gap-1.5">
							{#each activePalette.colors as color, cIdx}
								<div class="flex items-center gap-2">
									<div
										class="h-3 w-6 shrink-0 rounded border border-ink-700/20"
										style="background-color: {color}"
									></div>
									<span class="font-mono text-[7px] tracking-wider uppercase opacity-60"
										>{color}</span
									>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Нижний бренд-бар -->
		<div
			class="hero-partners mt-6 flex w-full flex-col items-center justify-between gap-5 border-t pt-6 pb-2 md:flex-row {isLight
				? 'border-ink-300'
				: 'border-ink-800'}"
		>
			<span class="font-mono text-[9px] tracking-[0.2em] uppercase opacity-50"
				>LEGET PARTNERS & HARDWARE:</span
			>
			<div class="flex flex-wrap items-center gap-4">
				{#each brands as brand}
					<a
						href={brand.url}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-center opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
					>
						<img
							class="max-h-[14px] max-w-[60px] object-contain {isLight
								? ''
								: 'brightness-0 invert filter'}"
							src={brand.logo}
							alt={brand.name}
						/>
					</a>
				{/each}

				<!-- Координатная метка сетки. Вынесена из фонового слоя в полосу
				     партнёров: на right-8/bottom-8 она ложилась поверх логотипов
				     брендов. Здесь остаётся у правого края, но в потоке. -->
				<span
					class="pointer-events-none ml-2 font-mono text-[9px] tracking-widest opacity-25 select-none"
				>
					SCALE 1:15 | AXIS_X_Y
				</span>
			</div>
		</div>
	</div>
</section>

<style>
	/* ── Компактный режим для невысоких десктопов ────────────────────────────
	   Компонент живёт в боксе фиксированной высоты (.hero-wrapper в ../index.svelte,
	   overflow-hidden), поэтому при нехватке места низ контента обрезается.
	   Ниже 920px поджимаем вертикальные отступы каркаса.
	   Свойства не в @layer, поэтому перекрывают Tailwind-утилиты на элементах. */
	@media (min-width: 1024px) and (max-height: 920px) {
		.hero-shell {
			padding-top: 1rem;
			padding-bottom: 1rem;
		}

		.hero-head {
			padding-bottom: 0.5rem;
		}

		.hero-grid {
			padding-top: 0.75rem;
			padding-bottom: 0.75rem;
		}

		.hero-head :global(img) {
			max-height: 2.5rem;
		}
	}

	/* Второй уровень — совсем низкие окна (ноутбуки 1366×768 и подобные).
	   Основной потребитель высоты здесь — мокап справа с фиксированной
	   h-[520px], поэтому его ужимаем вместе с ритмом левой колонки. */
	@media (min-width: 1024px) and (max-height: 800px) {
		.hero-shell {
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
		}

		.hero-grid {
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
		}

		.hero-mock {
			height: 24rem;
		}

		.hero-title {
			margin-bottom: 0.75rem;
			font-size: 2.5rem;
		}

		.hero-desc {
			margin-bottom: 1rem;
		}

		.hero-cta {
			margin-bottom: 1rem;
		}

		.hero-partners {
			margin-top: 0.5rem;
			padding-top: 1rem;
		}
	}

	:global(.font-sans-premium) {
		font-family: 'Jost', sans-serif !important;
	}

	:global(.font-display) {
		font-family: 'Playfair Display', serif !important;
	}
</style>
