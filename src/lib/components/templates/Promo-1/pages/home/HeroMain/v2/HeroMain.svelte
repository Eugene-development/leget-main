<script lang="ts">
	// Артикул: 1.1.1.2 — см. docs/architecture/component-articles-map.md
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
			description: 'Натуральное дерево, белые матовые оттенки и обилие естественного света.',
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

<!-- Jost/Playfair fonts are loaded once in Promo-1 layout/Header.svelte -->

<section
	class="font-sans-premium relative flex min-h-0 w-full items-center justify-start overflow-x-hidden transition-colors duration-500 lg:h-full {isLight
		? 'bg-ink-50 text-ink-900'
		: 'bg-ink-950 text-on-dark'}"
>
	<!-- Абстрактные линии и фоновые градиенты (взамен фонового изображения) -->
	<div
		class="absolute inset-0 z-0 overflow-hidden transition-colors duration-500 {isLight
			? 'bg-ink-50'
			: 'bg-ink-950'}"
	>
		<!-- Световые премиальные блики -->
		<div
			class="absolute top-1/4 left-1/4 z-[1] h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-500 {isLight
				? 'bg-link-400/20'
				: 'bg-link-500/12'}"
		></div>
		<div
			class="absolute right-1/4 bottom-1/4 z-[1] h-[600px] w-[600px] rounded-full blur-[130px] transition-colors duration-500 {isLight
				? 'bg-cat-4-400/20'
				: 'bg-cat-4-500/12'}"
		></div>

		<!-- Абстрактная векторная геометрия -->
		<svg
			class="absolute inset-0 z-[2] h-full w-full transition-opacity duration-500 {isLight
				? 'opacity-65'
				: 'opacity-55'}"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 1440 800"
			preserveAspectRatio="none"
		>
			<!-- Плавные волновые траектории (чертёж) -->
			<path
				d="M-100,200 C300,400 600,100 1000,500 C1200,700 1400,600 1600,650"
				fill="none"
				stroke="url(#line-grad-1)"
				stroke-width="1.5"
			/>
			<path
				d="M-50,250 C350,420 650,150 1050,480 C1250,650 1450,550 1650,600"
				fill="none"
				stroke="url(#line-grad-2)"
				stroke-width="1"
				stroke-dasharray="4 4"
			/>
			<path
				d="M-100,600 C200,450 500,700 900,300 C1100,100 1300,200 1600,150"
				fill="none"
				stroke="url(#line-grad-3)"
				stroke-width="1.5"
			/>
			<path
				d="M-50,650 C250,500 550,720 950,350 C1150,180 1350,250 1650,200"
				fill="none"
				stroke="url(#line-grad-1)"
				stroke-width="0.75"
			/>

			<!-- Векторная перспектива / Архитектурная сетка -->
			<path
				d="M100,-50 L100,850 M200,-50 L250,850 M300,-50 L400,850 M400,-50 L550,850 M500,-50 L700,850 M600,-50 L850,850 M700,-50 L1000,850 M800,-50 L1150,850 M900,-50 L1300,850 M1000,-50 L1450,850 M1100,-50 L1600,850"
				fill="none"
				stroke={isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(56, 189, 248, 0.08)'}
				stroke-width="0.75"
			/>
			<path
				d="M-50,100 L1650,100 M-50,200 C300,250 800,150 1650,200 M-50,300 C400,380 900,250 1650,300 M-50,400 C500,500 1000,350 1650,400 M-50,500 C600,600 1100,450 1650,500 M-50,600 L1650,600 M-50,700 L1650,700"
				fill="none"
				stroke={isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(99, 102, 241, 0.08)'}
				stroke-width="0.75"
			/>

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
		<div
			class="absolute inset-0 bg-gradient-to-b transition-all duration-500 {isLight
				? 'from-ink-50/15 via-transparent to-ink-50/35'
				: 'from-ink-950/40 via-transparent to-ink-950/75'} pointer-events-none z-[1]"
		></div>
		<div
			class="absolute inset-0 transition-all duration-500 {isLight
				? 'bg-[radial-gradient(ellipse_at_center,transparent_30%,color-mix(in_oklab,var(--color-ink-50)_40%,transparent)_80%)]'
				: 'bg-[radial-gradient(ellipse_at_center,transparent_30%,color-mix(in_oklab,var(--color-alt-night-bar)_50%,transparent)_80%)]'} pointer-events-none z-[1]"
		></div>
		<!-- Фоновая мелкая сетка -->
		<div
			class="bg-radial-mesh absolute inset-0 z-[1] opacity-[0.25] transition-opacity duration-500 {isLight
				? 'invert-[0.1]'
				: ''}"
		></div>
	</div>

	<!-- Основной контент -->
	<div
		class="hero-shell relative z-10 mx-auto flex min-h-0 w-full max-w-screen-2xl flex-col justify-between px-4 pt-4 pb-8 sm:px-6 sm:py-8 md:px-8 lg:h-full lg:px-12 xl:px-16"
	>
		<!-- Главный 12-колоночный грид -->
		<div
			class="hero-grid my-auto grid grid-cols-1 items-center gap-6 py-1 lg:grid-cols-12 lg:gap-10 lg:py-2 xl:gap-12"
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
								class="shadow-glow inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md transition-all duration-300 md:text-sm {isLight
									? 'border-link-200 bg-link-100/50 text-link-600 hover:border-link-300 hover:bg-link-100/70'
									: 'border-link-400/20 bg-link-950/40 text-link-300 hover:border-link-400/40'}"
							>
								<span class="relative flex h-2 w-2">
									<span
										class="absolute inline-flex h-full w-full animate-ping rounded-full bg-link-400 opacity-75"
									></span>
									<span class="relative inline-flex h-2 w-2 rounded-full bg-link-400"></span>
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
							class="font-display mb-3.5 bg-gradient-to-r bg-clip-text text-3xl text-transparent sm:text-4xl md:text-5xl lg:text-5xl xl:text-7xl {isLight
								? 'via-slate-850 from-ink-900 to-ink-700'
								: 'hero-title from-surface-raised via-ink-100 to-ink-400'}"
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
							class="hero-desc font-sans-premium mb-5 max-w-2xl text-base leading-relaxed font-normal transition-colors duration-500 md:text-lg {isLight
								? 'text-ink-600'
								: 'hero-description text-ink-300'}"
						>
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<!-- Кнопка с градиентом и интерактивным эффектом -->
				<div class="hero-cta mb-6 flex w-full items-center sm:w-auto">
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
									class="absolute inset-0 rounded-2xl bg-gradient-to-r from-link-400 via-cat-4-500 to-link-400 transition-all duration-500 group-hover:rotate-180"
								></span>

								<!-- Кнопка сверху -->
								<span
									class="relative flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all duration-300 md:px-8 md:text-base {isLight
										? 'border border-ink-200/85 bg-ink-100 text-ink-800 hover:bg-surface-raised'
										: 'bg-ink-900/90 text-on-dark hover:bg-ink-950/80 hover:text-link-300'}"
								>
									{displayValue}
									<svg
										class="h-4 w-4 text-link-400 transition-transform duration-300 group-hover:translate-x-1.5"
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
									class="absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 {isLight
										? 'bg-link-400/10'
										: 'bg-link-500/20'}"
								></div>
							</button>
						{/snippet}
					</EditableField>
				</div>

				<!-- Карточки доверия (Trust Badges - супер-компактные, 6 штук) -->
				<!-- На lg колонка контента сужается вдвое (lg:col-span-6), и в три
				     колонки карточкам остаётся ~90px под текст — возвращаемся к двум,
				     три включаем обратно на xl, где ширины снова хватает. -->
				<div
					class="hero-features grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3"
				>
					<!-- Карточка 1 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border p-2.5 backdrop-blur-md transition-all duration-300 sm:p-3 {isLight
							? 'border-ink-200 bg-surface-raised/70 shadow-sm hover:border-ink-300 hover:bg-surface-raised'
							: 'border-on-dark/5 bg-on-dark/5 hover:border-on-dark/10 hover:bg-on-dark/10'}"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 {isLight
								? 'border-link-400/20 bg-link-50 text-link-600'
								: 'border-link-500/20 bg-link-500/10 text-link-400'}"
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
							<div
								class="text-xs leading-tight font-bold transition-colors duration-500 sm:text-sm {isLight
									? 'text-ink-800'
									: 'text-on-dark'}"
							>
								10+ лет гарантии
							</div>
							<div
								class="hero-feature-sub mt-0.5 text-[10px] leading-tight transition-colors duration-500 sm:text-xs {isLight
									? 'text-ink-500'
									: 'text-ink-400'}"
							>
								Официальный договор
							</div>
						</div>
					</div>
					<!-- Карточка 2 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border p-2.5 backdrop-blur-md transition-all duration-300 sm:p-3 {isLight
							? 'border-ink-200 bg-surface-raised/70 shadow-sm hover:border-ink-300 hover:bg-surface-raised'
							: 'border-on-dark/5 bg-on-dark/5 hover:border-on-dark/10 hover:bg-on-dark/10'}"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 {isLight
								? 'border-link-400/20 bg-link-50 text-link-600'
								: 'border-link-500/20 bg-link-500/10 text-link-400'}"
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
							<div
								class="text-xs leading-tight font-bold transition-colors duration-500 sm:text-sm {isLight
									? 'text-ink-800'
									: 'text-on-dark'}"
							>
								Своя фабрика
							</div>
							<div
								class="hero-feature-sub mt-0.5 text-[10px] leading-tight transition-colors duration-500 sm:text-xs {isLight
									? 'text-ink-500'
									: 'text-ink-400'}"
							>
								Без наценки салонов
							</div>
						</div>
					</div>
					<!-- Карточка 3 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border p-2.5 backdrop-blur-md transition-all duration-300 sm:p-3 {isLight
							? 'border-ink-200 bg-surface-raised/70 shadow-sm hover:border-ink-300 hover:bg-surface-raised'
							: 'border-on-dark/5 bg-on-dark/5 hover:border-on-dark/10 hover:bg-on-dark/10'}"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 {isLight
								? 'border-link-400/20 bg-link-50 text-link-600'
								: 'border-link-500/20 bg-link-500/10 text-link-400'}"
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
							<div
								class="text-xs leading-tight font-bold transition-colors duration-500 sm:text-sm {isLight
									? 'text-ink-800'
									: 'text-on-dark'}"
							>
								Проект за 2 часа
							</div>
							<div
								class="hero-feature-sub mt-0.5 text-[10px] leading-tight transition-colors duration-500 sm:text-xs {isLight
									? 'text-ink-500'
									: 'text-ink-400'}"
							>
								Спецификация и 3D
							</div>
						</div>
					</div>
					<!-- Карточка 4 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border p-2.5 backdrop-blur-md transition-all duration-300 sm:p-3 {isLight
							? 'border-ink-200 bg-surface-raised/70 shadow-sm hover:border-ink-300 hover:bg-surface-raised'
							: 'border-on-dark/5 bg-on-dark/5 hover:border-on-dark/10 hover:bg-on-dark/10'}"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 {isLight
								? 'border-link-400/20 bg-link-50 text-link-600'
								: 'border-link-500/20 bg-link-500/10 text-link-400'}"
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
							<div
								class="text-xs leading-tight font-bold transition-colors duration-500 sm:text-sm {isLight
									? 'text-ink-800'
									: 'text-on-dark'}"
							>
								Рассрочка 0%
							</div>
							<div
								class="hero-feature-sub mt-0.5 text-[10px] leading-tight transition-colors duration-500 sm:text-xs {isLight
									? 'text-ink-500'
									: 'text-ink-400'}"
							>
								До 12 месяцев
							</div>
						</div>
					</div>
					<!-- Карточка 5 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border p-2.5 backdrop-blur-md transition-all duration-300 sm:p-3 {isLight
							? 'border-ink-200 bg-surface-raised/70 shadow-sm hover:border-ink-300 hover:bg-surface-raised'
							: 'border-on-dark/5 bg-on-dark/5 hover:border-on-dark/10 hover:bg-on-dark/10'}"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 {isLight
								? 'border-link-400/20 bg-link-50 text-link-600'
								: 'border-link-500/20 bg-link-500/10 text-link-400'}"
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
							<div
								class="text-xs leading-tight font-bold transition-colors duration-500 sm:text-sm {isLight
									? 'text-ink-800'
									: 'text-on-dark'}"
							>
								Бесплатный замер
							</div>
							<div
								class="hero-feature-sub mt-0.5 text-[10px] leading-tight transition-colors duration-500 sm:text-xs {isLight
									? 'text-ink-500'
									: 'text-ink-400'}"
							>
								Выезд с образцами
							</div>
						</div>
					</div>
					<!-- Карточка 6 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border p-2.5 backdrop-blur-md transition-all duration-300 sm:p-3 {isLight
							? 'border-ink-200 bg-surface-raised/70 shadow-sm hover:border-ink-300 hover:bg-surface-raised'
							: 'border-on-dark/5 bg-on-dark/5 hover:border-on-dark/10 hover:bg-on-dark/10'}"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border sm:h-10 sm:w-10 {isLight
								? 'border-link-400/20 bg-link-50 text-link-600'
								: 'border-link-500/20 bg-link-500/10 text-link-400'}"
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
							<div
								class="text-xs leading-tight font-bold transition-colors duration-500 sm:text-sm {isLight
									? 'text-ink-800'
									: 'text-on-dark'}"
							>
								Сборка за 1 день
							</div>
							<div
								class="hero-feature-sub mt-0.5 text-[10px] leading-tight transition-colors duration-500 sm:text-xs {isLight
									? 'text-ink-500'
									: 'text-ink-400'}"
							>
								Под ключ с техникой
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Правая колонка (Интерактивный виджет выбора стиля - увеличенный размер) -->
			<div class="flex w-full items-center justify-center lg:col-span-6">
				<div
					class="hero-card relative flex w-full max-w-lg flex-col gap-6 overflow-hidden rounded-3xl border p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 xl:max-w-[540px] {isLight
						? 'border-ink-200 bg-surface-raised/90 hover:border-ink-300'
						: 'border-on-dark/10 bg-ink-900/60 hover:border-on-dark/15'}"
				>
					<!-- Световой блик/градиент на карточке -->
					<div
						class="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl transition-colors duration-500 {isLight
							? 'bg-link-400/15'
							: 'bg-link-500/10'}"
					></div>

					<!-- Заголовок карточки -->

					<!-- Переключатель вкладок (2 ряда по 3 элемента) -->
					<div
						class="style-tabs-grid rounded-2xl border p-2 transition-all duration-500 {isLight
							? 'border-ink-200/60 bg-ink-100/60'
							: 'border-on-dark/5 bg-on-dark/5'}"
					>
						{#each styleOptions as opt, idx}
							<button
								type="button"
								onclick={() => {
									activeStyleIndex = idx;
									activeHotspot = null;
								}}
								class="cursor-pointer rounded-xl px-3 py-3 text-center text-sm font-bold transition-all duration-300 sm:text-base {activeStyleIndex ===
								idx
									? 'bg-link-500 text-on-accent shadow-md'
									: isLight
										? 'hover:bg-slate-250/80 bg-on-dark/50 text-ink-700 hover:text-ink-950'
										: 'bg-on-dark/10 text-ink-300 hover:bg-on-dark/10 hover:text-on-dark'}"
							>
								{opt.name}
							</button>
						{/each}
					</div>

					<!-- Описание выбранного стиля -->
					<p
						class="text-base leading-relaxed transition-colors duration-500 sm:text-lg {isLight
							? 'text-ink-700'
							: 'text-ink-200'} min-h-[38px] border-l-3 border-link-500/50 pl-3.5 font-semibold"
					>
						{activeStyle.description}
					</p>

					<!-- Контейнер изображения с интерактивными точками (Большой классический формат 4:3) -->
					<div
						class="hero-media group/img relative aspect-[4/3] overflow-hidden rounded-2xl border border-on-dark/10 bg-ink-950"
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
							class="pointer-events-none absolute inset-0 bg-ink-950/20 transition-all duration-300 {activeHotspot
								? 'bg-ink-950/30 backdrop-blur-[1px]'
								: ''}"
						></div>

						<!-- Интерактивные точки (Hotspots) -->
						{#each activeStyle.hotspots as hs}
							<button
								type="button"
								class="group/hs pointer-events-auto absolute -mt-3.5 -ml-3.5 flex h-7 w-7 cursor-pointer items-center justify-center"
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
								<span class="absolute inset-0 animate-ping rounded-full bg-link-400/80 opacity-75"
								></span>
								<!-- Центральная точка -->
								<span
									class="relative h-3.5 w-3.5 rounded-full border-2 border-on-accent bg-link-400 shadow-[0_0_15px] shadow-link-400/80 transition-transform duration-300 group-hover/hs:scale-125 group-hover/hs:bg-surface-raised"
								></span>
							</button>
						{/each}

						<!-- Всплывающая плашка информации по хотспоту (Улучшенная тема и блур) -->
						{#if activeHotspot}
							<div
								class="animate-slide-up absolute right-3 bottom-3 left-3 z-20 rounded-xl border p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 {isLight
									? 'border-cat-4-100 bg-surface-raised/95 text-ink-800'
									: 'border-on-dark/10 bg-ink-950/90 text-on-dark'}"
							>
								<h4
									class="p1-title-sub mb-1.5 flex items-center gap-1.5 text-xs uppercase sm:text-sm {isLight
										? 'text-indigo-650'
										: 'text-link-300'}"
								>
									<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-link-400"></span>
									{activeHotspot.label}
								</h4>
								<p
									class="text-xs leading-normal font-semibold sm:text-[13px] {isLight
										? 'text-ink-700'
										: 'text-ink-300'}"
								>
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
			class="hero-partners mt-4 flex w-full flex-col items-center justify-between gap-5 border-t pt-4 pb-3 transition-colors duration-500 md:flex-row {isLight
				? 'border-ink-200'
				: 'border-on-dark/10'}"
		>
			<span
				class="flex items-center gap-2.5 text-[10px] font-black tracking-widest uppercase transition-colors duration-500 md:text-[11px] {isLight
					? 'text-ink-500'
					: 'text-ink-400'}"
			>
				<span class="h-3 w-0.5 rounded-full bg-link-500"></span>
				Наши ключевые партнеры:
			</span>
			<div class="hero-capsules flex flex-wrap items-center justify-center gap-3.5 sm:gap-4.5">
				{#each brands as brand}
					<a
						href={brand.url}
						target="_blank"
						rel="noopener noreferrer"
						class="brand-capsule hero-capsule flex items-center justify-center rounded-xl border px-5 py-2.5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 {isLight
							? 'border-ink-200 bg-surface-raised/70 shadow-sm hover:border-link-500/30 hover:bg-surface-raised'
							: 'border-on-dark/5 bg-on-dark/5 opacity-60 hover:border-link-500/20 hover:bg-on-dark/10 hover:opacity-100'}"
					>
						<img
							class="max-h-[22px] max-w-[72px] object-contain transition-all duration-300 {isLight
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
</section>

