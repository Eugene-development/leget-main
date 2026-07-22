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
		await saveComponentData(editContext, 'WardrobeTypes', updated);
		data = updated;
	}

	const defaultTypes = [
		{
			title: 'Встроенные шкафы',
			description: 'Монтируются от пола до потолка, скрывая неровности стен и максимально эффективно используя ниши',
			image: null,
			offset: ''
		},
		{
			title: 'Корпусные решения',
			description: 'Самостоятельные модули, которые можно перемещать. Акцентные фасады и витринные стеклянные элементы',
			image: null,
			offset: 'lg:-translate-y-8'
		},
		{
			title: 'Гардеробные комнаты',
			description: 'Открытые и закрытые модульные системы премиум-класса с умной подсветкой и организаторами',
			image: null,
			offset: 'lg:-translate-y-16'
		}
	];

	const types = $derived(
		Array.isArray(data?.types) && (data.types as unknown[]).length > 0
			? (data.types as typeof defaultTypes)
			: defaultTypes
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

<section bind:this={sectionEl} class="overflow-hidden bg-white px-6 py-section-sm xl:px-1 lg:py-section">
	<div class="mx-auto max-w-screen-xl">
		<div class="mb-16 flex flex-col items-end justify-between gap-8 opacity-0 transition-all duration-700 lg:flex-row" class:animate-fade-up={visible}>
			<div class="max-w-2xl">
				<EditableField
					fieldKey="WardrobeTypes.label"
					label="Лейбл"
					value={String(data?.label ?? 'Варианты решений')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<span class="mb-4 block text-sm font-medium tracking-[0.2em] text-accent uppercase">
							{displayValue}
						</span>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="WardrobeTypes.heading"
					label="Заголовок"
					value={String(data?.heading ?? 'Виды систем')}
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
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each types as type, i}
				<div
					class="group cursor-pointer opacity-0 {type.offset}"
					class:animate-fade-up={visible}
					style="animation-delay: {0.1 + i * 0.1}s"
				>
					<div class="relative mb-6 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-[#F0F0F0] transition-all duration-500 group-hover:bg-[#E5E5E5]">
						<div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent"></div>
						<img loading="lazy"
							src={type.image || undefined}
							alt={type.title}
							class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105">
					</div>
					<h3
						class="mb-2 text-xl font-light tracking-wide text-primary"
						style="font-family: var(--font-heading);"
					>
						{type.title}
					</h3>
					<p class="text-sm leading-relaxed text-secondary">{type.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
