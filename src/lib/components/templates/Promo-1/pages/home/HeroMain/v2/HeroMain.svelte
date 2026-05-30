<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import { fade } from 'svelte/transition';

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

	// ─── Style selector states ────────────────────────────────────────────────
	let activeStyleIndex = $state(0);
	let activeHotspot = $state<{ label: string; desc: string } | null>(null);

	const styleOptions = [
		{
			id: 'loft',
			name: 'Лофт',
			description:
				'Матовые графитовые фасады, глубокая текстура дерева, темный металл и строгая геометрия.',
			image: 'https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg',
			hotspots: [
				{
					x: 32,
					y: 38,
					label: 'Фурнитура Blum (Австрия)',
					desc: 'Петли с доводчиком Clip Top Blumotion. Пожизненная гарантия.'
				},
				{
					x: 62,
					y: 48,
					label: 'Матовые фасады МДФ эмаль',
					desc: 'Сверхпрочное покрытие Soft-touch с защитой от отпечатков пальцев.'
				},
				{
					x: 45,
					y: 72,
					label: 'LED-подсветка в профиле',
					desc: 'Встроенный бесконтактный датчик движения и диммер яркости.'
				}
			],
			specs: [
				{ label: 'Материалы', value: 'МДФ + Шпон дуба' },
				{ label: 'Фурнитура', value: 'Blum (Австрия)' },
				{ label: 'Срок', value: 'от 14 дней' }
			]
		},
		{
			id: 'minimalism',
			name: 'Минимализм',
			description:
				'Чистые линии, фасады без ручек с системой открывания Push-to-Open и скрытые системы хранения.',
			image: 'https://storage.yandexcloud.net/novostroy/bg/hero-1.jpg',
			hotspots: [
				{
					x: 52,
					y: 35,
					label: 'Профиль Gola',
					desc: 'Интегрированный алюминиевый профиль для открывания без ручек.'
				},
				{
					x: 28,
					y: 55,
					label: 'Кварцевый агломерат',
					desc: 'Столешница повышенной прочности, устойчивая к царапинам и пятнам.'
				},
				{
					x: 75,
					y: 22,
					label: 'Push-to-Open петли',
					desc: 'Легкое открывание нажатием на фасад благодаря магнитным толкателям.'
				}
			],
			specs: [
				{ label: 'Материалы', value: 'Акрил + Кварц' },
				{ label: 'Фурнитура', value: 'Hettich (Германия)' },
				{ label: 'Срок', value: 'от 12 дней' }
			]
		},
		{
			id: 'classic',
			name: 'Классика',
			description:
				'Изящные фрезеровки, светлые пастельные тона, латунная фурнитура и благородная сдержанность.',
			image: 'https://storage.yandexcloud.net/novostroy/bg/hero-3.jpg',
			hotspots: [
				{
					x: 42,
					y: 42,
					label: 'Декоративная фрезеровка',
					desc: 'Идеальные пропорции, классические рамки и матовый лак.'
				},
				{
					x: 72,
					y: 60,
					label: 'Витрины с подсветкой',
					desc: 'Закаленное стекло Optiwhite со скрытым врезным диодным профилем.'
				}
			],
			specs: [
				{ label: 'Материалы', value: 'МДФ + Патина' },
				{ label: 'Фурнитура', value: 'Aristo + Blum' },
				{ label: 'Срок', value: 'от 20 дней' }
			]
		},
		{
			id: 'scandi',
			name: 'Сканди',
			description:
				'Натуральное дерево, белые матовые оттенки, максимальная практичность и обилие естественного света.',
			image: 'https://storage.yandexcloud.net/novostroy/bg/hero-1.jpg',
			hotspots: [
				{
					x: 35,
					y: 45,
					label: 'Натуральный массив',
					desc: 'Экологичные фасады из массива ясеня под матовым защитным лаком.'
				},
				{
					x: 65,
					y: 50,
					label: 'Рейлинговые системы',
					desc: 'Удобное хранение кухонных аксессуаров в рабочей зоне.'
				}
			],
			specs: [
				{ label: 'Материалы', value: 'Массив + Экоплита' },
				{ label: 'Фурнитура', value: 'Egger + Hettich' },
				{ label: 'Срок', value: 'от 15 дней' }
			]
		},
		{
			id: 'hitech',
			name: 'Хай-Тек',
			description:
				'Космический дизайн: стеклянные фасады в тонких алюминиевых рамах, умная сенсорная техника.',
			image: 'https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg',
			hotspots: [
				{
					x: 48,
					y: 30,
					label: 'Сенсорные приводы',
					desc: 'Электрическая система открывания шкафов Servo-Drive от Blum.'
				},
				{
					x: 70,
					y: 52,
					label: 'Фасады из стекла',
					desc: 'Ударопрочное тонированное стекло в узком матовом черном профиле.'
				}
			],
			specs: [
				{ label: 'Материалы', value: 'Стекло + Алюминий' },
				{ label: 'Фурнитура', value: 'Blum Servo-Drive' },
				{ label: 'Срок', value: 'от 18 дней' }
			]
		},
		{
			id: 'provence',
			name: 'Прованс',
			description:
				'Уютный средиземноморский стиль: фасады с эффектом старения, открытые полки и теплые пастельные тона.',
			image: 'https://storage.yandexcloud.net/novostroy/bg/hero-3.jpg',
			hotspots: [
				{
					x: 40,
					y: 35,
					label: 'Эффект старения (декапе)',
					desc: 'Ручное нанесение патины для создания винтажной благородной текстуры.'
				},
				{
					x: 60,
					y: 65,
					label: 'Открытые буфеты',
					desc: 'Элегантные открытые полки для посуды и декора в прованском стиле.'
				}
			],
			specs: [
				{ label: 'Материалы', value: 'МДФ + Эмаль патина' },
				{ label: 'Фурнитура', value: 'Aristo Vintage' },
				{ label: 'Срок', value: 'от 16 дней' }
			]
		}
	];

	const activeStyle = $derived(styleOptions[activeStyleIndex]);
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
</svelte:head>

