<script lang="ts">
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
		await saveComponentData(editContext, 'Benefits', updated);
		data = updated;
	}

	const defaultItems = [
		{ title: 'Прозрачные выплаты',    text: 'Фиксированный процент с каждой зарегистрированной сделки.',          color: 'sky' },
		{ title: 'Качественный продукт',   text: 'Рекомендуйте проверенную продукцию с гарантией качества.',           color: 'emerald' },
		{ title: 'Поддержка менеджера',    text: 'Персональный менеджер поможет с любыми вопросами.',                  color: 'violet' },
		{ title: 'Личный кабинет',         text: 'Отслеживайте заказы и доходы в удобном интерфейсе сайта.',           color: 'amber' },
		{ title: 'Обучение',               text: 'Бесплатные материалы по продукции и техникам продаж.',               color: 'pink' },
		{ title: 'Рост дохода',            text: 'Бонусы за объём и повышение процента при активной работе.',          color: 'cyan' },
	];

	/**
	 * Палитра карточек. Ключи (sky/emerald/violet/amber/pink/cyan) прежние —
	 * меняется только «одежда» цвета: градиентная плитка иконки, её тень,
	 * акцентная линия сверху карточки, hover-кайма и подсветка фона.
	 */
	const colorMap: Record<
		string,
		{ tile: string; hairline: string; border: string; glow: string; index: string }
	> = {
		sky: {
			tile: 'bg-linear-to-br from-sky-500 to-sky-600 shadow-[0_16px_40px_-18px_rgba(2,132,199,0.85)]',
			hairline: 'bg-linear-to-r from-transparent via-sky-500 to-transparent',
			border: 'group-hover:border-sky-500/40',
			glow: 'bg-sky-500/10',
			index: 'text-sky-500/25'
		},
		emerald: {
			tile: 'bg-linear-to-br from-emerald-500 to-emerald-600 shadow-[0_16px_40px_-18px_rgba(5,150,105,0.85)]',
			hairline: 'bg-linear-to-r from-transparent via-emerald-500 to-transparent',
			border: 'group-hover:border-emerald-500/40',
			glow: 'bg-emerald-500/10',
			index: 'text-emerald-500/25'
		},
		violet: {
			tile: 'bg-linear-to-br from-violet-500 to-violet-600 shadow-[0_16px_40px_-18px_rgba(124,58,237,0.85)]',
			hairline: 'bg-linear-to-r from-transparent via-violet-500 to-transparent',
			border: 'group-hover:border-violet-500/40',
			glow: 'bg-violet-500/10',
			index: 'text-violet-500/25'
		},
		amber: {
			tile: 'bg-linear-to-br from-amber-400 to-amber-500 shadow-[0_16px_40px_-18px_rgba(217,119,6,0.85)]',
			hairline: 'bg-linear-to-r from-transparent via-amber-500 to-transparent',
			border: 'group-hover:border-amber-500/40',
			glow: 'bg-amber-400/10',
			index: 'text-amber-500/25'
		},
		pink: {
			tile: 'bg-linear-to-br from-pink-500 to-pink-600 shadow-[0_16px_40px_-18px_rgba(219,39,119,0.85)]',
			hairline: 'bg-linear-to-r from-transparent via-pink-500 to-transparent',
			border: 'group-hover:border-pink-500/40',
			glow: 'bg-pink-500/10',
			index: 'text-pink-500/25'
		},
		cyan: {
			tile: 'bg-linear-to-br from-cyan-500 to-cyan-600 shadow-[0_16px_40px_-18px_rgba(8,145,178,0.85)]',
			hairline: 'bg-linear-to-r from-transparent via-cyan-500 to-transparent',
			border: 'group-hover:border-cyan-500/40',
			glow: 'bg-cyan-500/10',
			index: 'text-cyan-500/25'
		}
	};

	async function updateItem(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedItems = [...items];
		updatedItems[index] = { ...updatedItems[index], [field]: value };
		await saveField('items', updatedItems);
	}

	const items = $derived(
		Array.isArray(data?.items) && (data.items as unknown[]).length > 0
			? (data.items as typeof defaultItems)
			: defaultItems
	);

	/** Появление сетки при попадании во вьюпорт (тот же сценарий, что в PartnershipCTA). */
	function revealOnScroll(node: HTMLElement) {
		if (typeof IntersectionObserver === 'undefined') {
			node.classList.add('pb-visible');
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				node.classList.add('pb-visible');
				observer.unobserve(node);
			},
			{ threshold: 0.15 }
		);

		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

