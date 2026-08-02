<script lang="ts">
	// Артикул: 1.2.4.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { revealOnScroll } from './theme';
	import './theme.css';

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
		await saveComponentData(editContext, 'Values', updated);
		data = updated;
	}

	const defaultItems = [
		{ title: 'Качество', text: 'Работаем только с проверенными поставщиками и фабриками.', color: 'red' },
		{ title: 'Клиентоориентированность', text: 'Каждый проект уникален, и мы учитываем все пожелания клиента.', color: 'emerald' },
		{ title: 'Инновации', text: 'Следим за трендами и внедряем современные технологии.', color: 'violet' },
		{ title: 'Пунктуальность', text: 'Следим за сроками и держим клиента в курсе на каждом этапе.', color: 'amber' },
		{ title: 'Забота', text: 'Создаём пространства, которые вдохновляют и радуют каждый день.', color: 'pink' },
		{ title: 'Доступность', text: 'Работаем в разных городах России и постоянно расширяем географию.', color: 'cyan' },
	];

	/**
	 * Палитра карточек. Ключи цветов прежние, добавлены только «одежды»:
	 * градиентная плитка иконки с тенью, акцентная линия сверху, hover-кайма
	 * и приглушённый номер пункта.
	 */
	const colorMap: Record<
		string,
		{ tile: string; hairline: string; border: string; index: string }
	> = {
		red: {
			tile: 'bg-linear-to-br from-red-500 to-red-600 shadow-[0_16px_40px_-18px_rgba(220,38,38,0.85)]',
			hairline: 'bg-linear-to-r from-transparent via-red-500 to-transparent',
			border: 'group-hover:border-red-500/40',
			index: 'text-red-500/25'
		},
		emerald: {
			tile: 'bg-linear-to-br from-emerald-500 to-emerald-600 shadow-[0_16px_40px_-18px_rgba(5,150,105,0.85)]',
			hairline: 'bg-linear-to-r from-transparent via-emerald-500 to-transparent',
			border: 'group-hover:border-emerald-500/40',
			index: 'text-emerald-500/25'
		},
		violet: {
			tile: 'bg-linear-to-br from-violet-500 to-violet-600 shadow-[0_16px_40px_-18px_rgba(124,58,237,0.85)]',
			hairline: 'bg-linear-to-r from-transparent via-violet-500 to-transparent',
			border: 'group-hover:border-violet-500/40',
			index: 'text-violet-500/25'
		},
		amber: {
			tile: 'bg-linear-to-br from-amber-400 to-amber-500 shadow-[0_16px_40px_-18px_rgba(217,119,6,0.85)]',
			hairline: 'bg-linear-to-r from-transparent via-amber-500 to-transparent',
			border: 'group-hover:border-amber-500/40',
			index: 'text-amber-500/25'
		},
		pink: {
			tile: 'bg-linear-to-br from-pink-500 to-pink-600 shadow-[0_16px_40px_-18px_rgba(219,39,119,0.85)]',
			hairline: 'bg-linear-to-r from-transparent via-pink-500 to-transparent',
			border: 'group-hover:border-pink-500/40',
			index: 'text-pink-500/25'
		},
		cyan: {
			tile: 'bg-linear-to-br from-cyan-500 to-cyan-600 shadow-[0_16px_40px_-18px_rgba(8,145,178,0.85)]',
			hairline: 'bg-linear-to-r from-transparent via-cyan-500 to-transparent',
			border: 'group-hover:border-cyan-500/40',
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
</script>

<section class="relative isolate overflow-hidden bg-slate-50 py-24">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="ab-rules"></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div use:revealOnScroll class="ab-reveal text-center">
			<EditableField
				fieldKey="Values.title"
				label="Заголовок"
				value={String(data?.title ?? 'Наши ценности')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="ab-item block"
			>
				{#snippet children(displayValue)}
					<h2
						class="text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-pretty text-slate-900 sm:text-4xl"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Values.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Принципы, которыми мы руководствуемся в работе')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="ab-item ab-d1 mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-2xl text-sm/6 text-slate-600 sm:text-base/7">{displayValue}</p>
				{/snippet}
			</EditableField>

			<div class="ab-rule ab-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="h-px flex-1 bg-slate-900/10"></span>
				<span class="size-1.5 rotate-45 border border-red-500/70"></span>
				<span class="h-px flex-1 bg-slate-900/10"></span>
			</div>
		</div>

		<div use:revealOnScroll class="ab-reveal mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each items as item, i}
				{@const c = colorMap[item.color] ?? colorMap.red}
				<div
					class="ab-card group relative overflow-hidden rounded-3xl border border-slate-900/10 bg-white p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] transition duration-300 hover:shadow-[0_36px_90px_-44px_rgba(15,23,42,0.45)] motion-safe:hover:-translate-y-1 {c.border}"
					style="--ab-delay: {i * 70}ms"
				>
					<div
						class="pointer-events-none absolute inset-x-8 top-0 h-px opacity-70 transition-opacity duration-300 group-hover:opacity-100 {c.hairline}"
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
								fieldKey="Values.{i}.title"
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
								fieldKey="Values.{i}.text"
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
