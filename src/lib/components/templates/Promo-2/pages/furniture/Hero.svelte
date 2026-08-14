<script lang="ts">
	// Артикул: 2.6.1.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
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

<section class="relative min-h-[90vh] overflow-hidden bg-surface">
	<!-- Background Image with Dark Overlay -->
	<div class="absolute inset-0">
		<ImageFallback
			src={String(data?.image ?? '')}
			alt="Премиальная мебельная фурнитура"
			class="h-full w-full object-cover transition-transform duration-[2.5s] {visible
				? 'scale-105'
				: ''}"
		/>
		<div class="absolute inset-0 bg-linear-to-r from-primary/95 via-primary/70 to-primary/40"></div>
	</div>

	<!-- Content -->
	<div class="relative z-10 flex min-h-[90vh] items-center">
		<div class="mx-auto w-full max-w-screen-xl px-6 xl:px-1">
			<div class="max-w-2xl">
				<!-- Label -->
				<div class="mb-6 opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.3s">
					<EditableField
						fieldKey="Hero.label"
						label="Лейбл"
						value={String(data?.label ?? 'Функциональность')}
						{isEditable}
						onSave={(v) => saveField('label', v)}
					>
						{#snippet children(displayValue)}
							<span
								class="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2 text-[11px] tracking-[0.25em] text-white/70 uppercase backdrop-blur-sm"
							>
								{displayValue}
							</span>
						{/snippet}
					</EditableField>
				</div>

				<!-- Heading -->
				<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.5s">
					<EditableField
						fieldKey="Hero.title"
						label="Заголовок"
						value={String(data?.title ?? 'Безупречное движение')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<h1
								class="text-5xl text-white md:text-6xl lg:text-7xl"
								style="font-family: var(--font-heading);"
							>
								{displayValue}
							</h1>
						{/snippet}
					</EditableField>
				</div>

				<!-- Description -->
				<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.7s">
					<EditableField
						fieldKey="Hero.description"
						label="Описание"
						value={String(
							data?.description ??
								'Мебель премиум-класса требует фурнитуры соответствующего уровня.'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('description', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p class="mt-8 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
								{displayValue}
							</p>
						{/snippet}
					</EditableField>
				</div>

				<div class="mt-10 opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.9s">
					<a
						href="#intro-section"
						class="group inline-flex cursor-pointer items-center gap-3 rounded-sm border border-secondary bg-secondary px-8 py-4 text-xs tracking-[0.15em] text-white uppercase transition-all duration-500 hover:bg-transparent"
					>
						Узнать больше
						<svg
							class="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
							/>
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
			<span class="text-[10px] tracking-[0.3em] text-white/50 uppercase">Вниз</span>
			<div class="h-10 w-px bg-gradient-to-b from-white/50 to-transparent"></div>
		</div>
	</div>
</section>