<section class="relative isolate overflow-hidden bg-white py-24">
	<!-- Вертикальные линии-колонки: лёгкая структура под светлой секцией -->
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="pb-rules"></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<EditableField
				fieldKey="Benefits.title"
				label="Заголовок"
				value={String(data?.title ?? 'Преимущества партнёрства')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl font-semibold tracking-[-0.02em] text-slate-900 sm:text-4xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="Benefits.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Что вы получаете, работая с нами')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-4 max-w-2xl text-slate-600">{displayValue}</p>
				{/snippet}
			</EditableField>
			<div class="mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="h-px flex-1 bg-slate-900/10"></span>
				<span class="size-1.5 rotate-45 border border-sky-500/70"></span>
				<span class="h-px flex-1 bg-slate-900/10"></span>
			</div>
		</div>

		<div
			use:revealOnScroll
			class="pb-reveal mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
		>
			{#each items as item, i}
				{@const c = colorMap[item.color] ?? colorMap.sky}
				<div
					class="pb-card group relative overflow-hidden rounded-3xl border border-slate-900/10 bg-white p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] transition duration-300 hover:shadow-[0_36px_90px_-44px_rgba(15,23,42,0.45)] motion-safe:hover:-translate-y-1 {c.border}"
					style="--pb-delay: {i * 70}ms"
				>
					<!-- Акцентная линия сверху и цветная подсветка угла на hover -->
					<div
						class="pointer-events-none absolute inset-x-8 top-0 h-px opacity-70 transition-opacity duration-300 group-hover:opacity-100 {c.hairline}"
						aria-hidden="true"
					></div>
					<div
						class="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 {c.glow}"
						aria-hidden="true"
					></div>

					<span
						class="pointer-events-none absolute top-5 right-6 text-4xl font-semibold tabular-nums {c.index}"
						aria-hidden="true"
					>
						{String(i + 1).padStart(2, '0')}
					</span>

					<div class="relative">
						<div
							class="flex size-14 items-center justify-center rounded-2xl text-white ring-1 ring-white/25 transition-transform duration-300 motion-safe:group-hover:-rotate-6 {c.tile}"
						>
							<svg class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						</div>

						<h3 class="mt-6 text-lg font-semibold tracking-[-0.01em] text-slate-900">
							<EditableField
								fieldKey="Benefits.{i}.title"
								label="Заголовок"
								value={item.title}
								{isEditable}
								inline
								onSave={(v) => updateItem(i, 'title', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</h3>
						<p class="mt-3 text-sm/6 text-slate-600">
							<EditableField
								fieldKey="Benefits.{i}.text"
								label="Описание"
								value={item.text}
								{isEditable}
								inline
								onSave={(v) => updateItem(i, 'text', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	/* Классы глобальные: часть узлов приходит из обёрток <EditableField>. */

	:global(.pb-rules) {
		position: absolute;
		inset: 0;
		background-image: linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
		background-size: 25% 100%;
		opacity: 0.55;
		mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
	}

	@keyframes pb-rise {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(.pb-reveal .pb-card) {
		opacity: 0;
	}

	/*
		fill-mode = backwards, а не both: при `both` финальный transform анимации
		остаётся на элементе и перебивает hover-подъём карточки.
		Конечное состояние задаём обычным opacity ниже.
	*/
	:global(.pb-visible .pb-card) {
		opacity: 1;
		animation: pb-rise 700ms cubic-bezier(0.22, 1, 0.36, 1) var(--pb-delay, 0ms) backwards;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.pb-reveal .pb-card),
		:global(.pb-visible .pb-card) {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
