<script lang="ts">
	import type { CompanyDetail } from '$lib/partners/types';
	import CompanyLogo from '$lib/partners/CompanyLogo.svelte';
	import OtzovikAd from './OtzovikAd.svelte';

	let { data = {} }: { data?: Record<string, unknown> } = $props();
	const company = $derived(data.company as CompanyDetail | undefined);
	const phone = $derived(company?.phone?.replace(/[^+0-9]/g, ''));
	const linkClass = 'ds-accent underline underline-offset-4 wrap-anywhere';
</script>

<section
	class="p1-surface p1-title px-4 pt-section-sm pb-section sm:px-6 lg:px-8"
	data-p1-theme="light"
>
	<div class="mx-auto max-w-7xl">
		<a href="/b2b" class={linkClass}>К каталогу B2B</a>
		{#if company}
			<header
				class="p1-border mt-6 flex flex-col items-start gap-4 border-b pb-7 sm:flex-row sm:items-center sm:gap-6"
			>
				<CompanyLogo
					src={company.logoUrl}
					name={company.name}
					eager
					class="p1-surface-alt p1-border p1-body size-20 sm:size-28"
				/>
				<div class="min-w-0">
					<h1 class="text-page-title wrap-anywhere">{company.name}</h1>
					<p class="p1-body mt-3">{company.typeLabel}{company.city ? ` · ${company.city}` : ''}</p>
				</div>
			</header>
			<div class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				<section>
					<h2 class="text-2xl">О компании</h2>
					<p class="p1-body mt-4 max-w-prose leading-relaxed wrap-anywhere whitespace-pre-line">
						{company.description}
					</p>
				</section>
				<section class="p1-card p1-border self-start rounded-2xl border p-5 sm:p-6">
					<h2 class="text-2xl">Контакты</h2>
					<dl class="mt-4 grid gap-4">
						{#if phone}
							<div>
								<dt class="p1-body text-sm">Телефон</dt>
								<dd><a href="tel:{phone}" class={linkClass}>{company.phone}</a></dd>
							</div>
						{/if}
						{#if company.email}
							<div>
								<dt class="p1-body text-sm">Email</dt>
								<dd><a href="mailto:{company.email}" class={linkClass}>{company.email}</a></dd>
							</div>
						{/if}
						{#if company.website}
							<div>
								<dt class="p1-body text-sm">Сайт</dt>
								<dd><a href={company.website} rel="ugc" class={linkClass}>{company.website}</a></dd>
							</div>
						{/if}
						{#if company.address}
							<div>
								<dt class="p1-body text-sm">Адрес</dt>
								<dd class="wrap-anywhere">{company.address}</dd>
							</div>
						{/if}
					</dl>
				</section>
			</div>
			<div class="mt-8 sm:mt-10">
				<OtzovikAd />
			</div>
		{/if}
	</div>
</section>
