<script lang="ts">
	// Артикул: 1.5.4.1 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { ct, revealOnScroll } from './theme';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../theme.css';
	import './theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const isLight = $derived(isLightBlock(data, 'light'));
	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ContactMessengers', updated);
		data = updated;
	}
</script>

<!--
	Светлая секция с тёмной карточкой-акцентом внутри — узел ритма страницы.
	Единственное отклонение от красного акцента — бренд-цвет Telegram, и он
	живёт только на самой кнопке-знаке.
-->
<section
	class="{ct.section.shell} {ct.section.pad} {ct.surface.base}"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class={ct.accent.toplineOnLight}></div>
	</div>

	<div class={ct.section.container}>
		<div
			use:revealOnScroll
			data-p1-theme="dark"
			class="ct-reveal ct-card-enter {ct.card
				.inkPanel} relative isolate overflow-hidden px-6 py-14 sm:px-10 sm:py-16 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-16 lg:py-20"
		>
			<div class="pointer-events-none absolute inset-0" aria-hidden="true">
				<div class="ct-grid"></div>
				<div class="ct-glow absolute -top-32 -left-24 size-80"></div>
				<div class="ct-glow absolute -right-20 -bottom-40 size-96"></div>
			</div>
			<span class={ct.accent.hairlineOnCard} aria-hidden="true"></span>

			<div class="relative z-10">
				<EditableField
					fieldKey="ContactMessengers.eyebrow"
					label="Надпись над заголовком"
					value={String(data?.eyebrow ?? 'Социальные сети')}
					{isEditable}
					onSave={(v) => saveField('eyebrow', v)}
					class="ct-item inline-block"
				>
					{#snippet children(displayValue)}
						<p class={ct.eyebrow.onInk}>
							<span class={ct.eyebrow.dashOnInk} aria-hidden="true"></span>
							<RichText value={displayValue} />
						</p>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="ContactMessengers.title"
					label="Заголовок"
					value={String(data?.title ?? 'Мы в Телеграм')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="ct-item ct-d1 mt-5 block"
				>
					{#snippet children(displayValue)}
						<h2 class="{ct.title.h2OnInk} max-w-xl"><RichText value={displayValue} /></h2>
					{/snippet}
				</EditableField>
			</div>

			<div class="relative z-10 mt-14 flex justify-center lg:mt-0 lg:justify-end lg:pr-16">
				<EditableField
					richText={false}
					fieldKey="ContactMessengers.telegramUrl"
					label="Ссылка на Telegram"
					value={String(data?.telegramUrl || 'https://t.me/')}
					{isEditable}
					onSave={(v) => saveField('telegramUrl', v)}
					class="ct-item ct-d2 block"
				>
					{#snippet children(displayValue)}
						<a
							href={displayValue || 'https://t.me/'}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Открыть Telegram в новой вкладке"
							class="telegram-button group relative flex size-32 items-center justify-center rounded-full text-on-dark ring-1 ring-telegram/50 transition duration-500 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-telegram motion-safe:hover:scale-105 sm:size-40"
						>
							<span
								class="pointer-events-none absolute -inset-6 rounded-full border border-telegram/35"
								aria-hidden="true"
							></span>
							<span
								class="pointer-events-none absolute -inset-12 animate-ping rounded-full border border-telegram/20 motion-reduce:animate-none"
								aria-hidden="true"
							></span>
							<span
								class="pointer-events-none absolute inset-3 rounded-full border border-on-dark/20"
								aria-hidden="true"
							></span>

							<svg
								class="telegram-button__icon size-20 drop-shadow-xl sm:size-24"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<circle cx="12" cy="12" r="12" />
								<path
									class="telegram-button__plane"
									d="M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
								/>
							</svg>
						</a>
					{/snippet}
				</EditableField>
			</div>
		</div>
	</div>
</section>

<style>
	/* Бренд-знак Telegram — единственный элемент страницы вне красного акцента. */
	.telegram-button {
		--telegram-button-bg: #229ed9;
		background-color: var(--telegram-button-bg);
		box-shadow: 0 24px 70px -16px rgb(34 158 217 / 75%);
	}

	.telegram-button:hover {
		--telegram-button-bg: #1d91c9;
		box-shadow: 0 28px 90px -14px rgb(34 158 217 / 90%);
	}

	.telegram-button__icon {
		overflow: visible;
	}

	.telegram-button__plane {
		fill: var(--telegram-button-bg);
		transform-box: fill-box;
		transform-origin: center;
	}

	@media (prefers-reduced-motion: no-preference) {
		.telegram-button:is(:hover, :focus-visible) .telegram-button__plane {
			animation: telegram-plane-flight 900ms both;
		}
	}

	@keyframes telegram-plane-flight {
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
