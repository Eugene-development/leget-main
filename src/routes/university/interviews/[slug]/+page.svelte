<script lang="ts">
	import Shell from '$lib/university/StudyShell.svelte';
	import Content from '$lib/university/InterviewContent.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head
	><title>{data.interview.title} — Универ</title><meta
		name="robots"
		content="noindex"
	/></svelte:head
>
<Shell title={data.interview.speaker}><Content interview={data.interview} /></Shell>
