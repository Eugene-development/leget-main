<script lang="ts">
	import Hero from './templates/Test/blocks/Hero.svelte';
	import Text from './templates/Test/blocks/Text.svelte';

	let { components } = $props();

	const componentMap: Record<string, any> = {
		Hero,
		Text
	};
</script>

{#each components as element}
	{@const Component = componentMap[element.type]}
	{#if Component}
		<Component data={element.data} />
	{:else}
		{console.warn('Unknown component type:', element.type)}
	{/if}
{/each}
