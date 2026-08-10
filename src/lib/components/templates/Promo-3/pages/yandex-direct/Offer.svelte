<script lang="ts">
	// Артикул: 3.9.6.1 — см. docs/architecture/component-articles-map.md
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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Offer', updated);
		data = updated;
	}

	const defaultIncludes = [
		'Бесплатный выезд замерщика',
		'3D визуализация проекта',
		'Фиксация цены в договоре',
		'Доставка и монтаж',
		'Гарантия 5 лет'
	];

	const includes = $derived(
		Array.isArray(data?.includes) && (data.includes as unknown[]).length > 0
			? (data.includes as string[])
			: defaultIncludes
	);
</script>

<section class="relative overflow-hidden py-24 lg:py-32">
	<div
		class="absolute inset-0 bg-linear-to-br from-accent-600/10 via-surface-900 to-surface-900"
	></div>
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.04]"
		style="background-image: linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px); background-size: 40px 40px;"
	></div>

	<div class="relative px-10 lg:px-24 xl:px-32">
		<div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
			<!-- Left: offer text -->
			<div>
				<!-- Pulsing badge -->
				<div
					class="mb-8 inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/5 px-4 py-1.5"
				>
					<span class="size-2 animate-pulse rounded-full bg-accent-500"></span>
					<EditableField
						fieldKey="Offer.badge"
						label="Тег"
						value={String(data?.badge ?? 'Ограниченное предложение')}
						{isEditable}
						onSave={(v) => saveField('badge', v)}
					>
						{#snippet children(displayValue)}
							<span class="text-xs font-semibold tracking-wider text-accent-500 uppercase"
								>{displayValue}</span
							>
						{/snippet}
					</EditableField>
				</div>

				<EditableField
					fieldKey="Offer.title"
					label="Заголовок"
					value={String(data?.title ?? 'Закажите сейчас — получите скидку 15%')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="font-display text-4xl text-white lg:text-5xl">
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Offer.subtitle"
					label="Подзаголовок"
					value={String(
						data?.subtitle ??
							'Оставьте заявку до конца месяца и получите дополнительную скидку на весь заказ'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('subtitle', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="mt-6 max-w-md text-lg leading-relaxed text-surface-300">{displayValue}</p>
					{/snippet}
				</EditableField>

				<div class="mt-10">
					<a
						href={String(data?.buttonHref ?? '/contacts')}
						class="group inline-flex items-center gap-3 rounded-xl bg-accent-500 px-8 py-4 text-sm font-bold tracking-wide text-surface-900 uppercase transition-all duration-300 hover:bg-accent-400 hover:shadow-2xl hover:shadow-accent-500/30"
					>
						<EditableField
							fieldKey="Offer.buttonText"
							label="Текст кнопки"
							value={String(data?.buttonText ?? 'Получить скидку')}
							{isEditable}
							onSave={(v) => saveField('buttonText', v)}
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
						<svg
							viewBox="0 0 20 20"
							class="size-4 fill-current transition-transform duration-300 group-hover:translate-x-1"
						>
							<path
								fill-rule="evenodd"
								d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
								clip-rule="evenodd"
							/>
						</svg>
					</a>
					<p class="mt-4 text-xs text-surface-300">Перезвоним в течение 15 минут</p>
				</div>
			</div>

			<!-- Right: what's included card -->
			<div
				class="relative rounded-3xl border border-surface-700/50 bg-surface-800/50 p-8 shadow-2xl backdrop-blur-sm lg:p-10"
			>
				<div
					class="absolute -top-px left-10 h-px w-20 bg-linear-to-r from-transparent via-accent-500 to-transparent"
				></div>
				<div
					class="absolute right-10 -bottom-px h-px w-20 bg-linear-to-r from-transparent via-accent-500/50 to-transparent"
				></div>

				<p class="mb-8 text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase">
					В стоимость входит
				</p>

				<div class="flex flex-col gap-0">
					{#each includes as item}
						<div class="flex items-center gap-4 border-b border-surface-700/40 py-4 first:border-t">
							<div
								class="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-500/10"
							>
								<svg
									class="size-3 text-accent-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="3"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							</div>
							<span class="text-sm text-surface-200">{item}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
