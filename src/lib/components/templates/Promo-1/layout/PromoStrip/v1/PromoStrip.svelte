<script lang="ts">
	// Артикул: 1.П.1.1 — см. docs/architecture/component-articles.md
	import { isLightBlock } from '$lib/utils/block-theme';
	import Marquee from '../Marquee.svelte';
	import { isPromoClosed, rememberPromoClosed } from '../session';
	import '../../../theme.css';

	let {
		data = {},
		text = '',
		isEditable = false
	}: { data: Record<string, unknown>; text: string; isEditable?: boolean } = $props();

	let closedBySession = $state(isPromoClosed());
	const isHidden = $derived(closedBySession && !isEditable);
	const isLight = $derived(isLightBlock(data, 'dark', 'promoTheme'));

	function close() {
		if (isEditable) return;
		closedBySession = true;
		rememberPromoClosed();
	}
</script>

{#if !isHidden}
	<div
		class="promo-strip"
		data-dismissible={!isEditable ? '' : undefined}
		data-p1-theme={isLight ? 'light' : 'dark'}
	>
		<div
			class="p1-surface p1-line flex h-12 items-center gap-3.5 border-b px-4 sm:px-8 lg:h-10"
			role="complementary"
			aria-label="Информационная полоса"
		>
			<div class="flex min-w-0 flex-1" class:pr-12={isEditable}>
				<Marquee {text} />
			</div>
			<button
				type="button"
				onclick={close}
				data-goal-ignore="Скрытие информационной полосы на сессию"
				class="p1-muted p1-card-hover p1-accent-hover -mr-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400 lg:-mr-1 lg:size-6"
				aria-label="Скрыть информационную полосу до конца сессии"
				title="Скрыть до конца сессии"
			>
				<svg
					class="h-3.5 w-3.5 [stroke-width:var(--ds-icon-stroke)]"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg
				>
			</button>
		</div>
	</div>
{/if}
