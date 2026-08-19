<script lang="ts">
	// Артикул: 1.5.4.1 — см. docs/architecture/component-articles-map.md
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
							{displayValue}
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
						<h2 class="{ct.title.h2OnInk} max-w-xl">{displayValue}</h2>
					{/snippet}
				</EditableField>

				<div class="ct-rule ct-d2 mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
					<span class={ct.accent.diamond}></span>
					<span class={ct.accent.ruleOnInk}></span>
				</div>

				<p class="ct-item ct-d3 mt-6 flex items-center gap-3 {ct.body.onInkMuted}">
					<span class="relative flex size-2.5" aria-hidden="true">
						<span
							class="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-50 motion-reduce:animate-none"
						></span>
						<span class="relative inline-flex size-2.5 rounded-full bg-brand-600"></span>
					</span>
					Обычно отвечаем в течение нескольких минут
				</p>
			</div>

			<div class="relative z-10 mt-14 flex justify-center lg:mt-0 lg:justify-end lg:pr-16">
				<EditableField
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
							class="telegram-button group relative flex size-40 items-center justify-center rounded-full text-on-dark ring-1 ring-telegram/50 transition duration-500 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-telegram motion-safe:hover:scale-105 sm:size-48"
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
								class="size-20 drop-shadow-xl transition duration-500 group-hover:scale-110 sm:size-24"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
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
		background-color: #229ed9;
		box-shadow: 0 24px 70px -16px rgb(34 158 217 / 75%);
	}

	.telegram-button:hover {
		background-color: #1d91c9;
		box-shadow: 0 28px 90px -14px rgb(34 158 217 / 90%);
	}
</style>
