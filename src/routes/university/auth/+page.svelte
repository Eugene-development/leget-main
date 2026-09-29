<script lang="ts">
	import Frame from '$lib/university/Frame.svelte';
	import Admission from '$lib/university/Admission.svelte';
	let { data } = $props();
</script>

<svelte:head
	><title>Регистрация студента — Универ</title><meta name="robots" content="noindex" /></svelte:head
>
<Frame><Admission profile={data.profile} /></Frame>
