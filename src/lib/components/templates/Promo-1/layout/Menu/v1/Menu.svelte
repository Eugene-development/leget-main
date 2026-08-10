<script lang="ts">
	// Артикул: 1.М.1.1 — см. docs/architecture/component-articles-map.md
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { CatalogItem } from '../../catalogItems';
	import type { ServiceItem } from '../../serviceItems';

	// Вариант 1 меню (хэдер Promo-1) — исходный светлый дизайн навигации.
	// Данные (links / рубрики / услуги / disabled-списки) и обработчики переключателей
	// приходят из Header.svelte пропсами: списки живут в общем header_data blob'е,
	// а сохранением видимости рубрик/услуг по-прежнему управляет Header.
	let {
		links = [],
		visibleCatalogItems = [],
		visibleServiceItems = [],
		disabledRubrics = [],
		disabledServices = [],
		isEditable = false,
		onToggleRubric,
		onToggleService
	}: {
		links: { href: string; label: string }[];
		visibleCatalogItems: CatalogItem[];
		visibleServiceItems: ServiceItem[];
		disabledRubrics: string[];
		disabledServices: string[];
		isEditable?: boolean;
		onToggleRubric: (href: string, currentEnabled: boolean, e: Event) => void;
		onToggleService: (href: string, currentEnabled: boolean, e: Event) => void;
	} = $props();

	let visibleServicesMenu = $state(false);
	let visibleCatalogMenu = $state(false);
	let hoveredItem = $state<string | null>(null);

	const isCatalogActive = $derived(
		hoveredItem === 'catalog' ||
			(hoveredItem === null &&
				(visibleCatalogMenu ||
					visibleCatalogItems.some((item) => $page.url.pathname.startsWith(item.href))))
	);

	const isServicesActive = $derived(
		hoveredItem === 'services' ||
			(hoveredItem === null &&
				(visibleServicesMenu ||
					visibleServiceItems.some((item) => $page.url.pathname === item.href)))
	);

	function isLinkActive(href: string) {
		return hoveredItem === href || (hoveredItem === null && $page.url.pathname === href);
	}
</script>

