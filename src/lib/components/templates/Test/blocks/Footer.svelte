<script lang="ts">
	let { data } = $props();
</script>

<footer class="w-full border-t border-gray-200 bg-gray-50">
	<div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
		{#if data?.siteName}
			<span class="text-sm text-gray-500">{data.siteName}</span>
		{/if}

		{#if data?.links?.length}
			<nav class="flex flex-wrap items-center gap-4">
				{#each data.links as link}
					<a
						href={link.href}
						class="text-sm text-gray-500 transition-colors hover:text-gray-900"
					>
						{link.label}
					</a>
				{/each}
			</nav>
		{/if}

		{#if data?.copyright}
			<span class="text-sm text-gray-400">{data.copyright}</span>
		{/if}
	</div>
</footer>