<section
	class="relative flex min-h-0 lg:min-h-[calc(100vh-var(--header-h,80px))] w-full items-center justify-start overflow-x-hidden font-sans-premium transition-colors duration-500 {isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'}"
>

	<!-- Абстрактные линии и фоновые градиенты (взамен фонового изображения) -->
	<div class="absolute inset-0 z-0 overflow-hidden transition-colors duration-500 {isLight ? 'bg-slate-50' : 'bg-slate-950'}">
		<!-- Световые премиальные блики -->
		<div class="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-500 z-[1] {isLight ? 'bg-sky-400/20' : 'bg-sky-500/12'}"></div>
		<div class="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] rounded-full blur-[130px] transition-colors duration-500 z-[1] {isLight ? 'bg-indigo-400/20' : 'bg-indigo-500/12'}"></div>
		
		<!-- Абстрактная векторная геометрия -->
		<svg class="absolute inset-0 h-full w-full z-[2] transition-opacity duration-500 {isLight ? 'opacity-65' : 'opacity-55'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800" preserveAspectRatio="none">
			<!-- Плавные волновые траектории (чертёж) -->
			<path d="M-100,200 C300,400 600,100 1000,500 C1200,700 1400,600 1600,650" fill="none" stroke="url(#line-grad-1)" stroke-width="1.5" />
			<path d="M-50,250 C350,420 650,150 1050,480 C1250,650 1450,550 1650,600" fill="none" stroke="url(#line-grad-2)" stroke-width="1" stroke-dasharray="4 4" />
			<path d="M-100,600 C200,450 500,700 900,300 C1100,100 1300,200 1600,150" fill="none" stroke="url(#line-grad-3)" stroke-width="1.5" />
			<path d="M-50,650 C250,500 550,720 950,350 C1150,180 1350,250 1650,200" fill="none" stroke="url(#line-grad-1)" stroke-width="0.75" />
			
			<!-- Векторная перспектива / Архитектурная сетка -->
			<path d="M100,-50 L100,850 M200,-50 L250,850 M300,-50 L400,850 M400,-50 L550,850 M500,-50 L700,850 M600,-50 L850,850 M700,-50 L1000,850 M800,-50 L1150,850 M900,-50 L1300,850 M1000,-50 L1450,850 M1100,-50 L1600,850" fill="none" stroke={isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(56, 189, 248, 0.08)'} stroke-width="0.75" />
			<path d="M-50,100 L1650,100 M-50,200 C300,250 800,150 1650,200 M-50,300 C400,380 900,250 1650,300 M-50,400 C500,500 1000,350 1650,400 M-50,500 C600,600 1100,450 1650,500 M-50,600 L1650,600 M-50,700 L1650,700" fill="none" stroke={isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(99, 102, 241, 0.08)'} stroke-width="0.75" />

			<defs>
				<linearGradient id="line-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#38bdf8" stop-opacity="0" />
					<stop offset="50%" stop-color="#38bdf8" stop-opacity={isLight ? 0.55 : 0.4} />
					<stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
				</linearGradient>
				<linearGradient id="line-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#6366f1" stop-opacity="0" />
					<stop offset="30%" stop-color="#38bdf8" stop-opacity={isLight ? 0.45 : 0.35} />
					<stop offset="70%" stop-color="#6366f1" stop-opacity={isLight ? 0.45 : 0.35} />
					<stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
				</linearGradient>
				<linearGradient id="line-grad-3" x1="100%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color="#38bdf8" stop-opacity="0" />
					<stop offset="50%" stop-color="#6366f1" stop-opacity={isLight ? 0.4 : 0.3} />
					<stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
				</linearGradient>
			</defs>
		</svg>
		
		<!-- Затемнение краев и фокуса (теперь мягкие полупрозрачные переходы вместо глухой 90% заливки) -->
		<div class="absolute inset-0 bg-gradient-to-b transition-all duration-500 {isLight ? 'from-slate-50/15 via-transparent to-slate-50/35' : 'from-slate-950/40 via-transparent to-slate-950/75'} z-[1] pointer-events-none"></div>
		<div class="absolute inset-0 transition-all duration-500 {isLight ? 'bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(248,250,252,0.4)_80%)]' : 'bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(8,11,22,0.5)_80%)]'} z-[1] pointer-events-none"></div>
		<!-- Фоновая мелкая сетка -->
		<div class="bg-radial-mesh absolute inset-0 z-[1] opacity-[0.25] transition-opacity duration-500 {isLight ? 'invert-[0.1]' : ''}"></div>
	</div>

	<!-- Основной контент -->
	<div
		class="relative z-10 mx-auto flex min-h-0 lg:min-h-[calc(100vh-var(--header-h,80px)-60px)] w-full max-w-screen-2xl flex-col justify-between px-4 pt-6 pb-28 sm:px-6 sm:py-8 md:px-8 lg:px-12 xl:px-16"
	>
		<!-- Верхняя панель (Логотип) -->
		<div class="flex w-full items-center justify-between pb-3 sm:pb-4">
			{#if data?.logoUrl || isEditable}
				<div
					class="w-24 transition-all duration-300 hover:scale-[1.03] hover:drop-shadow-[0_0_15px_rgba(56,189,248,0.2)] md:w-32"
				>
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
									class="relative w-full object-contain brightness-0 invert filter"
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

		<!-- Главный 12-колоночный грид -->
		<div
			class="my-auto grid grid-cols-1 items-center gap-6 py-4 sm:py-6 lg:grid-cols-12 lg:gap-10 xl:gap-12"
		>
			<!-- Левая колонка (Контент) -->
			<div class="flex flex-col items-start select-none lg:col-span-6">
				<!-- Название компании (Pill Badge с пульсирующим эффектом) -->
				<div class="mb-3.5">
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
								class="shadow-glow inline-flex items-center gap-2 rounded-full border transition-all duration-300 px-3.5 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md md:text-sm {isLight ? 'border-sky-200 bg-sky-100/50 text-sky-600 hover:border-sky-300 hover:bg-sky-100/70' : 'border-sky-400/20 bg-sky-950/40 text-sky-300 hover:border-sky-400/40'}"
							>
								<span class="relative flex h-2 w-2">
									<span
										class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"
									></span>
									<span class="relative inline-flex h-2 w-2 rounded-full bg-sky-400"></span>
								</span>
								{displayValue}
							</span>
						{/snippet}
					</EditableField>
				</div>

				<!-- Заголовок (Массивный, премиальный градиент с уменьшенным размером под ноутбуки) -->
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
							class="font-display mb-3.5 bg-gradient-to-r bg-clip-text text-3xl leading-[1.1] font-extrabold tracking-tight text-transparent sm:text-4xl md:text-5xl lg:text-5xl xl:text-7xl {isLight ? 'from-slate-900 via-slate-850 to-slate-700' : 'from-white via-slate-100 to-slate-400 hero-title'}"
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
					class="block w-full max-w-3xl"
				>
					{#snippet children(displayValue)}
						<p
							class="font-sans-premium mb-5 max-w-2xl text-base leading-relaxed font-normal md:text-lg transition-colors duration-500 {isLight ? 'text-slate-600' : 'text-slate-300 hero-description'}"
						>
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<!-- Кнопка с градиентом и интерактивным эффектом -->
				<div class="mb-6 flex w-full items-center sm:w-auto">
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
								class="group relative w-full overflow-hidden rounded-2xl p-[1px] transition-transform duration-300 focus:outline-none active:scale-[0.98] sm:w-auto"
							>
								<!-- Анимированная рамка с подсветкой -->
								<span
									class="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-400 transition-all duration-500 group-hover:rotate-180"
								></span>

								<!-- Кнопка сверху -->
								<span
									class="relative flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all duration-300 md:px-8 md:text-base {isLight ? 'bg-slate-100 hover:bg-white text-slate-800 border border-slate-200/85' : 'bg-slate-900/90 hover:bg-slate-950/80 hover:text-sky-300 text-white'}"
								>
									{displayValue}
									<svg
										class="h-4 w-4 text-sky-400 transition-transform duration-300 group-hover:translate-x-1.5"
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

								<!-- Свечение снизу -->
								<div
									class="absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 {isLight ? 'bg-sky-400/10' : 'bg-sky-500/20'}"
								></div>
							</button>
						{/snippet}
					</EditableField>
				</div>

				<!-- Карточки доверия (Trust Badges - супер-компактные, 6 штук) -->
				<div class="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
					<!-- Карточка 1 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 p-2.5 sm:p-3 {isLight ? 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white shadow-sm' : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'}"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 {isLight ? 'border-sky-400/20 bg-sky-50 text-sky-600' : 'border-sky-500/20 bg-sky-500/10 text-sky-400'}"
						>
							<svg
								class="h-4 w-4 sm:h-5 sm:w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>
						<div class="min-w-0">
							<div class="truncate text-xs font-bold sm:text-sm transition-colors duration-500 {isLight ? 'text-slate-800' : 'text-white'}">10+ лет гарантии</div>
							<div class="truncate text-[10px] sm:text-xs transition-colors duration-500 {isLight ? 'text-slate-500' : 'text-slate-400'}">Официальный договор</div>
						</div>
					</div>
					<!-- Карточка 2 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 p-2.5 sm:p-3 {isLight ? 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white shadow-sm' : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'}"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 {isLight ? 'border-sky-400/20 bg-sky-50 text-sky-600' : 'border-sky-500/20 bg-sky-500/10 text-sky-400'}"
						>
							<svg
								class="h-4 w-4 sm:h-5 sm:w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
						</div>
						<div class="min-w-0">
							<div class="truncate text-xs font-bold sm:text-sm transition-colors duration-500 {isLight ? 'text-slate-800' : 'text-white'}">Своя фабрика</div>
							<div class="truncate text-[10px] sm:text-xs transition-colors duration-500 {isLight ? 'text-slate-500' : 'text-slate-400'}">Без наценки салонов</div>
						</div>
					</div>
					<!-- Карточка 3 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 p-2.5 sm:p-3 {isLight ? 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white shadow-sm' : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'}"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 {isLight ? 'border-sky-400/20 bg-sky-50 text-sky-600' : 'border-sky-500/20 bg-sky-500/10 text-sky-400'}"
						>
							<svg
								class="h-4 w-4 sm:h-5 sm:w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
						</div>
						<div class="min-w-0">
							<div class="truncate text-xs font-bold sm:text-sm transition-colors duration-500 {isLight ? 'text-slate-800' : 'text-white'}">Проект за 2 часа</div>
							<div class="truncate text-[10px] sm:text-xs transition-colors duration-500 {isLight ? 'text-slate-500' : 'text-slate-400'}">Спецификация и 3D</div>
						</div>
					</div>
					<!-- Карточка 4 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 p-2.5 sm:p-3 {isLight ? 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white shadow-sm' : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'}"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 {isLight ? 'border-sky-400/20 bg-sky-50 text-sky-600' : 'border-sky-500/20 bg-sky-500/10 text-sky-400'}"
						>
							<svg
								class="h-4 w-4 sm:h-5 sm:w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
								/>
							</svg>
						</div>
						<div class="min-w-0">
							<div class="truncate text-xs font-bold sm:text-sm transition-colors duration-500 {isLight ? 'text-slate-800' : 'text-white'}">Рассрочка 0%</div>
							<div class="truncate text-[10px] sm:text-xs transition-colors duration-500 {isLight ? 'text-slate-500' : 'text-slate-400'}">До 12 месяцев</div>
						</div>
					</div>
					<!-- Карточка 5 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 p-2.5 sm:p-3 {isLight ? 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white shadow-sm' : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'}"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 {isLight ? 'border-sky-400/20 bg-sky-50 text-sky-600' : 'border-sky-500/20 bg-sky-500/10 text-sky-400'}"
						>
							<svg
								class="h-4 w-4 sm:h-5 sm:w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						</div>
						<div class="min-w-0">
							<div class="truncate text-xs font-bold sm:text-sm transition-colors duration-500 {isLight ? 'text-slate-800' : 'text-white'}">Бесплатный замер</div>
							<div class="truncate text-[10px] sm:text-xs transition-colors duration-500 {isLight ? 'text-slate-500' : 'text-slate-400'}">Выезд с образцами</div>
						</div>
					</div>
					<!-- Карточка 6 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 p-2.5 sm:p-3 {isLight ? 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white shadow-sm' : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'}"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 {isLight ? 'border-sky-400/20 bg-sky-50 text-sky-600' : 'border-sky-500/20 bg-sky-500/10 text-sky-400'}"
						>
							<svg
								class="h-4 w-4 sm:h-5 sm:w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						</div>
						<div class="min-w-0">
							<div class="truncate text-xs font-bold sm:text-sm transition-colors duration-500 {isLight ? 'text-slate-800' : 'text-white'}">Сборка за 1 день</div>
							<div class="truncate text-[10px] sm:text-xs transition-colors duration-500 {isLight ? 'text-slate-500' : 'text-slate-400'}">Под ключ с техникой</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Правая колонка (Интерактивный виджет выбора стиля - увеличенный размер) -->
			<div class="flex w-full items-center justify-center lg:col-span-6">
				<div
					class="relative flex w-full max-w-lg flex-col gap-4.5 overflow-hidden rounded-3xl border p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 sm:p-6 xl:max-w-[540px] {isLight ? 'border-slate-200 bg-white/90 hover:border-slate-300' : 'border-white/10 bg-slate-900/60 hover:border-white/15'}"
				>
					<!-- Световой блик/градиент на карточке -->
					<div
						class="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl transition-colors duration-500 {isLight ? 'bg-sky-400/15' : 'bg-sky-500/10'}"
					></div>

					<!-- Заголовок карточки -->
					<div class="flex items-center justify-between border-b pb-2.5 {isLight ? 'border-slate-100' : 'border-white/5'}">
						<span class="text-xs font-black tracking-wider uppercase transition-colors duration-500 {isLight ? 'text-slate-500' : 'text-slate-400'}"
							>Решения по стилю</span
						>
						<span
							class="rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all duration-500 {isLight ? 'border-sky-400 bg-sky-50 text-sky-600' : 'border-sky-500/30 bg-sky-500/10 text-sky-400'}"
							>3D-Обзор</span
						>
					</div>

					<!-- Переключатель вкладок -->
					<div class="grid grid-cols-3 gap-1.5 rounded-xl border p-1 transition-all duration-500 {isLight ? 'border-slate-200/60 bg-slate-100/60' : 'border-white/5 bg-white/5'}">
						{#each styleOptions as opt, idx}
							<button
								type="button"
								onclick={() => {
									activeStyleIndex = idx;
									activeHotspot = null;
								}}
								class="rounded-lg py-2 text-center text-[10.5px] font-bold transition-all duration-300 {activeStyleIndex ===
								idx
									? 'bg-sky-500 text-white shadow-md'
									: (isLight ? 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800' : 'text-slate-400 hover:bg-white/5 hover:text-white')}"
							>
								{opt.name}
							</button>
						{/each}
					</div>

					<!-- Описание выбранного стиля (Временно скрыто по просьбе пользователя)
					<p class="text-xs sm:text-[13px] text-slate-300 min-h-[36px] leading-relaxed font-medium">
						{activeStyle.description}
					</p>
					-->

					<!-- Контейнер изображения с интерактивными точками (Большой классический формат 4:3) -->
					<div
						class="group/img relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
					>
						{#key activeStyleIndex}
							<img
								src={activeStyle.image}
								alt={activeStyle.name}
								class="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-105"
								in:fade={{ duration: 400 }}
							/>
						{/key}

						<!-- Наложение затемнения при активном хотспоте -->
						<div
							class="pointer-events-none absolute inset-0 bg-slate-950/20 transition-all duration-300 {activeHotspot
								? 'bg-slate-950/30 backdrop-blur-[1px]'
								: ''}"
						></div>

						<!-- Интерактивные точки (Hotspots) -->
						{#each activeStyle.hotspots as hs}
							<button
								type="button"
								class="group/hs pointer-events-auto absolute -mt-3.5 -ml-3.5 flex h-7 w-7 items-center justify-center"
								style="left: {hs.x}%; top: {hs.y}%;"
								onclick={() => {
									if (activeHotspot?.label === hs.label) {
										activeHotspot = null;
									} else {
										activeHotspot = hs;
									}
								}}
								onmouseenter={() => {
									activeHotspot = hs;
								}}
								onmouseleave={() => {
									activeHotspot = null;
								}}
								aria-label={hs.label}
							>
								<!-- Пульсация -->
								<span class="absolute inset-0 animate-ping rounded-full bg-sky-400/80 opacity-75"
								></span>
								<!-- Центральная точка -->
								<span
									class="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.8)] transition-transform duration-300 group-hover/hs:scale-125 group-hover/hs:bg-white"
								></span>
							</button>
						{/each}

						<!-- Всплывающая плашка информации по хотспоту -->
						{#if activeHotspot}
							<div
								class="animate-slide-up absolute right-3 bottom-3 left-3 z-20 rounded-xl border border-white/10 bg-slate-950/90 p-3.5 shadow-2xl backdrop-blur-xl transition-all duration-300"
							>
								<h4
									class="mb-1 flex items-center gap-1.5 text-xs font-black tracking-wider text-sky-300 uppercase"
								>
									<span class="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
									{activeHotspot.label}
								</h4>
								<p class="text-[10.5px] leading-normal font-semibold text-slate-200">
									{activeHotspot.desc}
								</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Нижний блок (Бренды с капсульным эффектом - просторный и премиальный) -->
		<div
			class="mt-8 flex w-full flex-col items-center justify-between gap-5 border-t pt-6 pb-3 md:flex-row transition-colors duration-500 {isLight ? 'border-slate-200' : 'border-white/10'}"
		>
			<span
				class="flex items-center gap-2.5 text-[10px] font-black tracking-widest uppercase md:text-[11px] transition-colors duration-500 {isLight ? 'text-slate-500' : 'text-slate-400'}"
			>
				<span class="h-3 w-0.5 rounded-full bg-sky-500"></span>
				Наши ключевые партнеры:
			</span>
			<div class="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4.5">
				{#each brands as brand}
					<a
						href={brand.url}
						target="_blank"
						rel="noopener noreferrer"
						class="brand-capsule flex items-center justify-center rounded-xl border px-5 py-2.5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 {isLight ? 'border-slate-200 bg-white/70 hover:border-sky-500/30 hover:bg-white shadow-sm' : 'border-white/5 bg-white/5 hover:border-sky-500/20 hover:bg-white/10 opacity-60 hover:opacity-100'}"
					>
						<img
							class="max-h-[22px] max-w-[72px] object-contain transition-all duration-300 {isLight ? 'brightness-0 opacity-60 hover:opacity-100' : 'brightness-0 invert filter'}"
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
	/* Кастомные шрифты и эффекты */
	@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

	:global(.font-display) {
		font-family: 'Playfair Display', serif !important;
	}

	:global(.font-sans-premium) {
		font-family: 'Jost', sans-serif !important;
	}

	/* Премиальные градиенты наложения */
	.bg-overlay {
		background: linear-gradient(
			90deg,
			rgba(8, 11, 22, 0.98) 0%,
			rgba(8, 11, 22, 0.9) 30%,
			rgba(8, 11, 22, 0.7) 60%,
			rgba(8, 11, 22, 0.4) 100%
		);
	}

	@media (max-width: 1024px) {
		.bg-overlay {
			background: linear-gradient(
				180deg,
				rgba(8, 11, 22, 0.98) 0%,
				rgba(8, 11, 22, 0.92) 50%,
				rgba(8, 11, 22, 0.8) 100%
			);
		}
	}

	/* Тонкая сетка поверх фона для технологичного стиля */
	.bg-radial-mesh {
		background-image: radial-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 0);
		background-size: 24px 24px;
	}

	.shadow-glow {
		box-shadow: 0 0 25px rgba(56, 189, 248, 0.12);
	}

	.hero-title {
		text-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
	}

	.hero-description {
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
	}

	/* Анимация появления плашки хотспота */
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-slide-up {
		animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	/* Бренды */
	.brand-capsule img {
		transition:
			filter 0.3s,
			transform 0.3s;
	}

	.brand-capsule:hover img {
		filter: brightness(0) invert(1) drop-shadow(0 0 6px rgba(56, 189, 248, 0.4));
	}
</style>
