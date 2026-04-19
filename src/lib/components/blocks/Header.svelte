<script lang="ts">
	let { data } = $props();
</script>

<header class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur">
	<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
		{#if data?.logo}
			<a href="/" class="flex items-center gap-2">
				<img src={data.logo} alt={data?.siteName ?? 'Logo'} class="h-8 w-auto" />
			</a>
		{:else if data?.siteName}
			<a href="/" class="text-xl font-bold text-gray-900">{data.siteName}</a>
		{:else}
			<a href="/" class="text-xl font-bold text-gray-900">Site</a>
		{/if}

		{#if data?.links?.length}
			<nav class="flex items-center gap-6">
				{#each data.links as link}
					<a
						href={link.href}
						class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
					>
						{link.label}
					</a>
				{/each}
			</nav>
		{/if}
	</div>
</header>
