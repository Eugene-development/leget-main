<script lang="ts">
	import type { Snippet } from 'svelte';
	import SiteAnalytics from '$lib/components/SiteAnalytics.svelte';
	import type { LayoutData } from './$types';
	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<SiteAnalytics data={data.site?.header?.data} />
{@render children()}
