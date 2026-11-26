<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		direction,
		isEditable,
		onclick,
		children
	}: {
		direction: 'left' | 'right';
		isEditable: boolean;
		onclick: () => void;
		children: Snippet;
	} = $props();

	const captionId = $props.id();
	const right = $derived(direction === 'right');
</script>

{#snippet caption()}
	<span
		id={captionId}
		class="text-start text-xs font-semibold tracking-[0.06em] text-primary uppercase sm:text-sm"
	>
		{@render children()}
	</span>
{/snippet}

<div class="flex items-center gap-2 sm:gap-4" class:ml-auto={right}>
	{#if isEditable && right}{@render caption()}{/if}
	<button
		type="button"
		{onclick}
		data-goal-ignore="Навигация по галерее"
		aria-label={right ? 'Листайте вправо' : 'Листайте влево'}
		aria-labelledby={isEditable ? undefined : captionId}
		class="group flex cursor-pointer items-center gap-2 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:gap-4"
	>
		{#if !isEditable && right}{@render caption()}{/if}
		<span
			class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-surface-raised text-primary shadow-soft group-hover:border-primary group-hover:bg-primary group-hover:text-on-dark group-active:border-primary group-active:bg-primary group-active:text-on-dark motion-safe:transition motion-safe:duration-200 motion-safe:group-active:scale-95"
		>
			<svg
				aria-hidden="true"
				class={[
					'size-6 motion-safe:transition-transform motion-safe:duration-200',
					right
						? 'motion-safe:group-hover:translate-x-0.5'
						: 'motion-safe:group-hover:-translate-x-0.5'
				]}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="1.75"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M4.5 12h15m-5.5-5.5 5.5 5.5-5.5 5.5"
					transform={right ? undefined : 'translate(24 0) scale(-1 1)'}
				/>
			</svg>
		</span>
		{#if !isEditable && !right}{@render caption()}{/if}
	</button>
	{#if isEditable && !right}{@render caption()}{/if}
</div>
