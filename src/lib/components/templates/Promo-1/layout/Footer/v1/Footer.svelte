<script lang="ts">
	// Артикул: 1.Ф.1.1 — см. docs/architecture/component-articles-map.md
	//
	// Композиция: приёмная стойка. Верхний ярус — опись контактов слева и
	// подписка справа; ниже плотная полоса рубрик, ещё ниже строка копирайта.
	// Пик иерархии здесь — форма, а не заголовок: этим версия отличается от v3
	// (крупный дисплейный разворот) и от v2 (стеклянный тёмный CTA).
	//
	// Версия theme-aware, как v3 с 19.08.2026: цвет приходит семантическими
	// ролями (`p1-surface`, `p1-title`, `p1-field`), а не абсолютной шкалой
	// `ink-*`. Собственный дефолт темы — тёмный: блок задуман ink-секцией,
	// и переключатель обязан инвертировать исходный вид, а не ломать его.
	import { page } from '$app/state';
	import { auth } from '$lib/stores/auth';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { resolveSitePhone, sitePhoneHref } from '$lib/utils/site-phone';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { clientAuthModal } from '$lib/stores/client-auth.svelte';
	import { catalogItems } from '../../catalogItems';
	import { serviceItems } from '../../serviceItems';
	import { createContactVisibility } from '../contacts.svelte';
	import ContactToggle from '../ContactToggle.svelte';
	import type { Snippet } from 'svelte';
	import '../../../theme.css';

	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false,
		sitePhone = null,
		pageSettings
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
		sitePhone?: string | null;
		pageSettings?: Snippet<[triggerClass: string]>;
	} = $props();

	// Отключаемые строки контактов — логика общая для v1/v2/v3,
	// см. `../contacts.svelte.ts`.
	const contacts = createContactVisibility({
		getData: () => data,
		setData: (next) => (data = next),
		getEditContext: () => editContext
	});

	// Тема блока. Дефолт 'dark' — см. isLightBlock() в block-theme.ts.
	const isLight = $derived(isLightBlock(data, 'dark'));

	// Клиентская сессия (см. ClientAuthButtons) — залогиненному не нужны
	// ссылки «Логин»/«Регистрация», ему нужен путь в кабинет.
	const client = $derived(
		(page.data as { client?: { name: string; email: string } | null }).client ?? null
	);

	let email = $state('');
	let testbot = $state('');
	let formState = $state<'idle' | 'error' | 'done'>('idle');
	let subscribedTo = $state('');
	let showLoginModal = $state(false);

	const phone = $derived(resolveSitePhone(sitePhone));
	const phoneHref = $derived(sitePhoneHref(sitePhone));

	// Список отключённых в хэдере рубрик каталога. Прокидывается сюда из headerData
	// через ComponentResolver. Список рубрик — общий с Header (см. ./catalogItems),
	// поэтому фильтрация здесь полностью совпадает с хэдером.
	const disabledRubrics = $derived(
		Array.isArray(data?.disabledRubrics) ? (data.disabledRubrics as string[]) : []
	);
	// Аналогично для услуг (см. ./serviceItems) — единый список с хэдером.
	const disabledServices = $derived(
		Array.isArray(data?.disabledServices) ? (data.disabledServices as string[]) : []
	);
	// В футере показываем только опубликованные рубрики: comingSoon (например «Плитка»)
	// и явно отключённые в хэдере здесь не нужны — футер для посетителей.
	const visibleCatalogItems = $derived(
		catalogItems.filter((item) => item.comingSoon !== true && !disabledRubrics.includes(item.href))
	);
	// Та же логика для услуг — скрываем comingSoon и отключённые в хэдере.
	const visibleServiceItems = $derived(
		serviceItems.filter((item) => item.comingSoon !== true && !disabledServices.includes(item.href))
	);

	const infoItems = [
		{ href: '/actions', label: 'Акции' },
		{ href: '/testimonials', label: 'Отзывы' },
		{ href: '/about', label: 'О компании' },
		{ href: '/contacts', label: 'Контакты' }
	];
	const otherItems = [
		{ href: '/vacancy', label: 'Вакансии' },
		{ href: '/partnership', label: 'Партнёрство' }
	];

	// Подписка живёт на клиенте: приёмника у форм в продукте пока нет вообще —
	// главная форма шаблона (`ContactForm`, 1.3.1.1) тоже только выставляет флаг.
	// Поэтому здесь честная проверка ввода и явные состояния, а не имитация
	// отправки: показывать «отправляем…» там, где никто ничего не отправляет,
	// хуже, чем не показывать ничего.
	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (testbot) return;
		const value = email.trim();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
			formState = 'error';
			return;
		}
		subscribedTo = value;
		formState = 'done';
		email = '';
	}

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Footer', updated);
		data = updated;
	}

	function handleAuthClick() {
		if ($auth.isAuthenticated) {
			auth.logout();
		} else {
			showLoginModal = true;
		}
	}
