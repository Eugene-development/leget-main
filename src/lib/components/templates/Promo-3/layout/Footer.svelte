<script lang="ts">
	// Артикул: 3.Ф.1.1 — см. docs/architecture/component-articles-map.md
	import LayoutArticleSettings from '$lib/components/LayoutArticleSettings.svelte';
	import type { EditContext } from '$lib/utils/page-edit';
	import { auth } from '$lib/stores/auth';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import type { Snippet } from 'svelte';

	let {
		data,
		editContext = null,
		isEditable = false,
		pageSettings
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
		pageSettings?: Snippet<[triggerClass: string]>;
	} = $props();

	let showLoginModal = $state(false);

	function handleAuthClick() {
		if ($auth.isAuthenticated) auth.logout();
		else showLoginModal = true;
	}

	const siteName = $derived(typeof data?.siteName === 'string' ? data.siteName : 'PLITKA');
	const siteTagline = $derived(
		typeof data?.siteTagline === 'string' ? data.siteTagline : 'Плитка & Дизайн'
	);
	const description = $derived(
		typeof data?.description === 'string'
			? data.description
			: 'Качественная плитка для вашего интерьера. Широкий ассортимент коллекций от ведущих мировых и российских производителей.'
	);
	const copyright = $derived(
		typeof data?.copyright === 'string'
			? data.copyright
			: `© ${new Date().getFullYear()} ${siteName}. Все права защищены.`
	);
	const privacyLink = $derived(
		typeof data?.privacyLink === 'string' ? data.privacyLink : '/privacy'
	);
	const termsLink = $derived(typeof data?.termsLink === 'string' ? data.termsLink : '/terms');

	const navColumns = $derived(
		Array.isArray(data?.navColumns)
			? (data.navColumns as { title: string; links: { label: string; href: string }[] }[])
			: [
					{
						title: 'Каталог',
						links: [
							{ label: 'Настенная плитка', href: '/catalog/wall' },
							{ label: 'Напольная плитка', href: '/catalog/floor' },
							{ label: 'Керамогранит', href: '/catalog/porcelain' },
							{ label: 'Мозаика', href: '/catalog/mosaic' }
						]
					},
					{
						title: 'Коллекции',
						links: [
							{ label: 'Новинки', href: '/collections/new' },
							{ label: 'Мрамор', href: '/collections/marble' },
							{ label: 'Минимализм', href: '/collections/minimal' },
							{ label: 'Лофт', href: '/collections/loft' }
						]
					},
					{
						title: 'Компания',
						links: [
							{ label: 'Контакты', href: '/contacts' },
							{ label: 'Услуги', href: '/services' },
							{ label: 'Вакансии', href: '/vacancies' },
							{ label: 'О компании', href: '/about' }
						]
					}
				]
	);
</script>

<footer class="relative border-t border-surface-700/50 bg-surface-900">
	<div class="absolute top-6 right-6 z-[100]">
		<LayoutArticleSettings {editContext} {isEditable} type="Footer" title="Футер" />
	</div>
	<!-- Gradient divider line -->
	<div
		class="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-accent-500/50 to-transparent"
	></div>

	<div class="px-10 pt-16 pb-8 lg:px-24 xl:px-32">
		<div class="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
			<!-- Brand column -->
			<div class="lg:col-span-2">
				<a href="/" class="group inline-flex items-center gap-3">
					<div
						class="flex size-10 items-center justify-center rounded-lg border border-accent-500/30 bg-accent-500/10 transition-all duration-300 group-hover:border-accent-500"
					>
						<svg
							viewBox="0 0 24 24"
							class="size-5 fill-none stroke-accent-500 stroke-2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="3" y="3" width="8" height="8" rx="1" />
							<rect x="13" y="3" width="8" height="8" rx="1" />
							<rect x="3" y="13" width="8" height="8" rx="1" />
							<rect x="13" y="13" width="8" height="8" rx="1" />
						</svg>
					</div>
					<div>
						<span class="font-display text-xl font-bold tracking-wider text-surface-50 uppercase"
							>{siteName}</span
						>
						<span class="block text-[10px] font-medium tracking-[0.3em] text-surface-300 uppercase"
							>{siteTagline}</span
						>
					</div>
				</a>
				<p class="mt-6 max-w-sm text-sm leading-relaxed text-surface-300">{description}</p>
			</div>

			<!-- Link columns -->
			{#each navColumns as column}
				<div>
					<h4 class="mb-5 text-sm text-surface-50 uppercase">
						{column.title}
					</h4>
					<ul class="flex flex-col gap-3">
						{#each column.links as link}
							<li>
								<a
									href={link.href}
									class="text-sm text-surface-300 transition-colors duration-200 hover:text-accent-500"
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<!-- Bottom bar -->
		<div
			class="mt-16 flex flex-col items-center justify-between gap-4 border-t border-surface-700/50 pt-8 md:flex-row"
		>
			<p class="text-xs text-surface-300">{copyright}</p>
			<div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-end">
				<a
					href={privacyLink}
					class="text-xs text-surface-300 transition-colors hover:text-surface-200"
					>Политика конфиденциальности</a
				>
				<a
					href={termsLink}
					class="text-xs text-surface-300 transition-colors hover:text-surface-200"
					>Пользовательское соглашение</a
				>
				<div class="flex items-center gap-2">
					{@render pageSettings?.(
						'rounded-lg border border-surface-600/60 bg-surface-800/70 text-surface-300 hover:border-accent-500/60 hover:text-accent-500'
					)}
					<button
						type="button"
						onclick={handleAuthClick}
						class="h-9 rounded-lg border border-surface-600/60 bg-surface-800/70 px-4 text-xs font-semibold text-surface-300 transition-colors hover:border-accent-500/60 hover:text-accent-500"
					>
						{$auth.isAuthenticated ? 'Выйти' : 'Админ'}
					</button>
				</div>
			</div>
		</div>
	</div>
</footer>

{#if showLoginModal}
	<LoginModal onClose={() => (showLoginModal = false)} />
{/if}
