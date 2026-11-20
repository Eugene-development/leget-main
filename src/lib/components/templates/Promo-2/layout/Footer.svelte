<script lang="ts">
	import ContentText from '../ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 2.Ф.1.1 — см. docs/architecture/component-articles-map.md
	import ComponentImageManager from '$lib/components/ComponentImageManager.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import LayoutArticleSettings from '$lib/components/LayoutArticleSettings.svelte';
	import { blockTheme, type BlockTheme } from '$lib/utils/block-theme';
	import { saveLayoutData, type EditContext } from '$lib/utils/page-edit';
	import { createFooterAccount } from '$lib/stores/client-account.svelte';
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
	const footerAccount = createFooterAccount();
	const authButtonClass =
		'h-9 rounded-full border border-current/15 bg-current/5 px-4 text-xs font-semibold transition-colors hover:border-current/35 hover:bg-current/10';
	let savingSettings = $state(false);
	let themeError = $state(false);
	let widthDraft = $state<number>();
	let logoSizeError = $state('');
	const minLogoWidth = 24;
	const maxLogoWidth = 320;
	const initialSliderWidth = 80;
	const themes = [
		{ value: 'light', label: 'Светлая' },
		{ value: 'dark', label: 'Тёмная' }
	] as const;

	async function saveSettings(context: EditContext, next: Record<string, unknown>) {
		if (savingSettings) throw new Error('Дождитесь завершения сохранения');
		savingSettings = true;
		try {
			await saveLayoutData(context, 'Footer', next);
		} finally {
			savingSettings = false;
		}
	}

	async function setTheme(context: EditContext, value: BlockTheme) {
		if (savingSettings || theme === value) return;
		themeError = false;
		const next = { ...data, footerTheme: value };
		try {
			await saveSettings(context, next);
			data = next;
		} catch {
			themeError = true;
		}
	}

	async function saveLogoSize(context: EditContext) {
		if (savingSettings) return;
		logoSizeError = '';
		if (
			widthDraft === undefined ||
			!Number.isFinite(widthDraft) ||
			widthDraft < minLogoWidth ||
			widthDraft > maxLogoWidth
		) {
			logoSizeError = `Укажите ширину от ${minLogoWidth} до ${maxLogoWidth} пикселей.`;
			return;
		}

		const width = Math.round(widthDraft);
		try {
			await saveSettings(context, { ...data, footerLogoWidth: width });
			data = { ...data, footerLogoWidth: width };
			widthDraft = width;
		} catch {
			logoSizeError = 'Не удалось сохранить размер. Повторите попытку.';
		}
	}

	const siteName = $derived(editableText(data?.siteName, 'Фабрика'));
	const theme = $derived(blockTheme(data, 'dark', 'footerTheme'));
	const primaryLogoUrl = $derived(
		typeof data?.footerLogoUrl === 'string' ? data.footerLogoUrl.trim() : ''
	);
	const lightLogoUrl = $derived(
		typeof data?.footerLogoLightUrl === 'string' ? data.footerLogoLightUrl.trim() : ''
	);
	const logoUrl = $derived(theme === 'light' ? lightLogoUrl || primaryLogoUrl : primaryLogoUrl);
	const logoWidth = $derived.by(() => {
		const width = Number(data?.footerLogoWidth);
		return Number.isFinite(width) && width > 0
			? Math.min(maxLogoWidth, Math.max(minLogoWidth, width))
			: undefined;
	});
	const displayedLogoWidth = $derived(
		isEditable && widthDraft !== undefined && Number.isFinite(widthDraft)
			? Math.min(maxLogoWidth, Math.max(minLogoWidth, widthDraft))
			: logoWidth
	);
	$effect(() => {
		widthDraft = logoWidth;
	});

	let logoFailed = $state(false);
	$effect(() => {
		logoUrl;
		logoFailed = false;
	});

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
							{ label: 'Комплектация', href: '/equipment' },
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

