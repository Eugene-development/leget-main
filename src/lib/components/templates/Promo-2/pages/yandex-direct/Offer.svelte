<script lang="ts">
	// Артикул: 2.14.6.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
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

	let visible = $state(false);
	let sectionEl: HTMLElement;

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

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.2, rootMargin: '0px 0px -80px 0px' }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section class="relative overflow-hidden py-section-sm lg:py-section" bind:this={sectionEl}>
	<!-- Decorative border lines -->
	<div
		class="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-border-medium to-transparent"
	></div>

	<div class="mx-auto max-w-7xl px-6 xl:px-1">
		<div class="grid gap-12 lg:grid-cols-2 lg:gap-20">
			<!-- Left: offer info -->
			<div class="opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
				<EditableField
					fieldKey="Offer.badge"
					label="Лейбл"
					value={String(data?.badge ?? 'Ограниченное предложение')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
				>
					{#snippet children(displayValue)}
						<span
							class="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] text-accent uppercase"
						>
							<span class="inline-block h-1.5 w-1.5 rounded-full bg-accent"></span>
							{displayValue}
						</span>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Offer.title"
					label="Заголовок"
					value={String(data?.title ?? 'Закажите сейчас — получите скидку 15%')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="mt-4 text-4xl text-primary lg:text-5xl"
							style="font-family: var(--font-heading);"
						>
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
						<p class="mt-6 max-w-md text-base leading-relaxed text-secondary">{displayValue}</p>
					{/snippet}
				</EditableField>

				<div class="mt-10">
					<a
						href={String(data?.buttonHref ?? '/contact')}
						class="group inline-flex cursor-pointer items-center gap-3 rounded-sm border border-primary bg-primary px-8 py-4 text-xs tracking-[0.15em] text-inverse uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary"
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
							class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
							/>
						</svg>
					</a>
					<p class="mt-4 text-xs text-muted">Перезвоним в течение 15 минут</p>
				</div>
			</div>

			<!-- Right: what's included -->
			<div
				class="opacity-0 transition-all duration-700"
				class:animate-slide-right={visible}
				style="animation-delay: 0.2s"
			>
				<p class="mb-8 text-[11px] tracking-[0.3em] text-secondary uppercase">В стоимость входит</p>
				<div class="flex flex-col gap-0">
					{#each includes as item, i}
						<div
							class="flex items-center gap-4 border-b border-border-light py-5 opacity-0 first:border-t"
							class:animate-fade-up={visible}
							style="animation-delay: {0.3 + i * 0.08}s"
						>
							<svg
								class="h-4 w-4 shrink-0 text-accent"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
							<span class="text-sm text-primary">{item}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
