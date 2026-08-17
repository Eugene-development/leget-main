<script lang="ts">
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import ComponentImageManager from '$lib/components/ComponentImageManager.svelte';
	import { saveLayoutData, type EditContext } from '$lib/utils/page-edit';
	import type { ComponentImageSlot } from '$lib/utils/component-images';

	let {
		data = $bindable(),
		editContext,
		isEditable,
		layoutType = 'Header',
		slots = []
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
		layoutType?: 'Header' | 'Footer';
		slots?: ComponentImageSlot[];
	} = $props();

	let open = $state(false);

	async function save(next: Record<string, unknown>) {
		if (!editContext) return;
		await saveLayoutData(editContext, layoutType, next);
	}
</script>

{#if isEditable && editContext}
	<button
		type="button"
		class="font-sans-premium absolute top-3 left-3 z-[170] flex min-h-10 items-center gap-2 rounded-xl border border-on-dark/15 bg-ink-950/80 px-3 py-2 text-xs font-semibold text-on-dark shadow-xl backdrop-blur-xl transition-colors hover:border-link-400/45 hover:bg-ink-900 focus-visible:ring-2 focus-visible:ring-link-400 focus-visible:outline-none"
		onclick={() => (open = true)}
		aria-label="Изображения шапки"
		title="Изображения шапки"
	>
		<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16m-2-2 1.6-1.6a2 2 0 0 1 2.8 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
			/>
		</svg>
		Изображения
	</button>

	<SideDrawer bind:open title="Изображения шапки">
		<ComponentImageManager
			bind:data
			{editContext}
			componentType={layoutType}
			{slots}
			onSaveData={save}
		/>
	</SideDrawer>
{/if}
