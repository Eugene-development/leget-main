<script lang="ts">
	import ContentText from '../../ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	import { openPromo2Form } from '../../forms/request';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import { equipmentDefaults } from './content';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		class: className = ''
	}: PageComponentProps & { class?: string } = $props();
	const defaults = equipmentDefaults.EquipmentCTA;
</script>

{#snippet label()}
	<ContentText
		bind:data
		{editContext}
		{isEditable}
		componentType="EquipmentCTA"
		path={['linkText']}
		fallback={defaults.linkText}
		label="Текст кнопки"
		richText={false}
	/>
	<svg
		class="h-4 w-4 shrink-0"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		aria-hidden="true"
	>
		<path d="M4 12h16m-6-6 6 6-6 6" />
	</svg>
{/snippet}

{#if isEditable}
	<div class={className}>{@render label()}</div>
{:else}
	<button
		type="button"
		data-metrika-goal="pages_equipment_equipmentcta_open"
		data-goal-action="open"
		data-goal-label="Обсудить комплектацию"
		aria-label={editableText(data?.linkText, defaults.linkText).trim() || defaults.linkText}
		onclick={() => {
			if (!isEditable) openPromo2Form('consultation', 'Комплектация мебели');
		}}
		class={className}
	>
		{@render label()}
	</button>
{/if}
