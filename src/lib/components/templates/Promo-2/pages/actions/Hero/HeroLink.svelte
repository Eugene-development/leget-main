<script lang="ts">
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
	// RichText stores formatting; link destinations remain the existing ctaLink field.
	const href = $derived(String(data?.ctaLink ?? '/contact'));
</script>

<a class="ah-link" {href}>
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
</a>
