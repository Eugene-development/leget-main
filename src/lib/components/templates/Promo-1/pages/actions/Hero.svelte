<script lang="ts">
	// Артикул: 1.4.1.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ArticleBadge from '$lib/components/ArticleBadge.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { fetchComponentArticle, saveComponentData, type EditContext } from '$lib/utils/page-edit';

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
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}

	// ── Тема блока ───────────────────────────────────────────────────────────
	// По умолчанию тёмная. Композиция, ритм и красный акцент у тем общие —
	// меняются только поверхность и цвет текста.
	const isLight = $derived(data?.theme === 'light');

	async function toggleTheme() {
		if (!editContext) return;
		// Оптимистичное обновление: тема применяется сразу, откат только при ошибке.
		const previous = data;
		const updated = { ...data, theme: isLight ? 'dark' : 'light' };
		data = updated;
		try {
			await saveComponentData(editContext, 'Hero', updated);
		} catch (err) {
			data = previous;
			console.error('Ошибка сохранения темы для Hero:', err);
		}
	}

	// Бегущая строка внизу блока: перечисление выгод страницы одной строкой.
	// Разделитель при вводе — «·», «,» или «•».
	const DEFAULT_HIGHLIGHTS =
		'Консультация дизайнера · Замер помещения · Дизайн-проект · Установка техники · Техника в подарок';

	function parseHighlights(value: string): string[] {
		return value
			.split(/[·•,]/)
			.map((item) => item.trim())
			.filter(Boolean);
	}

	// ── Артикул компонента ───────────────────────────────────────────────────
	// Показывается авторизованному пользователю (isEditable = browser + auth,
	// см. PageRenderer). У блока нет переключателя версий, поэтому собственного
	// бейджа из VersionSwitcher он не получает — берём общий ArticleBadge.
	let article = $state<string | null>(null);
	let articleRequested = false;

	$effect(() => {
		const templateId = editContext?.templateId ?? null;
		const slug = editContext?.slug ?? null;
		if (!isEditable || !templateId || !slug || articleRequested) return;
		articleRequested = true;
		fetchComponentArticle(templateId, slug, 'Hero')
			.then((res) => {
				if (!res) return;
				// У блока одна версия (v1) — берём её артикул, иначе групповой.
				article =
					res.variants.find((v) => v.version === 1)?.article ??
					res.variants[0]?.article ??
					res.article;
			})
			.catch(() => {});
	});
</script>

<!--
	Ритм страницы «Акции»: обложка → белая сетка карточек.
	Красная лента на стыке — единственный громкий элемент блока, всё остальное
	держится на типографике и воздухе. Акцент общий для обеих тем.
-->
<section
	class="relative isolate overflow-hidden transition-colors duration-300 {isLight
		? 'bg-surface-paper'
		: 'bg-surface-inverse'}"
