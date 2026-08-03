<script lang="ts">
	// Артикул: 1.5.5.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { ct, revealOnScroll } from '../../theme';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../../../theme.css';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

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
	Вариант 1 — центральная колонка: заголовок и кнопки выстроены по оси секции.
	Поверхность, палитра, кнопки и анимации общие для страницы (../../theme.ts).
-->
<section
	class="{ct.section.shell} {ct.section.pad} {ct.surface.ink}"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="ct-grid ct-grid--fade-center"></div>
		<div class="ct-glow absolute -top-24 left-1/2 size-112 -translate-x-1/2"></div>
		<div class={ct.accent.toplineOnInk}></div>
		<div
			class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"
		></div>
	</div>

	<div use:revealOnScroll class="ct-reveal {ct.section.containerNarrow} text-center">
		<p class="ct-item {ct.eyebrow.onInk}">
			<span class={ct.eyebrow.dashOnInk} aria-hidden="true"></span>
			Мы на связи
			<span class={ct.eyebrow.dashOnInk} aria-hidden="true"></span>
		</p>

		<EditableField
			fieldKey="ContactCTA.title"
			label="Заголовок"
			value={String(data?.title ?? 'Остались вопросы?')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="ct-item ct-d1 mt-5 block"
		>
			{#snippet children(displayValue)}
				<h2 class={ct.title.h2OnInk}>{displayValue}</h2>
			{/snippet}
		</EditableField>

		<div class="ct-rule ct-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
			<span class={ct.accent.ruleOnInk}></span>
			<span class={ct.accent.diamond}></span>
			<span class={ct.accent.ruleOnInk}></span>
		</div>

		<EditableField
			fieldKey="ContactCTA.subtitle"
			label="Подзаголовок"
			value={String(
				data?.subtitle ?? 'Свяжитесь с нами любым удобным способом — мы всегда рады помочь'
			)}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="ct-item ct-d3 mt-6 block"
		>
			{#snippet children(displayValue)}
				<p class="{ct.body.onInkMuted} mx-auto max-w-xl">{displayValue}</p>
			{/snippet}
		</EditableField>

		<div class="ct-item ct-d4 mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
			<EditableField
				fieldKey="ContactCTA.phone"
				label="Телефон"
				value={String(data?.phone ?? '')}
				{isEditable}
				onSave={(v) => saveField('phone', v)}
				class="inline-block"
			>
				{#snippet children(displayValue)}
					{#if displayValue}
						<a href="tel:{displayValue}" class={ct.btn.primary}>
							<svg
								class="size-4.5 transition-transform duration-300 group-hover:-rotate-12"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
								/>
							</svg>
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
				class="inline-block"
			>
				{#snippet children(displayValue)}
					{#if displayValue}
						<a
							href={displayValue}
							target="_blank"
							rel="noopener noreferrer"
							class={ct.btn.ghostOnInk}
						>
							<svg
								class="size-4.5 text-[#229ED9]"
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
</section>
