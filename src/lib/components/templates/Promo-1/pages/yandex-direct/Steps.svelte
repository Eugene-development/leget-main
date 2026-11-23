<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 1.10.4.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'Steps', updated);
		data = updated;
	}

	const defaultSteps = [
		{
			step: '01',
			title: 'Заявка и консультация',
			description:
				'Оставьте заявку — мы перезвоним в течение 15 минут. Обсудим ваши пожелания и бюджет'
		},
		{
			step: '02',
			title: 'Бесплатный замер',
			description:
				'Наш специалист приедет в удобное время, снимет точные размеры и предложит решения'
		},
		{
			step: '03',
			title: '3D дизайн-проект',
			description:
				'Создадим реалистичную визуализацию вашей мебели. Вы увидите результат до начала производства'
		},
		{
			step: '04',
			title: 'Производство и монтаж',
			description: 'Изготовим мебель на собственном производстве и установим с гарантией качества'
		}
	];

	const steps = $derived(
		Array.isArray(data?.steps) && (data.steps as unknown[]).length > 0
			? (data.steps as typeof defaultSteps)
			: defaultSteps
	);
</script>

<section data-ds-surface="light" class="yd-steps">
	<div class="yd-steps__container">
		<div class="yd-steps__header">
			<EditableField
				fieldKey="Steps.label"
				label="Метка"
				value={editableText(data?.label, 'Как мы работаем')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<span class="ds-copy yd-steps__label"><RichText value={displayValue} /></span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Steps.title"
				label="Заголовок"
				value={editableText(data?.title, '4 простых шага к вашей идеальной мебели')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="ds-copy yd-steps__title"><RichText value={displayValue} /></h2>
				{/snippet}
			</EditableField>
		</div>

		<div class="yd-steps__grid">
			{#each steps as item, i}
				<div data-ds-surface="light-overlay" class="yd-steps__card">
					<div data-ds-surface="light-overlay" class="yd-steps__card-number">{item.step}</div>
					<h3 data-ds-surface="light-overlay" class="ds-copy p1-title-sub yd-steps__card-title">
						{item.title}
					</h3>
					<p data-ds-surface="light-overlay" class="ds-copy yd-steps__card-text">
						{item.description}
					</p>
					{#if i < steps.length - 1}
						<div class="yd-steps__connector">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M5 12h14M12 5l7 7-7 7" />
							</svg>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.yd-steps {
		padding: 5rem 1.5rem;
		background: var(--ds-light-surface);
	}

	.yd-steps__container {
		max-width: 72rem;
		margin: 0 auto;
	}

	.yd-steps__header {
		text-align: center;
		margin-bottom: 3.5rem;
	}

	.yd-steps__label {
		display: inline-block;
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #f97316;
		margin-bottom: 0.75rem;
	}

	.yd-steps__title {
		font-size: var(--ds-font-section-title-size);
		color: #0f172a;
	}

	.yd-steps__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	.yd-steps__card {
		position: relative;
		padding: 2rem;
		background: var(--ds-light-overlay);
		border-radius: 1.25rem;
		border: 1px solid #e2e8f0;
		transition: all 0.3s ease;
	}

	.yd-steps__card:hover {
		background: var(--ds-light-overlay);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
		border-color: rgba(249, 115, 22, 0.2);
	}

	.yd-steps__card-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.75rem;
		background: linear-gradient(135deg, #f97316, #ea580c);
		color: white;
		font-size: 0.85rem;
		font-weight: 800;
		margin-bottom: 1.25rem;
	}

	.yd-steps__card-title {
		font-size: var(--ds-font-card-title-size);
		color: #0f172a;
		margin-bottom: 0.75rem;
	}

	.yd-steps__card-text {
		line-height: var(--ds-font-prose-leading);
		font-size: var(--ds-font-prose-size);
		color: #64748b;
	}

	.yd-steps__connector {
		display: none;
	}

	@media (min-width: 768px) {
		.yd-steps {
			padding: 6rem 2rem;
		}

		.yd-steps__grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.yd-steps__grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 1.5rem;
		}

		.yd-steps__connector {
			display: flex;
			position: absolute;
			top: 2rem;
			right: -1.25rem;
			color: #cbd5e1;
			z-index: 5;
		}
	}
</style>
