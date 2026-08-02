<script lang="ts">
	// Артикул: 2.9.1.1 — см. docs/architecture/component-articles-map.md
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

<section
	bind:this={sectionEl}
	class="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-primary text-white lg:min-h-[calc(100vh-120px)]"
>
	<div class="absolute inset-0 z-0">
		<img
			alt="Премиальные кухни"
			class="h-full w-full object-cover opacity-30 mix-blend-overlay"
		/>
		<div class="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/50 to-primary/95"></div>
	</div>

	<div class="relative z-10 mx-auto max-w-screen-xl px-6 text-center xl:px-1">
		<div class="mb-6 opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.3s">
			<EditableField
				fieldKey="Hero.label"
				label="Лейбл"
				value={String(data?.label ?? 'Мебельная фабрика')}
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
				value={String(data?.title ?? 'Создание вашей идеальной кухни')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h1
						class="mb-6 text-4xl font-light tracking-[0.1em] text-white uppercase lg:text-6xl"
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
				value={String(data?.description ?? 'От детального проектирования до бережной сборки — каждый этап контролируется нашими специалистами')}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-3xl text-lg leading-relaxed font-light text-white/80 lg:text-xl">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="mt-10 opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.9s">
			<a
				href={String(data?.ctaLink ?? '/contact')}
				class="group inline-flex items-center gap-3 rounded-sm border border-white bg-white px-8 py-4 text-xs tracking-[0.15em] text-primary uppercase transition-all duration-500 hover:bg-transparent hover:text-white"
			>
				<EditableField
					fieldKey="Hero.ctaText"
					label="Кнопка"
					value={String(data?.ctaText ?? 'Спроектировать кухню')}
					{isEditable}
					onSave={(v) => saveField('ctaText', v)}
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
					<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
				</svg>
			</a>
		</div>
	</div>

	<!-- Scroll Indicator -->
	<div
		class="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0"
		class:animate-fade-up={visible}
		style="animation-delay: 1.3s"
	>
		<div class="flex flex-col items-center gap-2">
			<span class="text-[10px] tracking-[0.3em] text-white/40 uppercase">Листайте</span>
			<div class="h-10 w-px bg-gradient-to-b from-white/40 to-transparent"></div>
		</div>
	</div>
</section>
