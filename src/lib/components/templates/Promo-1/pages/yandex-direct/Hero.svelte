<script lang="ts">
	// Артикул: 1.10.1.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { sitePhoneHref } from '$lib/utils/site-phone';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		sitePhone = null
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
		sitePhone?: string | null;
	} = $props();

	const phoneHref = $derived(sitePhoneHref(sitePhone));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}
</script>

<section class="yd-hero">
	<div class="yd-hero__bg">
		<div class="yd-hero__gradient"></div>
		<div class="yd-hero__pattern"></div>
	</div>

	<div class="yd-hero__container">
		<!-- Бейдж -->
		<div class="yd-hero__badge">
			<span class="yd-hero__badge-icon">🔥</span>
			<EditableField
				fieldKey="Hero.badge"
				label="Бейдж"
				value={String(data?.badge ?? 'Специальное предложение')}
				{isEditable}
				onSave={(v) => saveField('badge', v)}
				class="inline"
			>
				{#snippet children(displayValue)}{displayValue}{/snippet}
			</EditableField>
		</div>

		<!-- Заголовок -->
		<EditableField
			fieldKey="Hero.title"
			label="Заголовок"
			value={String(data?.title ?? 'Мебель на заказ по вашим размерам')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h1 class="yd-hero__title">{displayValue}</h1>
			{/snippet}
		</EditableField>

		<!-- Подзаголовок -->
		<EditableField
			fieldKey="Hero.subtitle"
			label="Подзаголовок"
			value={String(
				data?.subtitle ??
					'Кухни, шкафы, гардеробные — от замера до установки за 14 дней. Рассрочка 0% и бесплатный дизайн-проект'
			)}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<p class="yd-hero__subtitle">{displayValue}</p>
			{/snippet}
		</EditableField>

		<!-- Кнопки -->
		<div class="yd-hero__actions">
			<a href={String(data?.primaryHref ?? '/contact')} class="yd-hero__btn yd-hero__btn--primary">
				<EditableField
					fieldKey="Hero.primaryButton"
					label="Основная кнопка"
					value={String(data?.primaryButton ?? 'Рассчитать стоимость')}
					{isEditable}
					onSave={(v) => saveField('primaryButton', v)}
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</a>
			<a href={phoneHref} class="yd-hero__btn yd-hero__btn--secondary">
				<svg
					class="yd-hero__phone-icon"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
					/>
				</svg>
				<EditableField
					fieldKey="Hero.secondaryButton"
					label="Вторая кнопка"
					value={String(data?.secondaryButton ?? 'Позвонить')}
					{isEditable}
					onSave={(v) => saveField('secondaryButton', v)}
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</a>
		</div>

		<!-- Мини-преимущества -->
		<div class="yd-hero__mini-features">
			<div class="yd-hero__mini-feature">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg
				>
				<span>Замер бесплатно</span>
			</div>
			<div class="yd-hero__mini-feature">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg
				>
				<span>Гарантия 5 лет</span>
			</div>
			<div class="yd-hero__mini-feature">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg
				>
				<span>Рассрочка 0%</span>
			</div>
		</div>
	</div>
</section>

<style>
	.yd-hero {
		position: relative;
		width: 100%;
		min-height: 90vh;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.yd-hero__bg {
		position: absolute;
		inset: 0;
	}

	.yd-hero__gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
	}

	.yd-hero__pattern {
		position: absolute;
		inset: 0;
		background-image:
			radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.08) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.06) 0%, transparent 40%),
			radial-gradient(circle at 60% 80%, rgba(234, 179, 8, 0.05) 0%, transparent 40%);
	}

	.yd-hero__container {
		position: relative;
		z-index: 10;
		max-width: 52rem;
		width: 100%;
		padding: 3rem 1.5rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.yd-hero__badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(249, 115, 22, 0.12);
		border: 1px solid rgba(249, 115, 22, 0.25);
		border-radius: 9999px;
		padding: 0.5rem 1.25rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: #fb923c;
		margin-bottom: 2rem;
		backdrop-filter: blur(8px);
	}

	.yd-hero__badge-icon {
		font-size: 1rem;
	}

	.yd-hero__title {
		font-size: 2.5rem;
		font-weight: 800;
		color: #f8fafc;
		line-height: 1.1;
		letter-spacing: -0.03em;
		margin-bottom: 1.5rem;
	}

	.yd-hero__subtitle {
		font-size: 1.15rem;
		color: #94a3b8;
		line-height: 1.7;
		max-width: 38rem;
		margin-bottom: 2.5rem;
	}

	.yd-hero__actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 3rem;
		width: 100%;
		max-width: 24rem;
	}

	.yd-hero__btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-weight: 700;
		font-size: 1rem;
		padding: 1rem 2rem;
		border-radius: 0.875rem;
		text-decoration: none;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.yd-hero__btn--primary {
		background: linear-gradient(135deg, #f97316, #ea580c);
		color: white;
		box-shadow: 0 4px 24px rgba(249, 115, 22, 0.35);
	}

	.yd-hero__btn--primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 32px rgba(249, 115, 22, 0.45);
	}

	.yd-hero__btn--secondary {
		background: rgba(255, 255, 255, 0.06);
		color: #e2e8f0;
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	.yd-hero__btn--secondary:hover {
		background: rgba(255, 255, 255, 0.12);
		transform: translateY(-2px);
	}

	.yd-hero__phone-icon {
		flex-shrink: 0;
	}

	.yd-hero__mini-features {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.5rem;
	}

	.yd-hero__mini-feature {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: #94a3b8;
		font-weight: 500;
	}

	.yd-hero__mini-feature svg {
		color: #22c55e;
	}

	@media (min-width: 768px) {
		.yd-hero__title {
			font-size: 3.5rem;
		}

		.yd-hero__subtitle {
			font-size: 1.25rem;
		}

		.yd-hero__actions {
			flex-direction: row;
			max-width: none;
			width: auto;
		}
	}

	@media (min-width: 1024px) {
		.yd-hero__title {
			font-size: 4rem;
		}
	}
</style>
