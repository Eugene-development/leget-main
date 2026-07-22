<script lang="ts">
	let {
		src,
		alt = '',
		class: className = ''
	}: {
		src?: string | null;
		alt?: string;
		class?: string;
	} = $props();

	let failed = $state(false);
	const hasImage = $derived(Boolean(src?.trim()) && !failed);

	$effect(() => {
		src;
		failed = false;
	});
</script>

{#if hasImage}
	<img {src} {alt} class={className} onerror={() => (failed = true)} />
{:else}
	<div
		class={`flex items-center justify-center overflow-hidden bg-slate-200 bg-[linear-gradient(135deg,transparent_46%,rgb(148_163_184/0.35)_47%,rgb(148_163_184/0.35)_53%,transparent_54%)] text-slate-400 ${className}`}
		role="img"
		aria-label={alt || 'Изображение отсутствует'}
	>
		<svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5" />
			<circle cx="8.5" cy="9" r="1.5" fill="currentColor" />
			<path
				d="m4 18 5-5 3.5 3.5 2.5-2.5 5 4"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>
{/if}
