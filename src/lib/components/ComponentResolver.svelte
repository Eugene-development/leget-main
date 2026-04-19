<script lang="ts">
	import type { Component } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { browser } from '$app/environment';
	import type { EditContext } from '$lib/utils/page-edit';

	// Template registries — each template exports its own component map
	import * as TestTemplate from './templates/Test';
	// import * as Promo1Template from './templates/Promo-1';
	// import * as Promo2Template from './templates/Promo-2';

	type ComponentMap = Record<string, Component<{ data: Record<string, unknown>; editContext?: EditContext | null; isEditable?: boolean }>>;

	interface TemplateModule {
		Header?: Component<{ data: Record<string, unknown> }>;
		Footer?: Component<{ data: Record<string, unknown> }>;
		pageOverrides?: Record<string, ComponentMap>;
	}

	interface PageComponent {
		type: string;
		data: Record<string, unknown>;
	}

	let {
		templateId = null,
		slug = null,
		components = [],
		headerData = null,
		footerData = null,
		editContext = null
	}: {
		templateId: number | null;
		slug: string | null;
		components: PageComponent[];
		headerData: Record<string, unknown> | null;
		footerData: Record<string, unknown> | null;
		editContext: EditContext | null;
	} = $props();

	// Инициализируем auth в браузере
	$effect(() => {
		if (browser) {
			auth.init();
		}
	});

	const isEditable = $derived(browser && $auth.isAuthenticated && editContext !== null);

	/**
	 * Map templateId (from License) to a template module.
	 * null / undefined → fallback to Test template.
	 */
	function resolveTemplate(id: number | null): TemplateModule {
		switch (id) {
			// case 1: return Promo1Template as TemplateModule;
			// case 2: return Promo2Template as TemplateModule;
			default:
				return TestTemplate as unknown as TemplateModule;
		}
	}

	/**
	 * Resolve page-specific component map by slug.
	 */
	function resolveComponentMap(tmpl: TemplateModule, pageSlug: string | null): ComponentMap {
		if (!pageSlug || !tmpl.pageOverrides) return {};
		return tmpl.pageOverrides[pageSlug] ?? {};
	}

	const template = $derived(resolveTemplate(templateId));
	const componentMap = $derived(resolveComponentMap(template, slug));

	// Layout components come from the template module directly (layout/)
	const Header = $derived(template.Header ?? null);
	const Footer = $derived(template.Footer ?? null);
</script>

{#if Header && headerData}
	<Header data={headerData} />
{/if}

{#each components as element (element.type)}
	{@const Component = componentMap[element.type] ?? null}
	{#if Component}
		<Component data={element.data} {editContext} {isEditable} />
	{/if}
{/each}

{#if Footer && footerData}
	<Footer data={footerData} />
{/if}
