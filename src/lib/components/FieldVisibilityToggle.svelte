<script lang="ts">
	let {
		visible,
		label,
		pending = false,
		onToggle
	}: {
		visible: boolean;
		label: string;
		pending?: boolean;
		onToggle: (event: MouseEvent) => void | Promise<void>;
	} = $props();
	const title = $derived(`${visible ? 'Скрыть' : 'Показать'} ${label}`);
</script>

<button
	type="button"
	role="switch"
	aria-checked={visible}
	aria-label={title}
	aria-busy={pending}
	{title}
	disabled={pending}
	onclick={onToggle}
	class="relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-surface-raised/80 shadow-md transition-colors duration-[var(--ds-motion-duration-ui)] ease-ui focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 {visible
		? 'bg-link-500'
		: 'bg-ink-400'}"
>
	<span
		class="pointer-events-none inline-block size-5 rounded-full bg-surface-raised shadow-sm transition-transform duration-[var(--ds-motion-duration-ui)] ease-ui {visible
			? 'translate-x-4'
			: 'translate-x-0'}"
	></span>
</button>
