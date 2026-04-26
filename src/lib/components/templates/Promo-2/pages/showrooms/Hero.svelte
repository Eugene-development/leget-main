<script lang="ts">
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
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section bind:this={sectionEl} class="relative min-h-[90vh] overflow-hidden bg-surface" id="showrooms-hero">
	<!-- Background Image -->
	<div class="absolute inset-0">
		<img
			src="/images/modern_showroom.png"
			alt="Интерьер салона"
			class="h-full w-full object-cover transition-transform duration-[2s]"
			class:scale-105={visible}
		/>
		<div class="absolute inset-0 bg-linear-to-r from-primary/90 via-primary/60 to-transparent"></div>
	</div>

	<!-- Content -->
	<div class="relative z-10 flex min-h-[90vh] items-center">
		<div class="mx-auto w-full max-w-screen-xl px-6 xl:px-1">
			<div class="max-w-xl">
				<div class="mb-6 opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.3s">
					<EditableField
						fieldKey="Hero.label"
						label="Лейбл"
						value={String(data?.label ?? 'Где купить')}
						{isEditable}
						onSave={(v) => saveField('label', v)}
					>
						{#snippet children(displayValue)}
							<span class="text-[11px] tracking-[0.3em] text-white/70 uppercase">{displayValue}</span>
						{/snippet}
					</EditableField>
				</div>

				<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.5s">
					<EditableField
						fieldKey="Hero.title"
						label="Заголовок"
						value={String(data?.title ?? 'Наши салоны')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<h1
								class="text-5xl leading-[1.1] font-light text-white md:text-6xl lg:text-7xl"
								style="font-family: var(--font-heading);"
							>
								{displayValue}
							</h1>
						{/snippet}
					</EditableField>
				</div>

				<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.7s">
					<EditableField
						fieldKey="Hero.description"
						label="Описание"
						value={String(data?.description ?? 'Посетите один из наших фирменных салонов. Оцените качество материалов вживую.')}
						{isEditable}
						multiline
						onSave={(v) => saveField('description', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p class="mt-6 text-base leading-relaxed text-white/70 md:text-lg">
								{displayValue}
							</p>
						{/snippet}
					</EditableField>
				</div>

				<div class="mt-10 opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.9s">
					<a
						href={String(data?.ctaLink ?? '#network-section')}
						class="group inline-flex items-center gap-3 rounded-sm border border-secondary bg-secondary px-8 py-4 text-xs tracking-[0.15em] text-white uppercase transition-all duration-500 hover:bg-transparent"
					>
						<EditableField
							fieldKey="Hero.ctaText"
							label="Кнопка"
							value={String(data?.ctaText ?? 'Посмотреть карту')}
							{isEditable}
							onSave={(v) => saveField('ctaText', v)}
						>
							{#snippet children(displayValue)}
								{displayValue}
							{/snippet}
						</EditableField>
						<svg
							class="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
						</svg>
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Scroll Indicator -->
	<div
		class="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0"
		class:animate-fade-up={visible}
		style="animation-delay: 1.3s"
	>
		<div class="flex flex-col items-center gap-2">
			<span class="text-[10px] tracking-[0.3em] text-white/50 uppercase">Вниз</span>
			<div class="h-10 w-px bg-gradient-to-b from-white/50 to-transparent"></div>
		</div>
	</div>
</section>
