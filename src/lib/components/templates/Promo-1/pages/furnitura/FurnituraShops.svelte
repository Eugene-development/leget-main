<script lang="ts">
	// Артикул: 1.22.3.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const shops = $derived(data.shops || []);

	// Циклические цветовые градиенты как в N-front
	const gradients = [
		{ bg: 'bg-cat-1-100', text: 'text-cat-1-600', badge: 'text-cat-1-600', link: 'text-cat-1-600' },
		{ bg: 'bg-link-100', text: 'text-link-600', badge: 'text-link-600', link: 'text-link-600' },
		{ bg: 'bg-cat-3-100', text: 'text-cat-3-600', badge: 'text-cat-3-600', link: 'text-cat-3-600' },
		{ bg: 'bg-cat-2-100', text: 'text-cat-2-600', badge: 'text-cat-2-600', link: 'text-cat-2-600' },
		{ bg: 'bg-cat-5-100', text: 'text-cat-5-600', badge: 'text-cat-5-600', link: 'text-cat-5-600' },
		{ bg: 'bg-cat-6-100', text: 'text-cat-6-600', badge: 'text-cat-6-600', link: 'text-cat-6-600' }
	];

	function getGradient(i: number) {
		return gradients[i % gradients.length];
	}
</script>

<div class="mebel-container mt-12 mb-16">
	<h2 class="mb-6 text-2xl text-ink-900">{data.title || 'Магазины и поставщики'}</h2>

	{#if shops.length === 0}
		<div
			class="mt-6 rounded-xl bg-surface-raised p-12 text-center shadow-sm"
			in:fly={{ y: 20, duration: 400, easing: cubicOut }}
		>
			<svg
				class="mx-auto h-12 w-12 text-ink-300"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
				/>
			</svg>
			<h3 class="p1-title-sub mt-4 text-lg text-ink-900">Магазины пока не добавлены</h3>
			<p class="mt-2 text-ink-500">Скоро здесь появятся магазины мебельной фурнитуры</p>
		</div>
	{:else}
		<div class="grid gap-6 sm:grid-cols-2">
			{#each shops as shop, i}
				{@const g = getGradient(i)}
				<div
					class="rounded-xl bg-surface-raised p-6 shadow-sm transition-shadow hover:shadow-md"
					in:fly={{ y: 20, duration: 500, delay: i * 80, easing: cubicOut }}
				>
					<!-- Шапка карточки -->
					<div class="flex items-start gap-4">
						<div
							class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl {shop.logo
								? ''
								: g.bg}"
						>
							{#if shop.logo}
								<ImageFallback
									loading="lazy"
									src={shop.logo}
									alt={shop.title ?? shop.value}
									class="h-14 w-14 object-contain"
								/>
							{:else}
								<span class="text-2xl font-bold {g.text}">
									{(shop.title ?? shop.value ?? '?').charAt(0)}
								</span>
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<h3 class="p1-title-sub text-lg text-ink-900">{shop.title ?? shop.value}</h3>
							{#if shop.desc ?? shop.description}
								<p class="mt-1 line-clamp-2 text-sm text-ink-500">
									{shop.desc ?? shop.description}
								</p>
							{/if}
						</div>
					</div>

					<!-- Категории -->
					{#if shop.categories && shop.categories.length > 0}
						<div class="mt-4">
							<p class="text-xs font-medium tracking-wider text-ink-400 uppercase">Категории</p>
							<div class="mt-2 flex flex-wrap gap-2">
								{#each shop.categories.filter((c: any) => c.is_active !== false) as category}
									<span
										class="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-600"
									>
										{category.value ?? category.title}
									</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Бренды -->
					{#if shop.brands && shop.brands.length > 0}
						<div class="mt-4">
							<p class="text-xs font-medium tracking-wider text-ink-400 uppercase">Бренды</p>
							<div class="mt-2 flex flex-wrap gap-2">
								{#each shop.brands.filter((b: any) => b.is_active !== false) as brand}
									{#if brand.logo}
										<ImageFallback
											loading="lazy"
											src={brand.logo}
											alt={brand.value}
											class="h-6 object-contain"
										/>
									{:else}
										<span
											class="inline-flex items-center rounded-full bg-cat-1-100 px-2.5 py-0.5 text-xs font-medium text-cat-1-700"
										>
											{brand.value ?? brand.title}
										</span>
									{/if}
								{/each}
							</div>
						</div>
					{/if}

					<!-- Города -->
					{#if shop.cities && shop.cities.length > 0}
						<div class="mt-4 flex items-center gap-2 text-sm text-ink-500">
							<svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							<span
								>{shop.cities
									.filter((c: any) => c.is_active !== false)
									.map((c: any) => c.city_name)
									.join(', ')}</span
							>
						</div>
					{/if}

					<!-- Контакты и ссылка -->
					<div class="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
						<div class="flex items-center gap-3">
							{#if shop.phone}
								<a
									href="tel:{shop.phone}"
									class="flex items-center gap-1.5 text-sm text-ink-600 transition-colors hover:text-cat-1-600"
								>
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
										/>
									</svg>
									<span class="font-medium">{shop.phone}</span>
								</a>
							{/if}
							{#if shop.email}
								<a
									href="mailto:{shop.email}"
									aria-label="Написать на {shop.email}"
									class="text-sm text-ink-500 transition-colors hover:text-ink-700"
								>
									<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								</a>
							{/if}
						</div>
						{#if shop.slug}
							<a
								href="/furnitura/{shop.slug}"
								class="inline-flex items-center gap-1 text-sm font-medium {g.link} hover:underline"
							>
								Подробнее
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</a>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