</script>

<footer data-p1-theme={isLight ? 'light' : 'dark'} class="p1-surface p1-body p1-border border-t">
	<div class="mx-auto max-w-7xl px-6 pt-16 pb-8 sm:pt-24 lg:px-8 lg:pt-32">
		<div class="grid gap-14 lg:grid-cols-12 lg:gap-16">
			<!-- ── Опись контактов ────────────────────────────────────────── -->
			<div class="lg:col-span-5">
				{#if contacts.hasVisible || isEditable}
					<h3 class="p1-title-sub p1-title text-sm">Контакты</h3>

					<dl class="p1-border mt-5 border-t text-sm">
						{#if contacts.isVisible('phone') || isEditable}
							<div
								class="p1-border grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b py-3.5 {contacts.isVisible(
									'phone'
								)
									? ''
									: 'opacity-45'}"
							>
								<dt class="p1-label p1-muted uppercase">Телефон</dt>
								<dd class="flex items-baseline gap-3">
									<a href={phoneHref} class="p1-title p1-accent-hover transition-colors">
										{phone}
									</a>
									{#if isEditable}<ContactToggle
											{contacts}
											contactKey="phone"
											class="ml-auto self-center"
										/>{/if}
								</dd>
							</div>
						{/if}

						{#if contacts.isVisible('email') || isEditable}
							<div
								class="p1-border grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b py-3.5 {contacts.isVisible(
									'email'
								)
									? ''
									: 'opacity-45'}"
							>
								<dt class="p1-label p1-muted uppercase">Почта</dt>
								<dd class="flex items-baseline gap-3">
									<EditableField
										fieldKey="Footer.email"
										label="Email"
										value={String(data?.email ?? 'info@site.ru')}
										onSave={(val) => saveField('email', val)}
										{isEditable}
									>
										{#snippet children(displayValue)}
											<a
												href="mailto:{displayValue}"
												class="p1-title p1-accent-hover break-all transition-colors"
											>
												{displayValue}
											</a>
										{/snippet}
									</EditableField>
									{#if isEditable}<ContactToggle
											{contacts}
											contactKey="email"
											class="ml-auto self-center"
										/>{/if}
								</dd>
							</div>
						{/if}

						{#if contacts.isVisible('address') || isEditable}
							<div
								class="p1-border grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b py-3.5 {contacts.isVisible(
									'address'
								)
									? ''
									: 'opacity-45'}"
							>
								<dt class="p1-label p1-muted uppercase">Адрес</dt>
								<dd class="flex items-baseline gap-3">
									<EditableField
										fieldKey="Footer.address"
										label="Адрес"
										value={String(data?.address ?? 'г. Москва, ул. Ленина, д. 10')}
										onSave={(val) => saveField('address', val)}
										{isEditable}
										multiline
									>
										{#snippet children(displayValue)}
											<span class="p1-title leading-snug">{displayValue}</span>
										{/snippet}
									</EditableField>
									{#if isEditable}<ContactToggle
											{contacts}
											contactKey="address"
											class="ml-auto self-center"
										/>{/if}
								</dd>
							</div>
						{/if}

						{#if contacts.isVisible('hours') || isEditable}
							<div
								class="p1-border grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b py-3.5 {contacts.isVisible(
									'hours'
								)
									? ''
									: 'opacity-45'}"
							>
								<dt class="p1-label p1-muted uppercase">График</dt>
								<dd class="flex items-baseline gap-3">
									<EditableField
										fieldKey="Footer.hours"
										label="Режим работы"
										value={String(data?.hours ?? 'Пн–Вс: 9:00 — 21:00')}
										onSave={(val) => saveField('hours', val)}
										{isEditable}
									>
										{#snippet children(displayValue)}
											<span class="p1-title">{displayValue}</span>
										{/snippet}
									</EditableField>
									{#if isEditable}<ContactToggle
											{contacts}
											contactKey="hours"
											class="ml-auto self-center"
										/>{/if}
								</dd>
							</div>
						{/if}
					</dl>
				{/if}

				<!-- Мессенджеры. Знак чужого сервиса цвета не получает: правило
				     бренда разрешает его только на самом знаке, а тут знак
				     монохромный и живёт на роли акцента.
				     Условие на всю группу, а не только на плитки внутри: пустой
				     flex-контейнер сам по себе невидим, но `mt-6` над ним живой,
				     и у сайта без мессенджеров под описью оставалась дыра. -->
				{#if data?.telegram || data?.whatsapp || isEditable}
					<div class="mt-6 flex gap-3">
						<EditableField
							fieldKey="Footer.telegram"
							label="Telegram (ссылка)"
							value={String(data?.telegram ?? '')}
							onSave={(val) => saveField('telegram', val)}
							{isEditable}
						>
							{#snippet children(displayValue)}
								{#if displayValue || isEditable}
									<a
										href={displayValue || '#'}
										target="_blank"
										rel="noopener noreferrer"
										class="p1-border p1-muted p1-accent-hover p1-accent-border-hover flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
										title="Telegram"
										aria-label="Telegram"
									>
										<svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
											<path
												d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.97-.74 3.79-1.65 6.32-2.74 7.59-3.27 3.61-1.5 4.36-1.76 4.85-1.77.11 0 .35.03.5.15.13.1.17.24.18.33.01.06.02.19.01.29z"
											/>
										</svg>
									</a>
								{/if}
							{/snippet}
						</EditableField>

						<EditableField
							fieldKey="Footer.whatsapp"
							label="WhatsApp (ссылка)"
							value={String(data?.whatsapp ?? '')}
							onSave={(val) => saveField('whatsapp', val)}
							{isEditable}
						>
							{#snippet children(displayValue)}
								{#if displayValue || isEditable}
									<a
										href={displayValue || '#'}
										target="_blank"
										rel="noopener noreferrer"
										class="p1-border p1-muted p1-accent-hover p1-accent-border-hover flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
										title="WhatsApp"
										aria-label="WhatsApp"
									>
										<svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
											<path
												d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.459 3.473 1.332 4.984L2 22l5.201-1.365a9.927 9.927 0 004.811 1.253h.005c5.505 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.275 13.99c-.258.724-1.25 1.328-1.725 1.402-.455.07-1.018.106-2.905-.678-2.42-.999-3.992-3.463-4.113-3.624-.121-.161-.99-1.317-.99-2.51 0-1.192.624-1.778.845-2.02.221-.241.483-.301.644-.301.161 0 .322.002.462.008.148.006.347-.056.544.422.201.489.684 1.667.745 1.788.06.121.101.262.02.423-.08.161-.121.262-.241.402-.121.141-.254.314-.362.422-.121.121-.248.254-.108.496.141.242.624 1.026 1.339 1.663.921.821 1.699 1.074 1.94 1.195.242.121.382.101.524-.06.141-.161.604-.704.765-.946.161-.242.322-.201.544-.121.221.08 1.402.663 1.644.784.242.121.402.181.463.282.06.1.06.583-.198 1.308z"
											/>
										</svg>
									</a>
								{/if}
							{/snippet}
						</EditableField>
					</div>
				{/if}
			</div>

			<!-- ── Подписка ───────────────────────────────────────────────── -->
			<div class="lg:col-span-6 lg:col-start-7">
				<EditableField
					fieldKey="Footer.subscribeTitle"
					label="Заголовок подписки"
					value={String(data?.subscribeTitle ?? 'Подписка на новости')}
					onSave={(val) => saveField('subscribeTitle', val)}
					{isEditable}
				>
					{#snippet children(displayValue)}
						<h3 class="p1-title-sub p1-title text-2xl sm:text-3xl">{displayValue}</h3>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Footer.subscribeText"
					label="Текст подписки"
					value={String(
						data?.subscribeText ?? 'Подпишитесь на новости и будьте в курсе всех новинок и акций.'
					)}
					onSave={(val) => saveField('subscribeText', val)}
					{isEditable}
					multiline
				>
					{#snippet children(displayValue)}
						<p class="p1-muted mt-3 max-w-md text-sm/6">{displayValue}</p>
					{/snippet}
				</EditableField>

				{#if formState === 'done'}
					<p class="p1-title mt-7 text-sm/6" role="status">
						Готово — письма пойдут на <span class="p1-accent">{subscribedTo}</span>.
						<button
							type="button"
							class="p1-muted p1-accent-hover underline underline-offset-4 transition-colors"
							onclick={() => (formState = 'idle')}
						>
							Подписать другой адрес
						</button>
					</p>
				{:else}
					<form onsubmit={handleSubmit} class="mt-7" novalidate>
						<!-- Honeypot-поле (скрытое) -->
						<div class="hidden" aria-hidden="true">
							<label for="checkbot">Оставьте это поле пустым</label>
							<input
								type="text"
								id="checkbot"
								name="checkbot"
								bind:value={testbot}
								tabindex="-1"
								autocomplete="off"
							/>
						</div>

						<div class="flex flex-col gap-3 sm:flex-row">
							<label for="footer-email" class="sr-only">Адрес электронной почты</label>
							<input
								id="footer-email"
								type="email"
								name="email-address"
								autocomplete="email"
								bind:value={email}
								oninput={() => formState === 'error' && (formState = 'idle')}
								aria-invalid={formState === 'error'}
								aria-describedby={formState === 'error' ? 'footer-email-error' : undefined}
								placeholder="Введите вашу почту"
								class="p1-field w-full rounded-xl border px-4 py-3 text-base sm:max-w-sm sm:text-sm"
							/>
							<button
								type="submit"
								class="group flex items-center justify-center gap-2 rounded-xl bg-accent-surface px-6 py-3 text-sm font-semibold text-on-accent transition-colors ease-ui hover:bg-accent-surface-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p1-field-focus)]"
							>
								Подписаться
								<svg
									class="footer-v1-mark h-4 w-4 transition-transform duration-[var(--ds-motion-duration-ui)] group-hover:translate-x-0.5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
								</svg>
							</button>
						</div>

						{#if formState === 'error'}
							<p id="footer-email-error" class="p1-accent mt-3 text-sm/6" role="alert">
								Адрес не похож на почтовый — проверьте, есть ли в нём «@» и домен.
							</p>
						{/if}
					</form>
				{/if}
			</div>
		</div>

		<!-- ── Полоса рубрик ──────────────────────────────────────────────── -->
		<nav
			class="p1-border mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t pt-10 md:grid-cols-4 lg:mt-14"
			aria-label="Разделы сайта"
		>
			<div>
				<h3 class="p1-title-sub p1-title text-sm">Информация</h3>
				<ul role="list" class="mt-4 space-y-3">
					{#each infoItems as item}
						<li>
							<a href={item.href} class="p1-muted p1-accent-hover text-sm/6 transition-colors"
								>{item.label}</a
							>
						</li>
					{/each}
				</ul>
			</div>

			{#if visibleServiceItems.length > 0}
				<div>
					<h3 class="p1-title-sub p1-title text-sm">Услуги</h3>
					<ul role="list" class="mt-4 space-y-3">
						{#each visibleServiceItems as service}
							<li>
								<a href={service.href} class="p1-muted p1-accent-hover text-sm/6 transition-colors"
									>{service.label}</a
								>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if visibleCatalogItems.length > 0}
				<div>
					<h3 class="p1-title-sub p1-title text-sm">Каталог</h3>
					<ul role="list" class="mt-4 space-y-3">
						{#each visibleCatalogItems as item}
							<li>
								<a href={item.href} class="p1-muted p1-accent-hover text-sm/6 transition-colors"
									>{item.label}</a
								>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<div>
				<h3 class="p1-title-sub p1-title text-sm">Прочее</h3>
				<ul role="list" class="mt-4 space-y-3">
					{#each otherItems as item}
						<li>
							<a href={item.href} class="p1-muted p1-accent-hover text-sm/6 transition-colors"
								>{item.label}</a
							>
						</li>
					{/each}
					{#if client}
						<li>
							<a href="/cabinet" class="p1-muted p1-accent-hover text-sm/6 transition-colors"
								>Личный кабинет</a
							>
						</li>
					{:else}
						<li>
							<button
								type="button"
								onclick={() => clientAuthModal.open('login')}
								class="p1-muted p1-accent-hover text-sm/6 text-left transition-colors"
							>
								Логин
							</button>
						</li>
						<li>
							<button
								type="button"
								onclick={() => clientAuthModal.open('register')}
								class="p1-muted p1-accent-hover text-sm/6 text-left transition-colors"
							>
								Регистрация
							</button>
						</li>
					{/if}
				</ul>
			</div>
		</nav>

		<!-- ── Копирайт и вход ────────────────────────────────────────────── -->
		<div
			class="p1-border mt-12 flex flex-col items-center gap-4 border-t pt-8 md:flex-row md:justify-between"
		>
			<p class="p1-muted text-center text-sm/6 md:text-left">
				&copy; {new Date().getFullYear()} Компания "<EditableField
					fieldKey="Footer.siteName"
					label="Название в копирайте"
					value={!data?.siteName || data.siteName === 'Новострой'
						? 'Логотип'
						: String(data.siteName)}
					onSave={(val) => saveField('siteName', val)}
					{isEditable}
					inline
					>{#snippet children(displayValue)}<span>{displayValue}</span>{/snippet}</EditableField
				>". Все права защищены.
			</p>

			<div class="flex items-center gap-2">
				{@render pageSettings?.(
					'rounded-xl border p1-border p1-muted p1-accent-hover p1-accent-border-hover transition-colors'
				)}
				<button
					type="button"
					onclick={handleAuthClick}
					class="p1-border p1-muted p1-accent-hover p1-accent-border-hover h-9 rounded-xl border px-3 text-xs font-semibold transition-colors"
				>
					{$auth.isAuthenticated ? 'Выйти' : 'Админ'}
				</button>
			</div>
		</div>
	</div>
</footer>

{#if showLoginModal}
	<LoginModal onClose={() => (showLoginModal = false)} />
{/if}

<style>
	/* Штрих иконки принадлежит системе (`--ds-icon-stroke`). Презентационный
	   атрибут `stroke-width` var() не разбирает, поэтому правилом — как в
	   MebelBenefits/v2. */
	.footer-v1-mark {
		stroke-width: var(--ds-icon-stroke);
	}
</style>
