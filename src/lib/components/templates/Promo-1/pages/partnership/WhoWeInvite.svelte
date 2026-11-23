<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 1.6.2.1 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Тема блока: нейтральная палитра — из классов p1-*, акценты не зависят от темы.
	const isLight = $derived(isLightBlock(data, 'light'));
	const defaultPlatformUrl = 'https://rubonus.pro/';
	const defaultPlatformLabel = 'RUBONUS.PRO';
	const platformLinkLabelId = $props.id();
	const hasLegacyPlatformLabel = $derived(data?.platformButtonText === 'Перейти на платформу');
	const savedPlatformUrl = $derived(editableText(data?.platformUrl, defaultPlatformUrl).trim());
	// Старые настройки могли сохранить пустой URL вместе с шаблонной подписью.
	const platformUrl = $derived(
		savedPlatformUrl || (hasLegacyPlatformLabel ? defaultPlatformUrl : '')
	);
	const platformText = $derived(
		editableText(
			data?.platformText,
			'Профессиональная платформа для автоматизации партнёрских продаж: регистрируйте новые заказы, отслеживайте статус реализации проектов в реальном времени и управляйте начислениями бонусов через единую прозрачную систему.'
		)
	);
	const platformButtonText = $derived(
		hasLegacyPlatformLabel
			? defaultPlatformLabel
			: editableText(data?.platformButtonText, defaultPlatformLabel)
	);
	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const editingPlatformLink = field === 'platformUrl' || field === 'platformButtonText';
		const updated = {
			...data,
			...(hasLegacyPlatformLabel && editingPlatformLink ? { platformUrl, platformButtonText } : {}),
			[field]: value
		};
		await saveComponentData(editContext, 'WhoWeInvite', updated);
		data = updated;
	}

	const defaultCards = [
		{
			title: 'Дизайнеры',
			text: 'Реализуйте ваши проекты с качественной мебелью. Получайте вознаграждение за каждый заказ.',
			color: 'violet'
		},
		{
			title: 'Ремонтные бригады',
			text: 'После ремонта клиенты покупают мебель и технику. Рекомендуйте нас и повышайте ваш доход.',
			color: 'amber'
		},
		{
			title: 'Продавцы мебели',
			text: 'Передавайте заказы на мебель, которой нет у вас в ассортименте. Расширьте ваши возможности.',
			color: 'emerald'
		},
		{
			title: 'Физ. лица',
			text: 'Рекомендуйте нас друзьям и знакомым. Получайте вознаграждение от суммы каждого заказа.',
			color: 'sky'
		}
	];

	/**
	 * Палитра карточек. Ключи цветов прежние, добавлены только «одежды»:
	 * hairline — акцентная линия по верхнему краю, border — hover-кайма,
	 * index — приглушённый номер карточки.
	 */
	const colorMap: Record<
		string,
		{ bg: string; icon: string; dot: string; hairline: string; border: string; index: string }
	> = {
		violet: {
			bg: 'from-cat-3-100 to-cat-10-100',
			icon: 'from-cat-3-500 to-cat-10-600 shadow-cat-3-500/25',
			dot: 'bg-cat-3-500',
			hairline: 'bg-linear-to-r from-transparent via-cat-3-500 to-transparent',
			border: 'group-hover:border-cat-3-500/40',
			index: 'text-cat-3-500/25'
		},
		amber: {
			bg: 'from-cat-1-100 to-cat-8-100',
			icon: 'from-cat-1-500 to-cat-8-600 shadow-cat-1-500/25',
			dot: 'bg-cat-1-500',
			hairline: 'bg-linear-to-r from-transparent via-cat-1-500 to-transparent',
			border: 'group-hover:border-cat-1-500/40',
			index: 'text-cat-1-500/25'
		},
		emerald: {
			bg: 'from-cat-2-100 to-cat-9-100',
			icon: 'from-cat-2-500 to-cat-9-600 shadow-cat-2-500/25',
			dot: 'bg-cat-2-500',
			hairline: 'bg-linear-to-r from-transparent via-cat-2-500 to-transparent',
			border: 'group-hover:border-cat-2-500/40',
			index: 'text-cat-2-500/25'
		},
		sky: {
			bg: 'from-link-100 to-cat-11-100',
			icon: 'from-link-500 to-cat-11-600 shadow-link-500/25',
			dot: 'bg-link-500',
			hairline: 'bg-linear-to-r from-transparent via-link-500 to-transparent',
			border: 'group-hover:border-link-500/40',
			index: 'text-link-500/25'
		}
	};

	async function updateCard(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedCards = [...cards];
		updatedCards[index] = { ...updatedCards[index], [field]: value };
		await saveField('cards', updatedCards);
	}

	const cards = $derived(
		Array.isArray(data?.cards) && (data.cards as unknown[]).length > 0
			? (data.cards as typeof defaultCards)
			: defaultCards
	);

	/** Появление блоков при попадании во вьюпорт (сценарий страницы «Партнёрство»). */
	function revealOnScroll(node: HTMLElement) {
		if (typeof IntersectionObserver === 'undefined') {
			node.classList.add('wi-visible');
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				node.classList.add('wi-visible');
				observer.unobserve(node);
			},
			{ threshold: 0.15 }
		);

		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

