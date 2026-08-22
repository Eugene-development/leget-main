<script lang="ts">
	// Артикул: 1.Б.1.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { page } from '$app/stores';
	import { uiStore } from '$lib/stores/ui.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import ClientAuthButtons from '$lib/components/ClientAuthButtons.svelte';
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
		{ href: '/about', label: 'О компании' },
		{ href: '/partnership', label: 'Партнёрство' },
		{ href: '/testimonials', label: 'Отзывы' },
		{ href: '/installment', label: 'Рассрочка' },
		{ href: '/guarantees', label: 'Гарантии' }
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
	<div class="z-50 hidden items-center bg-ink-950/90 px-4 backdrop-blur-sm sm:px-8 md:flex">
		<!-- Левая часть: навигационные ссылки -->
		<div class="hidden flex-1 justify-start lg:flex">
			<div class="flex items-center space-x-3.5 tracking-wide">
				{#each links as link, i}
					<a
						href={link.href}
						class={$page.url.pathname === link.href
							? 'text-xs whitespace-nowrap text-link-400'
							: 'text-xs whitespace-nowrap text-ink-50 transition-colors hover:text-link-300'}
					>
						{link.label}
					</a>
					{#if i < links.length - 1}
						<svg
							viewBox="0 0 2 2"
							class="inline h-0.5 w-0.5 shrink-0 fill-current text-link-500"
							aria-hidden="true"
						>
							<circle cx={1} cy={1} r={1} />
						</svg>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Правая часть: контакты + вход -->
		<div class="hidden flex-1 justify-between lg:flex">
			<div class="flex flex-1">
				<div class="items-center py-1.5 lg:flex lg:min-w-0 lg:flex-1 lg:justify-end">
					{#if phone}
						<div
							class="flex items-center justify-center px-2 py-1 text-xl leading-6 font-semibold xl:px-4"
						>
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
										class="text-base font-normal tracking-wide text-ink-50 antialiased transition-colors hover:text-brand-400"
									>
										{displayValue}
									</a>
								{/snippet}
							</EditableField>
						</div>
					{/if}

					{#if phone && email}
						<svg
							viewBox="0 0 2 2"
							class="mx-1 inline h-0.5 w-0.5 shrink-0 fill-current text-link-500"
							aria-hidden="true"
						>
							<circle cx={1} cy={1} r={1} />
						</svg>
					{/if}

					{#if email}
						<div
							class="flex items-center justify-center px-2 py-1 text-xl leading-6 font-semibold xl:px-4"
						>
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
										class="text-base font-normal tracking-wide text-ink-50 antialiased transition-colors hover:text-brand-400"
									>
										{displayValue}
									</a>
								{/snippet}
							</EditableField>
						</div>
					{/if}

					{#if phone || email}
						<svg
							viewBox="0 0 2 2"
							class="mx-1 inline h-0.5 w-0.5 shrink-0 fill-current text-link-500"
							aria-hidden="true"
						>
							<circle cx={1} cy={1} r={1} />
						</svg>
					{/if}

					<!-- Вход и регистрация клиента: состояние приходит из клиентской cookie -->
					<ClientAuthButtons />
				</div>
			</div>
		</div>
	</div>

	<!-- Mobile Banner -->
	<div
		class="z-50 flex items-center justify-between bg-ink-900/90 px-4 py-3 backdrop-blur-md lg:hidden"
	>
		<a href="/" class="flex items-center gap-2">
			<span class="sr-only">Главная</span>
			{#if data?.logoUrl}
				<ImageFallback class="h-6 w-auto" src={String(data.logoUrl)} alt="Логотип" />
			{:else}
				<div class="size-6 rounded-full bg-linear-to-tr from-link-400 to-cat-4-500 shadow-sm"></div>
			{/if}
		</a>

		<div class="flex">
			{#if phone}
				<a
					href="tel:{phone}"
					class="font-display rounded-full bg-on-dark/10 px-4 py-1.5 text-base font-light tracking-wide text-ink-50 antialiased backdrop-blur-sm"
				>
					{phone}
				</a>
			{/if}
		</div>

		<div class="flex items-center gap-1">
			<!-- Вход и регистрация клиента -->
			<ClientAuthButtons compact />

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
					class="size-5 text-ink-50"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
					<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
					></path>
				</svg>
			</a>

			<!-- Mobile menu toggle -->
			<button
				type="button"
				onclick={() => uiStore.toggleMenu()}
				class="relative z-20 flex items-center p-2 text-ink-50"
				aria-label="Меню"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{#if uiStore.menuOpen}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					{:else}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					{/if}
				</svg>
			</button>
		</div>
	</div>
</div>
