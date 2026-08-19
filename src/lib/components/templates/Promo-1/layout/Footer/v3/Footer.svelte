<script lang="ts">
	// Артикул: 1.Ф.1.3 — см. docs/architecture/component-articles-map.md
	import { auth } from '$lib/stores/auth';
	import EditableField from '$lib/components/EditableField.svelte';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import type { Action } from 'svelte/action';
	import type { Snippet } from 'svelte';
	import { catalogItems } from '../../catalogItems';
	import { serviceItems } from '../../serviceItems';
	import { resolveSitePhone, sitePhoneHref } from '$lib/utils/site-phone';

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

	/**
	 * Тема блока. До 19.08.2026 футер темы не имел вовсе: он был нарисован
	 * собственной тёплой палитрой (карантин `alt-warm-*`) и потому выглядел
	 * одинаково в любой дизайн-системе. Теперь нейтраль приходит ролями
	 * `p1-*`, а какую половину палитры взять — решает блок, как у всех
	 * остальных. Дефолт 'light': футер задуман светлой закрывающей полосой.
	 */
	const isLight = $derived(isLightBlock(data, 'light'));

	let showLoginModal = $state(false);

	const siteName = $derived(
		typeof data?.siteName === 'string' && data.siteName && data.siteName !== 'Новострой'
			? data.siteName
			: 'Логотип'
	);
	const phone = $derived(resolveSitePhone(sitePhone));
	const phoneHref = $derived(sitePhoneHref(sitePhone));
	const email = $derived(String(data?.email ?? 'info@site.ru'));
	const address = $derived(String(data?.address ?? 'г. Москва, ул. Ленина, д. 10'));
	const hours = $derived(String(data?.hours ?? 'Пн–Вс: 9:00 — 21:00'));
	const telegram = $derived(String(data?.telegram ?? ''));
	const whatsapp = $derived(String(data?.whatsapp ?? ''));

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

	const reveal: Action<HTMLElement> = (node) => {
		const delay = Number(node.dataset.revealDelay ?? 0);
		const reducedMotion =
			typeof window !== 'undefined' &&
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (reducedMotion || typeof IntersectionObserver === 'undefined') {
			return {};
		}

		node.style.opacity = '0';
		node.style.transform = 'translateY(24px)';
		node.style.transition = `opacity .7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .7s cubic-bezier(.16,1,.3,1) ${delay}ms`;

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				node.style.opacity = '1';
				node.style.transform = 'translateY(0)';
				observer.disconnect();
			},
			{ threshold: 0.08 }
		);

		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	};
</script>

