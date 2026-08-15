<script lang="ts">
	// Артикул: 1.Ф.1.3 — см. docs/architecture/component-articles-map.md
	import { auth } from '$lib/stores/auth';
	import EditableField from '$lib/components/EditableField.svelte';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
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

<footer class="footer-v3 relative overflow-hidden bg-alt-warm-surface text-alt-warm-ink">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="footer-v3-grid absolute inset-0 opacity-55"></div>
		<div
			class="absolute -top-20 right-[8%] h-56 w-56 rounded-full border-[46px] border-alt-warm-accent/10 sm:h-80 sm:w-80 sm:border-[64px]"
		></div>
		<div class="absolute top-0 left-[6%] h-full w-px bg-alt-warm-ink/7"></div>
	</div>

	<div class="relative mx-auto max-w-[1400px] px-5 pt-20 pb-8 sm:px-8 lg:px-12 lg:pt-28">
		<div class="grid gap-12 lg:grid-cols-12 lg:gap-8" use:reveal>
			<div class="lg:col-span-8">
				<div class="flex items-center gap-3 text-[10px] font-semibold tracking-[0.24em] uppercase">
					<span class="h-px w-10 bg-alt-warm-accent"></span>
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
					class="mt-12 flex flex-col gap-8 border-t border-alt-warm-ink/20 pt-7 sm:flex-row sm:items-end sm:justify-between"
				>
					<p class="max-w-md text-base leading-relaxed text-alt-warm-ink/65">
						От идеи до установки: проектируем пространство, производим мебель и отвечаем за
						результат на каждом этапе.
					</p>

					<a
						href={phoneHref}
						class="group inline-flex w-fit items-center gap-5 rounded-full bg-alt-warm-ink py-2 pr-2 pl-6 text-sm font-semibold text-alt-warm-paper transition-transform duration-300 active:scale-[0.98]"
					>
						Обсудить проект
						<span
							class="flex h-10 w-10 items-center justify-center rounded-full bg-alt-warm-accent transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-45"
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
				<div class="border-t border-alt-warm-ink/25">
					<div class="grid grid-cols-[5rem_1fr] gap-4 border-b border-alt-warm-ink/15 py-5">
						<span class="text-[10px] font-semibold tracking-[0.18em] text-alt-warm-ink/45 uppercase"
							>01 / Телефон</span
						>
						<a
							href={phoneHref}
							class="text-base font-medium break-words transition-colors hover:text-alt-warm-accent"
							>{phone}</a
						>
					</div>

					<div class="grid grid-cols-[5rem_1fr] gap-4 border-b border-alt-warm-ink/15 py-5">
						<span class="text-[10px] font-semibold tracking-[0.18em] text-alt-warm-ink/45 uppercase"
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
									class="text-base font-medium break-all transition-colors hover:text-alt-warm-accent"
								>
									{displayValue}
								</a>
							{/snippet}
						</EditableField>
					</div>

					<div class="grid grid-cols-[5rem_1fr] gap-4 border-b border-alt-warm-ink/15 py-5">
						<span class="text-[10px] font-semibold tracking-[0.18em] text-alt-warm-ink/45 uppercase"
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

					<div class="grid grid-cols-[5rem_1fr] gap-4 py-5">
						<span class="text-[10px] font-semibold tracking-[0.18em] text-alt-warm-ink/45 uppercase"
							>04 / График</span
						>
						<div class="flex items-start gap-2.5">
							<span class="footer-v3-signal mt-1.5 h-2 w-2 shrink-0 rounded-full bg-alt-warm-accent"
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
			class="mt-20 grid gap-12 border-y border-alt-warm-ink/20 py-12 md:grid-cols-12 lg:mt-28"
			use:reveal
			data-reveal-delay="100"
		>
			<div class="md:col-span-3">
				<p class="max-w-[16rem] text-sm leading-relaxed text-alt-warm-ink/55">
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
									class="group flex items-center gap-2 rounded-full border border-alt-warm-ink/20 px-4 py-2 text-xs font-semibold transition-colors hover:border-alt-warm-accent hover:text-alt-warm-accent"
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
									class="group flex items-center gap-2 rounded-full border border-alt-warm-ink/20 px-4 py-2 text-xs font-semibold transition-colors hover:border-alt-warm-accent hover:text-alt-warm-accent"
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
					<h3 class="p1-title-sub text-[10px] text-alt-warm-accent uppercase">Компания</h3>
					<ul class="mt-5 space-y-3 text-sm font-medium">
						<li>
							<a href="/about" class="transition-colors hover:text-alt-warm-accent">О компании</a>
						</li>
						<li>
							<a href="/actions" class="transition-colors hover:text-alt-warm-accent">Акции</a>
						</li>
						<li>
							<a href="/testimonials" class="transition-colors hover:text-alt-warm-accent">Отзывы</a
							>
						</li>
						<li>
							<a href="/contacts" class="transition-colors hover:text-alt-warm-accent">Контакты</a>
						</li>
					</ul>
				</div>

				<div>
					{#if visibleServiceItems.length > 0}
						<h3 class="p1-title-sub text-[10px] text-alt-warm-accent uppercase">Услуги</h3>
						<ul class="mt-5 space-y-3 text-sm font-medium">
							{#each visibleServiceItems as service}
								<li>
									<a href={service.href} class="transition-colors hover:text-alt-warm-accent"
										>{service.label}</a
									>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div>
					{#if visibleCatalogItems.length > 0}
						<h3 class="p1-title-sub text-[10px] text-alt-warm-accent uppercase">Каталог</h3>
						<ul class="mt-5 space-y-3 text-sm font-medium">
							{#each visibleCatalogItems as item}
								<li>
									<a href={item.href} class="transition-colors hover:text-alt-warm-accent"
										>{item.label}</a
									>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div>
					<h3 class="p1-title-sub text-[10px] text-alt-warm-accent uppercase">Ещё</h3>
					<ul class="mt-5 space-y-3 text-sm font-medium">
						<li>
							<a href="/vacancy" class="transition-colors hover:text-alt-warm-accent">Вакансии</a>
						</li>
						<li>
							<a href="/partnership" class="transition-colors hover:text-alt-warm-accent"
								>Партнёрство</a
							>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div
			class="flex flex-col gap-5 pt-7 text-xs text-alt-warm-ink/55 md:flex-row md:items-center md:justify-between"
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
						class="font-semibold text-alt-warm-ink transition-colors hover:text-alt-warm-accent"
						>Leget</a
					>
				</p> -->
				<div class="flex items-center gap-2">
					{@render pageSettings?.(
						'rounded-full border border-alt-warm-ink/20 text-alt-warm-ink hover:border-alt-warm-accent hover:text-alt-warm-accent'
					)}
					<button
						type="button"
						onclick={handleAuthClick}
						class="h-9 rounded-full border border-alt-warm-ink/20 px-4 font-semibold text-alt-warm-ink transition-colors hover:border-alt-warm-accent hover:text-alt-warm-accent active:scale-[0.98]"
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
			linear-gradient(rgb(32 33 31 / 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgb(32 33 31 / 0.04) 1px, transparent 1px);
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
