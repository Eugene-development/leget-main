<script lang="ts">
	let {
		isEditable = false,
		triggerClass = ''
	}: {
		isEditable?: boolean;
		triggerClass?: string;
	} = $props();
</script>

{#if isEditable}
	<a
		href="/goals/unlock"
		target="_blank"
		rel="noopener noreferrer"
		class="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center transition-colors after:absolute after:-inset-1 after:content-[''] focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 {triggerClass}"
		title="Карта целей Яндекс Директа"
		aria-label="Открыть карту целей Яндекс Директа в новой вкладке"
	>
		<svg
			class="h-[18px] w-[18px]"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path
				d="M5 19 11.2 5.4c.34-.74 1.39-.74 1.73 0L19 19"
				stroke-linecap="round"
				stroke-linejoin="round"
				style="stroke-width: var(--ds-icon-stroke-bold)"
			/>
			<path
				d="m8.15 14.1 7.7-3.9"
				stroke-linecap="round"
				style="stroke-width: var(--ds-icon-stroke)"
			/>
			<circle cx="12" cy="12" r="9" style="stroke-width: var(--ds-icon-stroke)" />
		</svg>
	</a>
{/if}
