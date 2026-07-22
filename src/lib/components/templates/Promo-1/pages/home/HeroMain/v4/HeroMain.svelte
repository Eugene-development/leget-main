<script lang="ts">
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
		{ name: 'Warm Oak', colors: ['#D6C5B3', '#8C7A6B', '#4A3E3D', '#1C1917'], accent: 'text-amber-500', bgGlow: 'rgba(217, 119, 6, 0.12)' },
		{ name: 'Nordic Slate', colors: ['#E2E8F0', '#94A3B8', '#475569', '#0F172A'], accent: 'text-sky-400', bgGlow: 'rgba(56, 189, 248, 0.12)' },
		{ name: 'Forest Emerald', colors: ['#D1FAE5', '#34D399', '#065F46', '#022C22'], accent: 'text-emerald-400', bgGlow: 'rgba(52, 211, 153, 0.12)' },
		{ name: 'Luxury Obsidian', colors: ['#F3F4F6', '#9CA3AF', '#374151', '#030712'], accent: 'text-rose-400', bgGlow: 'rgba(251, 113, 133, 0.12)' }
	];

	const activePalette = $derived(palettes[activeSwatchIndex]);

	// Бренды по умолчанию
	const brands = $derived(
		Array.isArray(data?.brands)
			? (data.brands as { name: string; logo: string; url: string }[])
			: [
					{ name: 'Hettich', logo: 'https://storage.yandexcloud.net/novostroy/logo/hettich-Logo.png', url: 'https://www.hettich.com' },
					{ name: 'Egger',   logo: 'https://storage.yandexcloud.net/novostroy/logo/egger-Logo.png',   url: 'https://www.egger.com'   },
					{ name: 'Аристо',  logo: 'https://storage.yandexcloud.net/novostroy/logo/aristo-Logo.png',  url: 'https://www.aristo.ru'   },
					{ name: 'Blum',    logo: 'https://storage.yandexcloud.net/novostroy/logo/blum-Logo.png',    url: 'https://www.blum.com'    },
				]
	);
</script>

<!-- Jost/Playfair fonts are loaded once in Promo-1 layout/Header.svelte -->

<section
	class="relative flex min-h-0 lg:min-h-[calc(100vh-var(--header-h,80px))] w-full items-center justify-start overflow-hidden font-sans-premium transition-all duration-500 {isLight ? 'bg-zinc-100 text-zinc-900' : 'bg-black text-white'}"
