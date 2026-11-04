<script lang="ts">
	// Артикул: 1.П.1.2 — см. docs/architecture/component-articles.md
	import { isLightBlock } from '$lib/utils/block-theme';
	import Marquee from '../Marquee.svelte';
	import '../../../theme.css';

	let {
		data = {},
		text = '',
		isEditable = false
	}: { data: Record<string, unknown>; text: string; isEditable?: boolean } = $props();
	const isLight = $derived(isLightBlock(data, 'dark', 'promoTheme'));
</script>

<div class="promo-strip" data-p1-theme={isLight ? 'light' : 'dark'}>
	<div
		class="p1-surface p1-line relative flex h-12 items-center border-b px-4 sm:px-8 lg:h-10"
		class:promo-editable={isEditable}
		role="complementary"
		aria-label="Информационная полоса"
	>
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--p1-accent)_55%,transparent)] to-transparent"
		></div>
		<Marquee {text} />
	</div>
</div>

<style>
	.promo-editable {
		padding-right: 3rem;
	}
</style>
