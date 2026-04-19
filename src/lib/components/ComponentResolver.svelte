<script lang="ts">
	import type { Component } from 'svelte';

	// Template registries — each template exports its own component map
	import * as TestTemplate from './templates/Test';
	// import * as Promo1Template from './templates/Promo-1';
	// import * as Promo2Template from './templates/Promo-2';

	type ComponentMap = Record<string, Component<{ data: Record<string, unknown> }>>;

	interface PageComponent {
		type: string;
		data: Record<string, unknown>;
	}

	let {
		templateId = null,
		components = [],
		headerData = null,
		footerData = null
	}: {
		templateId: number | null;
		components: PageComponent[];
		headerData: Record<string, unknown> | null;
		footerData: Record<string, unknown> | null;
	} = $props();

	/**
	 * Map templateId (from License) to a component registry.
	 * null / undefined → fallback to Test template.
	 */
	function resolveTemplate(id: number | null): ComponentMap {
		switch (id) {
			// case 1: return Promo1Template as ComponentMap;
			// case 2: return Promo2Template as ComponentMap;
			default:
				return TestTemplate as ComponentMap;
		}
	}

	const template = $derived(resolveTemplate(templateId));
	const Header = $derived(template['Header'] ?? null);
	const Footer = $derived(template['Footer'] ?? null);
</script>

{#if Header && headerData}
	<Header data={headerData} />
{/if}

{#each components as element (element.type)}
	{@const Component = template[element.type] ?? null}
	{#if Component}
		<Component data={element.data} />
	{/if}
{/each}

{#if Footer && footerData}
	<Footer data={footerData} />
{/if}