>
	<!-- Фактура: сетка с радиальным затуханием + мягкое красное свечение -->
	<div
		class="ah-grid pointer-events-none absolute inset-0"
		style="--ah-line: {isLight ? 'rgba(15, 23, 42, 0.07)' : 'rgba(255, 255, 255, 0.055)'}"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -top-24 -left-32 size-[34rem] rounded-full blur-[120px] {isLight
			? 'bg-brand-500/12'
			: 'bg-brand-600/20'}"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent to-transparent {isLight
			? 'via-brand-600/40'
			: 'via-brand-500/60'}"
		aria-hidden="true"
	></div>

	{#if isEditable && editContext}
		<!-- Правый нижний угол блока: отступ снизу поднимает панель над лентой,
		     тултип артикула раскрывается вверх — секция обрезает всё, что вылезает вниз. -->
		<div class="absolute right-6 bottom-16 z-40 flex items-center gap-2">
			<ThemeToggle {isLight} onToggle={toggleTheme} />
			{#if article}
				<ArticleBadge {article} placement="top" />
			{/if}
		</div>
	{/if}

	<div
		class="relative mx-auto max-w-7xl px-6 pt-24 pb-20 sm:pt-28 sm:pb-24 lg:px-8 lg:pt-32 lg:pb-28"
	>
		<div class="grid gap-10 lg:grid-cols-12 lg:gap-12">
			<!-- Левая колонка: надзаголовок + заголовок -->
			<div class="lg:col-span-7">
				<div class="ah-in ah-d1">
					<EditableField
						fieldKey="Hero.eyebrow"
						label="Надпись над заголовком"
						value={String(data?.eyebrow ?? 'Выгодные предложения')}
						{isEditable}
						onSave={(v) => saveField('eyebrow', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p
								class="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] uppercase transition-colors duration-300 sm:text-xs {isLight
									? 'text-brand-600'
									: 'text-brand-400'}"
							>
								<span
									class="h-px w-8 {isLight ? 'bg-brand-600/60' : 'bg-brand-500/80'}"
									aria-hidden="true"
								></span>
								{displayValue}
							</p>
						{/snippet}
					</EditableField>
				</div>

				<div class="ah-in ah-d2 mt-8">
					<EditableField
						fieldKey="Hero.title"
						label="Заголовок"
						value={String(data?.title ?? 'Акции, скидки и подарки')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<h1
								class="text-4xl leading-[1.03] tracking-[-0.035em] text-balance transition-colors duration-300 sm:text-6xl lg:text-7xl {isLight
									? 'text-ink-900'
									: 'text-on-dark'}"
							>
								{displayValue}
							</h1>
						{/snippet}
					</EditableField>
					<span
						class="mt-8 block h-px w-24 {isLight ? 'bg-brand-600' : 'bg-brand-500'}"
						aria-hidden="true"
					></span>
				</div>
			</div>

			<!-- Правая колонка: подзаголовок, посаженный на общую базовую линию -->
			<div class="ah-in ah-d3 lg:col-span-5 lg:self-end lg:pb-1">
				<span
					class="mb-6 hidden h-px w-full lg:block {isLight ? 'bg-ink-900/10' : 'bg-on-dark/10'}"
					aria-hidden="true"
				></span>
				<EditableField
					fieldKey="Hero.subtitle"
					label="Подзаголовок"
					value={String(
						data?.subtitle ??
							'Получите актуальные акции наших партнёров и узнайте о подарках и скидках на проекты и услуги'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('subtitle', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p
							class="max-w-md text-base/7 transition-colors duration-300 sm:text-lg/8 {isLight
								? 'text-ink-600'
								: 'text-ink-400'}"
						>
							{displayValue}
						</p>
					{/snippet}
				</EditableField>
			</div>
		</div>
	</div>

	<!-- Лента выгод на стыке с белой секцией карточек.
	     В обычном потоке последним элементом секции: обёртка EditableField всегда
	     `relative`, поэтому позиционировать её через `absolute` бесполезно. -->
	<EditableField
		fieldKey="Hero.highlights"
		label="Бегущая строка (разделитель «·»)"
		value={String(data?.highlights ?? DEFAULT_HIGHLIGHTS)}
		{isEditable}
		onSave={(v) => saveField('highlights', v)}
		class="z-10 block"
	>
		{#snippet children(displayValue)}
			{@const items = parseHighlights(displayValue)}
			{#if items.length}
				<!-- Классы анимации — на собственном узле: в `class` дочернего
				     компонента scoped-стили Svelte не попадают. -->
				<div class="ah-ribbon ah-in ah-d4 overflow-hidden bg-brand-600">
					<div class="ah-marquee flex w-max">
						{#each [0, 1] as copy (copy)}
							<ul class="flex shrink-0 items-center" aria-hidden={copy === 1 ? 'true' : undefined}>
								{#each items as item, i (i)}
									<li
										class="flex items-center gap-4 py-3 pr-8 text-[11px] font-semibold tracking-[0.28em] whitespace-nowrap text-on-dark uppercase sm:text-xs"
									>
										<span class="size-1.5 rotate-45 border border-on-dark/70" aria-hidden="true"
										></span>
										{item}
									</li>
								{/each}
							</ul>
						{/each}
					</div>
				</div>
			{/if}
		{/snippet}
	</EditableField>
</section>

<style>
	/* Сетка-фактура: тонкие линии с радиальным затуханием к краям.
	   Цвет линии приходит из --ah-line и зависит от темы. */
	.ah-grid {
		background-image:
			linear-gradient(to right, var(--ah-line) 1px, transparent 1px),
			linear-gradient(to bottom, var(--ah-line) 1px, transparent 1px);
		background-size: 72px 72px;
		-webkit-mask-image: radial-gradient(ellipse 75% 65% at 22% 35%, #000 0%, transparent 78%);
		mask-image: radial-gradient(ellipse 75% 65% at 22% 35%, #000 0%, transparent 78%);
	}

	/* Появление блока при загрузке: одна ступенчатая волна сверху вниз. */
	@media (prefers-reduced-motion: no-preference) {
		.ah-in {
			opacity: 0;
			animation: ah-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		}
		.ah-d1 {
			animation-delay: 0.05s;
		}
		.ah-d2 {
			animation-delay: 0.16s;
		}
		.ah-d3 {
			animation-delay: 0.3s;
		}
		.ah-d4 {
			animation-delay: 0.44s;
		}

		/* Лента едет ровно на ширину одной копии — стык незаметен. */
		.ah-marquee {
			animation: ah-marquee 42s linear infinite;
		}
		.ah-ribbon:hover .ah-marquee {
			animation-play-state: paused;
		}
	}

	@keyframes ah-in {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes ah-marquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}
</style>