<footer
	class="footer-v3 p1-surface-paper p1-border p1-title relative overflow-hidden border-t"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="footer-v3-grid absolute inset-0 opacity-55"></div>
		<div
			class="absolute -top-20 right-[8%] h-56 w-56 rounded-full border-[46px] border-[var(--p1-accent)]/10 sm:h-80 sm:w-80 sm:border-[64px]"
		></div>
		<div class="p1-line absolute top-0 left-[6%] h-full w-px"></div>
	</div>

	<div class="relative mx-auto max-w-[1400px] px-5 pt-20 pb-8 sm:px-8 lg:px-12 lg:pt-28">
		<div class="grid gap-12 lg:grid-cols-12 lg:gap-8" use:reveal>
			<div class="lg:col-span-8">
				<div class="flex items-center gap-3 text-[10px] font-semibold tracking-[0.24em] uppercase">
					<span class="p1-accent-bg h-px w-10"></span>
					Мебель и интерьер на заказ
				</div>

				<h2 class="font-footer-display mt-8 max-w-5xl text-[clamp(3.6rem,10vw,9rem)]">
					<EditableField
						fieldKey="Footer.siteName"
						label="Название компании"
						value={siteName}
						onSave={(value) => saveField('siteName', value)}
						{isEditable}
					>
						{#snippet children(displayValue)}
							<span>{displayValue}</span>
						{/snippet}
					</EditableField>
				</h2>

				<div
					class="p1-border mt-12 flex flex-col gap-8 border-t pt-7 sm:flex-row sm:items-end sm:justify-between"
				>
					<p class="p1-body max-w-md text-base leading-relaxed">
						От идеи до установки: проектируем пространство и отвечаем за результат на каждом этапе.
					</p>

					<a
						href={phoneHref}
						class="group inline-flex w-fit items-center gap-5 rounded-full bg-brand-600 py-2 pr-2 pl-6 text-sm font-semibold text-on-accent transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--p1-surface-paper)] focus-visible:outline-none active:scale-[0.98]"
					>
						Обсудить проект
						<span
							class="flex h-10 w-10 items-center justify-center rounded-full bg-on-accent/15 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-45"
						>
							<svg
								class="h-4 w-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.8"
								aria-hidden="true"
							>
								<path d="M5 19 19 5M9 5h10v10" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</span>
					</a>
				</div>
			</div>

			<div class="lg:col-span-4 lg:pl-10">
				<div class="p1-border border-t">
					<div
						class="p1-border grid grid-cols-[6rem_1fr] gap-4 border-b py-5 sm:grid-cols-[5rem_1fr]"
					>
						<span class="p1-muted text-[10px] font-semibold tracking-[0.18em] uppercase"
							>01 / Телефон</span
						>
						<a
							href={phoneHref}
							class="p1-accent-hover rounded-sm text-base font-medium break-words transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
							>{phone}</a
						>
					</div>

					<div
						class="p1-border grid grid-cols-[6rem_1fr] gap-4 border-b py-5 sm:grid-cols-[5rem_1fr]"
					>
						<span class="p1-muted text-[10px] font-semibold tracking-[0.18em] uppercase"
							>02 / Почта</span
						>
						<EditableField
							fieldKey="Footer.email"
							label="Email"
							value={email}
							onSave={(value) => saveField('email', value)}
							{isEditable}
						>
							{#snippet children(displayValue)}
								<a
									href="mailto:{displayValue}"
									class="p1-accent-hover rounded-sm text-base font-medium break-all transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
								>
									{displayValue}
								</a>
							{/snippet}
						</EditableField>
					</div>

					<div
						class="p1-border grid grid-cols-[6rem_1fr] gap-4 border-b py-5 sm:grid-cols-[5rem_1fr]"
					>
						<span class="p1-muted text-[10px] font-semibold tracking-[0.18em] uppercase"
							>03 / Адрес</span
						>
						<EditableField
							fieldKey="Footer.address"
							label="Адрес"
							value={address}
							onSave={(value) => saveField('address', value)}
							{isEditable}
							multiline
						>
							{#snippet children(displayValue)}
								<span class="text-sm leading-relaxed font-medium">{displayValue}</span>
							{/snippet}
						</EditableField>
					</div>

					<div class="grid grid-cols-[6rem_1fr] gap-4 py-5 sm:grid-cols-[5rem_1fr]">
						<span class="p1-muted text-[10px] font-semibold tracking-[0.18em] uppercase"
							>04 / График</span
						>
						<div class="flex items-start gap-2.5">
							<span class="footer-v3-signal p1-accent-bg mt-1.5 h-2 w-2 shrink-0 rounded-full"
							></span>
							<EditableField
								fieldKey="Footer.hours"
								label="Режим работы"
								value={hours}
								onSave={(value) => saveField('hours', value)}
								{isEditable}
							>
								{#snippet children(displayValue)}
									<span class="text-sm leading-relaxed font-medium">{displayValue}</span>
								{/snippet}
							</EditableField>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div
			class="p1-border mt-20 grid gap-12 border-y py-12 md:grid-cols-12 lg:mt-28"
			use:reveal
			data-reveal-delay="100"
		>
			<div class="md:col-span-3">
				<p class="p1-muted max-w-[16rem] text-sm leading-relaxed">
					Быстрый маршрут по проектам, услугам и информации о компании.
				</p>

				<div class="mt-7 flex flex-wrap gap-2">
					<EditableField
						fieldKey="Footer.telegram"
						label="Telegram (ссылка)"
						value={telegram}
						onSave={(value) => saveField('telegram', value)}
						{isEditable}
					>
						{#snippet children(displayValue)}
							{#if displayValue || isEditable}
								<a
									href={displayValue || '#'}
									target="_blank"
									rel="noopener noreferrer"
									class="group p1-border p1-accent-border-hover p1-accent-hover flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
								>
									Telegram
									<svg
										class="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path d="M4 12 12 4M6 4h6v6" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</a>
							{/if}
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="Footer.whatsapp"
						label="WhatsApp (ссылка)"
						value={whatsapp}
						onSave={(value) => saveField('whatsapp', value)}
						{isEditable}
					>
						{#snippet children(displayValue)}
							{#if displayValue || isEditable}
								<a
									href={displayValue || '#'}
									target="_blank"
									rel="noopener noreferrer"
									class="group p1-border p1-accent-border-hover p1-accent-hover flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
								>
									WhatsApp
									<svg
										class="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
										viewBox="0 0 16 16"
										fill="none"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path d="M4 12 12 4M6 4h6v6" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</a>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-x-6 gap-y-10 md:col-span-9 md:grid-cols-4 md:pl-8">
				<div>
					<h3 class="p1-title-sub p1-accent text-[10px] uppercase">Компания</h3>
					<ul class="mt-5 space-y-3 text-sm font-medium">
						<li>
							<a
								href="/about"
								class="p1-accent-hover rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
								>О компании</a
							>
						</li>
						<li>
							<a
								href="/actions"
								class="p1-accent-hover rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
								>Акции</a
							>
						</li>
						<li>
							<a
								href="/testimonials"
								class="p1-accent-hover rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
								>Отзывы</a
							>
						</li>
						<li>
							<a
								href="/contacts"
								class="p1-accent-hover rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
								>Контакты</a
							>
						</li>
					</ul>
				</div>

				<div>
					{#if visibleServiceItems.length > 0}
						<h3 class="p1-title-sub p1-accent text-[10px] uppercase">Услуги</h3>
						<ul class="mt-5 space-y-3 text-sm font-medium">
							{#each visibleServiceItems as service}
								<li>
									<a
										href={service.href}
										class="p1-accent-hover rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
										>{service.label}</a
									>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div>
					{#if visibleCatalogItems.length > 0}
						<h3 class="p1-title-sub p1-accent text-[10px] uppercase">Каталог</h3>
						<ul class="mt-5 space-y-3 text-sm font-medium">
							{#each visibleCatalogItems as item}
								<li>
									<a
										href={item.href}
										class="p1-accent-hover rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
										>{item.label}</a
									>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div>
					<h3 class="p1-title-sub p1-accent text-[10px] uppercase">Ещё</h3>
					<ul class="mt-5 space-y-3 text-sm font-medium">
						<li>
							<a
								href="/vacancy"
								class="p1-accent-hover rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
								>Вакансии</a
							>
						</li>
						<li>
							<a
								href="/partnership"
								class="p1-accent-hover rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none"
								>Партнёрство</a
							>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div
			class="p1-muted flex flex-col gap-5 pt-7 text-xs md:flex-row md:items-center md:justify-between"
			use:reveal
			data-reveal-delay="180"
		>
			<p>&copy; {new Date().getFullYear()} {siteName}. Все права защищены.</p>
			<div class="flex flex-wrap items-center gap-x-6 gap-y-3">
				<!-- <p>
					Разработка — <a
						href="https://leget.ru/"
						target="_blank"
						rel="noopener noreferrer"
						class="font-semibold p1-title transition-colors p1-accent-hover"
						>Leget</a
					>
				</p> -->
				<div class="flex items-center gap-2">
					{@render pageSettings?.(
						'rounded-full p1-border border p1-title p1-accent-border-hover p1-accent-hover focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none'
					)}
					<button
						type="button"
						onclick={handleAuthClick}
						class="p1-border p1-title p1-accent-border-hover p1-accent-hover h-9 rounded-full border px-4 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none active:scale-[0.98]"
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

<style>
	:global(.font-footer-display) {
		font-family: 'Outfit', 'Jost', sans-serif !important;
	}

	.footer-v3-grid {
		background-image:
			linear-gradient(var(--p1-line) 1px, transparent 1px),
			linear-gradient(90deg, var(--p1-line) 1px, transparent 1px);
		background-size: 80px 80px;
		-webkit-mask-image: linear-gradient(to bottom, #000, transparent 78%);
		mask-image: linear-gradient(to bottom, #000, transparent 78%);
	}

	.footer-v3-signal {
		animation: footer-v3-signal 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
	}

	@keyframes footer-v3-signal {
		0%,
		100% {
			opacity: 0.45;
			transform: scale(0.82);
		}
		50% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.footer-v3-signal {
			animation: none;
		}
	}
</style>
