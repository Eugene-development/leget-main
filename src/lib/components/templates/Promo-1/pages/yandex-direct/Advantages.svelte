<script lang="ts">
	// Артикул: 1.10.3.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'Advantages', updated);
		data = updated;
	}

	const defaultAdvantages = [
		{ number: '500+', label: 'Выполненных проектов' },
		{ number: '14', label: 'Дней — средний срок' },
		{ number: '5', label: 'Лет гарантии' },
		{ number: '0%', label: 'Переплата по рассрочке' }
	];

	const advantages = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultAdvantages)
			: defaultAdvantages
	);

	const defaultFeatures = [
		'Собственное производство полного цикла',
		'Европейская фурнитура: Hettich, Blum, Egger',
		'Бесплатный 3D дизайн-проект',
		'Доставка и профессиональный монтаж',
		'Работаем без предоплаты',
		'Фиксируем цену в договоре'
	];

	const features = $derived(
		Array.isArray(data?.features) && (data.features as unknown[]).length > 0
			? (data.features as string[])
			: defaultFeatures
	);
</script>

<section class="yd-adv">
	<div class="yd-adv__container">
		<div class="yd-adv__left">
			<EditableField
				fieldKey="Advantages.label"
				label="Метка"
				value={String(data?.label ?? 'Наши преимущества')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<span class="yd-adv__label">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Advantages.title"
				label="Заголовок"
				value={String(data?.title ?? 'Цифры говорят за нас')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="yd-adv__title">{displayValue}</h2>
				{/snippet}
			</EditableField>

			<!-- Статистика -->
			<div class="yd-adv__stats">
				{#each advantages as stat}
					<div class="yd-adv__stat">
						<span class="yd-adv__stat-number">{stat.number}</span>
						<span class="yd-adv__stat-label">{stat.label}</span>
					</div>
				{/each}
			</div>
		</div>

		<div class="yd-adv__right">
			<div class="yd-adv__features-card">
				<h3 class="yd-adv__features-title">Что вы получаете</h3>
				<ul class="yd-adv__features-list">
					{#each features as feature}
						<li class="yd-adv__features-item">
							<div class="yd-adv__features-check">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
									<polyline points="20 6 9 17 4 12"/>
								</svg>
							</div>
							<span>{feature}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>

<style>
	.yd-adv {
		padding: 5rem 1.5rem;
		background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
	}

	.yd-adv__container {
		max-width: 72rem;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.yd-adv__left {
		flex: 1;
	}

	.yd-adv__label {
		display: inline-block;
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #f97316;
		margin-bottom: 0.75rem;
	}

	.yd-adv__title {
		font-size: 2rem;
		font-weight: 800;
		color: #0f172a;
		margin-bottom: 2.5rem;
		letter-spacing: -0.02em;
	}

	.yd-adv__stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
	}

	.yd-adv__stat {
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		background: white;
		border-radius: 1rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	}

	.yd-adv__stat-number {
		font-size: 2.25rem;
		font-weight: 800;
		color: #0f172a;
		line-height: 1;
		margin-bottom: 0.5rem;
		background: linear-gradient(135deg, #f97316, #ea580c);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.yd-adv__stat-label {
		font-size: 0.85rem;
		color: #64748b;
		font-weight: 500;
	}

	.yd-adv__right {
		flex: 1;
	}

	.yd-adv__features-card {
		background: linear-gradient(145deg, #0f172a, #1e293b);
		border-radius: 1.5rem;
		padding: 2.5rem;
		border: 1px solid rgba(255, 255, 255, 0.06);
	}

	.yd-adv__features-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #f8fafc;
		margin-bottom: 1.5rem;
	}

	.yd-adv__features-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.yd-adv__features-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.95rem;
		color: #cbd5e1;
		font-weight: 500;
	}

	.yd-adv__features-check {
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.5rem;
		background: rgba(34, 197, 94, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #22c55e;
		flex-shrink: 0;
	}

	@media (min-width: 768px) {
		.yd-adv {
			padding: 6rem 2rem;
		}

		.yd-adv__container {
			flex-direction: row;
			align-items: stretch;
		}

		.yd-adv__title {
			font-size: 2.5rem;
		}

		.yd-adv__stats {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
