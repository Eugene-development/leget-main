<script lang="ts">
	import { page } from '$app/stores';

	let {
		data = {}
	}: {
		data: Record<string, unknown>;
	} = $props();

	const defaultLinks = [
		{ href: '/about',        label: 'О компании' },
		{ href: '/partnership',  label: 'Партнёрство' },
		{ href: '/testimonials', label: 'Отзывы' },
		{ href: '/installment',  label: 'Рассрочка' },
		{ href: '/guarantees',   label: 'Гарантии' },
	];

	const links = $derived(
		Array.isArray(data?.links) && (data.links as unknown[]).length > 0
			? (data.links as typeof defaultLinks)
			: defaultLinks
	);

	const phone = $derived(data?.phone ? String(data.phone) : '+7 (999) 000-00-00');
	const email = $derived(data?.email ? String(data.email) : 'info@leget.ru');
	const favoritesHref = $derived(String(data?.favoritesHref ?? '/favorites'));
</script>

<!-- Desktop Banner -->
<div class="z-50 hidden md:flex items-center bg-gray-950/90 backdrop-blur-sm px-4 sm:px-8">

	<!-- Левая часть: навигационные ссылки -->
	<div class="hidden flex-1 justify-start lg:flex">
		<div class="flex items-center space-x-3.5 tracking-wide">
			{#each links as link, i}
				<a
					href={link.href}
					class={$page.url.pathname === link.href
						? 'whitespace-nowrap text-xs text-red-400'
						: 'whitespace-nowrap text-xs text-gray-50 hover:text-red-400 transition-colors'}
				>
					{link.label}
				</a>
				{#if i < links.length - 1}
					<svg viewBox="0 0 2 2" class="inline h-0.5 w-0.5 fill-current text-sky-500 shrink-0" aria-hidden="true">
						<circle cx={1} cy={1} r={1} />
					</svg>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Правая часть: контакты + избранное -->
	<div class="hidden flex-1 justify-between lg:flex">
		<div class="flex flex-1">
			<div class="items-center py-1.5 lg:flex lg:min-w-0 lg:flex-1 lg:justify-end">
				{#if phone}
					<div class="flex items-center justify-center px-2 py-1 text-xl font-semibold leading-6 xl:px-4">
						<a
							href="tel:{phone}"
							class="text-base font-normal tracking-wide text-gray-50 antialiased hover:text-red-400 transition-colors"
						>
							{phone}
						</a>
					</div>
				{/if}

				{#if phone && email}
					<svg viewBox="0 0 2 2" class="mx-1 inline h-0.5 w-0.5 fill-current text-sky-500 shrink-0" aria-hidden="true">
						<circle cx={1} cy={1} r={1} />
					</svg>
				{/if}

				{#if email}
					<div class="flex items-center justify-center px-2 py-1 text-xl font-semibold leading-6 xl:px-4">
						<a
							href="mailto:{email}"
							class="text-base font-normal tracking-wide text-gray-50 antialiased hover:text-red-400 transition-colors"
						>
							{email}
						</a>
					</div>
				{/if}

				{#if phone || email}
					<svg viewBox="0 0 2 2" class="mx-1 inline h-0.5 w-0.5 fill-current text-sky-500 shrink-0" aria-hidden="true">
						<circle cx={1} cy={1} r={1} />
					</svg>
				{/if}

				<!-- Избранное -->
				<a
					href={favoritesHref}
					class="relative isolate z-20 flex items-center px-3 focus-visible:outline-offset-[-4px]"
				>
					<span class="sr-only">Избранное</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-5 text-gray-50 hover:text-red-400 transition-colors duration-300"
					>
						<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
						<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"></path>
					</svg>
				</a>
			</div>
		</div>
	</div>
</div>

<!-- Mobile Banner -->
<div class="z-50 flex items-center justify-between bg-gray-900/90 backdrop-blur-md px-1.5 py-2 lg:hidden">
	<a href="/" class="w-24 px-1">
		<span class="sr-only">Главная</span>
		{#if data?.logoUrl}
			<img class="size-7 w-auto" src={String(data.logoUrl)} alt="Логотип" />
		{:else}
			<span class="text-sm font-bold text-white">{String(data?.siteName ?? '')}</span>
		{/if}
	</a>

	<div class="flex">
		{#if phone}
			<a
				href="tel:{phone}"
				class="font-display text-lg font-light tracking-wide text-gray-50 antialiased bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm"
			>
				{phone}
			</a>
		{/if}
	</div>

	<div class="flex items-center w-24 justify-end">
		<!-- Избранное -->
		<a href={favoritesHref} class="relative isolate z-20 flex items-center px-3">
			<span class="sr-only">Избранное</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="size-5 text-gray-50"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
				<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"></path>
			</svg>
		</a>
	</div>
</div>
