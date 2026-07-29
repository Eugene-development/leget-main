<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { ct } from '../../theme';
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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ContactsHero', updated);
		data = updated;
	}
</script>

<!--
	Вариант 1 — асимметричная подача: текст выровнен по левому краю, свободное
	поле справа. Палитра, типографика и анимации общие для страницы (см. ../../theme.ts),
	отличие от варианта 2 только в композиции.
-->
<section class="{ct.section.shell} {ct.section.heroPad} {ct.surface.ink}">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_78%_38%,rgba(239,68,68,0.11),transparent_31%),radial-gradient(circle_at_15%_8%,rgba(255,255,255,0.055),transparent_26%)]"
		></div>
		<div class="ct-grid ct-grid--fade-bottom"></div>
		<div class={ct.accent.toplineOnInk}></div>
	</div>

	<div class={ct.section.container}>
		<div class="ct-enter relative z-10">
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
					<h1 class="{ct.title.h1OnInk} max-w-3xl">{displayValue}</h1>
				{/snippet}
			</EditableField>

			<div class="ct-rule ct-d2 mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
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
					<p class="{ct.body.onInk} max-w-2xl">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
