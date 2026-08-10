<script lang="ts">
	// Артикул: 1.Ф.1.2 — см. docs/architecture/component-articles-map.md
	import { auth } from '$lib/stores/auth';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { catalogItems } from '../../catalogItems';
	import { serviceItems } from '../../serviceItems';
	import type { Action } from 'svelte/action';

	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
	} = $props();

	let showLoginModal = $state(false);

	// Те же поля и дефолты, что в v1 — редактирование и сохранение идентичны.
	const siteName = $derived(
		typeof data?.siteName === 'string' && data.siteName && data.siteName !== 'Новострой'
			? data.siteName
			: 'Логотип'
	);
	const phone = $derived(String(data?.phone ?? '+7 (999) 000-00-00'));
	const phoneHref = $derived('tel:' + phone.replace(/[^+\d]/g, ''));
	const email = $derived(String(data?.email ?? 'info@site.ru'));
	const address = $derived(String(data?.address ?? 'г. Москва, ул. Ленина, д. 10'));
	const hours = $derived(String(data?.hours ?? 'Пн–Вс: 9:00 — 21:00'));
	const telegram = $derived(String(data?.telegram ?? ''));
	const whatsapp = $derived(String(data?.whatsapp ?? ''));

	// Списки рубрик/услуг общие с хэдером (см. ../../catalogItems, ../../serviceItems).
	const disabledRubrics = $derived(
		Array.isArray(data?.disabledRubrics) ? (data.disabledRubrics as string[]) : []
	);
	const disabledServices = $derived(
		Array.isArray(data?.disabledServices) ? (data.disabledServices as string[]) : []
	);
	const visibleCatalogItems = $derived(
		catalogItems.filter((item) => item.comingSoon !== true && !disabledRubrics.includes(item.href))
	);
	const visibleServiceItems = $derived(
		serviceItems.filter((item) => item.comingSoon !== true && !disabledServices.includes(item.href))
	);

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

	// Появление при входе в viewport. Только transform/opacity, без scroll-listener'ов.
	// Стаггер задаётся через data-reveal-delay. Уважает prefers-reduced-motion.
	const reveal: Action<HTMLElement> = (node) => {
		const delay = Number(node.dataset.revealDelay ?? 0);
		const reduce =
			typeof window !== 'undefined' &&
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce || typeof IntersectionObserver === 'undefined') {
			node.style.opacity = '1';
			return {};
		}
		node.style.opacity = '0';
		node.style.transform = 'translateY(28px)';
		node.style.transition = `opacity .9s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .9s cubic-bezier(.16,1,.3,1) ${delay}ms`;
		node.style.willChange = 'opacity, transform';
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						node.style.opacity = '1';
						node.style.transform = 'none';
						io.unobserve(node);
					}
				}
			},
			{ threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
		);
		io.observe(node);
		return {
			destroy() {
				io.disconnect();
			}
		};
	};
</script>

