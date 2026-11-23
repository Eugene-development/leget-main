<script lang="ts">
	import type { CompanyDirectory, PartnerApplication } from '$lib/partners/types';
	import { companyDirectoryHref, type CompanyFilter } from '$lib/partners/directory';
	import CompanyFeed from './CompanyFeed.svelte';
	import OtzovikAd from './OtzovikAd.svelte';
	import PartnerRegistrationDialog from './PartnerRegistrationDialog.svelte';

	let { data = {} }: { data?: Record<string, unknown> } = $props();

	const directory = $derived(data.directory as CompanyDirectory | undefined);
	const filter = $derived((data.filter as CompanyFilter | null) ?? null);
	const registration = $derived(
		data.registration as
			| {
					profile: { role: string } | null;
					application: PartnerApplication | null;
					apiError: string | null;
			  }
			| undefined
	);
	const filters = [
		{ value: null, name: 'Все компании' },
		{ value: 'manufacturer', name: 'Производители' },
		{ value: 'supplier', name: 'Поставщики' }
	] as const;
</script>

<section
	class="p1-surface p1-title px-4 pt-section-sm pb-section sm:px-6 lg:px-8"
	data-p1-theme="light"
>
	<div class="mx-auto max-w-7xl">
		<header
			class="p1-border flex flex-col items-start gap-5 border-b pb-7 sm:pb-8 md:flex-row md:items-end md:justify-between"
		>
			<div>
				<h1 class="text-page-title text-balance">{String(data.title ?? 'Каталог B2B')}</h1>
				<p class="p1-body mt-3 max-w-prose leading-relaxed">
					{String(
						data.description ??
							'Производители и поставщики, зарегистрированные как партнёры проекта.'
					)}
				</p>
			</div>
			<div class="shrink-0">
				<PartnerRegistrationDialog
					profile={registration?.profile}
					application={registration?.application}
					apiError={registration?.apiError}
				/>
			</div>
		</header>

		<nav aria-label="Рубрики компаний" class="my-6 flex flex-wrap gap-2 sm:my-8">
			{#each filters as item (item.value)}
				<a
					href={companyDirectoryHref(item.value)}
					aria-current={filter === item.value ? 'page' : undefined}
					class="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors {filter ===
					item.value
						? 'ds-action'
						: 'p1-border p1-accent-hover border'}">{item.name}</a
				>
			{/each}
		</nav>

		<div class="mb-6 sm:mb-8">
			<OtzovikAd />
		</div>

		{#if data.directoryError}
			<p class="p1-body py-8" role="alert">
				Каталог временно недоступен. <a
					href={companyDirectoryHref(filter)}
					data-sveltekit-reload
					class="ds-accent underline underline-offset-4">Попробовать снова</a
				>
			</p>
		{:else if directory?.items.length}
			{#key `${filter}:${directory.page}`}
				<CompanyFeed {directory} {filter} />
			{/key}
		{:else}
			<p class="p1-body py-8">
				{filter
					? 'В этой рубрике пока нет опубликованных компаний.'
					: 'Компании появятся здесь после публикации карточек партнёрами.'}
			</p>
		{/if}
	</div>
</section>
