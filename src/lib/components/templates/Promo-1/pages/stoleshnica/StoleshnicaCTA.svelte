<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	// Артикул: 1.19.7.1 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { sitePhoneHref } from '$lib/utils/site-phone';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		sitePhone = null
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
		sitePhone?: string | null;
	} = $props();

	const phoneHref = $derived(sitePhoneHref(sitePhone));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'StoleshnicaCTA', updated);
		data = updated;
	}
</script>

<div class="p1-catalog-container mt-12 mb-16">
	<div
		class="countertop-cta relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-accent-panel to-accent-panel-deep text-on-accent shadow-xl ring-1 ring-on-accent/10 ring-inset"
	>
		<div class="cta-copy">
			<h2 class="cta-title text-balance">
				<EditableField
					fieldKey="StoleshnicaCTA.title"
					label="Заголовок CTA"
					value={editableText(data.title, 'Рассчитайте стоимость столешницы')}
					{isEditable}
					inline
					onSave={(v) => saveField('title', v)}
				>
					{#snippet children(val)}<RichText value={val} />{/snippet}
				</EditableField>
			</h2>

			<p class="mt-4 max-w-[38ch] text-pretty text-on-accent-muted">
				<EditableField
					fieldKey="StoleshnicaCTA.description"
					label="Описание CTA"
					value={editableText(
						data.description,
						'Оставьте заявку и получите расчёт стоимости с учётом всех вырезов и монтажа'
					)}
					{isEditable}
					inline
					multiline
					onSave={(v) => saveField('description', v)}
				>
					{#snippet children(val)}<RichText value={val} />{/snippet}
				</EditableField>
			</p>

			<div class="mt-7 flex flex-col items-start gap-3">
				<button
					data-metrika-goal="pages_stoleshnica_stoleshnicacta_open_1"
					data-goal-action="open"
					onclick={() => serviceOrderStore.open('countertop-estimate')}
					type="button"
					class="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-raised px-7 py-3 font-medium text-accent-ink shadow-sm transition-[translate,background-color,box-shadow] ease-ui hover:bg-accent-ink-wash hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-accent motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 sm:w-auto"
				>
					<EditableField
						fieldKey="StoleshnicaCTA.buttonText"
						label="Текст кнопки"
						value={editableText(data.buttonText, 'Получить расчёт')}
						{isEditable}
						inline
						onSave={(v) => saveField('buttonText', v)}
					>
						{#snippet children(val)}<RichText value={val} />{/snippet}
					</EditableField>
					<span
						class="cta-arrow shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
						aria-hidden="true"
					></span>
				</button>

				<a
					href={phoneHref}
					class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-on-accent/20 bg-on-accent/10 px-7 py-3 font-medium text-on-accent transition-colors ease-ui hover:border-on-accent/30 hover:bg-on-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-accent sm:hidden"
				>
					<svg
						class="size-[18px]"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
						/>
					</svg>
					Позвонить
				</a>
			</div>
		</div>

		<div class="drawing" aria-hidden="true">
			<div class="worktop-plan">
				<div class="dimension dimension-length"></div>
				<div class="dimension dimension-depth"></div>
				<div class="worktop">
					<div class="sink-cutout"></div>
					<div class="tap-hole"></div>
					<div class="hob-cutout"></div>
				</div>
				<div class="worktop-return"></div>
			</div>
		</div>
	</div>
</div>

<style>
	.countertop-cta {
		container-type: inline-size;
	}

	.cta-copy {
		padding: clamp(1.5rem, 6cqi, 3.75rem);
	}

	.cta-title {
		font-size: clamp(var(--text-3xl), 5.2cqi, var(--text-6xl));
		line-height: 1.02;
		overflow-wrap: anywhere;
	}

	.cta-arrow {
		position: relative;
		width: 1rem;
		height: 1px;
		background: currentColor;
	}

	.cta-arrow::after {
		position: absolute;
		inset: -3px 0 auto auto;
		width: 7px;
		aspect-ratio: 1;
		border-block-start: 1px solid;
		border-inline-end: 1px solid;
		transform: rotate(45deg);
		content: '';
	}

	.drawing {
		display: none;
	}

	@container (min-width: 40rem) {
		.cta-copy {
			width: 61%;
		}

		.drawing {
			position: absolute;
			inset: 0 0 0 61%;
			display: grid;
			place-items: center;
			padding: 1.75rem 2rem 1.75rem 0;
			color: color-mix(in srgb, var(--color-on-accent) 78%, transparent);
			pointer-events: none;
		}

		.worktop-plan {
			--return-start: 67%;
			position: relative;
			width: min(100%, 22rem);
			aspect-ratio: 1.6;
		}

		.worktop-plan::after {
			position: absolute;
			inset: 57% auto auto 0;
			width: var(--return-start);
			border-block-start: 1px solid;
			content: '';
		}

		.worktop,
		.worktop-return {
			position: absolute;
			border: 1px solid;
			background: color-mix(in srgb, currentColor 9%, transparent);
		}

		.worktop {
			inset: 19% 8% 43% 0;
			border-block-end: 0;
		}

		.worktop-return {
			inset: 57% 8% 8% var(--return-start);
			border-block-start: 1px dashed color-mix(in srgb, currentColor 50%, transparent);
		}

		.sink-cutout,
		.tap-hole,
		.hob-cutout {
			position: absolute;
			border: 1px solid;
			background: color-mix(in srgb, currentColor 17%, transparent);
		}

		.sink-cutout {
			inset: 28% 64% 15% 10%;
			border-radius: var(--ds-radius-md);
		}

		.tap-hole {
			inset: 10% auto auto 22%;
			width: clamp(4px, 0.65cqi, 6px);
			aspect-ratio: 1;
			border-radius: 50%;
		}

		.hob-cutout {
			inset: 23% 30% 18% 44%;
			border-radius: var(--ds-radius-xs);
		}

		.dimension {
			position: absolute;
			opacity: 0.6;
		}

		.dimension-length {
			inset: 5% 8% auto 0;
			height: 0.4rem;
			border-inline: 1px solid;
		}

		.dimension-depth {
			inset: 19% 0 8% auto;
			width: 0.4rem;
			border-block: 1px solid;
		}

		.dimension::after {
			position: absolute;
			content: '';
		}

		.dimension-length::after {
			inset: 50% 0 auto;
			border-block-start: 1px solid;
		}

		.dimension-depth::after {
			inset: 0 auto 0 50%;
			border-inline-start: 1px solid;
		}
	}
</style>