<footer class="font-sans-premium relative overflow-hidden bg-surface-inverse text-on-dark">
	<!-- Декоративный фон: точечная сетка + мягкие световые орбы -->
	<div class="footer-mesh-v2 pointer-events-none absolute inset-0"></div>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-cat-6-500/10 blur-[120px]"
	></div>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full bg-link-500/[0.07] blur-[140px]"
	></div>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-on-dark/15 to-transparent"
	></div>

	<div class="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:py-32">
		<!-- Верх: Editorial Split — бренд-заявка слева, контакты + навигация справа -->
		<div class="grid gap-16 lg:grid-cols-12 lg:gap-12">
			<!-- ЛЕВО: wordmark + CTA + соцсети -->
			<div class="lg:col-span-5" use:reveal>
				<span
					class="inline-flex items-center gap-2 rounded-full border border-on-dark/10 bg-surface-raised/[0.03] px-3 py-1 text-[10px] font-medium tracking-[0.25em] text-on-dark/55 uppercase"
				>
					<span class="h-1 w-1 rounded-full bg-cat-6-400"></span>
					Связаться с нами
				</span>

				<h2 class="font-display mt-7 text-5xl sm:text-6xl lg:text-7xl">
					<EditableField
						fieldKey="Footer.siteName"
						label="Название компании"
						value={siteName}
						onSave={(val) => saveField('siteName', val)}
						{isEditable}
					>
						{#snippet children(displayValue)}
							<span
								class="bg-gradient-to-b from-surface-raised to-surface-raised/70 bg-clip-text text-transparent"
								>{displayValue}</span
							>
						{/snippet}
					</EditableField>
				</h2>

				<p class="mt-6 max-w-md text-sm leading-relaxed text-on-dark/55">
					Изготовление и монтаж мебели под ключ. Проектируем, производим и собираем — с гарантией и
					по фиксированной цене.
				</p>

				<!-- CTA: «кнопка в кнопке» -->
				<a
					href={phoneHref}
					class="group/cta mt-9 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cat-6-500 to-cat-7-600 px-6 py-3 text-sm font-semibold text-on-accent shadow-[0_8px_30px] shadow-cat-6-500/25 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_10px_40px] hover:shadow-cat-6-500/35 active:scale-[0.98]"
				>
					Позвонить
					<span
						class="flex h-7 w-7 items-center justify-center rounded-full bg-scrim/15 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
					>
						<svg
							class="h-3.5 w-3.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M7 17 17 7M9 7h8v8" />
						</svg>
					</span>
				</a>

				<!-- Соцсети: glass-капсулы -->
				<div class="mt-8 flex items-center gap-3">
					<EditableField
						fieldKey="Footer.telegram"
						label="Telegram (ссылка)"
						value={telegram}
						onSave={(val) => saveField('telegram', val)}
						{isEditable}
					>
						{#snippet children(displayValue)}
							{#if displayValue || isEditable}
								<a
									href={displayValue || '#'}
									target="_blank"
									rel="noopener noreferrer"
									title="Telegram"
									class="flex h-11 w-11 items-center justify-center rounded-2xl border border-on-dark/10 bg-surface-raised/[0.03] text-on-dark/70 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-cat-6-400/40 hover:bg-cat-6-500/10 hover:text-on-accent active:scale-[0.95]"
								>
									<svg class="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
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
						value={whatsapp}
						onSave={(val) => saveField('whatsapp', val)}
						{isEditable}
					>
						{#snippet children(displayValue)}
							{#if displayValue || isEditable}
								<a
									href={displayValue || '#'}
									target="_blank"
									rel="noopener noreferrer"
									title="WhatsApp"
									class="flex h-11 w-11 items-center justify-center rounded-2xl border border-on-dark/10 bg-surface-raised/[0.03] text-on-dark/70 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-cat-6-400/40 hover:bg-cat-6-500/10 hover:text-on-accent active:scale-[0.95]"
								>
									<svg class="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
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

			<!-- ПРАВО: контактная капсула (double-bezel) + колонки навигации -->
			<div class="lg:col-span-7" use:reveal data-reveal-delay="120">
				<div
					class="rounded-[1.75rem] border border-on-dark/10 bg-surface-raised/[0.025] p-1.5 shadow-[0_20px_60px] shadow-scrim/45"
				>
					<div
						class="rounded-[calc(1.75rem-0.375rem)] bg-surface-inverse/80 p-6 shadow-[inset_0_1px_0] shadow-on-dark/6 sm:p-8"
					>
						<div class="grid gap-5 sm:grid-cols-2">
							<!-- Телефон -->
							<div class="flex items-center gap-4">
								<span
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-on-dark/10 bg-surface-raised/[0.03] text-cat-6-300"
								>
									<svg
										class="h-[18px] w-[18px]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.4"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
										/>
									</svg>
								</span>
								<div class="min-w-0">
									<div class="text-[10px] font-medium tracking-[0.2em] text-on-dark/40 uppercase">
										Телефон
									</div>
									<EditableField
										fieldKey="Footer.phone"
										label="Телефон"
										value={phone}
										onSave={(val) => saveField('phone', val)}
										{isEditable}
									>
										{#snippet children(displayValue)}
											<a
												href={phoneHref}
												class="text-sm text-on-dark/85 transition-colors duration-300 hover:text-on-dark"
												>{displayValue}</a
											>
										{/snippet}
									</EditableField>
								</div>
							</div>

							<!-- Email -->
							<div class="flex items-center gap-4">
								<span
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-on-dark/10 bg-surface-raised/[0.03] text-cat-6-300"
								>
									<svg
										class="h-[18px] w-[18px]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.4"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								</span>
								<div class="min-w-0">
									<div class="text-[10px] font-medium tracking-[0.2em] text-on-dark/40 uppercase">
										Почта
									</div>
									<EditableField
										fieldKey="Footer.email"
										label="Email"
										value={email}
										onSave={(val) => saveField('email', val)}
										{isEditable}
									>
										{#snippet children(displayValue)}
											<a
												href="mailto:{displayValue}"
												class="text-sm break-all text-on-dark/85 transition-colors duration-300 hover:text-on-dark"
												>{displayValue}</a
											>
										{/snippet}
									</EditableField>
								</div>
							</div>

							<!-- Адрес -->
							<div class="flex items-start gap-4 sm:col-span-2">
								<span
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-on-dark/10 bg-surface-raised/[0.03] text-cat-6-300"
								>
									<svg
										class="h-[18px] w-[18px]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.4"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
								</span>
								<div class="min-w-0">
									<div class="text-[10px] font-medium tracking-[0.2em] text-on-dark/40 uppercase">
										Адрес
									</div>
									<EditableField
										fieldKey="Footer.address"
										label="Адрес"
										value={address}
										onSave={(val) => saveField('address', val)}
										{isEditable}
										multiline
									>
										{#snippet children(displayValue)}
											<span class="text-sm leading-snug text-on-dark/85">{displayValue}</span>
										{/snippet}
									</EditableField>
								</div>
							</div>

							<!-- Режим работы -->
							<div class="flex items-center gap-4 sm:col-span-2">
								<span
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-on-dark/10 bg-surface-raised/[0.03] text-cat-6-300"
								>
									<svg
										class="h-[18px] w-[18px]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.4"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</span>
								<div class="min-w-0">
									<div class="text-[10px] font-medium tracking-[0.2em] text-on-dark/40 uppercase">
										Режим работы
									</div>
									<EditableField
										fieldKey="Footer.hours"
										label="Режим работы"
										value={hours}
										onSave={(val) => saveField('hours', val)}
										{isEditable}
									>
										{#snippet children(displayValue)}
											<span class="text-sm text-on-dark/85">{displayValue}</span>
										{/snippet}
									</EditableField>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Колонки навигации -->
				<div class="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
					<div>
						<h3 class="p1-title-sub text-[10px] text-on-dark/40 uppercase">Информация</h3>
						<ul class="mt-5 space-y-3.5">
							<li>
								<a
									href="/actions"
									class="group/link relative inline-block text-sm text-on-dark/60 transition-colors duration-500 hover:text-on-dark"
								>
									Акции
									<span
										class="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-cat-6-400 to-cat-7-500 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:w-full"
									></span>
								</a>
							</li>
							<li>
								<a
									href="/testimonials"
									class="group/link relative inline-block text-sm text-on-dark/60 transition-colors duration-500 hover:text-on-dark"
								>
									Отзывы
									<span
										class="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-cat-6-400 to-cat-7-500 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:w-full"
									></span>
								</a>
							</li>
							<li>
								<a
									href="/about"
									class="group/link relative inline-block text-sm text-on-dark/60 transition-colors duration-500 hover:text-on-dark"
								>
									О компании
									<span
										class="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-cat-6-400 to-cat-7-500 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:w-full"
									></span>
								</a>
							</li>
							<li>
								<a
									href="/contacts"
									class="group/link relative inline-block text-sm text-on-dark/60 transition-colors duration-500 hover:text-on-dark"
								>
									Контакты
									<span
										class="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-cat-6-400 to-cat-7-500 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:w-full"
									></span>
								</a>
							</li>
						</ul>
					</div>

					<div>
						{#if visibleServiceItems.length > 0}
							<h3 class="p1-title-sub text-[10px] text-on-dark/40 uppercase">Услуги</h3>
							<ul class="mt-5 space-y-3.5">
								{#each visibleServiceItems as service}
									<li>
										<a
											href={service.href}
											class="group/link relative inline-block text-sm text-on-dark/60 transition-colors duration-500 hover:text-on-dark"
										>
											{service.label}
											<span
												class="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-cat-6-400 to-cat-7-500 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:w-full"
											></span>
										</a>
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<div>
						{#if visibleCatalogItems.length > 0}
							<h3 class="p1-title-sub text-[10px] text-on-dark/40 uppercase">Каталог</h3>
							<ul class="mt-5 space-y-3.5">
								{#each visibleCatalogItems as item}
									<li>
										<a
											href={item.href}
											class="group/link relative inline-block text-sm text-on-dark/60 transition-colors duration-500 hover:text-on-dark"
										>
											{item.label}
											<span
												class="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-cat-6-400 to-cat-7-500 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:w-full"
											></span>
										</a>
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<div>
						<h3 class="p1-title-sub text-[10px] text-on-dark/40 uppercase">Прочее</h3>
						<ul class="mt-5 space-y-3.5">
							<li>
								<a
									href="/vacancy"
									class="group/link relative inline-block text-sm text-on-dark/60 transition-colors duration-500 hover:text-on-dark"
								>
									Вакансии
									<span
										class="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-cat-6-400 to-cat-7-500 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:w-full"
									></span>
								</a>
							</li>
							<li>
								<a
									href="/partnership"
									class="group/link relative inline-block text-sm text-on-dark/60 transition-colors duration-500 hover:text-on-dark"
								>
									Партнёрство
									<span
										class="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-cat-6-400 to-cat-7-500 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:w-full"
									></span>
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>

		<!-- Низ: копирайт + авторизация -->
		<div
			class="mt-20 flex flex-col gap-5 border-t border-on-dark/10 pt-8 md:flex-row md:items-center md:justify-between"
		>
			<p class="text-sm text-on-dark/45">
				&copy; {new Date().getFullYear()}
				{siteName}. Все права защищены.
			</p>
			<div class="flex items-center gap-6">
				<p class="text-xs text-on-dark/35">
					Разработка — <a
						href="https://leget.ru/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium text-on-dark/55 transition-colors duration-300 hover:text-on-dark"
						>Leget</a
					>
				</p>
				<button
					type="button"
					onclick={handleAuthClick}
					class="rounded-full border border-on-dark/10 bg-surface-raised/[0.03] px-4 py-1.5 text-xs font-semibold tracking-wider text-on-dark/70 uppercase transition-all duration-300 hover:border-on-dark/25 hover:bg-surface-raised/[0.07] hover:text-on-dark"
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
	/* Шрифты грузятся один раз в layout/Header.svelte; классы продублированы :global
	   на случай, если на странице не оказался HeroMain v2. */
	:global(.font-display) {
		font-family: 'Playfair Display', serif !important;
	}
	:global(.font-sans-premium) {
		font-family: 'Jost', sans-serif !important;
	}

	/* Точечная сетка с мягким затуханием к краям — «технологичная» текстура фона. */
	.footer-mesh-v2 {
		background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0);
		background-size: 26px 26px;
		-webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%);
		mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%);
	}
</style>
