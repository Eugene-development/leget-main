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
		await saveComponentData(editContext, 'KitchenStyles', updated);
		data = updated;
	}

	const defaultStyles = [
		{
			title: 'Современный стиль',
			description: 'Минимализм в каждой детали. Гладкие матовые фасады, скрытая фурнитура, отсутствие лишних визуальных шумов. Идеально для функционального и чистого пространства.',
			image: '/images/style-modern.png'
		},
		{
			title: 'Неоклассика',
			description: 'Утонченное сочетание традиций и современных тенденций. Изящная неглубокая фрезеровка фасадов, пастельная цветовая палитра и премиальные материалы.',
			image: '/images/style-neoclassic.png'
		},
		{
			title: 'Лофт',
			description: 'Выразительная фактура натурального дерева, бетона и металла. Брутальные формы, индустриальный шик и максимальный акцент на естественные покрытия.',
			image: '/images/style-loft.png'
		}
	];

	const styles = $derived(
		Array.isArray(data?.styles) && (data.styles as unknown[]).length > 0
			? (data.styles as typeof defaultStyles)
			: defaultStyles
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

<section bind:this={sectionEl} class="bg-surface-warm px-6 py-section-sm xl:px-1 lg:py-section">
	<div class="mx-auto max-w-screen-xl">
		<div class="mb-16 text-center opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
			<EditableField
				fieldKey="KitchenStyles.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Варианты стилистических решений')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mb-6 text-3xl font-light tracking-wide text-primary uppercase lg:text-4xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="KitchenStyles.description"
				label="Описание"
				value={String(data?.description ?? 'Мы адаптируем индивидуальный проект под любой стиль.')}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-2xl text-lg leading-relaxed font-light text-secondary">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each styles as style, i}
				<div
					class="group overflow-hidden rounded-2xl bg-white shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated opacity-0"
					class:animate-fade-up={visible}
					style="animation-delay: {0.1 + i * 0.1}s"
				>
					<div class="aspect-[4/3] w-full overflow-hidden">
						<img
							src={style.image}
							alt={style.title}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
					</div>
					<div class="p-8">
						<h3
							class="mb-3 text-xl font-light tracking-wide text-primary"
							style="font-family: var(--font-heading);"
						>
							{style.title}
						</h3>
						<p class="text-sm leading-relaxed text-secondary">{style.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
