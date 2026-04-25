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

<section
	bind:this={sectionEl}
	class="relative grid min-h-[calc(100vh-64px)] border-border-light lg:min-h-[calc(100vh-120px)] lg:grid-cols-2 lg:border-b"
>
	<!-- Left: text -->
	<div class="flex shrink-0 flex-col justify-center bg-white px-8 py-16 lg:px-20">
		<div class="opacity-0 transition-all duration-700" class:animate-slide-right={visible} style="animation-delay: 0.1s">
			<EditableField
				fieldKey="Hero.label"
				label="Лейбл"
				value={String(data?.label ?? 'Системы хранения')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<span class="mb-6 block text-sm font-medium tracking-[0.3em] text-accent uppercase">
						{displayValue}
					</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Hero.title"
				label="Заголовок"
				value={String(data?.title ?? 'Идеальный порядок в каждой детали')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h1
						class="mb-8 text-4xl leading-tight font-light tracking-wide text-primary lg:text-6xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h1>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Hero.description"
				label="Описание"
				value={String(data?.description ?? 'Мы создаем уникальные встроенные и корпусные шкафы, которые становятся органичным продолжением вашей квартиры.')}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mb-12 max-w-lg text-lg leading-relaxed text-secondary">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>

			<a
				href={String(data?.ctaLink ?? '/contact')}
				class="group inline-flex items-center gap-3 rounded-sm border border-primary bg-primary px-8 py-4 text-xs tracking-[0.15em] text-white uppercase transition-all duration-500 hover:bg-transparent hover:text-primary"
			>
				<EditableField
					fieldKey="Hero.ctaText"
					label="Кнопка"
					value={String(data?.ctaText ?? 'Спроектировать шкаф')}
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

	<!-- Right: image -->
	<div class="relative hidden overflow-hidden bg-border-light lg:block">
		<img
			src="/images/promo-wardrobe.png"
			alt="Премиальная гардеробная"
			class="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
		/>
		<div class="absolute inset-0 bg-primary/0 transition-colors duration-500 hover:bg-primary/10"></div>
	</div>
</section>
