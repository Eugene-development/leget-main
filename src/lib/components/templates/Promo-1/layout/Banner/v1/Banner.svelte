<script lang="ts">
	import { page } from '$app/stores';
	import { uiStore } from '$lib/stores/ui.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveLayoutData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveLayoutData(editContext, 'Header', updated);
		data = updated;
	}
</script>

<div>
<!-- Desktop Banner -->
<div class="z-50 hidden md:flex items-center bg-gray-950/90 backdrop-blur-sm px-4 sm:px-8">

	<!-- Левая часть: навигационные ссылки -->
	<div class="hidden flex-1 justify-start lg:flex">
		<div class="flex items-center space-x-3.5 tracking-wide">
			{#each links as link, i}
				<a
					href={link.href}
					class={$page.url.pathname === link.href
						? 'whitespace-nowrap text-xs text-sky-400'
						: 'whitespace-nowrap text-xs text-gray-50 hover:text-sky-300 transition-colors'}
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
						<EditableField
							fieldKey="Banner.phone"
							label="Телефон"
							value={phone}
							onSave={(val) => saveField('phone', val)}
							{isEditable}
						>
							{#snippet children(displayValue)}
								<a
									href="tel:{displayValue}"
									class="text-base font-normal tracking-wide text-gray-50 antialiased hover:text-red-400 transition-colors"
								>
									{displayValue}
								</a>
							{/snippet}
						</EditableField>
					</div>
				{/if}

				{#if phone && email}
					<svg viewBox="0 0 2 2" class="mx-1 inline h-0.5 w-0.5 fill-current text-sky-500 shrink-0" aria-hidden="true">
						<circle cx={1} cy={1} r={1} />
					</svg>
				{/if}

				{#if email}
					<div class="flex items-center justify-center px-2 py-1 text-xl font-semibold leading-6 xl:px-4">
						<EditableField
							fieldKey="Banner.email"
							label="Email"
							value={email}
							onSave={(val) => saveField('email', val)}
							{isEditable}
						>
							{#snippet children(displayValue)}
								<a
									href="mailto:{displayValue}"
									class="text-base font-normal tracking-wide text-gray-50 antialiased hover:text-red-400 transition-colors"
								>
									{displayValue}
								</a>
							{/snippet}
						</EditableField>
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
<div class="z-50 flex items-center justify-between bg-gray-900/90 backdrop-blur-md px-4 py-3 lg:hidden">
	<a href="/" class="flex items-center gap-2">
		<span class="sr-only">Главная</span>
		{#if data?.logoUrl}
			<img class="h-6 w-auto" src={String(data.logoUrl)} alt="Логотип" />
		{:else}
			<div class="size-6 rounded-full bg-linear-to-tr from-sky-400 to-indigo-500 shadow-sm"></div>
		{/if}
	</a>

	<div class="flex">
		{#if phone}
			<a
				href="tel:{phone}"
				class="font-display text-base font-light tracking-wide text-gray-50 antialiased bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm"
			>
				{phone}
			</a>
		{/if}
	</div>

	<div class="flex items-center gap-1">
		<!-- Избранное -->
		<a href={favoritesHref} class="relative isolate z-20 flex items-center p-2">
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

		<!-- Mobile menu toggle -->
		<button
			type="button"
			onclick={() => uiStore.toggleMenu()}
			class="relative z-20 flex items-center p-2 text-gray-50"
			aria-label="Меню"
		>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				{#if uiStore.menuOpen}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				{/if}
			</svg>
		</button>
	</div>
	</div>
</div>
