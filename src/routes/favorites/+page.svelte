<script lang="ts">
	import ComponentResolver from '$lib/components/ComponentResolver.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	type PageComponent = {
		id?: string | null;
		type: string;
		data: Record<string, unknown>;
	};

	const site = $derived(data.pageData?.site);
	const page = $derived(data.pageData?.page);
	const pageId = $derived(page?.id ?? null);
	const licenseId = $derived(page?.licenseId ?? null);
</script>

<svelte:head>
	<title>{page?.seo?.title ?? `Избранное${site?.name ? ` — ${site.name}` : ''}`}</title>
	<meta
		name="description"
		content={page?.seo?.description ?? 'Сохранённые кухни, шкафы и проекты'}
	/>
	{#if site?.faviconUrl}
		<link rel="icon" href={site.faviconUrl} />
	{/if}
</svelte:head>

<ComponentResolver
	templateId={site?.templateId ?? null}
	slug="/favorites"
	headerData={site?.header?.data ?? null}
	footerData={site?.footer?.data ?? null}
	actionCards={site?.actionCards ?? null}
	seo={page?.seo ?? null}
	components={(page?.componentsData as PageComponent[] | undefined) ?? []}
	editContext={pageId && licenseId
		? { pageId, licenseId, templateId: site?.templateId ?? null, slug: '/favorites' }
		: null}
	ownerId={site?.ownerId ?? null}
/>