{#snippet footerSettings(context: EditContext)}
	<fieldset disabled={savingSettings} class="min-w-0 disabled:opacity-60">
		<legend class="mb-2 text-sm font-medium text-on-dark">Тема футера</legend>
		<div class="grid grid-cols-2 gap-2">
			{#each themes as option (option.value)}
				<button
					type="button"
					aria-pressed={theme === option.value}
					data-goal-ignore="Изменение темы футера владельцем сайта"
					class="min-h-11 cursor-pointer rounded-xl border border-on-dark/15 px-3 text-sm font-medium text-on-dark hover:bg-on-dark/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400 disabled:cursor-wait aria-pressed:border-link-400/60 aria-pressed:bg-link-500/15"
					onclick={() => setTheme(context, option.value)}
				>
					{option.label}
				</button>
			{/each}
		</div>
		{#if themeError}
			<p role="alert" class="mt-2 text-sm text-cat-6-300">
				Не удалось сохранить тему. Повторите попытку.
			</p>
		{/if}
	</fieldset>

	<fieldset disabled={savingSettings} class="min-w-0 disabled:opacity-60">
		<legend class="mb-2 text-sm font-medium text-on-dark">Размер логотипа</legend>
		<div class="flex flex-col gap-3 text-on-dark">
			<label class="flex flex-col gap-2 text-sm">
				Ширина логотипа, px
				<input
					type="number"
					min={minLogoWidth}
					max={maxLogoWidth}
					step="1"
					placeholder="Авто"
					bind:value={widthDraft}
					oninput={() => (logoSizeError = '')}
					class="min-h-11 w-full rounded-xl border border-on-dark/20 bg-transparent p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400"
				/>
			</label>
			<input
				type="range"
				min={minLogoWidth}
				max={maxLogoWidth}
				step="1"
				bind:value={() => widthDraft ?? initialSliderWidth, (value) => (widthDraft = value)}
				oninput={() => (logoSizeError = '')}
				aria-label="Ширина логотипа"
				class="min-h-11 w-full cursor-pointer accent-link-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400"
			/>
			{#if logoSizeError}<p role="alert" class="text-sm">{logoSizeError}</p>{/if}
			<button
				type="button"
				onclick={() => saveLogoSize(context)}
				disabled={widthDraft === logoWidth}
				data-goal-ignore="Сохранение размера логотипа владельцем сайта"
				class="min-h-11 cursor-pointer rounded-xl bg-link-600 px-4 py-3 text-sm font-medium text-on-dark hover:bg-link-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400 disabled:cursor-default disabled:opacity-50"
			>
				Сохранить размер
			</button>
		</div>
	</fieldset>

	<fieldset disabled={savingSettings} class="min-w-0 disabled:opacity-60">
		<ComponentImageManager
			bind:data
			editContext={context}
			componentType="Footer"
			slots={[{ path: ['footerLogoLightUrl'] }, { path: ['footerLogoUrl'] }]}
			previewClassByPath={{
				footerLogoLightUrl: 'bg-surface-warm p-1',
				footerLogoUrl: 'bg-primary p-1'
			}}
			excludePathPrefixes={['logoUrl']}
			onSaveData={(next) => saveSettings(context, next)}
		/>
	</fieldset>
{/snippet}

<footer
	data-footer-theme={theme}
	class="relative {theme === 'light'
		? 'bg-surface-warm text-text-primary'
		: 'bg-primary text-inverse'}"
>
	<div class="absolute top-6 right-6 z-[100]">
		<LayoutArticleSettings
			{editContext}
			{isEditable}
			type="Footer"
			title="Футер"
			children={footerSettings}
		/>
	</div>
	<!-- Decorative Top Line -->
	<div class="h-px w-full bg-linear-to-r from-transparent via-accent to-transparent"></div>

	<!-- Main Footer Content -->
	<div class="p2-container mx-auto pt-16 pb-10 lg:pt-20 lg:pb-14">
		<div class="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-12 lg:gap-8">
			<!-- Brand Column -->
			<div class="col-span-2 lg:col-span-4">
				<a href="/" class="group inline-block max-w-full">
					{#if logoUrl && !logoFailed}
						<ImageFallback
							imageRole="preview"
							src={logoUrl}
							alt={siteName || 'Главная'}
							class={[
								'max-w-full object-contain object-left transition-opacity duration-300 group-hover:opacity-90',
								displayedLogoWidth === undefined ? 'h-12 w-auto lg:h-16' : 'h-auto',
								theme === 'light' && !lightLogoUrl && 'rounded-md bg-primary p-2'
							]}
							style={displayedLogoWidth === undefined
								? undefined
								: `width: ${displayedLogoWidth}px`}
							loading="lazy"
							onerror={() => (logoFailed = true)}
						/>
					{:else}
						<span
							class="text-3xl font-medium tracking-[0.2em] group-hover:underline lg:text-4xl"
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
					{/if}
				</a>
				<p class="mt-6 max-w-xs text-prose">
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
					<h4 class="text-xs uppercase">
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
								<a href={link.href} class="text-sm underline-offset-4 hover:underline">
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
				<h4 class="text-xs uppercase">
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
							href={phone ? `tel:${phone}` : undefined}
							class="text-sm wrap-anywhere underline-offset-4 hover:underline"
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
								placeholder="Добавить телефон"
								richText={false}
							/>
						</a>
					{/if}
					{#if email || isEditable}
						<a
							href={email ? `mailto:${email}` : undefined}
							class="text-sm wrap-anywhere underline-offset-4 hover:underline"
						>
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="Footer"
								scope="Footer"
								path={['email']}
								fallback={email}
								label="Почта"
								placeholder="Добавить почту"
								richText={false}
							/>
						</a>
					{/if}
				</div>

				{#if address || isEditable}
					<div class="mt-6">
						<p class="text-xs tracking-[0.2em] uppercase">
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
						<p class="mt-1 text-sm">
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
					<p class="text-xs tracking-[0.2em] uppercase">
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
					<p class="mt-1 text-sm">
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
	<div class="border-t border-current/15">
		<div
			class="p2-container mx-auto flex flex-col items-center justify-between gap-4 py-6 md:flex-row"
		>
			<p class="text-xs">
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
				<a href={privacyLink} class="text-xs underline-offset-4 hover:underline">
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
				<a href={termsLink} class="text-xs underline-offset-4 hover:underline">
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
						class="text-xs underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
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
						'rounded-full border border-current/15 bg-current/5 hover:border-current/35 hover:bg-current/10'
					)}
					{#if footerAccount.signedIn}
						<button
							type="button"
							class={authButtonClass}
							disabled={footerAccount.isLoggingOut}
							onclick={footerAccount.logout}
							data-goal-ignore="Выход из учётной записи">Выйти</button
						>
					{:else}
						<button
							type="button"
							class={authButtonClass}
							data-metrika-goal="layout_footer_open_1"
							data-goal-action="open"
							onclick={() => (showLoginModal = true)}>Админ</button
						>
					{/if}
				</div>
			</div>
		</div>
	</div>
</footer>

{#if showLoginModal}
	<LoginModal onClose={() => (showLoginModal = false)} />
{/if}
