<script lang="ts">
	// Артикул: 1.5.5.2 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { ct } from '../../theme';
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
	const isLight = $derived(isLightBlock(data, 'dark'));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ContactCTA', updated);
		data = updated;
	}
</script>

{#snippet arrow(compact = false)}
	<svg
		class="contact-panel__arrow size-5 shrink-0 {compact ? 'max-[374px]:hidden' : ''}"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		aria-hidden="true"
	>
		<path d="M7 17 17 7M7 7h10v10" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
{/snippet}

<!-- v2: контактная панель; данные и семантические роли общие с остальными версиями. -->
<section
	class="contact-panel p1-surface py-16 sm:py-20 lg:py-24"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class={ct.section.containerMid}>
		<div class="p1-card rounded-3xl border p-6 sm:p-10 lg:p-12">
			<div class="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
				<div class="min-w-0">
					<EditableField
						fieldKey="ContactCTA.title"
						label="Заголовок"
						value={String(data?.title ?? 'Остались вопросы?')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<h2 class="{ct.title.h2OnInk} text-balance break-words">
								<RichText value={displayValue} />
							</h2>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="ContactCTA.subtitle"
						label="Подзаголовок"
						value={String(
							data?.subtitle ?? 'Свяжитесь с нами любым удобным способом — мы всегда рады помочь'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('subtitle', v)}
						class="mt-4 block"
					>
						{#snippet children(displayValue)}
							<p class="p1-body max-w-md text-base/7 break-words">
								<RichText value={displayValue} />
							</p>
						{/snippet}
					</EditableField>
				</div>

				<div class="min-w-0">
					<EditableField
						richText={false}
						fieldKey="ContactCTA.phone"
						label="Телефон"
						value={phone}
						isEditable={false}
						onSave={(v) => saveField('phone', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<a
									href={phoneHref}
									aria-label={`Позвонить по номеру ${displayValue}`}
									class="contact-panel__action contact-panel__call flex min-h-28 items-center justify-between gap-4 rounded-2xl bg-brand-600 p-5 text-on-accent sm:p-6"
								>
									<span class="min-w-0">
										<span class="block text-sm">Позвонить</span>
										<span
											class="ds-title-sub mt-2 block text-lg break-words min-[375px]:text-xl sm:text-2xl"
										>
											{displayValue}
										</span>
									</span>
									{@render arrow(true)}
								</a>
							{/if}
						{/snippet}
					</EditableField>

					<EditableField
						richText={false}
						fieldKey="ContactCTA.telegramUrl"
						label="Ссылка на Telegram"
						value={String(data?.telegramUrl ?? '')}
						{isEditable}
						onSave={(v) => saveField('telegramUrl', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<a
									href={displayValue}
									target="_blank"
									rel="noopener noreferrer"
									class="contact-panel__action contact-panel__message p1-title p1-line mt-3 flex min-h-16 items-center justify-between gap-4 rounded-2xl border px-5 py-4 sm:px-6"
								>
									<span class="flex min-w-0 items-center gap-3">
										<svg
											class="size-5 shrink-0"
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path
												d="m21 3-6 18-4-8-8-4L21 3ZM11 13l5-5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
										<span class="break-words">Написать в Telegram</span>
										<span class="sr-only">(откроется в новой вкладке)</span>
									</span>
									{@render arrow()}
								</a>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.contact-panel__action {
		text-decoration: none;
		transition: background-color var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}

	.contact-panel__action:focus-visible {
		outline: 2px solid var(--p1-title);
		outline-offset: 4px;
	}

	.contact-panel__call:hover {
		background-color: var(--color-brand-700);
	}

	.contact-panel__message:hover {
		background-color: var(--p1-card-hover);
	}

	.contact-panel__arrow {
		transition: transform var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}

	.contact-panel__action:is(:hover, :focus-visible) .contact-panel__arrow {
		transform: translate(0.125rem, -0.125rem);
	}

	@media (prefers-reduced-motion: reduce) {
		.contact-panel__action,
		.contact-panel__arrow {
			transition: none;
		}

		.contact-panel__action:is(:hover, :focus-visible) .contact-panel__arrow {
			transform: none;
		}
	}
</style>
