<script lang="ts">
	// Артикул: 1.1.1.3 — см. docs/architecture/component-articles-map.md
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

	// ─── Список интерактивных скилов (направлений фабрики) ───────────────────
	let activeSkillIndex = $state(0);

	const skills = $derived([
		{
			id: 'design',
			title: '3D Проектирование',
			subtitle: 'Цифровое моделирование пространства',
			description:
				'Создаем интерактивную 3D-модель вашей будущей кухни в реальном масштабе. Вы увидите фотореалистичный рендер материалов, текстур и освещения еще до начала производства.',
			bgImage: 'https://storage.yandexcloud.net/novostroy/bg/hero-1.jpg',
			gradient: 'from-violet-600 via-indigo-600 to-sky-500',
			accentColor: 'text-violet-400',
			glowColor: 'rgba(139, 92, 246, 0.15)',
			specs: [
				{ label: 'Точность модели', value: '100% совпадение' },
				{ label: 'Время создания', value: 'от 2 часов' },
				{ label: 'Формат', value: 'VR-панорама 360°' }
			]
		},
		{
			id: 'ergonomics',
			title: 'Инженерная эргономика',
			subtitle: 'Умная организация пространства',
			description:
				'Индивидуальный расчет высоты рабочих зон под ваш рост. Разработка скрытых выдвижных систем, бесшумных угловых решений и идеальной последовательности рабочих треугольников.',
			bgImage: 'https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg',
			gradient: 'from-cyan-600 via-sky-600 to-indigo-500',
			accentColor: 'text-cyan-400',
			glowColor: 'rgba(6, 182, 212, 0.15)',
			specs: [
				{ label: 'Оптимизация зон', value: '+45% полезной площади' },
				{ label: 'Тип механизмов', value: 'Push-to-open & Soft-close' },
				{ label: 'Анализ траекторий', value: 'Стандарт Blum Dynamic Space' }
			]
		},
		{
			id: 'materials',
			title: 'Материаловедение',
			subtitle: 'Эстетика премиальных текстур',
			description:
				'Работаем с лучшими мировыми материалами. Натуральный шпон дуба, итальянские эмали Soft-touch, кварцевый агломерат повышенной прочности и ультрасовременные нано-покрытия Fenix.',
			bgImage: 'https://storage.yandexcloud.net/novostroy/bg/hero-3.jpg',
			gradient: 'from-emerald-600 via-teal-600 to-sky-500',
			accentColor: 'text-emerald-400',
			glowColor: 'rgba(16, 185, 129, 0.15)',
			specs: [
				{ label: 'Столешницы', value: 'Кварц / Керамогранит' },
				{ label: 'Защита фасадов', value: 'Нано-лак против царапин' },
				{ label: 'Экологичность', value: 'Стандарт Е1 (Европа)' }
			]
		},
		{
			id: 'assembly',
			title: 'Высокоточный монтаж',
			subtitle: 'Безупречная интеграция за 1 день',
			description:
				'Монтаж выполняют сертифицированные инженеры фабрики LEGET с использованием лазерного нивелирования. Чистая установка со строительными пылесосами Festool и врезка всей бытовой техники.',
			bgImage: 'https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg',
			gradient: 'from-amber-600 via-rose-600 to-indigo-500',
			accentColor: 'text-amber-400',
			glowColor: 'rgba(245, 158, 11, 0.15)',
			specs: [
				{ label: 'Скорость сборки', value: '1 рабочий день' },
				{ label: 'Контроль зазоров', value: 'Допуск до 0.5 мм' },
				{ label: 'Гарантия сборки', value: 'Пожизненное обслуживание' }
			]
		}
	]);

	const activeSkill = $derived(skills[activeSkillIndex]);

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
		? 'bg-slate-50 text-slate-900'
		: 'bg-slate-950 text-white'}"
