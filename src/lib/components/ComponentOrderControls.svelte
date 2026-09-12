<script lang="ts">
	import { getContext } from 'svelte';
	import type { EditContext } from '$lib/utils/page-edit';
	import {
		COMPONENT_ORDER_CONTEXT,
		type ComponentOrderController
	} from '$lib/utils/component-order';

	let { componentType, editContext }: { componentType: string; editContext: EditContext | null } =
		$props();
	const order = getContext<ComponentOrderController | undefined>(COMPONENT_ORDER_CONTEXT);
	const position = $derived(order?.position(componentType, editContext) ?? null);
</script>

{#if order && position && position.count > 1}
	<div
		class="relative flex shrink-0 items-center gap-1"
		role="group"
		aria-label="Порядок блока"
		aria-busy={order.busy}
	>
		{#each ['up', 'down'] as direction}
			{@const isUp = direction === 'up'}
			{@const label = isUp ? 'Переместить блок выше' : 'Переместить блок ниже'}
			<button
				type="button"
				class="flex size-11 cursor-pointer items-center justify-center rounded-xl border border-on-dark/10 bg-ink-950/75 text-on-dark hover:border-on-dark/25 hover:bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-500 disabled:cursor-default disabled:opacity-40"
				aria-label={label}
				title={label}
				disabled={order.busy ||
					(isUp ? position.index === 0 : position.index === position.count - 1)}
				onclick={() => order.move(componentType, isUp ? 'up' : 'down')}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d={isUp ? 'M12 19V5m-7 7 7-7 7 7' : 'M12 5v14m-7-7 7 7 7-7'} />
				</svg>
			</button>
		{/each}
	</div>
{/if}