<!--
	ВНИМАНИЕ — стык секций: сверху в этот блок «вливается» волна из Hero
	(PartnershipHero). Заливка волны — переменная `--ph-wave` (#f8fafc), поэтому
	фон секции обязан быть ровно `bg-ink-50` и БЕЗ градиента/подсветки у самой
	верхней кромки, иначе на границе появится полоса. Декор ниже намеренно
	отодвинут от верха и приглушён маской.
-->
<section
	class="p1-surface-alt relative isolate overflow-hidden py-section-xs sm:py-section-sm"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="wi-rules"></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div use:revealOnScroll class="wi-reveal text-center">
			<EditableField
				fieldKey="WhoWeInvite.title"
				label="Заголовок"
				value={editableText(data?.title, 'У вас есть клиент?')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="wi-item block"
			>
				{#snippet children(displayValue)}
					<h2 class="p1-title text-section-title text-balance">
						<RichText value={displayValue} />
					</h2>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="WhoWeInvite.subtitle"
				label="Подзаголовок"
				value={editableText(
					data?.subtitle,
					'Партнёрство для профессионалов в сфере интерьера и ремонта'
				)}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="wi-item wi-d1 mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="p1-body mx-auto max-w-2xl text-prose">
						<RichText value={displayValue} />
					</p>
				{/snippet}
			</EditableField>
		</div>

		<div use:revealOnScroll class="wi-reveal mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each cards as card, i}
				{@const c = colorMap[card.color] ?? colorMap.sky}
				<div
					class="p1-card-copy wi-card group p1-border p1-card relative overflow-hidden rounded-3xl border p-8 shadow-[0_30px_80px_-50px] shadow-ink-900/35 transition duration-300 hover:shadow-[0_36px_90px_-44px] hover:shadow-ink-900/45 motion-safe:hover:-translate-y-1 {c.border}"
					style="--wi-delay: {i * 70}ms"
				>
					<!-- Цветное пятно в углу — прежний акцент карточки, теперь под каймой -->
					<div
						class="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full bg-linear-to-br opacity-60 transition-transform duration-500 group-hover:scale-150 {c.bg}"
						aria-hidden="true"
					></div>
					<div
						class="pointer-events-none absolute inset-x-8 top-0 h-px opacity-70 transition-opacity duration-300 group-hover:opacity-100 {c.hairline}"
						aria-hidden="true"
					></div>
					<span
						class="pointer-events-none absolute top-5 right-6 text-3xl font-semibold tabular-nums {c.index}"
						aria-hidden="true"
					>
						{String(i + 1).padStart(2, '0')}
					</span>

					<div class="relative">
						<div
							class="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br text-on-dark shadow-lg ring-1 ring-on-dark/25 transition-transform duration-300 motion-safe:group-hover:-rotate-6 {c.icon}"
						>
							<svg
								class="size-7"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						</div>

						<h3 class="p1-title p1-title-sub mt-6 flex items-center gap-2.5 text-card-title">
							<span class="size-1.5 shrink-0 rounded-full {c.dot}" aria-hidden="true"></span>
							<EditableField
								fieldKey="WhoWeInvite.{i}.title"
								label="Заголовок"
								value={card.title}
								{isEditable}
								inline
								onSave={(v) => updateCard(i, 'title', v)}
							>
								{#snippet children(val)}<RichText value={val} />{/snippet}
							</EditableField>
						</h3>
						<p class="p1-body mt-3 text-prose">
							<EditableField
								fieldKey="WhoWeInvite.{i}.text"
								label="Описание"
								value={card.text}
								{isEditable}
								inline
								onSave={(v) => updateCard(i, 'text', v)}
							>
								{#snippet children(val)}<RichText value={val} />{/snippet}
							</EditableField>
						</p>
					</div>
				</div>
			{/each}
		</div>

		<div
			class="p1-border mt-10 hidden items-center gap-y-3 border-y py-5 has-[>*]:grid sm:mt-12 sm:py-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
		>
			{#if isEditable || platformUrl}
				<EditableField
					richText={false}
					fieldKey="WhoWeInvite.platformUrl"
					label="Ссылка на платформу"
					value={platformUrl}
					{isEditable}
					onSave={(v) => saveField('platformUrl', v)}
					class="p1-border min-w-0 md:border-r md:pr-8 md:only:col-span-2 md:only:border-r-0 md:only:pr-0 lg:pr-12"
				>
					{#snippet children(url)}
						{@const href = url.trim()}
						{#if href}
							<a
								{href}
								target="_blank"
								rel="noopener noreferrer"
								aria-labelledby={platformLinkLabelId}
								aria-label="Открыть партнёрскую платформу"
								class="p1-title group flex min-h-12 items-center justify-between gap-4 py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
							>
								<EditableField
									fieldKey="WhoWeInvite.platformButtonText"
									label="Текст ссылки на платформу"
									value={platformButtonText}
									{isEditable}
									inline
									onSave={(v) => saveField('platformButtonText', v)}
									class="min-w-0"
								>
									{#snippet children(linkText)}
										{#if linkText.trim()}
											<span
												id={platformLinkLabelId}
												class="p1-title-sub text-card-title wrap-anywhere underline decoration-1 underline-offset-6 group-hover:decoration-2 group-focus-visible:decoration-2"
												><RichText value={linkText} /></span
											>
										{/if}
									{/snippet}
								</EditableField>
								<svg
									class="p1-accent size-6 shrink-0 motion-safe:transition-transform motion-safe:duration-[var(--ds-motion-duration-ui)] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									style="stroke-width: var(--ds-icon-stroke-bold)"
									aria-hidden="true"
								>
									<path d="M5 19 19 5M9 5h10v10" />
								</svg>
							</a>
						{/if}
					{/snippet}
				</EditableField>
			{/if}
			{#if isEditable || platformText.trim()}
				<EditableField
					fieldKey="WhoWeInvite.platformText"
					label="Текст о платформе"
					value={platformText}
					{isEditable}
					multiline
					onSave={(v) => saveField('platformText', v)}
					class="min-w-0 md:pl-8 md:only:col-span-2 md:only:pl-0 lg:pl-12"
				>
					{#snippet children(description)}
						<p class="p1-body max-w-[58ch] text-prose wrap-anywhere">
							<RichText value={description} />
						</p>
					{/snippet}
				</EditableField>
			{/if}
		</div>
	</div>
</section>

<style>
	/* Классы глобальные: часть анимируемых узлов — обёртки <EditableField>. */

	/*
		Вертикальные линии-колонки. Маска гасит текстуру у верхней кромки, чтобы
		стык с волной Hero оставался ровным #f8fafc.
	*/
	:global(.wi-rules) {
		position: absolute;
		inset: 0;
		background-image: linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
		background-size: 25% 100%;
		opacity: 0.5;
		mask-image: linear-gradient(to bottom, transparent, black 22%, black 78%, transparent);
	}

	@keyframes wi-rise {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes wi-rule {
		from {
			opacity: 0;
			transform: scaleX(0.4);
		}
		to {
			opacity: 1;
			transform: scaleX(1);
		}
	}

	:global(.wi-reveal .wi-item),
	:global(.wi-reveal .wi-rule),
	:global(.wi-reveal .wi-card) {
		opacity: 0;
	}

	/*
		fill-mode = backwards: при `both` финальный transform анимации остаётся
		на элементе и перебивает hover-подъём карточек.
	*/
	:global(.wi-visible .wi-item),
	:global(.wi-visible .wi-card) {
		opacity: 1;
		animation: wi-rise 720ms cubic-bezier(0.22, 1, 0.36, 1) var(--wi-delay, 0ms) backwards;
	}

	:global(.wi-visible .wi-rule) {
		opacity: 1;
		animation: wi-rule 720ms cubic-bezier(0.22, 1, 0.36, 1) var(--wi-delay, 0ms) backwards;
	}

	:global(.wi-d1) {
		--wi-delay: 80ms;
	}
	:global(.wi-d2) {
		--wi-delay: 160ms;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.wi-reveal .wi-item),
		:global(.wi-reveal .wi-rule),
		:global(.wi-reveal .wi-card),
		:global(.wi-visible .wi-item),
		:global(.wi-visible .wi-rule),
		:global(.wi-visible .wi-card) {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
