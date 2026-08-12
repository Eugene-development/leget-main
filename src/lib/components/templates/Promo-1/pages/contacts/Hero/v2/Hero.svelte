<script lang="ts">
	// Артикул: 1.5.1.2 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { ct } from '../../theme';
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
		await saveComponentData(editContext, 'ContactsHero', updated);
		data = updated;
	}
</script>

<!--
	Вариант 2 — «editorial»-подача: центральная ось, карточка-паспарту и
	ромбовидный разделитель под заголовком. Поверхность, палитра, шкала
	заголовков и высота секции те же, что у варианта 1 (см. ../../theme.ts),
	поэтому переключение версий не меняет стиль страницы — только композицию.
-->
<section
	class="{ct.section.shell} {ct.section.heroPad} {ct.surface.ink}"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--color-brand-500)_13%,transparent),transparent_45%)]"
		></div>
		<div class="ct-grid ct-grid--fade-center"></div>
		<div class={ct.accent.toplineOnInk}></div>
	</div>

	<div class={ct.section.containerText}>
		<div
			class="ct-enter ct-card-enter {ct.card
				.onInk} relative px-6 py-9 text-center sm:px-12 sm:py-11 lg:px-16"
		>
			<span class={ct.accent.hairlineOnCard} aria-hidden="true"></span>

			<EditableField
				fieldKey="ContactsHero.eyebrow"
				label="Надпись над заголовком"
				value={String(data?.eyebrow ?? 'Связь с нами')}
				{isEditable}
				onSave={(v) => saveField('eyebrow', v)}
				class="ct-item inline-block"
			>
				{#snippet children(displayValue)}
					<p class={ct.eyebrow.onInk}>
						<span class={ct.eyebrow.dashOnInk} aria-hidden="true"></span>
						{displayValue}
						<span class={ct.eyebrow.dashOnInk} aria-hidden="true"></span>
					</p>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ContactsHero.title"
				label="Заголовок"
				value={String(data?.title ?? 'Контакты')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="ct-item ct-d1 mt-5 block"
			>
				{#snippet children(displayValue)}
					<h1 class={ct.title.h1OnInk}>{displayValue}</h1>
				{/snippet}
			</EditableField>

			<div class="ct-rule ct-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class={ct.accent.ruleOnInk}></span>
				<span class={ct.accent.diamond}></span>
				<span class={ct.accent.ruleOnInk}></span>
			</div>

			<EditableField
				fieldKey="ContactsHero.subtitle"
				label="Подзаголовок"
				value={String(
					data?.subtitle ??
						'Мы работаем с понедельника по субботу с 10:00 до 20:00. В иное время воспользуйтесь онлайн-чатом или почтой.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('subtitle', v)}
				class="ct-item ct-d3 mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="{ct.body.onInk} mx-auto max-w-xl">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
