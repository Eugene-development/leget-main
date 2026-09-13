<script lang="ts">
	import { renderRichText } from '$lib/utils/rich-text';
	let { value, legacyHtml = false }: { value: string; legacyHtml?: boolean } = $props();
</script>

{@html renderRichText(value, legacyHtml)}
