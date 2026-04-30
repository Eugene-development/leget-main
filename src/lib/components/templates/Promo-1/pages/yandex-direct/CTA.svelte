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
		await saveComponentData(editContext, 'CTA', updated);
		data = updated;
	}
</script>

<section class="yd-cta">
	<div class="yd-cta__container">
		<div class="yd-cta__inner">
			<EditableField
				fieldKey="CTA.title"
				label="Заголовок"
				value={String(data?.title ?? 'Готовы обсудить ваш проект?')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="yd-cta__title">{displayValue}</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="CTA.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Оставьте заявку — мы перезвоним в течение 15 минут и ответим на все вопросы')}
				{isEditable}
				multiline
				onSave={(v) => saveField('subtitle', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="yd-cta__subtitle">{displayValue}</p>
				{/snippet}
			</EditableField>

			<div class="yd-cta__actions">
				<a href={String(data?.primaryHref ?? '/contact')} class="yd-cta__btn yd-cta__btn--primary">
					<EditableField
						fieldKey="CTA.primaryButton"
						label="Основная кнопка"
						value={String(data?.primaryButton ?? 'Оставить заявку')}
						{isEditable}
						onSave={(v) => saveField('primaryButton', v)}
						class="inline"
					>
						{#snippet children(displayValue)}{displayValue}{/snippet}
					</EditableField>
				</a>
				<a href={String(data?.phoneHref ?? 'tel:+70000000000')} class="yd-cta__btn yd-cta__btn--secondary">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
					</svg>
					<EditableField
						fieldKey="CTA.phoneButton"
						label="Кнопка телефона"
						value={String(data?.phoneButton ?? 'Позвонить нам')}
						{isEditable}
						onSave={(v) => saveField('phoneButton', v)}
						class="inline"
					>
						{#snippet children(displayValue)}{displayValue}{/snippet}
					</EditableField>
				</a>
			</div>

			<div class="yd-cta__trust">
				<div class="yd-cta__trust-item">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
					</svg>
					<span>Безопасная сделка</span>
				</div>
				<div class="yd-cta__trust-item">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
						<path d="M7 11V7a5 5 0 0110 0v4"/>
					</svg>
					<span>Данные защищены</span>
				</div>
				<div class="yd-cta__trust-item">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="20 6 9 17 4 12"/>
					</svg>
					<span>Без спама</span>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.yd-cta {
		padding: 5rem 1.5rem;
		background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%);
		position: relative;
		overflow: hidden;
	}

	.yd-cta::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
		pointer-events: none;
	}

	.yd-cta__container {
		max-width: 48rem;
		margin: 0 auto;
		position: relative;
		z-index: 10;
	}

	.yd-cta__inner {
		text-align: center;
	}

	.yd-cta__title {
		font-size: 2rem;
		font-weight: 800;
		color: white;
		margin-bottom: 1rem;
		letter-spacing: -0.02em;
	}

	.yd-cta__subtitle {
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.85);
		line-height: 1.7;
		margin-bottom: 2.5rem;
		max-width: 32rem;
		margin-left: auto;
		margin-right: auto;
	}

	.yd-cta__actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 2.5rem;
	}

	.yd-cta__btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-weight: 700;
		font-size: 1rem;
		padding: 1rem 2.5rem;
		border-radius: 0.875rem;
		text-decoration: none;
		transition: all 0.3s ease;
		cursor: pointer;
		min-width: 14rem;
	}

	.yd-cta__btn--primary {
		background: white;
		color: #ea580c;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	}

	.yd-cta__btn--primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
	}

	.yd-cta__btn--secondary {
		background: rgba(255, 255, 255, 0.15);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		backdrop-filter: blur(4px);
	}

	.yd-cta__btn--secondary:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: translateY(-2px);
	}

	.yd-cta__trust {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.5rem;
	}

	.yd-cta__trust-item {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.75);
		font-weight: 500;
	}

	.yd-cta__trust-item svg {
		opacity: 0.8;
	}

	@media (min-width: 768px) {
		.yd-cta {
			padding: 6rem 2rem;
		}

		.yd-cta__title {
			font-size: 2.75rem;
		}

		.yd-cta__actions {
			flex-direction: row;
			justify-content: center;
		}
	}
</style>
