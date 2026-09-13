<script lang="ts">
	import FieldToolbar from './FieldToolbar.svelte';
	import FieldVisibilityToggle from './FieldVisibilityToggle.svelte';
	let {
		target,
		label,
		onOpen,
		visibility
	}: {
		target: HTMLElement;
		label: string;
		onOpen: () => void;
		visibility?: {
			visible: boolean;
			pending?: boolean;
			label: string;
			onToggle: (event: MouseEvent) => void | Promise<void>;
		};
	} = $props();
</script>

{#snippet imageAction()}
	<button
		type="button"
		class="image-add-control"
		aria-label={`Добавить изображение по ссылке: ${label}`}
		title={`Добавить изображение по ссылке: ${label}`}
		onclick={(event) => {
			event.preventDefault();
			event.stopPropagation();
			onOpen();
		}}
	>
		<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
			<path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
	</button>
{/snippet}

<FieldToolbar {target} {label}>
	{@render imageAction()}
	{#if visibility}<FieldVisibilityToggle {...visibility} />{/if}
</FieldToolbar>

<style>
	.image-add-control {
		position: static;
		z-index: 180;
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		border: 1px solid var(--color-ink-300);
		background: var(--color-surface-raised);
		color: var(--color-link-600);
		box-shadow: 0 2px 8px color-mix(in oklab, var(--color-scrim) 20%, transparent);
	}
	.image-add-control:hover {
		background: var(--color-link-50);
	}
	.image-add-control:focus-visible {
		outline: 2px solid var(--color-link-600);
		outline-offset: 2px;
	}
</style>
