<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	import RichText from '$lib/components/RichText.svelte';
	// Артикулы: 1.16.6.1, 1.17.5.1, 1.18.5.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { sitePhoneHref } from '$lib/utils/site-phone';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		sitePhone = null,
		featured = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
		sitePhone?: string | null;
		featured?: boolean;
	} = $props();

	// Read-only мост из header_data.phone: локальную копию номера CTA не хранит.
	const phoneHref = $derived(sitePhoneHref(sitePhone));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelCTA', updated);
		data = updated;
	}
</script>

<div class="p1-catalog-container my-12">
	<div
		class="relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-accent-panel to-accent-panel-deep text-on-accent shadow-xl ring-1 ring-on-accent/10 ring-inset"
		class:featured
		class:text-center={!featured}
	>
		<div class={featured ? 'featured-copy' : 'px-6 py-10 sm:px-12 sm:py-14'}>
			<h2
				class={featured
					? 'featured-title text-balance'
					: 'mx-auto max-w-2xl text-section-title text-balance'}
			>
				<EditableField
					fieldKey="MebelCTA.title"
					label="Заголовок"
					value={editableText(data.title, 'Готовы начать проект?')}
					{isEditable}
					inline
					onSave={(v) => saveField('title', v)}
				>
					{#snippet children(val)}
						<RichText value={val} />
					{/snippet}
				</EditableField>
			</h2>

			<p
				class={featured
					? 'mt-4 max-w-[65ch] text-prose text-pretty text-on-accent-muted'
					: 'mx-auto mt-4 max-w-xl text-prose text-pretty text-on-accent-muted'}
			>
				<EditableField
					fieldKey="MebelCTA.description"
					label="Описание"
					value={editableText(
						data.description,
						'Оставьте заявку и получите бесплатный дизайн-проект вашей будущей мебели'
					)}
					{isEditable}
					inline
					multiline
					onSave={(v) => saveField('description', v)}
				>
					{#snippet children(val)}
						<RichText value={val} />
					{/snippet}
				</EditableField>
			</p>

			<div
				class={featured
					? 'mt-7 flex flex-col gap-3 sm:flex-row'
					: 'mx-auto mt-8 flex max-w-xl flex-col justify-center gap-3 sm:flex-row'}
			>
				<button
					data-metrika-goal="pages_mebel_mebelcta_open_1"
					data-goal-label="Получить консультацию — CTA мебели"
					data-goal-action="open"
					type="button"
					onclick={() => serviceOrderStore.open('consultation')}
					class="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-raised px-7 py-3 font-medium text-accent-ink shadow-sm transition-[transform,background-color,box-shadow] ease-ui hover:-translate-y-0.5 hover:bg-accent-ink-wash hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-accent active:translate-y-0 motion-reduce:translate-none motion-reduce:transition-none sm:w-auto"
				>
					<EditableField
						fieldKey="MebelCTA.buttonText"
						label="Текст кнопки"
						value={editableText(data.buttonText, 'Получить консультацию')}
						{isEditable}
						inline
						onSave={(v) => saveField('buttonText', v)}
					>
						{#snippet children(val)}
							<RichText value={val} />
						{/snippet}
					</EditableField>
					{#if featured}
						<span
							class="cta-arrow shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
							aria-hidden="true"
						></span>
					{/if}
				</button>

				<a
					href={phoneHref}
					class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-on-accent/20 bg-on-accent/10 px-7 py-3 font-medium text-on-accent transition-[transform,background-color,border-color] ease-ui hover:-translate-y-0.5 hover:border-on-accent/30 hover:bg-on-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-accent active:translate-y-0 sm:hidden"
				>
					<svg
						class="h-[18px] w-[18px]"
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

		{#if featured}
			<div class="drawing" aria-hidden="true">
				<div class="kitchen-elevation">
					<div class="wall-cabinets">
						<div class="cabinet double-doors"></div>
						<div class="cabinet hood"></div>
						<div class="cabinet single-door"></div>
					</div>
					<div class="counter">
						<div class="faucet"></div>
						<div class="hob"></div>
					</div>
					<div class="base-cabinets">
						<div class="cabinet double-doors"></div>
						<div class="cabinet oven"></div>
						<div class="cabinet drawers"></div>
					</div>
					<div class="cabinet pantry"></div>
					<div class="plinth"></div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.featured {
		container-type: inline-size;
	}

	.featured-copy {
		padding: clamp(1.5rem, 6cqi, 3.75rem);
	}

	.featured-title {
		font-size: var(--ds-font-section-title-size);
		overflow-wrap: anywhere;
	}

	.cta-arrow {
		position: relative;
		display: block;
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
		.featured-copy {
			width: 61%;
		}

		.drawing {
			position: absolute;
			inset: 0 0 0 61%;
			display: grid;
			place-items: center;
			padding: 1.75rem 2rem 2.5rem 0;
			color: color-mix(in srgb, var(--color-on-accent) 78%, transparent);
			pointer-events: none;
		}

		.kitchen-elevation {
			position: relative;
			display: grid;
			grid-template-columns: 3fr 1fr;
			grid-template-rows: 35% 22% 38% 5%;
			width: min(100%, 22rem);
			aspect-ratio: 1.62;
		}

		.wall-cabinets,
		.counter,
		.base-cabinets {
			display: grid;
			grid-column: 1;
			grid-template-columns: 1.2fr 1fr 0.8fr;
		}

		.cabinet {
			position: relative;
			border: 1px solid currentColor;
			border-inline-end: 0;
			background: color-mix(in srgb, currentColor 8%, transparent);
		}

		.cabinet::before,
		.cabinet::after,
		.kitchen-elevation::before,
		.kitchen-elevation::after {
			position: absolute;
			content: '';
		}

		.double-doors::before {
			inset: 0 auto 0 50%;
			border-inline-start: 1px solid;
		}

		.double-doors::after {
			inset: 61% 43% 18%;
			border-inline: 1px solid;
		}

		.base-cabinets .double-doors::after {
			inset-block: 18% 61%;
		}

		.single-door::after {
			inset: 61% auto 18% 18%;
			border-inline-start: 1px solid;
		}

		.hood::before {
			inset: auto 0 0;
			height: 21%;
			border-block-start: 1px solid;
			background: color-mix(in srgb, currentColor 12%, transparent);
		}

		.counter {
			align-items: end;
		}

		.faucet {
			justify-self: center;
			width: 19%;
			height: 60%;
			border: 1px solid;
			border-inline-end: 0;
			border-block-end: 0;
			border-radius: 50% 50% 0 0 / 35% 35% 0 0;
		}

		.hob {
			justify-self: center;
			width: 74%;
			height: 3px;
			border: 1px solid;
			border-block-end: 0;
		}

		.base-cabinets {
			border-block-start: 3px double;
		}

		.base-cabinets .cabinet {
			border-block-start: 0;
		}

		.oven::before {
			inset: 18% 23% auto;
			border-block-start: 1px solid;
		}

		.oven::after {
			inset: 33% 13% 14%;
			border: 1px solid;
			background: color-mix(in srgb, currentColor 13%, transparent);
		}

		.drawers::before {
			inset: 31% 0 31%;
			border-block: 1px solid;
		}

		.pantry {
			grid-area: 1 / 2 / 4;
			border-inline-end: 1px solid;
		}

		.pantry::before {
			inset: 57% 0 auto;
			border-block-start: 1px solid;
		}

		.pantry::after {
			inset: 36% auto 49% 18%;
			border-inline-start: 1px solid;
		}

		.plinth {
			grid-column: 1 / -1;
			margin-inline: 2%;
			border: 1px solid;
			border-block-start: 0;
		}

		.kitchen-elevation::before {
			inset: auto 0 -0.8rem;
			height: 0.4rem;
			border-inline: 1px solid;
			opacity: 0.58;
		}

		.kitchen-elevation::after {
			inset: auto 0 -0.6rem;
			border-block-start: 1px solid;
			opacity: 0.58;
		}
	}
</style>
