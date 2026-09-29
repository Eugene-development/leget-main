<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Shell from '$lib/university/StudyShell.svelte';
	import type { LayoutData } from './$types';
	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	const title = $derived(
		page.url.pathname.endsWith('/exam')
			? 'Итоговый экзамен'
			: (data.course.lessons.find((l) => page.url.pathname.endsWith(`/lessons/${l.id}`))?.title ??
					data.course.title)
	);
</script>

<Shell course={data.course} attempts={data.attempts} sidebar {title}>{@render children()}</Shell>
