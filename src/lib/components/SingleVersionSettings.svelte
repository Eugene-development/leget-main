<script lang="ts">
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';
	import type { EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		componentType,
		resetId = null,
		themeToggle = false,
		themeDefault = 'light',
		title = ''
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
		componentType: string;
		resetId?: string | null;
		themeToggle?: boolean;
		themeDefault?: 'light' | 'dark';
		title?: string;
	} = $props();

	const versionKey = $derived(
		`${componentType.charAt(0).toLowerCase() + componentType.slice(1)}Version`
	);
	// VersionSwitcher синхронизирует значение из data в своём $effect. Начальное v1
	// достаточно и не захватывает реактивный ключ в момент создания компонента.
	let selectedVersion = $state<'v1' | 'disabled'>('v1');
</script>

<VersionSwitcher
	bind:data
	{editContext}
	{isEditable}
	{componentType}
	{versionKey}
	{resetId}
	bind:selectedVersion
	versions={['v1']}
	showVersionMenu={false}
	themeVersions={themeToggle ? ['v1'] : []}
	{themeDefault}
	title={title || componentType}
/>