<style>
	/* ── Компактный режим для невысоких десктопов ────────────────────────────
	   Компонент живёт в боксе фиксированной высоты (.hero-wrapper в ../index.svelte,
	   overflow-hidden): секция уже ровно lg:h-full, но контент выше неё, и низ
	   полосы партнёров обрезался (на 1440×900 — 39px реального контента).
	   Поджимаем ритм каркаса и высоту медиа-блока в карточке справа —
	   именно он главный потребитель высоты (aspect-[4/3] ≈ 368px).
	   Свойства не в @layer, поэтому перекрывают Tailwind-утилиты на элементах. */
	@media (min-width: 1024px) and (max-height: 920px) {
		.hero-shell {
			padding-top: 1rem;
			padding-bottom: 1rem;
		}

		.hero-partners {
			margin-top: 0.5rem;
			padding-top: 0.5rem;
			padding-bottom: 0.375rem;
		}

		.hero-media {
			max-height: 18rem;
		}
	}

	/* Второй уровень — совсем низкие окна (ноутбуки 1366×768 и подобные). */
	@media (min-width: 1024px) and (max-height: 800px) {
		.hero-shell {
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
		}

		.hero-grid {
			padding-top: 0.25rem;
			padding-bottom: 0.25rem;
		}

		.hero-card {
			gap: 1rem;
			padding: 1rem;
		}

		.hero-media {
			max-height: 12rem;
		}

		/* Капсул брендов десять, и на узких десктопах они переносятся
		   на две строки — поджимаем их вместе с шагом переноса. */
		.hero-capsules {
			gap: 0.75rem;
		}

		.hero-capsule {
			padding: 0.375rem 1rem;
		}

		/* На этой высоте левая колонка становится выше правой карточки
		   и начинает задавать высоту грида — поджимаем и её ритм. */
		.hero-desc {
			margin-bottom: 0.75rem;
		}

		.hero-cta {
			margin-bottom: 0.625rem;
		}

		/* Подписи в карточках переносятся на две строки (вместо обрезки
		   многоточием), поэтому сетка выше — компенсируем шагом и паддингом. */
		.hero-features {
			gap: 0.5rem;
		}

		.hero-features > div {
			padding: 0.5rem;
			gap: 0.5rem;
		}

		/* Иконка поменьше и подпись на шрифт мельче отдают ширину тексту —
		   часть подписей укладывается обратно в одну строку. */
		.hero-features > div > div:first-child {
			height: 2rem;
			width: 2rem;
		}

		.hero-feature-sub {
			font-size: 0.6875rem;
		}
	}

	/* Кастомные шрифты и эффекты */
	/* Jost/Playfair fonts are loaded once in Promo-1 layout/Header.svelte */

	:global(.font-display) {
		font-family: 'Playfair Display', serif !important;
	}

	:global(.font-sans-premium) {
		font-family: 'Jost', sans-serif !important;
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

	/* Таблица стилей: сетка 2 ряда по 3 колонки */
	.style-tabs-grid {
		display: grid !important;
		grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
		grid-template-rows: repeat(2, minmax(0, 1fr)) !important;
		gap: 8px !important;
		width: 100% !important;
	}
</style>