{#snippet comingSoonIndicator(paddingClass = 'pr-3')}
	<div class="flex shrink-0 items-center {paddingClass}" title="В разработке">
		<span
			class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cat-1-50 text-cat-1-600 ring-1 ring-cat-1-200/80"
			aria-hidden="true"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-2.791 2.697A6.98 6.98 0 0112 13.02a6.98 6.98 0 01-3.02-1.046m2.791 2.697L9.75 21"
				/>
			</svg>
		</span>
	</div>
{/snippet}

<nav class="hidden items-center gap-6 sm:flex">
	{#each links as link}
		{#if link.label === 'Услуги'}
			<div
				role="group"
				class="relative flex h-full items-center"
				onmouseenter={() => {
					visibleServicesMenu = true;
					hoveredItem = 'services';
				}}
				onmouseleave={() => {
					visibleServicesMenu = false;
					hoveredItem = null;
				}}
			>
				<button
					type="button"
					class="group relative flex items-center gap-1 px-2 py-1 text-sm font-bold tracking-wider uppercase transition-colors duration-300 {isServicesActive
						? 'text-link-600'
						: 'text-ink-700'} hover:text-link-600"
					aria-expanded={visibleServicesMenu}
				>
					<span>{link.label}</span>
					<svg
						class="h-3.5 w-3.5 transition-transform duration-300 {visibleServicesMenu
							? 'rotate-180 text-link-500'
							: 'text-ink-400 group-hover:text-link-500'}"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
					<span
						class="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-link-500 transition-transform duration-300 group-hover:scale-x-100"
						class:scale-x-100={isServicesActive}
					></span>
				</button>

				{#if visibleServicesMenu}
					<div class="absolute top-full left-1/2 h-4 w-full -translate-x-1/2"></div>
					<div
						transition:fly={{ y: -10, duration: 250, easing: cubicOut }}
						class="absolute top-full left-1/2 z-50 mt-4 w-80 -translate-x-1/2 overflow-hidden rounded-2xl bg-surface-raised/98 p-2 shadow-2xl ring-1 ring-ink-200 backdrop-blur-xl"
					>
						<div
							class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-link-500/50 to-transparent"
						></div>

						{#each visibleServiceItems as service, idx}
							{@const isComingSoon = service.comingSoon === true}
							{@const isEnabled = !isComingSoon && !disabledServices.includes(service.href)}
							<div
								class="group flex w-full items-center justify-between rounded-xl transition-all duration-300 {isComingSoon
									? 'cursor-not-allowed opacity-60'
									: 'hover:bg-linear-to-r hover:from-link-50/50 hover:to-cat-4-50/50'}"
								class:opacity-60={!isComingSoon && isEditable && !isEnabled}
								class:bg-ink-50={!isComingSoon && isEditable && !isEnabled}
								title={isComingSoon ? 'В разработке' : undefined}
								transition:fly={{ y: -5, duration: 200, delay: idx * 40 }}
							>
								<a
									onclick={(e) => {
										if (isComingSoon) {
											e.preventDefault();
											return;
										}
										visibleServicesMenu = false;
									}}
									href={service.href}
									tabindex={isComingSoon ? -1 : undefined}
									aria-disabled={isComingSoon}
									class="flex flex-1 items-start gap-3 p-3 transition-all duration-300 {isComingSoon
										? 'pointer-events-none'
										: 'hover:translate-x-1'}"
									class:pointer-events-none={!isComingSoon && isEditable && !isEnabled}
								>
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-link-100/50 to-cat-4-100/50 text-link-600 transition-all duration-300 {isComingSoon
											? ''
											: 'group-hover:from-link-500 group-hover:to-cat-4-500 group-hover:text-on-accent group-hover:shadow-lg group-hover:shadow-link-500/25'}"
									>
										{#if service.icon === 'chat'}
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
												/>
											</svg>
										{:else if service.icon === 'design'}
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
												/>
											</svg>
										{:else if service.icon === 'ruler'}
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
												/>
											</svg>
										{:else if service.icon === 'project'}
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
												/>
											</svg>
										{:else}
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
												/>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												/>
											</svg>
										{/if}
									</div>
									<div class="flex-1">
										<div class="flex items-center gap-2">
											<p
												class="text-sm font-bold text-ink-900 transition-colors {isComingSoon
													? ''
													: 'group-hover:text-link-600'}"
											>
												{service.label}
											</p>
											{#if isEditable && !isEnabled && !isComingSoon}
												<span
													class="rounded bg-ink-200 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-ink-600 uppercase"
													>Откл.</span
												>
											{/if}
										</div>
										<p class="mt-0.5 text-[11px] leading-tight text-ink-500">{service.desc}</p>
									</div>
									{#if !isEditable && !isComingSoon}
										<svg
											class="h-4 w-4 self-center text-ink-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-link-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									{/if}
								</a>
								{#if isEditable}
									{#if isComingSoon}
										{@render comingSoonIndicator()}
									{:else}
										<div class="flex items-center pr-3">
											<button
												type="button"
												onclick={(e) => onToggleService(service.href, isEnabled, e)}
												class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-link-500 focus:ring-offset-2 focus:outline-none {isEnabled
													? 'bg-link-500'
													: 'bg-ink-300'}"
												title={isEnabled ? 'Скрыть услугу' : 'Показать услугу'}
											>
												<span
													class="pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-surface-raised shadow-sm ring-0 transition duration-200 ease-in-out {isEnabled
														? 'translate-x-4'
														: 'translate-x-0'}"
												>
												</span>
											</button>
										</div>
									{/if}
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{:else if link.label === 'Каталог'}
			<div
				role="group"
				class="relative flex h-full items-center"
				onmouseenter={() => {
					visibleCatalogMenu = true;
					hoveredItem = 'catalog';
				}}
				onmouseleave={() => {
					visibleCatalogMenu = false;
					hoveredItem = null;
				}}
			>
				<button
					type="button"
					class="group relative flex items-center gap-1 px-2 py-1 text-sm font-bold tracking-wider uppercase transition-colors duration-300 {isCatalogActive
						? 'text-link-600'
						: 'text-ink-700'} hover:text-link-600"
					aria-expanded={visibleCatalogMenu}
				>
					<span>{link.label}</span>
					<svg
						class="h-3.5 w-3.5 transition-transform duration-300 {visibleCatalogMenu
							? 'rotate-180 text-link-500'
							: 'text-ink-400 group-hover:text-link-500'}"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
					<span
						class="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-link-500 transition-transform duration-300 group-hover:scale-x-100"
						class:scale-x-100={isCatalogActive}
					></span>
				</button>

				{#if visibleCatalogMenu}
					<div class="absolute top-full left-1/2 h-4 w-full -translate-x-1/2"></div>
					<div
						transition:fly={{ y: -10, duration: 250, easing: cubicOut }}
						class="absolute top-full left-1/2 z-50 mt-4 w-80 -translate-x-1/2 overflow-hidden rounded-2xl bg-surface-raised/98 p-2 shadow-2xl ring-1 ring-ink-200 backdrop-blur-xl"
					>
						<div
							class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-link-500/50 to-transparent"
						></div>

						{#each visibleCatalogItems as item, idx}
							{@const isComingSoon = item.comingSoon === true}
							{@const isEnabled = !isComingSoon && !disabledRubrics.includes(item.href)}
							<div
								class="group flex w-full items-center justify-between rounded-xl transition-all duration-300 {isComingSoon
									? 'cursor-not-allowed opacity-60'
									: 'hover:bg-linear-to-r hover:from-link-50/50 hover:to-cat-4-50/50'}"
								class:opacity-60={!isComingSoon && isEditable && !isEnabled}
								class:bg-ink-50={!isComingSoon && isEditable && !isEnabled}
								title={isComingSoon ? 'В разработке' : undefined}
							>
								<a
									onclick={(e) => {
										if (isComingSoon) {
											e.preventDefault();
											return;
										}
										visibleCatalogMenu = false;
									}}
									href={item.href}
									tabindex={isComingSoon ? -1 : undefined}
									aria-disabled={isComingSoon}
									class="flex flex-1 items-start gap-3 p-3 transition-all duration-300 {isComingSoon
										? 'pointer-events-none'
										: 'hover:translate-x-1'}"
									class:pointer-events-none={!isComingSoon && isEditable && !isEnabled}
								>
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-link-100/50 to-cat-4-100/50 text-link-600 transition-all duration-300 {isComingSoon
											? ''
											: 'group-hover:from-link-500 group-hover:to-cat-4-500 group-hover:text-on-accent group-hover:shadow-lg group-hover:shadow-link-500/25'}"
									>
										{#if item.icon === 'sofa'}
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M20 12V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4M4 12v6a2 2 0 002 2h2m10-8V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0v6a2 2 0 01-2 2h-2M4 12h16m-16 0v-2a2 2 0 012-2h12a2 2 0 012 2v2"
												/>
											</svg>
										{:else if item.icon === 'surface'}
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M3 10h18M3 14h18m-9-4v8m-3-8v8m6-8v8M3 6h18a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z"
												/>
											</svg>
										{:else if item.icon === 'fridge'}
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h4m-4 4h4"
												/>
											</svg>
										{:else if item.icon === 'faucet'}
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
												/>
											</svg>
										{:else if item.icon === 'hinge'}
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m12 12a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
												/>
											</svg>
										{:else if item.icon === 'tiles'}
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
												/>
											</svg>
										{:else}
											<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M4 6h16M4 12h16m-7 6h7"
												/>
											</svg>
										{/if}
									</div>
									<div class="flex-1">
										<div class="flex items-center gap-2">
											<p
												class="text-sm font-bold text-ink-900 transition-colors {isComingSoon
													? ''
													: 'group-hover:text-link-600'}"
											>
												{item.label}
											</p>
											{#if isEditable && !isEnabled && !isComingSoon}
												<span
													class="rounded bg-ink-200 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-ink-600 uppercase"
													>Откл.</span
												>
											{/if}
										</div>
										<p class="mt-0.5 text-[11px] leading-tight text-ink-500">{item.desc}</p>
									</div>
									{#if !isEditable && !isComingSoon}
										<svg
											class="h-4 w-4 self-center text-ink-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-link-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									{/if}
								</a>
								{#if isEditable}
									{#if isComingSoon}
										{@render comingSoonIndicator()}
									{:else}
										<div class="flex items-center pr-3">
											<button
												type="button"
												onclick={(e) => onToggleRubric(item.href, isEnabled, e)}
												class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-link-500 focus:ring-offset-2 focus:outline-none {isEnabled
													? 'bg-link-500'
													: 'bg-ink-300'}"
												title={isEnabled ? 'Скрыть рубрику' : 'Показать рубрику'}
											>
												<span
													class="pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-surface-raised shadow-sm ring-0 transition duration-200 ease-in-out {isEnabled
														? 'translate-x-4'
														: 'translate-x-0'}"
												>
												</span>
											</button>
										</div>
									{/if}
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<a
				href={link.href}
				class="group relative px-2 py-1 text-sm font-bold tracking-wider uppercase transition-colors duration-300 {isLinkActive(
					link.href
				)
					? 'text-link-600'
					: 'text-ink-700'} hover:text-link-600"
				onmouseenter={() => (hoveredItem = link.href)}
				onmouseleave={() => (hoveredItem = null)}
			>
				<span>{link.label}</span>
				<span
					class="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-link-500 transition-transform duration-300 group-hover:scale-x-100"
					class:scale-x-100={isLinkActive(link.href)}
				></span>
			</a>
		{/if}
	{/each}
</nav>
