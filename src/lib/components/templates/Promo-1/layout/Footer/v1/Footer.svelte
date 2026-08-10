<script lang="ts">
	// Артикул: 1.Ф.1.1 — см. docs/architecture/component-articles-map.md
	import { auth } from '$lib/stores/auth';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { catalogItems } from '../../catalogItems';
	import { serviceItems } from '../../serviceItems';

	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
	} = $props();

	let formSubmitted = $state(false);
	let testbot = $state('');
	let showLoginModal = $state(false);

	const siteName = $derived(typeof data?.siteName === 'string' ? data.siteName : 'Логотип');

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

	// Простая обработка формы (без backend пока)
	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const email = formData.get('email-address');

		if (email && !testbot) {
			formSubmitted = true;
			console.log('Email submitted:', email);
		}
	}

	function handleAuthClick() {
		if ($auth.isAuthenticated) {
			auth.logout();
		} else {
			showLoginModal = true;
		}
	}

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Footer', updated);
		data = updated;
	}
</script>

<footer class="bg-ink-900">
	<div class="mx-auto max-w-7xl px-6 pt-16 pb-8 sm:pt-24 lg:px-8 lg:pt-32">
		<div class="xl:grid xl:grid-cols-3 xl:gap-8">
			<div class="flex flex-col items-start gap-4">
				<h3 class="p1-title-sub text-sm text-on-dark uppercase">Контакты</h3>
				<ul class="space-y-3.5 text-sm text-ink-400">
					<!-- Phone -->
					<li class="flex items-center gap-3">
						<svg
							class="h-5 w-5 shrink-0 text-cat-7-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
							/>
						</svg>
						<EditableField
							fieldKey="Footer.phone"
							label="Телефон"
							value={String(data?.phone ?? '+7 (999) 000-00-00')}
							onSave={(val) => saveField('phone', val)}
							{isEditable}
						>
							{#snippet children(displayValue)}
								<a
									href="tel:{displayValue.replace(/[^+\d]/g, '')}"
									class="transition-colors hover:text-on-dark"
								>
									{displayValue}
								</a>
							{/snippet}
						</EditableField>
					</li>

					<!-- Email -->
					<li class="flex items-center gap-3">
						<svg
							class="h-5 w-5 shrink-0 text-cat-7-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
						<EditableField
							fieldKey="Footer.email"
							label="Email"
							value={String(data?.email ?? 'info@site.ru')}
							onSave={(val) => saveField('email', val)}
							{isEditable}
						>
							{#snippet children(displayValue)}
								<a href="mailto:{displayValue}" class="transition-colors hover:text-on-dark">
									{displayValue}
								</a>
							{/snippet}
						</EditableField>
					</li>

					<!-- Address -->
					<li class="flex items-start gap-3">
						<svg
							class="mt-0.5 h-5 w-5 shrink-0 text-cat-7-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						<EditableField
							fieldKey="Footer.address"
							label="Адрес"
							value={String(data?.address ?? 'г. Москва, ул. Ленина, д. 10')}
							onSave={(val) => saveField('address', val)}
							{isEditable}
							multiline
						>
							{#snippet children(displayValue)}
								<span class="leading-snug">{displayValue}</span>
							{/snippet}
						</EditableField>
					</li>

					<!-- Working Hours -->
					<li class="flex items-center gap-3">
						<svg
							class="h-5 w-5 shrink-0 text-cat-7-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<EditableField
							fieldKey="Footer.hours"
							label="Режим работы"
							value={String(data?.hours ?? 'Пн–Вс: 9:00 — 21:00')}
							onSave={(val) => saveField('hours', val)}
							{isEditable}
						>
							{#snippet children(displayValue)}
								<span>{displayValue}</span>
							{/snippet}
						</EditableField>
					</li>
				</ul>

				<!-- Social Links -->
				<div class="mt-4 flex gap-4">
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
									class="flex h-9 w-9 items-center justify-center rounded-xl bg-on-dark/5 text-ink-400 shadow-sm transition-all duration-300 hover:bg-cat-7-500 hover:text-on-accent"
									title="Telegram"
								>
									<svg class="fill-currentColor h-4.5 w-4.5" viewBox="0 0 24 24">
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
									class="flex h-9 w-9 items-center justify-center rounded-xl bg-on-dark/5 text-ink-400 shadow-sm transition-all duration-300 hover:bg-cat-7-500 hover:text-on-accent"
									title="WhatsApp"
								>
									<svg class="fill-currentColor h-4.5 w-4.5" viewBox="0 0 24 24">
										<path
											d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.459 3.473 1.332 4.984L2 22l5.201-1.365a9.927 9.927 0 004.811 1.253h.005c5.505 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.275 13.99c-.258.724-1.25 1.328-1.725 1.402-.455.07-1.018.106-2.905-.678-2.42-.999-3.992-3.463-4.113-3.624-.121-.161-.99-1.317-.99-2.51 0-1.192.624-1.778.845-2.02.221-.241.483-.301.644-.301.161 0 .322.002.462.008.148.006.347-.056.544.422.201.489.684 1.667.745 1.788.06.121.101.262.02.423-.08.161-.121.262-.241.402-.121.141-.254.314-.362.422-.121.121-.248.254-.108.496.141.242.624 1.026 1.339 1.663.921.821 1.699 1.074 1.94 1.195.242.121.382.101.524-.06.141-.161.604-.704.765-.946.161-.242.322-.201.544-.121.221.08 1.402.663 1.644.784.242.121.402.181.463.282.06.1.06.583-.198 1.308z"
										/>
									</svg>
								</a>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			</div>
			<div class="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
				<div class="md:grid md:grid-cols-2 md:gap-8">
					<div>
						<h3 class="p1-title-sub text-sm/6 text-on-dark">Информация</h3>
						<ul role="list" class="mt-6 space-y-4">
							<li>
								<a href="/actions" class="text-sm/6 text-ink-400 hover:text-on-dark">Акции</a>
							</li>
							<li>
								<a href="/testimonials" class="text-sm/6 text-ink-400 hover:text-on-dark">Отзывы</a>
							</li>
							<li>
								<a href="/about" class="text-sm/6 text-ink-400 hover:text-on-dark">О компании</a>
							</li>

							<li>
								<a href="/contacts" class="text-sm/6 text-ink-400 hover:text-on-dark">Контакты</a>
							</li>
						</ul>
					</div>
					<div class="mt-10 md:mt-0">
						{#if visibleServiceItems.length > 0}
							<h3 class="p1-title-sub text-sm/6 text-on-dark">Услуги</h3>
							<ul role="list" class="mt-6 space-y-4">
								{#each visibleServiceItems as service}
									<li>
										<a href={service.href} class="text-sm/6 text-ink-400 hover:text-on-dark"
											>{service.label}</a
										>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>
				<div class="md:grid md:grid-cols-2 md:gap-8">
					<div>
						<h3 class="p1-title-sub text-sm/6 text-on-dark">Каталог</h3>
						{#if visibleCatalogItems.length > 0}
							<ul role="list" class="mt-6 space-y-4">
								{#each visibleCatalogItems as item}
									<li>
										<a href={item.href} class="text-sm/6 text-ink-400 hover:text-on-dark"
											>{item.label}</a
										>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
					<div class="mt-10 md:mt-0">
						<h3 class="p1-title-sub text-sm/6 text-on-dark">Прочее</h3>
						<ul role="list" class="mt-6 space-y-4">
							<li>
								<a href="/vacancy" class="text-sm/6 text-ink-400 hover:text-on-dark">Вакансии</a>
							</li>
							<li>
								<a href="/partnership" class="text-sm/6 text-ink-400 hover:text-on-dark"
									>Партнёрство</a
								>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
		{#if false}
			<div
				class="mt-16 border-t border-on-dark/10 pt-8 sm:mt-20 lg:mt-24 lg:flex lg:items-center lg:justify-between"
			>
				<div>
					<EditableField
						fieldKey="Footer.subscribeTitle"
						label="Заголовок подписки"
						value={String(data?.subscribeTitle ?? 'Подписка на новости')}
						onSave={(val) => saveField('subscribeTitle', val)}
						{isEditable}
					>
						{#snippet children(displayValue)}
							<h3 class="p1-title-sub text-sm/6 text-on-dark">{displayValue}</h3>
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
							<p class="mt-2 text-sm/6 text-ink-300">
								{displayValue}
							</p>
						{/snippet}
					</EditableField>
				</div>
				{#if formSubmitted}
					<span class="text-sm/6 text-ink-300">Спасибо за подписку!</span>
				{:else}
					<form onsubmit={handleSubmit} class="mt-6 sm:flex sm:max-w-md lg:mt-0">
						<label for="email-address" class="sr-only">Адрес электронной почты</label>
						<!-- Honeypot-поле (скрытое) -->
						<div class="hidden">
							<label for="checkbot" class="block text-sm font-medium text-ink-700"
								>Оставьте это поле пустым</label
							>
							<input
								type="text"
								id="checkbot"
								name="checkbot"
								bind:value={testbot}
								tabindex="-1"
								autocomplete="off"
								class="mt-1 block w-full rounded-md border border-ink-300 px-3 py-2 shadow-sm focus:border-cat-4-500 focus:ring-cat-4-500 focus:outline-none sm:text-sm"
							/>
						</div>
						<input
							type="email"
							name="email-address"
							id="email-address"
							autocomplete="email"
							required
							class="w-full min-w-0 rounded-md bg-on-dark/5 px-3 py-1.5 text-base text-on-dark outline-1 -outline-offset-1 outline-on-dark/10 placeholder:text-ink-500 focus:outline-2 focus:-outline-offset-2 focus:outline-cat-7-500 sm:w-56 sm:text-sm/6"
							placeholder="Введите вашу почту"
						/>
						<div class="mt-4 sm:mt-0 sm:ml-4 sm:shrink-0">
							<button
								type="submit"
								class="flex w-full items-center justify-center rounded-md bg-cat-7-500 px-3 py-2 text-sm font-semibold text-on-accent shadow-sm hover:bg-cat-7-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cat-7-500"
								>Отправить</button
							>
						</div>
					</form>
				{/if}
			</div>
		{/if}
		<div
			class="mt-8 flex flex-col items-center gap-4 border-t border-on-dark/10 pt-8 md:flex-row md:justify-between"
		>
			<div class="text-center md:text-left">
				<p class="text-sm/6 text-ink-400">
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
			</div>

			<div class="flex items-center gap-8">
				<p class="text-xs text-ink-500">
					Разработка проекта — <a
						href="https://leget.ru/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium text-ink-400 transition-colors hover:text-on-dark">Leget</a
					>
				</p>
				<button
					type="button"
					onclick={handleAuthClick}
					class="rounded-md bg-on-dark/5 px-3 py-1.5 text-xs font-semibold text-ink-300 shadow-sm ring-1 ring-on-dark/10 transition-all ring-inset hover:bg-on-dark/10 hover:text-on-dark"
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
