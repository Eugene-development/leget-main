<script lang="ts">
	// Артикул: 1.5.5.3 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { resolveSitePhone, sitePhoneHref } from '$lib/utils/site-phone';
	import { ct } from '../../theme';
	import '../../../../theme.css';

	/*
	 * THESIS: открытая контактная полоса с двумя адресными действиями.
	 * OWN-WORLD: семантические поверхности, шрифты и акцент текущей системы.
	 * STORY: прочитать приглашение, выбрать звонок или сообщение.
	 * FIRST VIEWPORT: заголовок слева, крупная строка звонка и Telegram справа;
	 * на телефоне — единая колонка, без потери номера или зоны нажатия.
	 * FORM: разделённые линиями действия; стрелка откликается на hover/focus,
	 * содержимое видно сразу, reduced-motion отключает движение.
	 */
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

	const isLight = $derived(isLightBlock(data, 'dark'));
	const phone = $derived(resolveSitePhone(sitePhone));
	const phoneHref = $derived(sitePhoneHref(sitePhone));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ContactCTA', updated);
		data = updated;
	}
</script>

{#snippet arrow()}
	<svg
		class="contact-desk__arrow size-6 shrink-0"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		aria-hidden="true"
	>
		<path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
{/snippet}

<section
	class="contact-desk p1-surface {ct.section.pad}"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class={ct.section.container}>
		<div class="grid gap-12 lg:grid-cols-12 lg:gap-16">
			<div class="min-w-0 lg:col-span-5">
				<EditableField
					fieldKey="ContactCTA.title"
					label="Заголовок"
					value={String(data?.title ?? 'Остались вопросы?')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="p1-title text-4xl text-balance break-words sm:text-5xl">{displayValue}</h2>
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
					class="mt-6 block"
				>
					{#snippet children(displayValue)}
						<p class="p1-muted max-w-md text-base/7 break-words">{displayValue}</p>
					{/snippet}
				</EditableField>
			</div>

			<div class="min-w-0 lg:col-span-7">
				<a
					href={phoneHref}
					aria-label={`Позвонить по номеру ${phone}`}
					class="contact-desk__action p1-line flex items-center justify-between gap-4 border-y py-8 sm:gap-8 sm:py-10"
				>
					<span class="min-w-0">
						<span class="p1-muted block text-sm">Позвонить</span>
						<span
							class="p1-title p1-title-sub mt-3 block text-2xl break-words sm:text-3xl xl:text-4xl"
							>{phone}</span
						>
					</span>
					<span
						class="contact-desk__call p1-accent-bg flex size-14 shrink-0 items-center justify-center rounded-full sm:size-18"
						>{@render arrow()}</span
					>
				</a>

				<EditableField
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
								class="contact-desk__action p1-line p1-title flex items-center justify-between gap-6 border-b py-7 sm:py-8"
							>
								<span class="text-lg break-words sm:text-xl">Написать в Telegram</span>
								<span class="flex size-14 shrink-0 items-center justify-center sm:size-18"
									>{@render arrow()}</span
								>
							</a>
						{:else if isEditable}
							<p class="p1-muted p1-line border-b py-7 text-sm">Добавить ссылку на Telegram</p>
						{/if}
					{/snippet}
				</EditableField>
			</div>
		</div>
	</div>
</section>

<style>
	.contact-desk__call {
		color: var(--color-on-accent);
	}
	.contact-desk__action {
		text-decoration: none;
	}
	.contact-desk__action:focus-visible {
		outline: 2px solid var(--color-link-600);
		outline-offset: 4px;
	}
	.contact-desk__action:hover .p1-title,
	.contact-desk__action:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	.contact-desk__arrow {
		transition: transform var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}
	.contact-desk__action:is(:hover, :focus-visible) .contact-desk__arrow {
		transform: translateX(0.25rem);
	}
	@media (prefers-reduced-motion: reduce) {
		.contact-desk__arrow {
			transition: none;
		}
		.contact-desk__action:is(:hover, :focus-visible) .contact-desk__arrow {
			transform: none;
		}
	}
</style>
