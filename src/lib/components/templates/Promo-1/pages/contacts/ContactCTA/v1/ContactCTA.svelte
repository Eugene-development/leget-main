<script lang="ts">
	// Артикул: 1.5.5.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { ct, revealOnScroll } from '../../theme';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { resolveSitePhone, sitePhoneHref } from '$lib/utils/site-phone';
	import '../../../../theme.css';
	import '../../theme.css';

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

	// Ink-блок: дефолт тёмный, тумблер живёт в панели VersionSwitcher.
	const isLight = $derived(isLightBlock(data, 'dark'));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ContactCTA', updated);
		data = updated;
	}
</script>

<!--
	Вариант 1 — архитектурная линия. Заголовок начинает маршрут, направляющая
	собирает взгляд и приводит его к единственному главному действию — звонку.
	Telegram остаётся запасным каналом и не спорит с номером за иерархию.

	Анимация принадлежит самому устройству блока: линия прорисовывается к
	контактной точке, после чего номер открывается маской. Это один короткий
	сценарий, а не набор независимых появлений. Цвет, типографика, пластика и
	скорость по-прежнему приходят из дизайн-системы.
-->
<section
	class="{ct.section.shell} {ct.surface.ink} py-18 sm:py-22 lg:py-26"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		{#if isLight}
			<div class="ct-rules"></div>
		{:else}
			<div class="ct-grid ct-grid--fade-bottom"></div>
		{/if}
		<div class="ct-glow absolute -right-36 -bottom-48 size-112"></div>
		<div class={isLight ? ct.accent.toplineOnLight : ct.accent.toplineOnInk}></div>
		<div class="p1-line absolute inset-x-0 bottom-0 border-t"></div>
	</div>

	<div use:revealOnScroll class={ct.section.container}>
		<div class="grid gap-y-8 md:grid-cols-12 md:gap-x-8 lg:gap-x-12">
			<EditableField
				fieldKey="ContactCTA.title"
				label="Заголовок"
				value={String(data?.title ?? 'Остались вопросы?')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block md:col-span-8 lg:col-span-7"
			>
				{#snippet children(displayValue)}
					<h2 class="{ct.title.h2OnInk} mx-auto max-w-3xl text-center md:mx-0 md:text-left">
						{displayValue}
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
				class="block md:col-span-4 md:self-end lg:col-span-4 lg:col-start-9"
			>
				{#snippet children(displayValue)}
					<p
						class="{ct.body
							.onInkMuted} mx-auto max-w-sm text-center md:mr-0 md:ml-auto md:text-left"
					>
						{displayValue}
					</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="contact-route mt-12 sm:mt-16 lg:mt-20">
			<div class="contact-route__track p1-line" aria-hidden="true">
				<span class="contact-route__origin p1-surface"></span>
				<span class="contact-route__progress"></span>
				<span class="contact-route__destination p1-accent-bg"></span>
			</div>

			<div
				class="grid gap-y-8 pt-10 sm:pt-12 md:grid-cols-12 md:items-end md:gap-x-8 lg:gap-x-12 lg:pt-14"
			>
				<EditableField
					fieldKey="ContactCTA.phone"
					label="Телефон"
					value={phone}
					isEditable={false}
					onSave={(v) => saveField('phone', v)}
					class="contact-route__phone-wrap block justify-self-center md:col-span-7 md:col-start-3 md:justify-self-stretch"
				>
					{#snippet children(displayValue)}
						{#if displayValue}
							<a
								href={phoneHref}
								class="contact-route__phone ds-title-display p1-title mx-auto block text-center text-action-display whitespace-nowrap md:mx-0 md:text-left"
								aria-label={`Позвонить по номеру ${displayValue}`}
							>
								{displayValue}
							</a>
						{/if}
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="ContactCTA.telegramUrl"
					label="Ссылка на Telegram"
					value={String(data?.telegramUrl ?? '')}
					{isEditable}
					onSave={(v) => saveField('telegramUrl', v)}
					class="block justify-self-center md:col-span-3 md:col-start-10 md:justify-self-end"
				>
					{#snippet children(displayValue)}
						{#if displayValue}
							<a
								href={displayValue}
								target="_blank"
								rel="noopener noreferrer"
								class={isLight ? ct.btn.ghostOnLight : ct.btn.ghostOnInk}
								aria-label="Написать в Telegram"
							>
								<svg
									class="size-4.5 text-telegram"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
									/>
								</svg>
								Написать в Telegram
								<span class={ct.arrow} aria-hidden="true">&rarr;</span>
							</a>
						{/if}
					{/snippet}
				</EditableField>
			</div>
		</div>
	</div>
</section>

<style>
	.contact-route {
		position: relative;
	}

	.contact-route__track {
		position: relative;
		height: 1px;
		border-top-width: 1px;
	}

	.contact-route__origin,
	.contact-route__destination {
		position: absolute;
		top: 50%;
		width: 0.625rem;
		height: 0.625rem;
		border: 1px solid var(--p1-accent);
		border-radius: var(--ds-radius-full);
		transform: translateY(-50%);
	}

	.contact-route__origin {
		left: 0;
	}

	.contact-route__destination {
		right: 0;
		box-shadow: 0 0 0 0.375rem color-mix(in srgb, var(--p1-accent) 12%, transparent);
	}

	.contact-route__progress {
		position: absolute;
		inset: -1px 0 auto;
		height: 2px;
		transform: scaleX(1);
		transform-origin: left center;
	}

	.contact-route__progress::before,
	.contact-route__progress::after {
		position: absolute;
		inset-inline: 0;
		background-color: var(--p1-accent);
		content: '';
	}

	.contact-route__progress::before {
		top: 50%;
		height: 1px;
		transform: translateY(-50%);
	}

	.contact-route__progress::after {
		inset-block: 0;
		-webkit-mask-image: linear-gradient(
			to right,
			transparent 0%,
			black 24%,
			black 76%,
			transparent 100%
		);
		mask-image: linear-gradient(to right, transparent 0%, black 24%, black 76%, transparent 100%);
	}

	.contact-route__phone-wrap {
		overflow: hidden;
	}

	.contact-route__phone {
		width: fit-content;
		font-variant-numeric: lining-nums;
		text-decoration-line: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 0.04em;
		text-underline-offset: 0.14em;
		transition:
			color var(--ds-motion-duration-ui) var(--ds-motion-ease-ui),
			text-decoration-color var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}

	.contact-route__phone:hover,
	.contact-route__phone:focus-visible {
		color: var(--p1-accent);
		text-decoration-color: var(--p1-accent);
	}

	.contact-route__phone:focus-visible {
		outline: 2px solid var(--color-link-600);
		outline-offset: 4px;
	}

	:global(.ct-reveal-visible) .contact-route__progress {
		animation: contact-route-draw var(--ds-motion-duration-ui-slow) var(--ds-motion-ease-ui) 120ms
			both;
	}

	:global(.ct-reveal-visible) .contact-route__destination {
		animation: contact-route-arrive var(--ds-motion-duration-ui-slow) var(--ds-motion-ease-ui)
			calc(var(--ds-motion-duration-ui-slow) * 0.72) both;
	}

	:global(.ct-reveal-visible) .contact-route__phone-wrap {
		animation: contact-route-open var(--ds-motion-duration-ui-slow) var(--ds-motion-ease-ui)
			calc(var(--ds-motion-duration-ui-slow) * 0.52) both;
	}

	@keyframes contact-route-draw {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}

	@keyframes contact-route-arrive {
		from {
			opacity: 0;
			transform: translateY(-50%) scale(0.45);
		}
		to {
			opacity: 1;
			transform: translateY(-50%) scale(1);
		}
	}

	@keyframes contact-route-open {
		from {
			opacity: 0;
			clip-path: inset(0 100% 0 0);
		}
		to {
			opacity: 1;
			clip-path: inset(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.contact-route__phone {
			transition: none;
		}

		.contact-route__progress,
		.contact-route__destination,
		.contact-route__phone-wrap,
		:global(.ct-reveal-visible) .contact-route__progress,
		:global(.ct-reveal-visible) .contact-route__destination,
		:global(.ct-reveal-visible) .contact-route__phone-wrap {
			animation: none;
			opacity: 1;
			clip-path: none;
			transform: none;
		}

		.contact-route__destination {
			transform: translateY(-50%);
		}
	}
</style>
