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
		await saveComponentData(editContext, 'Offer', updated);
		data = updated;
	}

	const defaultIncludes = [
		'Бесплатный выезд замерщика',
		'3D визуализация проекта',
		'Фиксация цены в договоре',
		'Доставка и монтаж',
		'Гарантия 5 лет'
	];

	const includes = $derived(
		Array.isArray(data?.includes) && (data.includes as unknown[]).length > 0
			? (data.includes as string[])
			: defaultIncludes
	);
</script>

<section class="yd-offer">
	<div class="yd-offer__container">
		<div class="yd-offer__card">
			<div class="yd-offer__glow"></div>

			<div class="yd-offer__content">
				<div class="yd-offer__badge">
					<span class="yd-offer__badge-pulse"></span>
					<EditableField
						fieldKey="Offer.badge"
						label="Бейдж"
						value={String(data?.badge ?? 'Ограниченное предложение')}
						{isEditable}
						onSave={(v) => saveField('badge', v)}
						class="inline"
					>
						{#snippet children(displayValue)}{displayValue}{/snippet}
					</EditableField>
				</div>

				<EditableField
					fieldKey="Offer.title"
					label="Заголовок"
					value={String(data?.title ?? 'Закажите сейчас — получите скидку 15%')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="yd-offer__title">{displayValue}</h2>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Offer.subtitle"
					label="Подзаголовок"
					value={String(data?.subtitle ?? 'Оставьте заявку до конца месяца и получите дополнительную скидку на весь заказ')}
					{isEditable}
					multiline
					onSave={(v) => saveField('subtitle', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="yd-offer__subtitle">{displayValue}</p>
					{/snippet}
				</EditableField>

				<!-- Что входит -->
				<div class="yd-offer__includes">
					{#each includes as item}
						<div class="yd-offer__includes-item">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="20 6 9 17 4 12"/>
							</svg>
							<span>{item}</span>
						</div>
					{/each}
				</div>
			</div>

			<div class="yd-offer__action">
				<a href={String(data?.buttonHref ?? '/contact')} class="yd-offer__btn">
					<EditableField
						fieldKey="Offer.buttonText"
						label="Текст кнопки"
						value={String(data?.buttonText ?? 'Получить скидку')}
						{isEditable}
						onSave={(v) => saveField('buttonText', v)}
						class="inline"
					>
						{#snippet children(displayValue)}{displayValue}{/snippet}
					</EditableField>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<line x1="5" y1="12" x2="19" y2="12"/>
						<polyline points="12 5 19 12 12 19"/>
					</svg>
				</a>
				<p class="yd-offer__note">Перезвоним в течение 15 минут</p>
			</div>
		</div>
	</div>
</section>

<style>
	.yd-offer {
		padding: 5rem 1.5rem;
		background: #0f172a;
		position: relative;
		overflow: hidden;
	}

	.yd-offer__container {
		max-width: 52rem;
		margin: 0 auto;
		position: relative;
		z-index: 10;
	}

	.yd-offer__card {
		position: relative;
		background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
		border-radius: 2rem;
		padding: 3rem 2rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}

	.yd-offer__glow {
		position: absolute;
		top: -100px;
		right: -100px;
		width: 300px;
		height: 300px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(249, 115, 22, 0.15), transparent 70%);
		pointer-events: none;
	}

	.yd-offer__content {
		position: relative;
		z-index: 5;
	}

	.yd-offer__badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #fb923c;
		margin-bottom: 1.5rem;
	}

	.yd-offer__badge-pulse {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #f97316;
		animation: offer-pulse 2s ease-in-out infinite;
	}

	@keyframes offer-pulse {
		0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.5); }
		50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(249, 115, 22, 0); }
	}

	.yd-offer__title {
		font-size: 1.75rem;
		font-weight: 800;
		color: #f8fafc;
		line-height: 1.2;
		margin-bottom: 1rem;
	}

	.yd-offer__subtitle {
		font-size: 1rem;
		color: #94a3b8;
		line-height: 1.7;
		margin-bottom: 2rem;
	}

	.yd-offer__includes {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 2.5rem;
	}

	.yd-offer__includes-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.9rem;
		color: #e2e8f0;
		font-weight: 500;
	}

	.yd-offer__includes-item svg {
		color: #22c55e;
		flex-shrink: 0;
	}

	.yd-offer__action {
		position: relative;
		z-index: 5;
		text-align: center;
	}

	.yd-offer__btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		max-width: 20rem;
		font-weight: 700;
		font-size: 1rem;
		padding: 1.125rem 2rem;
		border-radius: 0.875rem;
		background: linear-gradient(135deg, #f97316, #ea580c);
		color: white;
		text-decoration: none;
		box-shadow: 0 4px 24px rgba(249, 115, 22, 0.35);
		transition: all 0.3s ease;
	}

	.yd-offer__btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 32px rgba(249, 115, 22, 0.5);
	}

	.yd-offer__note {
		margin-top: 1rem;
		font-size: 0.8rem;
		color: #64748b;
	}

	@media (min-width: 768px) {
		.yd-offer {
			padding: 6rem 2rem;
		}

		.yd-offer__card {
			padding: 4rem 3.5rem;
		}

		.yd-offer__title {
			font-size: 2.25rem;
		}

		.yd-offer__includes {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 1rem 2rem;
		}
	}
</style>
