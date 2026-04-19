<script lang="ts">
	let { data } = $props();
</script>

<section
	class="relative flex min-h-[60vh] items-center justify-center px-6 py-24 text-center"
	style={data?.backgroundImage ? `background-image: url('${data.backgroundImage}'); background-size: cover; background-position: center;` : ''}
>
	{#if data?.backgroundImage}
		<div class="absolute inset-0 bg-black/50"></div>
	{/if}

	<div class="relative z-10 max-w-3xl">
		{#if data?.title}
			<h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl" class:text-white={data?.backgroundImage}>
				{data.title}
			</h1>
		{/if}
		{#if data?.subtitle}
			<p class="mt-4 text-lg sm:text-xl" class:text-gray-200={data?.backgroundImage} class:text-gray-600={!data?.backgroundImage}>
				{data.subtitle}
			</p>
		{/if}
	</div>
</section>
