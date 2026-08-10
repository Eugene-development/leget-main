<script lang="ts">
	// Артикул: 1.9.3.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'WhatsCovered', updated);
		data = updated;
	}

	const defaultItems = [
		{
			title: 'Дефекты материалов',
			text: 'Сколы, трещины, отслоение покрытия при нормальной эксплуатации'
		},
		{ title: 'Качество сборки', text: 'Неплотное прилегание, перекосы, скрипы механизмов' },
		{ title: 'Работа фурнитуры', text: 'Поломка петель, направляющих, подъёмных механизмов' },
		{ title: 'Монтажные работы', text: 'Качество установки и подключения техники' }
	];

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

<section class="relative isolate overflow-hidden bg-surface-raised py-24">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="gt-rules"></div>
	</div>

	<div use:revealOnScroll class="gt-reveal relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
			<div>
				<EditableField
					fieldKey="WhatsCovered.title"
					label="Заголовок"
					value={String(data?.title ?? 'Что покрывает гарантия')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="gt-item block"
				>
					{#snippet children(displayValue)}
						<h2 class="text-3xl text-pretty text-ink-900 sm:text-4xl lg:text-5xl">
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<div class="gt-rule gt-d1 mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
					<span class="h-px flex-1 bg-ink-900/10"></span>
					<span class="size-1.5 rotate-45 border border-brand-500/70"></span>
					<span class="h-px flex-1 bg-ink-900/10"></span>
				</div>

				<EditableField
					fieldKey="WhatsCovered.description"
					label="Описание"
					value={String(
						data?.description ??
							'Наша гарантия распространяется на производственные дефекты материалов и качество сборки. Мы несём ответственность за каждый элемент вашей мебели.'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="gt-item gt-d2 mt-6 block"
				>
					{#snippet children(displayValue)}
						<p class="max-w-xl text-sm/6 text-ink-600 sm:text-base/7">{displayValue}</p>
					{/snippet}
				</EditableField>

				<div class="gt-item gt-d3 mt-8 space-y-3">
					{#each items as item, i}
						<div
							class="group flex items-start gap-4 rounded-2xl border border-ink-900/10 bg-surface-raised p-4 shadow-[0_20px_50px_-45px] shadow-ink-900/50 transition duration-300 hover:border-brand-500/40 hover:shadow-[0_26px_60px_-40px] hover:shadow-ink-900/55 sm:p-5"
						>
							<span
								class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-500/20 transition duration-300 group-hover:bg-brand-500 group-hover:text-on-accent"
								aria-hidden="true"
							>
								<svg
									class="size-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="2.5"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
								</svg>
							</span>
							<div class="min-w-0">
								<h3 class="p1-title-sub text-ink-900">
									<EditableField
										fieldKey="WhatsCovered.{i}.title"
										label="Заголовок пункта"
										value={item.title}
										{isEditable}
										inline
										onSave={(v) => updateItem(i, 'title', v)}
									>
										{#snippet children(val)}{val}{/snippet}
									</EditableField>
								</h3>
								<p class="mt-1 text-sm/6 text-ink-500">
									<EditableField
										fieldKey="WhatsCovered.{i}.text"
										label="Описание пункта"
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

			<!-- Изображение в паспарту с градиентной каймой -->
			<div class="gt-card gt-d2 mt-12 lg:mt-0">
				<div
					class="rounded-4xl bg-linear-to-br from-brand-500/25 via-ink-900/10 to-brand-500/25 p-px shadow-[0_40px_100px_-60px] shadow-ink-900/55"
				>
					<EditableField
						fieldKey="WhatsCovered.imageUrl"
						label="URL изображения"
						value={String(data?.imageUrl ?? '')}
						{isEditable}
						onSave={(v) => saveField('imageUrl', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<img
									loading="lazy"
									src={displayValue}
									alt="Гарантия качества"
									class="aspect-4/3 w-full rounded-[calc(var(--radius-4xl)-1px)] object-cover"
								/>
							{:else}
								<div
									class="flex aspect-4/3 w-full items-center justify-center rounded-[calc(var(--radius-4xl)-1px)] bg-ink-50"
								>
									<p class="text-sm text-ink-400">Добавьте URL изображения</p>
								</div>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			</div>
		</div>
	</div>
</section>
