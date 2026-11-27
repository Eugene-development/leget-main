<script lang="ts">
	import ContentText from '$lib/components/templates/Promo-2/ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 2.9.4.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { onMount } from 'svelte';
	import RichText from '$lib/components/RichText.svelte';
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
			title: 'Посуда под рукой',
			description:
				'Глубокий ящик выдвигается целиком, а переставляемые держатели удерживают стопки тарелок на месте.',
			image:
				'https://storage.yandexcloud.net/leget-main/templates/promo-2/kitchen-details-2-9-4-1/dish-drawer.webp'
		},
		{
			title: 'Запасы на виду',
			description:
				'Выдвижная колонна открывает доступ к банкам и бутылкам по всей глубине шкафа.',
			image:
				'https://storage.yandexcloud.net/leget-main/templates/promo-2/kitchen-details-2-9-4-1/pull-out-pantry.webp'
		},
		{
			title: 'Свет там, где готовите',
			description:
				'Встроенная подсветка под верхними шкафами освещает столешницу вдоль всей рабочей зоны.',
			image:
				'https://storage.yandexcloud.net/leget-main/templates/promo-2/kitchen-details-2-9-4-1/worktop-lighting.webp'
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

<section bind:this={sectionEl} class="bg-surface-warm py-section-sm lg:py-section">
	<div class="p2-container mx-auto">
		<div
			class="mb-16 text-center opacity-0 transition-all duration-700"
			class:animate-fade-up={visible}
		>
			<EditableField
				fieldKey="KitchenStyles.heading"
				label="Заголовок"
				value={editableText(data?.heading, 'Удобство в деталях')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mb-6 text-section-title text-primary uppercase"
						style="font-family: var(--font-heading);"
					>
						<RichText value={displayValue} />
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="KitchenStyles.description"
				label="Описание"
				value={editableText(
					data?.description,
					'Продумываем, где хранить посуду и продукты и как осветить рабочую зону.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-2xl text-prose font-light text-secondary">
						<RichText value={displayValue} />
					</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each styles as style, i}
				<div
					class="group overflow-hidden rounded-2xl bg-white opacity-0 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated"
					class:animate-fade-up={visible}
					style="animation-delay: {0.1 + i * 0.1}s"
				>
					<div class="aspect-[4/3] w-full overflow-hidden">
						<ImageFallback
							proxyPublicImage
							imagePath={['styles', i, 'image']}
							imageDefaults={{ styles }}
							loading="lazy"
							src={style.image || undefined}
							alt={style.title}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
					</div>
					<div class="p-8">
						<h3 class="mb-3 text-card-title text-primary" style="font-family: var(--font-heading);">
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="KitchenStyles"
								path={['styles', styles.indexOf(style), 'title']}
								fallback={style.title}
								label="Заголовок"
								defaults={{ styles }}
							/>
						</h3>
						<p class="text-prose text-secondary">
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="KitchenStyles"
								path={['styles', styles.indexOf(style), 'description']}
								fallback={style.description}
								label="Описание"
								defaults={{ styles }}
								multiline
							/>
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
