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
		await saveComponentData(editContext, 'WardrobeFeatures', updated);
		data = updated;
	}

	const defaultFeatures = [
		{ title: 'Точные замеры', desc: 'Лазерное 3D-сканирование помещения для идеального встраивания', colSpan: 'md:col-span-2' },
		{ title: 'Премиум фурнитура', desc: 'Бесшумное скольжение и доводчики от ведущих брендов', colSpan: 'md:col-span-1' },
		{ title: 'Надежные материалы', desc: 'Экологичные плиты европейского стандарта высокой плотности', colSpan: 'md:col-span-1' },
		{ title: 'Сложная архитектура', desc: 'Проектируем наполнение, учитывая ваш гардероб и обувь до мелочей', colSpan: 'md:col-span-2' }
	];

	const features = $derived(
		Array.isArray(data?.features) && (data.features as unknown[]).length > 0
			? (data.features as typeof defaultFeatures)
			: defaultFeatures
	);

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

<section bind:this={sectionEl} class="mx-auto max-w-screen-xl px-6 py-section-sm xl:px-1 lg:py-section">
	<div class="mb-16 text-center opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
		<EditableField
			fieldKey="WardrobeFeatures.heading"
			label="Заголовок"
			value={String(data?.heading ?? 'Безупречное качество от замера до установки')}
			{isEditable}
			onSave={(v) => saveField('heading', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2
					class="text-3xl font-light tracking-wide text-primary lg:text-4xl"
					style="font-family: var(--font-heading);"
				>
					{displayValue}
				</h2>
			{/snippet}
		</EditableField>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		{#each features as feature, i}
			<div
				class="relative flex min-h-[250px] flex-col justify-end overflow-hidden rounded-3xl bg-white p-10 shadow-soft transition-shadow duration-300 hover:shadow-elevated opacity-0 {feature.colSpan}"
				class:animate-fade-up={visible}
				style="animation-delay: {0.1 + i * 0.1}s"
			>
				<div
					class="absolute top-8 right-8 text-6xl font-light text-border-medium/30"
					style="font-family: var(--font-heading);"
				>
					0{i + 1}
				</div>
				<h3
					class="mb-3 text-2xl font-light text-primary"
					style="font-family: var(--font-heading);"
				>
					{feature.title}
				</h3>
				<p class="leading-relaxed text-secondary">{feature.desc}</p>
			</div>
		{/each}
	</div>
</section>
