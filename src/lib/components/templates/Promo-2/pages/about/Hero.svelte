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

	onMount(() => {
		visible = true;
	});
</script>

<section class="relative min-h-[90vh] overflow-hidden bg-surface" id="about-hero">
	<!-- Background Image -->
	<div class="absolute inset-0">
		<img
			alt="Салон мебели"
			class="h-full w-full object-cover transition-transform duration-[2s]"
			class:scale-105={visible}
		/>
		<div class="absolute inset-0 bg-linear-to-r from-white via-white/80 to-white/30"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent"></div>
	</div>

	<!-- Content -->
	<div class="relative z-10 flex min-h-[90vh] items-center pb-24">
		<div class="mx-auto w-full max-w-screen-xl px-6 xl:px-1">
			<div class="max-w-2xl">
				<!-- Label -->
				<div class="mb-6 opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.3s">
					<EditableField
						fieldKey="Hero.label"
						label="Лейбл"
						value={String(data?.label ?? 'О фабрике')}
						{isEditable}
						onSave={(v) => saveField('label', v)}
					>
						{#snippet children(displayValue)}
							<span
								class="inline-flex items-center gap-2 border border-secondary/30 bg-white/60 px-4 py-2 text-[11px] tracking-[0.25em] text-secondary uppercase backdrop-blur-sm"
							>
								{displayValue}
							</span>
						{/snippet}
					</EditableField>
				</div>

				<!-- Heading -->
				<div
					class="opacity-0"
					class:animate-fade-up={visible}
					style="animation-delay: 0.5s"
				>
					<EditableField
						fieldKey="Hero.title"
						label="Заголовок"
						value={String(data?.title ?? 'От нашей фабрики для вашей семьи')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<h1
								class="text-5xl leading-[1.1] font-light text-primary md:text-6xl lg:text-7xl"
								style="font-family: var(--font-heading);"
							>
								{displayValue}
							</h1>
						{/snippet}
					</EditableField>
				</div>

				<!-- Description -->
				<div
					class="opacity-0"
					class:animate-fade-up={visible}
					style="animation-delay: 0.7s"
				>
					<EditableField
						fieldKey="Hero.description"
						label="Описание"
						value={String(data?.description ?? 'Наша фабрика располагает самой крупной сетью мебельных салонов. Предлагаем отличный сервис и доступные цены на мебель премиального качества.')}
						{isEditable}
						multiline
						onSave={(v) => saveField('description', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p class="mt-8 max-w-lg text-base leading-relaxed text-secondary md:text-lg">
								{displayValue}
							</p>
						{/snippet}
					</EditableField>
				</div>

				<!-- CTA -->
				<div
					class="mt-10 flex flex-wrap items-center gap-4 opacity-0"
					class:animate-fade-up={visible}
					style="animation-delay: 0.9s"
				>
					<a
						href={String(data?.ctaPrimaryLink ?? '/showrooms')}
						class="group inline-flex items-center gap-3 rounded-sm border border-primary bg-primary px-8 py-4 text-xs tracking-[0.15em] text-white uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary"
					>
						<EditableField
							fieldKey="Hero.ctaPrimary"
							label="Кнопка"
							value={String(data?.ctaPrimary ?? 'Найти ближайший салон')}
							{isEditable}
							onSave={(v) => saveField('ctaPrimary', v)}
						>
							{#snippet children(displayValue)}
								{displayValue}
							{/snippet}
						</EditableField>
						<svg
							class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
						</svg>
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Scroll Indicator -->
	<div
		class="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0"
		class:animate-fade-in={visible}
		style="animation-delay: 1.3s"
	>
		<div class="flex flex-col items-center gap-2">
			<span class="text-[10px] tracking-[0.3em] text-muted uppercase">Листайте</span>
			<div class="h-10 w-px bg-gradient-to-b from-border-medium to-transparent"></div>
		</div>
	</div>
</section>
