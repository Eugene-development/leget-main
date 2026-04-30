<script lang="ts">
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
		await saveComponentData(editContext, 'SocialProof', updated);
		data = updated;
	}

	const defaultReviews = [
		{
			name: 'Анна К.',
			text: 'Заказывали кухню — результат превзошёл ожидания. Всё точно по размерам, качество фурнитуры отличное. Установили за один день!',
			rating: 5
		},
		{
			name: 'Дмитрий М.',
			text: 'Шкаф-купе сделали за 12 дней. Очень доволен качеством и тем, что цена не изменилась с момента заказа. Рекомендую!',
			rating: 5
		},
		{
			name: 'Елена С.',
			text: 'Оформили рассрочку без проблем. Гардеробная получилась именно такой, как на 3D-визуализации. Спасибо команде!',
			rating: 5
		}
	];

	const reviews = $derived(
		Array.isArray(data?.reviews) && (data.reviews as unknown[]).length > 0
			? (data.reviews as typeof defaultReviews)
			: defaultReviews
	);
</script>

<section class="yd-social">
	<div class="yd-social__container">
		<div class="yd-social__header">
			<EditableField
				fieldKey="SocialProof.label"
				label="Метка"
				value={String(data?.label ?? 'Отзывы клиентов')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<span class="yd-social__label">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="SocialProof.title"
				label="Заголовок"
				value={String(data?.title ?? 'Нам доверяют сотни клиентов')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="yd-social__title">{displayValue}</h2>
				{/snippet}
			</EditableField>
		</div>

		<!-- Рейтинг -->
		<div class="yd-social__rating-bar">
			<div class="yd-social__rating-stars">
				{#each Array(5) as _}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="#f97316">
						<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
					</svg>
				{/each}
			</div>
			<span class="yd-social__rating-text">4.9 из 5 — на основе 200+ отзывов</span>
		</div>

		<!-- Отзывы -->
		<div class="yd-social__grid">
			{#each reviews as review}
				<div class="yd-social__card">
					<div class="yd-social__card-stars">
						{#each Array(review.rating) as _}
							<svg width="16" height="16" viewBox="0 0 24 24" fill="#f97316">
								<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
							</svg>
						{/each}
					</div>
					<p class="yd-social__card-text">"{review.text}"</p>
					<div class="yd-social__card-author">
						<div class="yd-social__card-avatar">
							{review.name.charAt(0)}
						</div>
						<span class="yd-social__card-name">{review.name}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.yd-social {
		padding: 5rem 1.5rem;
		background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
	}

	.yd-social__container {
		max-width: 72rem;
		margin: 0 auto;
	}

	.yd-social__header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.yd-social__label {
		display: inline-block;
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #f97316;
		margin-bottom: 0.75rem;
	}

	.yd-social__title {
		font-size: 2rem;
		font-weight: 800;
		color: #0f172a;
		letter-spacing: -0.02em;
	}

	.yd-social__rating-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-bottom: 3rem;
		padding: 1rem;
		background: rgba(249, 115, 22, 0.05);
		border-radius: 1rem;
		border: 1px solid rgba(249, 115, 22, 0.1);
	}

	.yd-social__rating-stars {
		display: flex;
		gap: 0.125rem;
	}

	.yd-social__rating-text {
		font-size: 0.9rem;
		color: #64748b;
		font-weight: 600;
	}

	.yd-social__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.yd-social__card {
		background: white;
		border-radius: 1.25rem;
		padding: 2rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
		transition: all 0.3s ease;
	}

	.yd-social__card:hover {
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
		transform: translateY(-2px);
	}

	.yd-social__card-stars {
		display: flex;
		gap: 0.125rem;
		margin-bottom: 1rem;
	}

	.yd-social__card-text {
		font-size: 0.95rem;
		color: #475569;
		line-height: 1.7;
		margin-bottom: 1.25rem;
		font-style: italic;
	}

	.yd-social__card-author {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.yd-social__card-avatar {
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		background: linear-gradient(135deg, #f97316, #ea580c);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		font-size: 0.85rem;
	}

	.yd-social__card-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: #0f172a;
	}

	@media (min-width: 768px) {
		.yd-social {
			padding: 6rem 2rem;
		}

		.yd-social__title {
			font-size: 2.5rem;
		}

		.yd-social__grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
