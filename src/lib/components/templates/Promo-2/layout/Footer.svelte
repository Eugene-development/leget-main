<script lang="ts">
	import ContentText from '../ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 2.Ф.1.1 — см. docs/architecture/component-articles-map.md
	import LayoutArticleSettings from '$lib/components/LayoutArticleSettings.svelte';
	import type { EditContext } from '$lib/utils/page-edit';
	import { auth } from '$lib/stores/auth';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import type { Snippet } from 'svelte';

	let {
		data = $bindable(),
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

	const siteName = $derived(editableText(data?.siteName, 'Фабрика'));
	const description = $derived(
		editableText(data?.description, 'Более 25 лет создаём мебель премиального качества.')
	);
	const phone = $derived(typeof data?.phone === 'string' ? data.phone : '');
	const email = $derived(typeof data?.email === 'string' ? data.email : '');
	const address = $derived(typeof data?.address === 'string' ? data.address : '');
	const hours = $derived(editableText(data?.hours, 'Пн–Пт: 9:00 — 18:00'));
	const copyright = $derived(
		editableText(data?.copyright, `© ${new Date().getFullYear()} Все права защищены.`)
	);
	const privacyLink = $derived(
		typeof data?.privacyLink === 'string' ? data.privacyLink : '/privacy'
	);
	const termsLink = $derived(typeof data?.termsLink === 'string' ? data.termsLink : '/terms');

	const allNavColumns = $derived(
		Array.isArray(data?.navColumns)
			? (data.navColumns as { title: string; links: { label: string; href: string }[] }[])
			: [
					{
						title: 'Каталог',
						links: [
							{ label: 'Фурнитура', href: '/furniture' },
							{ label: 'Фасады', href: '/facades' },
							{ label: 'Шкафы', href: '/wardrobes' },
							{ label: 'Кухни', href: '/kitchens' }
						]
					},
					{
						title: 'Компания',
						links: [
							{ label: 'О фабрике', href: '/about' },
							{ label: 'Вакансии', href: '/careers' },
							{ label: 'Дизайнерам', href: '/designers' }
						]
					},
					{
						title: 'Покупателям',
						links: [
							{ label: 'Стили', href: '/styles' },
							{ label: 'Акции', href: '/actions' },
							{ label: 'Салоны', href: '/showrooms' },
							{ label: 'Контакты', href: '/contact' }
						]
					}
				]
	);
	const navColumns = $derived(
		allNavColumns.map((column) => ({
			...column,
			links: column.links.filter((link) => link.href !== '/news')
		}))
	);
</script>

<footer class="relative bg-primary text-inverse">
	<div class="absolute top-6 right-6 z-[100]">
		<LayoutArticleSettings {editContext} {isEditable} type="Footer" title="Футер" />
	</div>
	<!-- Decorative Top Line -->
	<div class="h-px w-full bg-linear-to-r from-transparent via-accent to-transparent"></div>

	<!-- Main Footer Content -->
	<div class="p2-container mx-auto pt-16 pb-10 lg:pt-20 lg:pb-14">
		<div class="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-12 lg:gap-8">
			<!-- Brand Column -->
			<div class="col-span-2 lg:col-span-4">
				<a href="/" class="group inline-block">
					<span
						class="text-3xl font-medium tracking-[0.2em] text-white transition-opacity duration-300 group-hover:opacity-75 lg:text-4xl"
						style="font-family: var(--font-heading);"
					>
						<ContentText
							bind:data
							{editContext}
							{isEditable}
							componentType="Footer"
							scope="Footer"
							path={['siteName']}
							fallback={siteName}
							label="Текст футера"
							richText={false}
						/>
					</span>
				</a>
				<p class="mt-6 max-w-xs text-sm leading-relaxed text-white/60">
					<ContentText
						bind:data
						{editContext}
						{isEditable}
						componentType="Footer"
						scope="Footer"
						path={['description']}
						fallback={description}
						label="Текст футера"
						richText={false}
					/>
				</p>
			</div>

			<!-- Navigation Columns -->
			{#each navColumns as column, columnIndex}
				<div class="col-span-1 lg:col-span-2">
					<h4 class="text-xs text-white/40 uppercase">
						<ContentText
							bind:data
							{editContext}
							{isEditable}
							componentType="Footer"
							scope="Footer"
							path={['navColumns', columnIndex, 'title']}
							fallback={column.title}
							label="Текст футера"
							defaults={{ navColumns: allNavColumns }}
							richText={false}
						/>
					</h4>
					<ul class="mt-5 flex flex-col gap-3">
						{#each column.links as link}
							<li>
								<a
									href={link.href}
									class="text-sm text-white/65 transition-colors duration-300 hover:text-accent-light"
								>
									<ContentText
										bind:data
										{editContext}
										{isEditable}
										componentType="Footer"
										scope="Footer"
										path={[
											'navColumns',
											columnIndex,
											'links',
											allNavColumns[columnIndex].links.indexOf(link),
											'label'
										]}
										fallback={link.label}
										label="Текст футера"
										defaults={{ navColumns: allNavColumns }}
										richText={false}
									/>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}

			<!-- Contact Column -->
			<div class="col-span-1 lg:col-span-2">
				<h4 class="text-xs text-white/40 uppercase">
					<ContentText
						bind:data
						{editContext}
						{isEditable}
						componentType="Footer"
						scope="Footer"
						path={['copy', 'contactsLabel']}
						fallback={'Контакты'}
						label="Контакты"
						richText={false}
					/>
				</h4>
				<div class="mt-1 flex flex-col gap-1">
					{#if phone || isEditable}
						<a
							href="tel:{phone}"
							class="text-sm text-white/65 transition-colors duration-300 hover:text-accent-light"
						>
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="Footer"
								scope="Footer"
								path={['phone']}
								fallback={phone}
								label="Телефон"
								richText={false}
							/>
						</a>
					{/if}
					{#if email || isEditable}
						<a
							href="mailto:{email}"
							class="text-sm text-white/65 transition-colors duration-300 hover:text-accent-light"
						>
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="Footer"
								scope="Footer"
								path={['email']}
								fallback={email}
								label="Email"
								richText={false}
							/>
						</a>
					{/if}
				</div>

				{#if address || isEditable}
					<div class="mt-6">
						<p class="text-[10px] tracking-[0.2em] text-white/30 uppercase">
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="Footer"
								scope="Footer"
								path={['copy', 'addressLabel']}
								fallback={'Адрес'}
								label="Адрес"
								richText={false}
							/>
						</p>
						<p class="mt-1 text-sm text-white/65">
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="Footer"
								scope="Footer"
								path={['address']}
								fallback={address}
								label="Текст футера"
								richText={false}
							/>
						</p>
					</div>
				{/if}

				<div class="mt-6">
					<p class="text-[10px] tracking-[0.2em] text-white/30 uppercase">
						<ContentText
							bind:data
							{editContext}
							{isEditable}
							componentType="Footer"
							scope="Footer"
							path={['copy', 'hoursLabel']}
							fallback={'Режим работы'}
							label="Режим работы"
							richText={false}
						/>
					</p>
					<p class="mt-1 text-sm text-white/65">
						<ContentText
							bind:data
							{editContext}
							{isEditable}
							componentType="Footer"
							scope="Footer"
							path={['hours']}
							fallback={hours}
							label="Текст футера"
							richText={false}
						/>
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Bottom Bar -->
	<div class="border-t border-white/10">
		<div
			class="p2-container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:flex-row"
		>
			<p class="text-xs text-white/35">
				<ContentText
					bind:data
					{editContext}
					{isEditable}
					componentType="Footer"
					scope="Footer"
					path={['copyright']}
					fallback={copyright}
					label="Текст футера"
					richText={false}
				/>
			</p>
			<div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-end">
				<a
					href={privacyLink}
					class="text-xs text-white/35 transition-colors duration-300 hover:text-white/60"
				>
					<ContentText
						bind:data
						{editContext}
						{isEditable}
						componentType="Footer"
						scope="Footer"
						path={['copy', 'privacyText']}
						fallback={'Политика конфиденциальности'}
						label="Политика конфиденциальности"
						richText={false}
					/>
				</a>
				<a
					href={termsLink}
					class="text-xs text-white/35 transition-colors duration-300 hover:text-white/60"
				>
					<ContentText
						bind:data
						{editContext}
						{isEditable}
						componentType="Footer"
						scope="Footer"
						path={['copy', 'termsText']}
						fallback={'Пользовательское соглашение'}
						label="Пользовательское соглашение"
						richText={false}
					/>
				</a>
				<div class="flex items-center gap-2">
					<a
						href="/crm"
						class="text-xs text-on-dark/70 transition-colors hover:text-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
						><ContentText
							bind:data
							{editContext}
							{isEditable}
							componentType="Footer"
							scope="Footer"
							path={['copy', 'managerText']}
							fallback={'Менеджер'}
							label="Менеджер"
							richText={false}
						/></a
					>
					{@render pageSettings?.(
						'rounded-full border border-white/15 bg-white/5 text-white/65 hover:border-white/35 hover:bg-white/10 hover:text-white'
					)}
					<button
						data-metrika-goal="layout_footer_open_1"
						data-goal-action="open"
						type="button"
						onclick={handleAuthClick}
						class="h-9 rounded-full border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white/65 transition-colors hover:border-white/35 hover:bg-white/10 hover:text-white"
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
