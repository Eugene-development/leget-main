<script lang="ts">
	import CrmLayout from '$lib/crm/CrmLayout.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<CrmLayout {data} {children} />
