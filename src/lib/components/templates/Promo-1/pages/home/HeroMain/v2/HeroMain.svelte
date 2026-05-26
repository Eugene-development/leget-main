<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import BgImagePicker from '$lib/components/BgImagePicker.svelte';
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

	// ─── Bg image picker ──────────────────────────────────────────────────────
	let showImagePicker = $state(false);
	/** Live preview URL — перекрывает сохранённое только пока picker открыт. */
	let previewBgImage = $state<string | null>(null);

	const activeBgImage = $derived(
		previewBgImage ??
			String(
				data?.bgImageV2 ??
					data?.bgImage ??
					'https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg'
			)
	);

	async function handleImageApprove(url: string) {
		if (!editContext) return;
		const updated = { ...data, bgImageV2: url };
		await saveComponentData(editContext, 'HeroMain', updated);
		data = updated;
		previewBgImage = null;
		showImagePicker = false;
	}

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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'HeroMain', updated);
		data = updated;
	}

	// ─── Style selector states ────────────────────────────────────────────────
	let activeStyleIndex = $state(0);
	let activeHotspot = $state<{ label: string; desc: string } | null>(null);

	const styleOptions = [
		{
			id: 'loft',
			name: 'Кухни Loft',
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
			name: 'Неоклассика',
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
		}
	];

	const activeStyle = $derived(styleOptions[activeStyleIndex]);
</script>

<section
	class="relative flex min-h-full w-full items-center justify-start overflow-hidden bg-slate-950 font-sans text-white"
