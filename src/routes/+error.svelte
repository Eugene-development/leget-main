<script lang="ts">
	import { page } from '$app/stores';
	import ComponentResolver from '$lib/components/ComponentResolver.svelte';

	type PageComponent = { type: string; data: Record<string, unknown> };

	/**
	 * Страница 404 шаблона. Её данные приходят в теле ошибки из loadRenderPage():
	 * layout сайт не грузит, поэтому иначе здесь не из чего собрать фирменную
	 * страницу. Нет данных (сайт не резолвится, шаблон без '/404', API недоступен)
	 * — остаётся нейтральная заглушка ниже.
	 */
	const notFound = $derived($page.status === 404 ? ($page.error?.pageData ?? null) : null);
	const site = $derived(notFound?.site ?? null);
	const notFoundPage = $derived(notFound?.page ?? null);
	const licenseId = $derived(
		notFoundPage ? (notFoundPage.licenseId ?? (notFoundPage as any).license_id ?? null) : null
	);
</script>

<!-- svelte:head живёт только на верхнем уровне компонента, внутрь {#if} его не внести. -->
<svelte:head>
	{#if notFound && site}
		{#if site.name}
			<title>Страница не найдена — {site.name}</title>
		{/if}
		<meta name="robots" content="noindex" />
		{#if site.faviconUrl}
			<link rel="icon" href={site.faviconUrl} />
		{/if}
	{/if}
</svelte:head>

{#if notFound && site}
	<ComponentResolver
		templateId={site.templateId ?? null}
		slug={notFoundPage?.slug ?? '/404'}
		headerData={site.header?.data ?? null}
		footerData={site.footer?.data ?? null}
		components={(notFoundPage?.componentsData as PageComponent[]) ?? []}
		editContext={notFoundPage?.id && licenseId
			? {
					pageId: notFoundPage.id,
					licenseId,
					templateId: site.templateId,
					slug: notFoundPage.slug
				}
			: null}
	/>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
		<div class="text-center">
			{#if $page.status === 404}
				<p class="text-6xl font-bold text-gray-300">404</p>
				<h1 class="mt-4 text-2xl text-gray-800">Сайт не найден</h1>
				<p class="mt-2 text-gray-500">Site not found</p>
			{:else if $page.status === 403}
				<p class="text-6xl font-bold text-gray-300">403</p>
				<h1 class="mt-4 text-2xl text-gray-800">Сайт приостановлен</h1>
				<p class="mt-2 text-gray-500">Site suspended</p>
			{:else if $page.status === 502}
				<p class="text-6xl font-bold text-gray-300">502</p>
				<h1 class="mt-4 text-2xl text-gray-800">Ошибка сервера</h1>
				<p class="mt-2 text-gray-500">Server error</p>
			{:else}
				<p class="text-6xl font-bold text-gray-300">{$page.status}</p>
				<h1 class="mt-4 text-2xl text-gray-800">Произошла ошибка</h1>
				<p class="mt-2 text-gray-500">{$page.error?.message ?? 'Something went wrong'}</p>
			{/if}
		</div>
	</div>
{/if}
