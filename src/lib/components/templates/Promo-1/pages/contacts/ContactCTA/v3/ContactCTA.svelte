<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 1.5.5.3 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { resolveSitePhone, sitePhoneHref } from '$lib/utils/site-phone';
	import { ct } from '../../theme';
	import '../../../../theme.css';

	/*
	 * THESIS: открытая контактная полоса с адресными действиями.
	 * OWN-WORLD: семантические поверхности, шрифты и акцент текущей системы.
	 * STORY: прочитать приглашение, выбрать звонок или сообщение.
	 * FIRST VIEWPORT: заголовок слева, телефон, почта и Telegram справа;
	 * на телефоне — единая колонка, без потери номера или зоны нажатия.
	 * FORM: на hover/focus трубка вибрирует, конверт раскрывается, самолётик улетает;
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

{#snippet contactButton(channel: 'phone' | 'email' | 'telegram')}
	<span
		class="contact-button relative flex size-14 shrink-0 items-center justify-center rounded-full sm:size-18"
		class:contact-button--telegram={channel === 'telegram'}
		aria-hidden="true"
	>
		<span class="contact-button__ring pointer-events-none absolute -inset-1.5 rounded-full border"
		></span>
		<span
			class="contact-button__ring contact-button__ring--outer pointer-events-none absolute -inset-3 rounded-full border"
		></span>
		<span class="contact-button__inset pointer-events-none absolute inset-1.5 rounded-full border"
		></span>
		<svg class="contact-button__icon size-9 sm:size-11" fill="currentColor" viewBox="0 0 24 24">
			<circle cx="12" cy="12" r="12" />
			{#if channel === 'telegram'}
				<path
					class="contact-button__glyph contact-button__glyph--plane"
					d="M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
				/>
			{:else}
				<g class="contact-button__glyph" class:contact-button__glyph--phone={channel === 'phone'}>
					<g
						transform="translate(6 6) scale(0.5)"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						{#if channel === 'phone'}
							<path
								d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
							/>
						{:else}
							<rect x="2.25" y="6.75" width="19.5" height="12.75" rx="2.25" />
							<path
								class="contact-button__flap"
								fill="var(--color-on-accent)"
								d="M2.25 6.75 12 13.5l9.75-6.75Z"
							/>
							<g class="contact-button__letter">
								<rect x="6" y="8" width="12" height="10" rx="1" fill="var(--color-on-accent)" />
								<path d="M9 11h6m-6 3h4" />
							</g>
							<path
								fill="var(--color-on-accent)"
								d="M2.25 6.75 12 13.5l9.75-6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25Z"
							/>
						{/if}
					</g>
				</g>
			{/if}
		</svg>
	</span>
{/snippet}

<section
	class="contact-desk p1-surface {ct.section.pad}"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class={ct.section.container}>
		<div class="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
			<div class="min-w-0 lg:col-span-5">
				<EditableField
					fieldKey="ContactCTA.title"
					label="Заголовок"
					value={editableText(data?.title, 'Остались вопросы?')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="p1-title text-4xl text-balance break-words sm:text-5xl">
							<RichText value={displayValue} />
						</h2>
					{/snippet}
				</EditableField>
				<EditableField
					fieldKey="ContactCTA.subtitle"
					label="Подзаголовок"
					value={editableText(
						data?.subtitle,
						'Свяжитесь с нами любым удобным способом — мы всегда рады помочь'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('subtitle', v)}
					class="mt-5 block"
				>
					{#snippet children(displayValue)}
						<p class="p1-muted max-w-md text-base/7 break-words">
							<RichText value={displayValue} />
						</p>
					{/snippet}
				</EditableField>
			</div>

			<div class="min-w-0 lg:col-span-7">
				<a
					href={phoneHref}
					aria-label={`Позвонить по номеру ${phone}`}
					class="contact-desk__action p1-line flex min-h-28 items-center gap-6 border-y px-3 py-6 sm:min-h-36 sm:py-8"
				>
					{@render contactButton('phone')}
					<span class="p1-title block min-w-0 text-lg break-words sm:text-xl">{phone}</span>
				</a>

				<EditableField
					richText={false}
					fieldKey="ContactCTA.email"
					label="Email"
					value={editableText(data?.email, 'info@leget.ru')}
					{isEditable}
					onSave={(v) => saveField('email', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						{#if displayValue}
							<a
								href="mailto:{displayValue}"
								class="contact-desk__action p1-line p1-title flex min-h-28 items-center gap-6 border-b px-3 py-6 sm:min-h-36 sm:py-8"
							>
								{@render contactButton('email')}
								<span class="p1-title block min-w-0 text-lg break-words sm:text-xl"
									>{displayValue}</span
								>
							</a>
						{/if}
					{/snippet}
				</EditableField>

				<EditableField
					richText={false}
					fieldKey="ContactCTA.telegramUrl"
					label="Ссылка на Telegram"
					value={editableText(data?.telegramUrl, 'https://t.me/')}
					{isEditable}
					onSave={(v) => saveField('telegramUrl', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<a
							href={displayValue || 'https://t.me/'}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Написать в Telegram — откроется в новой вкладке"
							class="contact-desk__action p1-line p1-title flex min-h-28 items-center gap-6 border-b px-3 py-6 sm:min-h-36 sm:py-8"
						>
							{@render contactButton('telegram')}
							<span class="p1-title block min-w-0 text-lg break-words sm:text-xl"
								>Написать в Telegram</span
							>
						</a>
					{/snippet}
				</EditableField>
			</div>
		</div>
	</div>
</section>

<style>
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
	.contact-button {
		--contact-button-color: var(--p1-accent);
		--contact-button-bg: var(--contact-button-color);
		color: var(--color-on-accent);
		background-color: var(--contact-button-bg);
		box-shadow: 0 12px 35px -8px color-mix(in oklab, var(--contact-button-color) 75%, transparent);
		transition:
			background-color var(--ds-motion-duration-ui) var(--ds-motion-ease-ui),
			transform var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}
	.contact-button--telegram {
		--contact-button-color: var(--color-telegram);
		color: var(--color-on-dark);
	}
	.contact-desk__action:is(:hover, :focus-visible) .contact-button {
		--contact-button-bg: color-mix(in oklab, var(--contact-button-color) 90%, var(--color-ink-950));
	}
	.contact-button__ring {
		border-color: color-mix(in oklab, var(--contact-button-color) 35%, transparent);
	}
	.contact-button__ring--outer {
		border-color: color-mix(in oklab, var(--contact-button-color) 20%, transparent);
	}
	.contact-button__inset {
		border-color: color-mix(in oklab, currentColor 20%, transparent);
	}
	.contact-button__icon {
		overflow: visible;
	}
	.contact-button__glyph {
		color: var(--contact-button-bg);
		fill: var(--contact-button-bg);
		transform-box: fill-box;
		transform-origin: center;
	}
	.contact-button__flap {
		transform-box: fill-box;
		transform-origin: center top;
	}
	.contact-button__letter {
		opacity: 0;
	}
	@media (prefers-reduced-motion: no-preference) {
		.contact-button__flap {
			transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
		}
		.contact-button__letter {
			transition:
				transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
				opacity 200ms ease-out;
		}
		.contact-desk__action:is(:hover, :focus-visible) .contact-button {
			transform: scale(1.05);
		}
		.contact-desk__action:is(:hover, :focus-visible) .contact-button__glyph--phone {
			animation: contact-phone-vibrate 700ms ease-in-out both;
		}
		.contact-desk__action:is(:hover, :focus-visible) .contact-button__flap {
			transform: scaleY(-1);
		}
		.contact-desk__action:is(:hover, :focus-visible) .contact-button__letter {
			transform: translateY(-5px);
			opacity: 1;
		}
		.contact-desk__action:is(:hover, :focus-visible) .contact-button__glyph--plane {
			animation: contact-icon-flight 900ms both;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.contact-button {
			transition-property: background-color;
		}
	}
	@keyframes contact-phone-vibrate {
		0%,
		100% {
			transform: translateX(0) rotate(0deg);
		}
		10%,
		30%,
		50%,
		70% {
			transform: translateX(-0.75px) rotate(-12deg);
		}
		20%,
		40%,
		60%,
		80% {
			transform: translateX(0.75px) rotate(12deg);
		}
		90% {
			transform: translateX(-0.25px) rotate(-4deg);
		}
	}
	@keyframes contact-icon-flight {
		0% {
			transform: translate(0, 0);
			opacity: 1;
		}
		12% {
			transform: translate(-1px, 1px) rotate(-8deg);
			opacity: 1;
			animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
		}
		55% {
			transform: translate(48px, -48px) rotate(8deg);
			opacity: 0;
		}
		56% {
			transform: translate(-4px, 4px);
			opacity: 0;
			animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
		}
		100% {
			transform: translate(0, 0);
			opacity: 1;
		}
	}
</style>