>
	<!-- Фоновое изображение с плавным переходом -->
	<div class="absolute inset-0 z-0">
		{#key activeSkillIndex}
			<img
				src={activeSkill.bgImage}
				alt="Фоновое изображение"
				class="absolute inset-0 h-full w-full scale-102 object-cover blur-[2px] transition-all duration-1000"
				in:fade={{ duration: 800 }}
			/>
		{/key}
		<!-- Динамический премиальный оверлей в зависимости от выбранного скилла и темы -->
		<div
			class="absolute inset-0 transition-colors duration-700 {isLight
				? 'bg-slate-50/88 backdrop-blur-md'
				: 'bg-slate-950/88 backdrop-blur-md'}"
		></div>
		<!-- Сетка и градиентные премиальные блики -->
		<div class="bg-radial-mesh pointer-events-none absolute inset-0 opacity-[0.2]"></div>
		<div
			class="absolute -top-40 -right-40 z-[1] h-[600px] w-[600px] rounded-full opacity-75 blur-[150px] transition-all duration-1000"
			style="background-color: {activeSkill.glowColor};"
		></div>
	</div>

	<div
		class="hero-shell relative z-10 mx-auto flex min-h-0 w-full max-w-screen-2xl flex-col justify-between px-4 pt-6 pb-24 sm:px-6 sm:py-8 md:px-8 lg:h-full lg:px-12 xl:px-16"
	>
		<!-- Логотип сверху -->
		<div class="hero-head flex w-full items-center justify-between pb-4">
			{#if data?.logoUrl || isEditable}
				<div class="w-24 transition-all duration-300 hover:scale-[1.03] md:w-32">
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
								<!-- max-h обязателен: без него квадратный логотип растягивается
								     до ширины бокса (128px) и выдавливает контент вниз. -->
								<img
									src={displayValue}
									alt={String(data?.logoAlt ?? 'Логотип')}
									class="relative max-h-12 w-full object-contain md:max-h-16 {isLight
										? ''
										: 'brightness-0 invert filter'}"
								/>
							{:else if isEditable}
								<div
									class="rounded-xl border border-dashed border-white/20 bg-white/5 p-3 text-[10px] font-bold tracking-widest text-white/50 uppercase backdrop-blur-md"
								>
									Логотип
								</div>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			{/if}
		</div>

		<!-- Главный грид -->
		<div
			class="hero-grid my-auto grid grid-cols-1 items-center gap-6 py-4 sm:py-6 lg:grid-cols-12 lg:gap-10 xl:gap-14"
		>
			<!-- Левая колонка: Описание скилла и фабрики -->
			<div class="flex flex-col items-start select-none lg:col-span-6">
				<!-- Заголовок страницы / Слоган -->
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
							<span
								class="shadow-glow inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md md:text-sm {isLight
									? 'border-indigo-200 bg-indigo-100/50 text-indigo-600'
									: 'border-indigo-500/20 bg-indigo-950/40 text-indigo-300'}"
							>
								<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500"></span>
								{displayValue}
							</span>
						{/snippet}
					</EditableField>
				</div>

				<!-- Заголовок -->
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
							class="font-display mb-3.5 bg-gradient-to-r bg-clip-text text-3xl leading-[1.1] font-extrabold tracking-tight text-transparent sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl {isLight
								? 'from-slate-900 via-slate-800 to-slate-700'
								: 'from-white via-slate-100 to-slate-400'}"
						>
							{displayValue}
						</h1>
					{/snippet}
				</EditableField>

				<!-- Описание -->
				<EditableField
					fieldKey="HeroMain.description"
					label="Описание"
					value={String(data?.description ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block w-full max-w-2xl"
				>
					{#snippet children(displayValue)}
						<p
							class="font-sans-premium mb-6 text-sm leading-relaxed font-normal transition-colors duration-500 md:text-base {isLight
								? 'text-slate-600'
								: 'text-slate-300'}"
						>
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<!-- Кнопка действия -->
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
								class="group relative w-full cursor-pointer overflow-hidden rounded-2xl p-[1px] transition-transform duration-300 focus:outline-none active:scale-[0.98] sm:w-auto"
							>
								<!-- Динамическая рамка с градиентом активного скилла -->
								<span
									class="absolute inset-0 rounded-2xl bg-gradient-to-r transition-all duration-1000 group-hover:rotate-180 {activeSkill.gradient}"
								></span>
								<span
									class="relative flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all duration-300 md:px-8 md:text-base {isLight
										? 'border border-slate-200/85 bg-slate-100 text-slate-800 hover:bg-white'
										: 'bg-slate-900/90 text-white hover:bg-slate-950/80 hover:text-white'}"
								>
									{displayValue}
									<svg
										class="h-4 w-4 text-indigo-400 transition-transform duration-300 group-hover:translate-x-1.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2.5"
											d="M14 5l7 7m0 0l-7 7m7-7H3"
										/>
									</svg>
								</span>
							</button>
						{/snippet}
					</EditableField>
				</div>

				<!-- Список Брендов-партнеров -->
				<div
					class="flex w-full flex-col gap-3.5 border-t pt-5 {isLight
						? 'border-slate-200'
						: 'border-white/10'}"
				>
					<span
						class="text-[10px] font-black tracking-widest uppercase {isLight
							? 'text-slate-500'
							: 'text-slate-400'}">Используем комплектующие лидеров рынка:</span
					>
					<div class="flex flex-wrap items-center gap-4">
						{#each brands as brand}
							<a
								href={brand.url}
								target="_blank"
								rel="noopener noreferrer"
								class="brand-capsule flex items-center justify-center rounded-xl border px-4 py-2 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 {isLight
									? 'border-slate-200 bg-white/70 hover:border-indigo-500/30'
									: 'border-white/5 bg-white/5 opacity-60 hover:border-indigo-500/20 hover:opacity-100'}"
							>
								<img
									class="max-h-[16px] max-w-[64px] object-contain transition-all duration-300 {isLight
										? 'opacity-60 brightness-0 hover:opacity-100'
										: 'brightness-0 invert filter'}"
									src={brand.logo}
									alt={brand.name}
								/>
							</a>
						{/each}
					</div>
				</div>
			</div>

			<!-- Правая колонка: Интерактивный интерактивный стенд "Скиллы" -->
			<div class="flex w-full items-center justify-center lg:col-span-6">
				<div
					class="relative flex w-full max-w-lg flex-col gap-5 overflow-hidden rounded-3xl border p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 sm:p-6 xl:max-w-[540px] {isLight
						? 'border-slate-200 bg-white/80'
						: 'border-white/10 bg-slate-900/50'}"
				>
					<!-- Шапка панели Скиллов -->
					<div
						class="flex items-center justify-between border-b pb-3 {isLight
							? 'border-slate-100'
							: 'border-white/5'}"
					>
						<span
							class="text-xs font-black tracking-wider uppercase {isLight
								? 'text-slate-500'
								: 'text-slate-400'}">Профессиональные Скиллы LEGET</span
						>
						<span
							class="rounded-full border px-2 py-0.5 text-[10px] font-bold {isLight
								? 'border-indigo-400 bg-indigo-50 text-indigo-600'
								: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'}">Мастерство</span
						>
					</div>

					<!-- Вертикальный список-переключатель скиллов -->
					<div class="flex flex-col gap-2">
						{#each skills as skill, idx}
							<button
								type="button"
								onclick={() => (activeSkillIndex = idx)}
								class="group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-3.5 text-left transition-all duration-300 {activeSkillIndex ===
								idx
									? isLight
										? 'translate-x-1 border-indigo-200 bg-white shadow-md'
										: 'translate-x-1 border-indigo-500/30 bg-slate-900/80 shadow-lg'
									: isLight
										? 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'
										: 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'}"
							>
								<!-- Номер / Иконка скилла с динамическим градиентным кругом -->
								<div
									class="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-all duration-300 {activeSkillIndex ===
									idx
										? `bg-gradient-to-br ${skill.gradient} text-white shadow-lg`
										: isLight
											? 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
											: 'bg-white/5 text-white/50 group-hover:bg-white/10'}"
								>
									0{idx + 1}
								</div>

								<!-- Текст скилла -->
								<div class="min-w-0 flex-1">
									<h3
										class="text-sm font-bold tracking-tight transition-colors duration-300 {activeSkillIndex ===
										idx
											? isLight
												? 'text-indigo-600'
												: 'text-white'
											: isLight
												? 'text-slate-800'
												: 'text-slate-300'}"
									>
										{skill.title}
									</h3>
									<p
										class="mt-0.5 truncate text-[11px] leading-normal font-semibold {activeSkillIndex ===
										idx
											? isLight
												? 'text-slate-500'
												: 'text-slate-400'
											: 'text-slate-500'}"
									>
										{skill.subtitle}
									</p>
								</div>

								<!-- Стрелка активности -->
								{#if activeSkillIndex === idx}
									<div
										class="flex h-6 w-6 items-center justify-center self-center text-indigo-500"
										in:fly={{ x: -6, duration: 250 }}
									>
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="3"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								{/if}
							</button>
						{/each}
					</div>

					<!-- Презентация контента выбранного скилла с плавным переходом -->
					<div
						class="relative overflow-hidden rounded-2xl border p-4.5 {isLight
							? 'border-slate-200/80 bg-slate-100/40'
							: 'border-white/5 bg-slate-950/40'}"
					>
						{#key activeSkillIndex}
							<div class="flex flex-col gap-3" in:fade={{ duration: 300 }}>
								<!-- Описание выбранного скилла -->
								<p
									class="text-xs leading-relaxed font-semibold sm:text-[12.5px] {isLight
										? 'text-slate-600'
										: 'text-slate-200'}"
								>
									{activeSkill.description}
								</p>

								<!-- Спецификации / Важные показатели скилла -->
								<div
									class="grid grid-cols-3 gap-2 border-t pt-3.5 {isLight
										? 'border-slate-200'
										: 'border-white/5'}"
								>
									{#each activeSkill.specs as spec}
										<div class="flex flex-col">
											<span
												class="text-[9px] font-black tracking-wider uppercase {isLight
													? 'text-slate-400'
													: 'text-slate-500'}">{spec.label}</span
											>
											<span
												class="mt-0.5 text-[10.5px] leading-tight font-bold {isLight
													? 'text-slate-800'
													: 'text-white'}">{spec.value}</span
											>
										</div>
									{/each}
								</div>
							</div>
						{/key}
					</div>
				</div>
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

	/* Второй уровень — совсем низкие окна (ноутбуки 1366×768 и подобные). */
	@media (min-width: 1024px) and (max-height: 800px) {
		.hero-shell {
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
		}

		.hero-grid {
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
		}
	}

	/* Тонкая сетка поверх фона для технологичного стиля */
	.bg-radial-mesh {
		background-image: radial-gradient(rgba(99, 102, 241, 0.08) 1px, transparent 0);
		background-size: 24px 24px;
	}

	.shadow-glow {
		box-shadow: 0 0 25px rgba(99, 102, 241, 0.12);
	}

	:global(.font-sans-premium) {
		font-family: 'Jost', sans-serif !important;
	}

	:global(.font-display) {
		font-family: 'Playfair Display', serif !important;
	}

	.brand-capsule img {
		transition:
			filter 0.3s,
			transform 0.3s;
	}

	.brand-capsule:hover img {
		filter: brightness(0) invert(1) drop-shadow(0 0 6px rgba(99, 102, 241, 0.4));
	}
</style>
