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
		class="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center transition-colors after:absolute after:-inset-1 after:content-[''] focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 {triggerClass}"
		title="Карта целей Яндекс Директа"
		aria-label="Открыть карту целей Яндекс Директа"
	>
		<svg
			class="h-[18px] w-[18px]"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			aria-hidden="true"
		>
			<g style="stroke-width: var(--ds-icon-stroke)">
				<circle cx="12" cy="12" r="9" />
				<circle cx="12" cy="12" r="5" />
				<circle cx="12" cy="12" r="1" />
			</g>
		</svg>
	</a>
{/if}
