<script lang="ts">
	import ComponentResolver from '$lib/components/ComponentResolver.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type PageComponent = {
		type: string;
		data: Record<string, unknown>;
	};

	const site = $derived(data.pageData?.site);
	const sourceComponents = $derived(
		(data.pageData?.page?.componentsData as PageComponent[] | undefined) ?? []
	);
	const projects = $derived.by(() => {
		const latest = sourceComponents.find((component) => component.type === 'ProjectsHero')?.data
			?.latest;
		const rest = sourceComponents.find((component) => component.type === 'ProjectsFeed')?.data
			?.projects;

		return [latest, ...(Array.isArray(rest) ? rest : [])].filter(Boolean);
	});
	const components = $derived([{ type: 'FavoritesPage', data: { projects } }]);
</script>

<svelte:head>
	<title>Избранное{site?.name ? ` — ${site.name}` : ''}</title>
	<meta name="description" content="Сохранённые проекты" />
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
	seo={null}
	{components}
	editContext={null}
	ownerId={null}
/>
