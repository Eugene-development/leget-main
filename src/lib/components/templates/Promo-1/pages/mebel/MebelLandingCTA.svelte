<script lang="ts">
	import type { PageComponentProps } from '$lib/components/templates/types';
	import MebelCTA from './MebelCTA.svelte';

	let { data = $bindable(), editContext, isEditable, sitePhone }: PageComponentProps = $props();
</script>

<MebelCTA bind:data {editContext} {isEditable} {sitePhone} featured />
