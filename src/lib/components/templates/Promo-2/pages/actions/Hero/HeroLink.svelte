<script lang="ts">
	import { openPromo2Form } from '$lib/components/templates/Promo-2/forms/request';
	import HeroField from './HeroField.svelte';
	import type { EditContext } from '$lib/utils/page-edit';
	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();
</script>

<button
	class="ah-link"
	type="button"
	data-metrika-goal="pages_actions_hero_herolink_open"
	data-goal-action="open"
	onclick={() => {
		if (!isEditable) openPromo2Form('estimate', '');
	}}
>
	<HeroField
		bind:data
		{editContext}
		{isEditable}
		field="ctaText"
		label="Текст кнопки"
		fallback="Расчёт проекта за час"
	/>
	<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"
		><path
			d="M4 12h16m-6-6 6 6-6 6"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/></svg
	>
</button>
