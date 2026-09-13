<script lang="ts">
	import { setContext, type Component as SvelteComponent } from 'svelte';
	import SingleVersionSettings from './SingleVersionSettings.svelte';
	import { provideImageEditing } from '$lib/utils/image-editing.svelte';
	import type { EditContext } from '$lib/utils/page-edit';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import {
		createEditableVisibility,
		EDITABLE_VISIBILITY_CONTEXT
	} from '$lib/utils/editable-visibility.svelte';

	let {
		component: Component,
		componentType,
		data = $bindable({}),
		editContext = null,
		isEditable = false,
		componentId = null,
		sitePhone = null,
		showSettings = false,
		settingsThemeDefault = null
	}: {
		component: SvelteComponent<PageComponentProps>;
		componentType: string;
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
		componentId?: string | null;
		sitePhone?: string | null;
		showSettings?: boolean;
		settingsThemeDefault?: 'light' | 'dark' | null;
	} = $props();

	const visibility = createEditableVisibility({
		getComponentType: () => componentType,
		getData: () => data,
		setData: (next) => (data = next),
		getEditContext: () => editContext
	});

	setContext(EDITABLE_VISIBILITY_CONTEXT, visibility);
	provideImageEditing({
		getData: () => data,
		setData: (next) => (data = next),
		getContext: () => editContext,
		isEditable: () => isEditable,
		getType: () => componentType
	});
</script>

{#if showSettings}
	<SingleVersionSettings
		bind:data
		{editContext}
		{isEditable}
		{componentType}
		resetId={componentId}
		themeToggle={settingsThemeDefault !== null}
		themeDefault={settingsThemeDefault ?? 'light'}
	/>
{/if}

<Component bind:data {editContext} {isEditable} {componentId} {sitePhone} />
