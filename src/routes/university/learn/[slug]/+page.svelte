<script lang="ts">
	import Frame from '$lib/university/Frame.svelte';
	import Classroom from '$lib/university/Classroom.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head
	><title>{data.course.title} — Универ</title><meta name="robots" content="noindex" /></svelte:head
>
<Frame
	>{#key data.course.slug}<Classroom course={data.course} attempts={data.attempts} />{/key}</Frame
>
