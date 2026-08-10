<script lang="ts">
	// Артикул: 1.10.2.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'USP', updated);
		data = updated;
	}

	const defaultItems = [
		{
			icon: 'ruler',
			title: 'Индивидуальный проект',
			description:
				'Каждое изделие проектируется под ваши размеры и пожелания. Никаких стандартных решений'
		},
		{
			icon: 'shield',
			title: 'Гарантия качества',
			description: 'Используем фурнитуру Hettich и Blum. Гарантия на все изделия — 5 лет'
		},
		{
			icon: 'clock',
			title: 'Быстрое изготовление',
			description: 'От замера до установки — 14 рабочих дней. Соблюдаем сроки или делаем скидку'
		},
		{
			icon: 'wallet',
			title: 'Рассрочка 0%',
			description: 'Оформляем рассрочку без переплат на срок до 24 месяцев. Первый взнос от 0%'
		}
	];

	const items = $derived(
		Array.isArray(data?.items) && (data.items as unknown[]).length > 0
			? (data.items as typeof defaultItems)
			: defaultItems
	);

	const iconPaths: Record<string, string> = {
		ruler:
			'M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm4 0v4m4-4v2m4-2v4m4-4v2',
		shield:
			'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
		clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
		wallet: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
	};
</script>

<section class="yd-usp">
	<div class="yd-usp__container">
		<div class="yd-usp__header">
			<EditableField
				fieldKey="USP.label"
				label="Метка"
				value={String(data?.label ?? 'Почему мы')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<span class="yd-usp__label">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="USP.title"
				label="Заголовок"
				value={String(data?.title ?? 'Уникальное торговое предложение')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="yd-usp__title">{displayValue}</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="USP.subtitle"
				label="Подзаголовок"
				value={String(
					data?.subtitle ??
						'То, что отличает нас от конкурентов и делает сотрудничество выгодным для вас'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('subtitle', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="yd-usp__subtitle">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="yd-usp__grid">
			{#each items as item, i}
				<div class="yd-usp__card" style="animation-delay: {i * 100}ms">
					<div class="yd-usp__card-icon">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d={iconPaths[item.icon] ?? iconPaths.shield} />
						</svg>
					</div>
					<h3 class="p1-title-sub yd-usp__card-title">{item.title}</h3>
					<p class="yd-usp__card-text">{item.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.yd-usp {
		padding: 5rem 1.5rem;
		background: #f8fafc;
	}

	.yd-usp__container {
		max-width: 72rem;
		margin: 0 auto;
	}

	.yd-usp__header {
		text-align: center;
		margin-bottom: 3.5rem;
	}

	.yd-usp__label {
		display: inline-block;
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #f97316;
		margin-bottom: 0.75rem;
	}

	.yd-usp__title {
		font-size: 2rem;
		font-weight: 800;
		color: #0f172a;
		margin-bottom: 1rem;
		letter-spacing: -0.02em;
	}

	.yd-usp__subtitle {
		font-size: 1.05rem;
		color: #64748b;
		max-width: 36rem;
		margin: 0 auto;
		line-height: 1.7;
	}

	.yd-usp__grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: 1fr;
	}

	.yd-usp__card {
		background: white;
		border-radius: 1.25rem;
		padding: 2rem;
		border: 1px solid #e2e8f0;
		transition: all 0.3s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	}

	.yd-usp__card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
		border-color: rgba(249, 115, 22, 0.2);
	}

	.yd-usp__card-icon {
		width: 3rem;
		height: 3rem;
		border-radius: 0.75rem;
		background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 179, 8, 0.1));
		display: flex;
		align-items: center;
		justify-content: center;
		color: #f97316;
		margin-bottom: 1.25rem;
	}

	.yd-usp__card-title {
		font-size: 1.15rem;
		font-weight: 700;
		color: #0f172a;
		margin-bottom: 0.75rem;
	}

	.yd-usp__card-text {
		font-size: 0.925rem;
		color: #64748b;
		line-height: 1.7;
	}

	@media (min-width: 640px) {
		.yd-usp__grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 768px) {
		.yd-usp {
			padding: 6rem 2rem;
		}

		.yd-usp__title {
			font-size: 2.5rem;
		}
	}

	@media (min-width: 1024px) {
		.yd-usp__grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
