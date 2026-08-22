<script lang="ts">
	// Артикул: 1.Б.1.2 — см. docs/architecture/component-articles-map.md
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

	// Те же поля/дефолты, что в v1 — редактирование и сохранение идентичны.
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
	<div class="relative z-50 hidden items-center bg-alt-night-bar px-4 sm:px-8 md:flex">
		<!-- Световая акцентная линия сверху -->
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-link-400/60 to-transparent"
		></div>

		<!-- Левая часть: навигационные ссылки с вертикальными разделителями -->
		<nav class="hidden flex-1 items-center justify-start gap-3 lg:flex">
			{#each links as link, i (link.href)}
				{#if i > 0}
					<span class="h-3 w-px bg-on-dark/15" aria-hidden="true"></span>
				{/if}
				<a
					href={link.href}
					class={$page.url.pathname === link.href
						? 'text-xs font-medium whitespace-nowrap text-link-300'
						: 'text-xs whitespace-nowrap text-on-dark/70 transition-colors duration-300 hover:text-on-dark'}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- Правая часть: телефон (glass-пилюля) + email + вход -->
		<div class="hidden flex-1 items-center justify-end gap-3 py-1.5 lg:flex">
			{#if phone}
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
							class="flex items-center gap-1.5 rounded-full bg-surface-raised/[0.06] px-3 py-1 text-xs font-semibold tracking-wide text-on-dark ring-1 ring-on-dark/10 transition-all duration-300 hover:ring-link-400/40"
						>
							<svg
								class="h-3 w-3 text-link-300"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
								/>
							</svg>
							{displayValue}
						</a>
					{/snippet}
				</EditableField>
			{/if}

			{#if email}
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
							class="text-xs whitespace-nowrap text-on-dark/55 transition-colors duration-300 hover:text-on-dark"
						>
							{displayValue}
						</a>
					{/snippet}
				</EditableField>
			{/if}

			<span class="h-3 w-px bg-on-dark/15" aria-hidden="true"></span>

			<!-- Вход и регистрация клиента: состояние приходит из клиентской cookie -->
			<ClientAuthButtons />
		</div>
	</div>

	<!-- Mobile Banner -->
	<div
		class="relative z-50 flex items-center justify-between bg-alt-night-bar-alt px-4 py-2.5 lg:hidden"
	>
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-link-400/60 to-transparent"
		></div>

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
					class="flex items-center gap-1.5 rounded-full bg-surface-raised/[0.06] px-3 py-1 text-xs font-semibold tracking-wide text-on-dark ring-1 ring-on-dark/10"
				>
					<svg
						class="h-3 w-3 text-link-300"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
						/>
					</svg>
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
					class="size-5 text-on-dark/80"
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
				class="relative z-20 flex items-center p-2 text-on-dark"
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
