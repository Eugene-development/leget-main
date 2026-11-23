<script lang="ts">
	// Артикул: 1.4.5.1 — см. docs/architecture/component-articles-map.md
	import { editableText } from '$lib/utils/editable-text';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { resolveSitePhone, sitePhoneHref } from '$lib/utils/site-phone';
	import '../../../../theme.css';

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
	const phone = $derived(resolveSitePhone(sitePhone));
	const phoneHref = $derived(sitePhoneHref(sitePhone));

	const isLight = $derived(isLightBlock(data, 'light'));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ActionsCTA', updated);
		data = updated;
	}
</script>

<section class="p1-surface" data-p1-theme={isLight ? 'light' : 'dark'}>
	<div class="mx-auto max-w-7xl px-6 pt-section-sm pb-6 sm:pt-section sm:pb-8 lg:px-8">
		<EditableField
			fieldKey="ActionsCTA.title"
			label="Заголовок"
			value={editableText(data?.title, 'Хотите узнать больше об акциях?')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block max-w-3xl"
		>
			{#snippet children(displayValue)}
				<h2
					class="p1-title ds-title-display text-section-title text-balance wrap-anywhere"
				>
					<RichText value={displayValue} />
				</h2>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="ActionsCTA.subtitle"
			label="Подзаголовок"
			value={editableText(
				data?.subtitle,
				'Свяжитесь с нами и мы расскажем обо всех актуальных предложениях'
			)}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="mt-4 block max-w-lg sm:mt-5"
		>
			{#snippet children(displayValue)}
				<p class="p1-body text-prose text-pretty wrap-anywhere">
					<RichText value={displayValue} />
				</p>
			{/snippet}
		</EditableField>

		<div class="contact-strip mt-8 sm:mt-12">
			<EditableField
				fieldKey="ActionsCTA.buttonText"
				label="Текст кнопки"
				value={editableText(data?.buttonText, 'Связаться с нами')}
				{isEditable}
				onSave={(v) => saveField('buttonText', v)}
				class="block min-w-0"
			>
				{#snippet children(displayValue)}
					<a
						href="/contact"
						class="contact-link contact-link--primary text-lg font-semibold sm:text-xl"
					>
						<span class="min-w-0 wrap-anywhere"><RichText value={displayValue} /></span>
						<svg
							class="size-5 shrink-0 sm:size-6"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							aria-hidden="true"
						>
							<path d="M4 12h15m-6-6 6 6-6 6" />
						</svg>
					</a>
				{/snippet}
			</EditableField>

			{#if phoneHref}
				<EditableField
					richText={false}
					fieldKey="ActionsCTA.phone"
					label="Телефон"
					value={phone}
					isEditable={false}
					onSave={(v) => saveField('phone', v)}
					class="block min-w-0"
				>
					{#snippet children(displayValue)}
						<a href={phoneHref} class="contact-link p1-title">
							<span class="p1-body text-sm">Позвонить</span>
							<span class="min-w-0 text-end text-base font-semibold wrap-anywhere sm:text-lg">
								{displayValue}
							</span>
						</a>
					{/snippet}
				</EditableField>
			{/if}
		</div>
	</div>
</section>

<style>
	.contact-strip {
		display: flex;
		flex-wrap: wrap;
		column-gap: clamp(2rem, 7vw, 7rem);
	}

	.contact-strip > :global(*) {
		flex: 1 1 20rem;
	}

	.contact-link {
		box-sizing: border-box;
		display: flex;
		min-height: 4rem;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		border-block-start: 1px solid var(--p1-border);
		padding-block: 0.875rem;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.25em;
	}

	.contact-link:hover {
		text-decoration-line: underline;
	}

	.contact-link:focus-visible {
		outline: 2px solid var(--p1-title);
		outline-offset: 4px;
	}

	.contact-link--primary {
		color: var(--p1-title);
	}
</style>
