<script lang="ts">
	// Артикул: 1.6.2.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'WhoWeInvite', updated);
		data = updated;
	}

	const defaultCards = [
		{ title: 'Дизайнеры', text: 'Реализуйте ваши проекты с качественной мебелью. Получайте вознаграждение за каждый заказ.', color: 'violet' },
		{ title: 'Ремонтные бригады', text: 'После ремонта клиенты покупают мебель и технику. Рекомендуйте нас и повышайте ваш доход.', color: 'amber' },
		{ title: 'Продавцы мебели', text: 'Передавайте заказы на мебель, которой нет у вас в ассортименте. Расширьте ваши возможности.', color: 'emerald' },
		{ title: 'Физ. лица', text: 'Рекомендуйте нас друзьям и знакомым. Получайте вознаграждение от суммы каждого заказа.', color: 'sky' },
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
			bg: 'from-violet-100 to-purple-100',
			icon: 'from-violet-500 to-purple-600 shadow-violet-500/25',
			dot: 'bg-violet-500',
			hairline: 'bg-linear-to-r from-transparent via-violet-500 to-transparent',
			border: 'group-hover:border-violet-500/40',
			index: 'text-violet-500/25'
		},
		amber: {
			bg: 'from-amber-100 to-orange-100',
			icon: 'from-amber-500 to-orange-600 shadow-amber-500/25',
			dot: 'bg-amber-500',
			hairline: 'bg-linear-to-r from-transparent via-amber-500 to-transparent',
			border: 'group-hover:border-amber-500/40',
			index: 'text-amber-500/25'
		},
		emerald: {
			bg: 'from-emerald-100 to-teal-100',
			icon: 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
			dot: 'bg-emerald-500',
			hairline: 'bg-linear-to-r from-transparent via-emerald-500 to-transparent',
			border: 'group-hover:border-emerald-500/40',
			index: 'text-emerald-500/25'
		},
		sky: {
			bg: 'from-sky-100 to-blue-100',
			icon: 'from-sky-500 to-blue-600 shadow-sky-500/25',
			dot: 'bg-sky-500',
			hairline: 'bg-linear-to-r from-transparent via-sky-500 to-transparent',
			border: 'group-hover:border-sky-500/40',
			index: 'text-sky-500/25'
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
	фон секции обязан быть ровно `bg-slate-50` и БЕЗ градиента/подсветки у самой
	верхней кромки, иначе на границе появится полоса. Декор ниже намеренно
	отодвинут от верха и приглушён маской.
-->
<section class="relative isolate overflow-hidden bg-slate-50 py-16 sm:py-20">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="wi-rules"></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div use:revealOnScroll class="wi-reveal text-center">
			<EditableField
				fieldKey="WhoWeInvite.title"
				label="Заголовок"
				value={String(data?.title ?? 'Кого мы приглашаем')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="wi-item block"
			>
				{#snippet children(displayValue)}
					<h2
						class="text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-pretty text-slate-900 sm:text-4xl lg:text-5xl"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="WhoWeInvite.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Партнёрство для профессионалов в сфере интерьера и ремонта')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="wi-item wi-d1 mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-2xl text-sm/6 text-slate-600 sm:text-base/7">{displayValue}</p>
				{/snippet}
			</EditableField>
			<div class="wi-rule wi-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="h-px flex-1 bg-slate-900/10"></span>
				<span class="size-1.5 rotate-45 border border-sky-500/70"></span>
				<span class="h-px flex-1 bg-slate-900/10"></span>
			</div>
		</div>

		<div use:revealOnScroll class="wi-reveal mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each cards as card, i}
				{@const c = colorMap[card.color] ?? colorMap.sky}
				<div
					class="wi-card group relative overflow-hidden rounded-3xl border border-slate-900/10 bg-white p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] transition duration-300 hover:shadow-[0_36px_90px_-44px_rgba(15,23,42,0.45)] motion-safe:hover:-translate-y-1 {c.border}"
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
							class="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-lg ring-1 ring-white/25 transition-transform duration-300 motion-safe:group-hover:-rotate-6 {c.icon}"
						>
							<svg class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>

						<h3 class="mt-6 flex items-center gap-2.5 text-lg font-semibold tracking-[-0.01em] text-slate-900">
							<span class="size-1.5 shrink-0 rounded-full {c.dot}" aria-hidden="true"></span>
							<EditableField
								fieldKey="WhoWeInvite.{i}.title"
								label="Заголовок"
								value={card.title}
								{isEditable}
								inline
								onSave={(v) => updateCard(i, 'title', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</h3>
						<p class="mt-3 text-sm/6 text-slate-600">
							<EditableField
								fieldKey="WhoWeInvite.{i}.text"
								label="Описание"
								value={card.text}
								{isEditable}
								inline
								onSave={(v) => updateCard(i, 'text', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</p>
					</div>
				</div>
			{/each}
		</div>

		<!-- Платформа: отдельная панель, чтобы блок не читался как продолжение карточек -->
		<div use:revealOnScroll class="wi-reveal mt-12">
			<div
				class="wi-item relative overflow-hidden rounded-4xl border border-slate-900/10 bg-white px-6 py-10 text-center shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] sm:px-12 sm:py-12"
			>
				<div
					class="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-red-500/70 to-transparent"
					aria-hidden="true"
				></div>
				<div
					class="pointer-events-none absolute -top-20 left-1/2 size-64 -translate-x-1/2 rounded-full bg-red-500/5 blur-3xl"
					aria-hidden="true"
				></div>

				<div class="relative">
					<EditableField
						fieldKey="WhoWeInvite.platformText"
						label="Текст о платформе"
						value={String(data?.platformText ?? 'Профессиональная платформа для автоматизации партнёрских продаж: регистрируйте новые заказы, отслеживайте статус реализации проектов в реальном времени и управляйте начислениями бонусов через единую прозрачную систему.')}
						{isEditable}
						multiline
						onSave={(v) => saveField('platformText', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p class="mx-auto max-w-2xl text-sm/6 text-slate-600 sm:text-base/7">{displayValue}</p>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="WhoWeInvite.platformUrl"
						label="Ссылка на платформу"
						value={String(data?.platformUrl ?? '')}
						{isEditable}
						onSave={(v) => saveField('platformUrl', v)}
						class="mt-8 inline-block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<a
									href={displayValue}
									target="_blank"
									rel="noopener noreferrer"
									class="group inline-flex items-center justify-center gap-2.5 rounded-full bg-linear-to-r from-red-500 to-red-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(239,68,68,0.9)] transition duration-300 hover:from-red-400 hover:to-red-500 hover:shadow-[0_22px_55px_-16px_rgba(239,68,68,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 motion-safe:hover:-translate-y-0.5"
								>
									<EditableField
										fieldKey="WhoWeInvite.platformButtonText"
										label="Текст кнопки платформы"
										value={String(data?.platformButtonText ?? 'Перейти на платформу')}
										{isEditable}
										onSave={(v) => saveField('platformButtonText', v)}
										class="inline"
									>
										{#snippet children(btnText)}
											{btnText}
										{/snippet}
									</EditableField>
									<svg
										class="size-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
										aria-hidden="true"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
									</svg>
								</a>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			</div>
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