>
	<!-- Фоновое изображение (с глубоким боковым градиентом) -->
	<div class="absolute inset-0 z-0">
		<img
			src={activeBgImage}
			alt="Фоновое изображение"
			class="h-full w-full scale-100 object-cover brightness-[0.8] filter transition-all duration-700"
		/>

		<!-- Глубокий премиальный радиально-линейный оверлей -->
		<div class="bg-overlay absolute inset-0 z-[1]"></div>
		<div class="bg-radial-mesh absolute inset-0 z-[2]"></div>

		<!-- Кнопка смены фото (только в режиме редактирования) -->
		{#if isEditable && editContext}
			<button
				type="button"
				class="bg-picker-btn z-[20]"
				onclick={() => {
					previewBgImage = null;
					showImagePicker = true;
				}}
				aria-label="Сменить фоновое изображение"
				title="Сменить фоновое изображение"
			>
				<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<span>Сменить фото</span>
			</button>
		{/if}
	</div>

	<!-- Picker модалка -->
	{#if showImagePicker && editContext}
		<BgImagePicker
			{editContext}
			currentImage={String(data?.bgImageV2 ?? data?.bgImage ?? '')}
			defaultImage="https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg"
			onApprove={handleImageApprove}
			onClose={() => {
				previewBgImage = null;
				showImagePicker = false;
			}}
		/>
	{/if}

	<!-- Основной контент -->
	<div
		class="relative z-10 mx-auto flex min-h-full w-full max-w-screen-2xl flex-col justify-between px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-12 xl:px-16"
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
								class="shadow-glow inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-950/40 px-3.5 py-1 text-xs font-bold tracking-wider text-sky-300 uppercase backdrop-blur-md transition-all duration-300 hover:border-sky-400/40 md:text-sm"
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
							class="font-display hero-title mb-3.5 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-3xl leading-[1.1] font-extrabold tracking-tight text-transparent sm:text-4xl md:text-5xl lg:text-5xl xl:text-7xl"
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
							class="hero-description mb-5 max-w-2xl text-base leading-relaxed font-normal text-slate-300 md:text-lg"
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
						value={String(data?.buttonText ?? 'Бесплатный дизайн-проект с расчётом стоимости')}
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
									class="relative flex items-center justify-center gap-2 rounded-2xl bg-slate-900/90 px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 group-hover:bg-slate-950/80 group-hover:text-sky-300 md:px-8 md:text-base"
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
									class="absolute -inset-1 rounded-2xl bg-sky-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
								></div>
							</button>
						{/snippet}
					</EditableField>
				</div>

				<!-- Карточки доверия (Trust Badges - супер-компактные, 6 штук) -->
				<div class="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
					<!-- Карточка 1 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/10 sm:p-3"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400 sm:h-10 sm:w-10"
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
							<div class="truncate text-xs font-bold text-white sm:text-sm">10+ лет гарантии</div>
							<div class="truncate text-[10px] text-slate-400 sm:text-xs">Официальный договор</div>
						</div>
					</div>
					<!-- Карточка 2 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/10 sm:p-3"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400 sm:h-10 sm:w-10"
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
							<div class="truncate text-xs font-bold text-white sm:text-sm">Своя фабрика</div>
							<div class="truncate text-[10px] text-slate-400 sm:text-xs">Без наценки салонов</div>
						</div>
					</div>
					<!-- Карточка 3 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/10 sm:p-3"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400 sm:h-10 sm:w-10"
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
							<div class="truncate text-xs font-bold text-white sm:text-sm">Проект за 2 часа</div>
							<div class="truncate text-[10px] text-slate-400 sm:text-xs">Спецификация и 3D</div>
						</div>
					</div>
					<!-- Карточка 4 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/10 sm:p-3"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400 sm:h-10 sm:w-10"
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
							<div class="truncate text-xs font-bold text-white sm:text-sm">Рассрочка 0%</div>
							<div class="truncate text-[10px] text-slate-400 sm:text-xs">До 12 месяцев</div>
						</div>
					</div>
					<!-- Карточка 5 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/10 sm:p-3"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400 sm:h-10 sm:w-10"
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
							<div class="truncate text-xs font-bold text-white sm:text-sm">Бесплатный замер</div>
							<div class="truncate text-[10px] text-slate-400 sm:text-xs">Выезд с образцами</div>
						</div>
					</div>
					<!-- Карточка 6 -->
					<div
						class="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2.5 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/10 sm:p-3"
					>
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400 sm:h-10 sm:w-10"
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
							<div class="truncate text-xs font-bold text-white sm:text-sm">Сборка за 1 день</div>
							<div class="truncate text-[10px] text-slate-400 sm:text-xs">Под ключ с техникой</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Правая колонка (Интерактивный виджет выбора стиля - уменьшенный размер) -->
			<div class="flex w-full items-center justify-center lg:col-span-6">
				<div
					class="relative flex w-full max-w-md flex-col gap-4.5 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-white/15 sm:p-6 xl:max-w-[480px]"
				>
					<!-- Световой блик/градиент на карточке -->
					<div
						class="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl"
					></div>

					<!-- Заголовок карточки -->
					<div class="flex items-center justify-between border-b border-white/5 pb-2.5">
						<span class="text-xs font-black tracking-wider text-slate-400 uppercase"
							>Решения по стилю</span
						>
						<span
							class="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400"
							>3D-Обзор</span
						>
					</div>

					<!-- Переключатель вкладок -->
					<div class="grid grid-cols-3 gap-1.5 rounded-xl border border-white/5 bg-white/5 p-1">
						{#each styleOptions as opt, idx}
							<button
								type="button"
								onclick={() => {
									activeStyleIndex = idx;
									activeHotspot = null;
								}}
								class="rounded-lg py-2 text-center text-xs font-bold transition-all duration-300 {activeStyleIndex ===
								idx
									? 'bg-sky-500 text-white shadow-md'
									: 'text-slate-400 hover:bg-white/5 hover:text-white'}"
							>
								{opt.name.split(' ')[0]}
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

					<!-- Спецификации внизу карточки -->
					<div class="grid grid-cols-3 gap-2.5 border-t border-white/5 pt-2.5">
						{#each activeStyle.specs as spec}
							<div class="flex flex-col gap-0.5">
								<span
									class="text-[9px] font-bold tracking-wider text-slate-400 uppercase sm:text-[10px]"
									>{spec.label}</span
								>
								<span class="truncate text-xs font-black text-slate-200 sm:text-sm"
									>{spec.value}</span
								>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Нижний блок (Бренды с капсульным эффектом - компактный) -->
		<div
			class="mt-4 flex w-full flex-col items-center justify-between gap-4 border-t border-white/10 pt-4 md:flex-row"
		>
			<span
				class="flex items-center gap-2 text-[9px] font-black tracking-widest text-slate-400 uppercase md:text-[10px]"
			>
				<span class="h-2.5 w-0.5 rounded-full bg-sky-500"></span>
				Наши ключевые партнеры:
			</span>
			<div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
				{#each brands as brand}
					<a
						href={brand.url}
						target="_blank"
						rel="noopener noreferrer"
						class="brand-capsule flex items-center justify-center rounded-lg border border-white/5 bg-white/5 px-4 py-1.5 opacity-60 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-500/20 hover:bg-white/10 hover:opacity-100"
					>
						<img
							class="max-h-[18px] max-w-[65px] object-contain brightness-0 invert filter"
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
	@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');

	.font-display {
		font-family: 'Outfit', sans-serif;
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

	/* ── Background image picker button ─────────────────────────────────────── */
	.bg-picker-btn {
		position: absolute;
		bottom: 1rem;
		left: 1rem;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.8rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(15, 23, 42, 0.7);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		color: #f1f5f9;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.2s,
			border-color 0.2s,
			transform 0.2s,
			box-shadow 0.2s;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
	}

	.bg-picker-btn svg {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
	}

	.bg-picker-btn:hover {
		background: rgba(56, 189, 248, 0.25);
		border-color: rgba(56, 189, 248, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(56, 189, 248, 0.25);
	}

	.bg-picker-btn:active {
		transform: translateY(0);
	}
</style>
