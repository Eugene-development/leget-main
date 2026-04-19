<script lang="ts">
	let { data } = $props();
</script>

<div class="prose prose-lg mx-auto max-w-3xl px-6 py-12">
	{#if data?.content}
		{@html data.content}
	{/if}
</div>