>
	<!-- Задний технологичный план (Бруталистские оси координат и градиентная точка) -->
	<div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
		<!-- Осевая разметка -->
		<div class="absolute inset-y-0 left-1/2 w-px {isLight ? 'bg-zinc-300/40' : 'bg-zinc-800/30'}"></div>
		<div class="absolute inset-x-0 top-1/2 h-px {isLight ? 'bg-zinc-300/40' : 'bg-zinc-800/30'}"></div>
		
		<!-- Координатные точки сетки -->
		<div class="absolute left-8 top-8 text-[9px] font-mono opacity-25 tracking-widest uppercase">LEGET // GRID_SYSTEM_V4</div>
		<div class="absolute right-8 bottom-8 text-[9px] font-mono opacity-25 tracking-widest">SCALE 1:15 | AXIS_X_Y</div>

		<!-- Динамический блик мудборда -->
		<div
			class="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full blur-[130px] transition-all duration-1000 opacity-60"
			style="background-color: {activePalette.bgGlow};"
		></div>
	</div>

	<div class="relative z-10 mx-auto flex min-h-0 lg:min-h-[calc(100vh-var(--header-h,80px)-40px)] w-full max-w-screen-2xl flex-col justify-between px-4 pt-6 pb-24 sm:px-6 sm:py-8 md:px-8 lg:px-12 xl:px-16">
		
		<!-- Шапка / Логотип -->
		<div class="flex w-full items-center justify-between pb-6">
			{#if data?.logoUrl || isEditable}
				<div class="w-24 transition-all duration-300 hover:scale-[1.02] md:w-32">
					<EditableField
						fieldKey="HeroMain.logoUrl"
						label="Логотип (URL)"
						value={String(data?.logoUrl ?? '')}
						{isEditable}
						onSave={(v) => saveField('logoUrl', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<img
									src={displayValue}
									alt={String(data?.logoAlt ?? 'Логотип')}
									class="relative w-full object-contain {isLight ? '' : 'brightness-0 invert filter'}"
								/>
							{:else if isEditable}
								<div class="rounded-none border border-zinc-500 bg-zinc-800/5 p-3 text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
									LOGO_V4
								</div>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			{/if}
		</div>

		<!-- Асимметричный Бруталистский Грид -->
		<div class="my-auto grid grid-cols-1 items-center gap-12 py-4 sm:py-6 lg:grid-cols-12">
			
			<!-- Левая колонка: Архитектурная журнальная верстка -->
			<div class="flex flex-col items-start select-none lg:col-span-5 border-l-2 pl-6 sm:pl-8 {isLight ? 'border-zinc-300' : 'border-zinc-800'}">
				
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
							<div class="font-mono text-xs uppercase tracking-[0.3em] {isLight ? 'text-zinc-500' : 'text-zinc-400'}">
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
						<h1 class="font-display mb-6 text-4xl leading-[1.05] font-black tracking-tight sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl {isLight ? 'text-black' : 'text-white'}">
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
						<p class="font-sans-premium mb-8 text-sm leading-relaxed font-light md:text-base {isLight ? 'text-zinc-600' : 'text-zinc-300'}">
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<!-- Бруталистская кнопка с прямыми углами и резкой тенью -->
				<div class="mb-8 flex w-full items-center sm:w-auto">
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
								class="relative w-full rounded-none border-2 font-mono text-xs uppercase tracking-wider px-8 py-4 cursor-pointer transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 sm:w-auto {isLight ? 'bg-black text-white border-black shadow-[4px_4px_0px_#9CA3AF]' : 'bg-white text-black border-white shadow-[4px_4px_0px_rgba(255,255,255,0.15)]'}"
							>
								{displayValue}
							</button>
						{/snippet}
					</EditableField>
				</div>

				<!-- Переключатель палитр холста -->
				<div class="flex flex-col gap-2.5">
					<span class="font-mono text-[10px] uppercase tracking-wider opacity-50">Палитра холста: {activePalette.name}</span>
					<div class="flex items-center gap-2">
						{#each palettes as pal, idx}
							<button
								type="button"
								onclick={() => activeSwatchIndex = idx}
								aria-label="Палитра: {pal.name}"
								aria-pressed={activeSwatchIndex === idx}
								class="flex items-center justify-center p-[2px] rounded-full border transition-all duration-200 cursor-pointer {activeSwatchIndex === idx ? (isLight ? 'border-black' : 'border-white') : 'border-transparent hover:scale-105'}"
							>
								<div class="flex h-5 w-5 rounded-full overflow-hidden">
									<div class="w-1/2 h-full" style="background-color: {pal.colors[2]}"></div>
									<div class="w-1/2 h-full" style="background-color: {pal.colors[3]}"></div>
								</div>
							</button>
						{/each}
					</div>
				</div>

			</div>

			<!-- Правая колонка: Свободный творческий мудборд (Moodboard Canvas) -->
			<div class="relative flex w-full h-[480px] sm:h-[520px] lg:col-span-7 items-center justify-center">
				<div class="relative w-full h-full max-w-lg sm:max-w-xl">

					<!-- КАРТОЧКА 1: Архитектурный план (Сзади) -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="absolute top-[8%] left-[6%] w-[68%] aspect-[4/3] border font-mono select-none p-4 transition-all duration-500 scale-95 origin-top-left rounded-xl backdrop-blur-md shadow-2xl {hoveredCardId === 'blueprint' ? 'z-40 border-indigo-500' : 'z-10'} {isLight ? 'border-zinc-200 bg-white/70 text-zinc-500' : 'border-zinc-800 bg-zinc-950/70 text-zinc-400'}"
						style="transform: rotate(-6deg) {hoveredCardId === 'blueprint' ? 'scale(1.02)' : ''};"
						onmouseenter={() => hoveredCardId = 'blueprint'}
						onmouseleave={() => hoveredCardId = null}
					>
						<div class="flex justify-between text-[8px] border-b pb-1 border-zinc-700/20 mb-3">
							<span>DWG_LAYOUT_REVISION_1</span>
							<span>SCALE 1:20</span>
						</div>
						<!-- Стилизованный чертеж мебели -->
						<div class="relative flex-1 h-[80%] border border-dashed border-zinc-700/20 rounded-lg flex items-center justify-center overflow-hidden">
							<svg class="w-full h-full opacity-35" viewBox="0 0 100 100" fill="none">
								<rect x="10" y="20" width="80" height="60" stroke="currentColor" stroke-width="0.5" />
								<line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="0.5" />
								<line x1="36" y1="20" x2="36" y2="80" stroke="currentColor" stroke-width="0.5" />
								<line x1="64" y1="20" x2="64" y2="80" stroke="currentColor" stroke-width="0.5" />
								<circle cx="50" cy="50" r="1.5" fill="currentColor" />
							</svg>
							<span class="absolute right-2 bottom-2 text-[7px] tracking-widest opacity-40">LEGET CABINET</span>
						</div>
					</div>

					<!-- КАРТОЧКА 2: Живой рендер кухни (В центре) -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="absolute top-[18%] right-[8%] w-[58%] aspect-[4/3] border p-1.5 transition-all duration-500 rounded-xl shadow-2xl overflow-hidden {hoveredCardId === 'render' ? 'z-40 border-sky-400 scale-[1.03]' : 'z-20'} {isLight ? 'border-zinc-200 bg-white' : 'border-zinc-800 bg-zinc-900'}"
						style="transform: rotate(3deg);"
						onmouseenter={() => hoveredCardId = 'render'}
						onmouseleave={() => hoveredCardId = null}
					>
						<div class="relative w-full h-full overflow-hidden rounded-lg bg-zinc-950">
							<img src="https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg" alt="LEGET Premium Kitchen" class="w-full h-full object-cover grayscale-[20%] transition-transform duration-700 hover:scale-105" />
							<!-- Тег поверх изображения -->
							<div class="absolute left-2.5 bottom-2.5 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[8px] font-mono tracking-wider text-white">CONCEPT_04_SLATE</div>
						</div>
					</div>

					<!-- КАРТОЧКА 3: Натуральный Шпон (Снизу слева) -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="absolute bottom-[8%] left-[10%] w-[42%] aspect-square border p-2.5 transition-all duration-500 rounded-xl shadow-2xl {hoveredCardId === 'material' ? 'z-40 border-emerald-400 scale-[1.03]' : 'z-30'} {isLight ? 'border-zinc-200 bg-white' : 'border-zinc-850 bg-zinc-950'}"
						style="transform: rotate(-10deg);"
						onmouseenter={() => hoveredCardId = 'material'}
						onmouseleave={() => hoveredCardId = null}
					>
						<!-- Премиум текстура дуба -->
						<div class="w-full h-[78%] overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800">
							<div class="w-full h-full bg-cover" style="background-image: url('https://storage.yandexcloud.net/novostroy/bg/hero-3.jpg');"></div>
						</div>
						<div class="mt-2 flex justify-between items-center">
							<span class="text-[8px] font-mono tracking-wider uppercase">Veneer Oak</span>
							<span class="h-2 w-2 rounded-full" style="background-color: {activePalette.colors[1]}"></span>
						</div>
					</div>

					<!-- КАРТОЧКА 4: Палитра и Цвета (Снизу справа) -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="absolute bottom-[16%] right-[10%] w-[38%] border p-3.5 transition-all duration-500 rounded-xl shadow-2xl {hoveredCardId === 'colors' ? 'z-40 border-amber-400 scale-[1.03]' : 'z-35'} {isLight ? 'border-zinc-200 bg-white' : 'border-zinc-850 bg-zinc-950'}"
						style="transform: rotate(8deg);"
						onmouseenter={() => hoveredCardId = 'colors'}
						onmouseleave={() => hoveredCardId = null}
					>
						<div class="flex items-center justify-between text-[8px] font-mono border-b pb-1.5 border-zinc-700/20 mb-2.5">
							<span>SWATCHES</span>
							<span class="text-[7px]">VER_4</span>
						</div>
						<div class="flex flex-col gap-1.5">
							{#each activePalette.colors as color, cIdx}
								<div class="flex items-center gap-2">
									<div class="h-3 w-6 rounded border border-zinc-700/20 shrink-0" style="background-color: {color}"></div>
									<span class="text-[7px] font-mono tracking-wider opacity-60 uppercase">{color}</span>
								</div>
							{/each}
						</div>
					</div>

				</div>
			</div>

		</div>

		<!-- Нижний бренд-бар -->
		<div class="mt-6 flex w-full flex-col items-center justify-between gap-5 border-t pt-6 pb-2 md:flex-row {isLight ? 'border-zinc-300' : 'border-zinc-800'}">
			<span class="font-mono text-[9px] uppercase tracking-[0.2em] opacity-50">LEGET PARTNERS & HARDWARE:</span>
			<div class="flex flex-wrap items-center gap-4">
				{#each brands as brand}
					<a
						href={brand.url}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-center grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
					>
						<img
							class="max-h-[14px] max-w-[60px] object-contain {isLight ? '' : 'brightness-0 invert filter'}"
							src={brand.logo}
							alt={brand.name}
						/>
					</a>
				{/each}
			</div>
		</div>

	</div>
</section>

<style>
	:global(.font-sans-premium) {
		font-family: 'Jost', sans-serif !important;
	}

	:global(.font-display) {
		font-family: 'Playfair Display', serif !important;
	}
</style>
