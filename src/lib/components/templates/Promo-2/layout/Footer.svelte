<script lang="ts">
	// Артикул: 2.Ф.1.1 — см. docs/architecture/component-articles-map.md
	let { data }: { data: Record<string, unknown> } = $props();

	const siteName    = $derived(typeof data?.siteName    === 'string' ? data.siteName    : 'Фабрика');
	const description = $derived(typeof data?.description === 'string' ? data.description : 'Более 25 лет создаём мебель премиального качества.');
	const phone       = $derived(typeof data?.phone       === 'string' ? data.phone       : '');
	const email       = $derived(typeof data?.email       === 'string' ? data.email       : '');
	const address     = $derived(typeof data?.address     === 'string' ? data.address     : '');
	const hours       = $derived(typeof data?.hours       === 'string' ? data.hours       : 'Пн–Пт: 9:00 — 18:00');
	const copyright   = $derived(typeof data?.copyright   === 'string' ? data.copyright   : `© ${new Date().getFullYear()} Все права защищены.`);
	const privacyLink = $derived(typeof data?.privacyLink === 'string' ? data.privacyLink : '/privacy');
	const termsLink   = $derived(typeof data?.termsLink   === 'string' ? data.termsLink   : '/terms');

	const navColumns = $derived(
		Array.isArray(data?.navColumns)
			? (data.navColumns as { title: string; links: { label: string; href: string }[] }[])
			: [
				{
					title: 'Каталог',
					links: [
						{ label: 'Фурнитура', href: '/furniture' },
						{ label: 'Фасады',    href: '/facades'   },
						{ label: 'Шкафы',     href: '/wardrobes' },
						{ label: 'Кухни',     href: '/kitchens'  },
					]
				},
				{
					title: 'Компания',
					links: [
						{ label: 'О фабрике',   href: '/about'     },
						{ label: 'Новости',      href: '/news'      },
						{ label: 'Вакансии',     href: '/careers'   },
						{ label: 'Дизайнерам',   href: '/designers' },
					]
				},
				{
					title: 'Покупателям',
					links: [
						{ label: 'Стили',   href: '/styles'    },
						{ label: 'Акции',   href: '/actions'   },
						{ label: 'Салоны',  href: '/showrooms' },
						{ label: 'Контакты', href: '/contact'  },
					]
				},
			]
	);
</script>

<footer class="relative bg-primary text-inverse">
	<!-- Decorative Top Line -->
	<div class="h-px w-full bg-linear-to-r from-transparent via-accent to-transparent"></div>

	<!-- Main Footer Content -->
	<div class="mx-auto max-w-screen-xl px-6 pt-16 pb-10 lg:pt-20 lg:pb-14 xl:px-1">
		<div class="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-12 lg:gap-8">
			<!-- Brand Column -->
			<div class="col-span-2 lg:col-span-4">
				<a href="/" class="group inline-block">
					<span
						class="text-3xl font-medium tracking-[0.2em] text-white transition-opacity duration-300 group-hover:opacity-75 lg:text-4xl"
						style="font-family: var(--font-heading);"
					>
						{siteName}
					</span>
				</a>
				<p class="mt-6 max-w-xs text-sm leading-relaxed text-white/60">
					{description}
				</p>
			</div>

			<!-- Navigation Columns -->
			{#each navColumns as column}
				<div class="col-span-1 lg:col-span-2">
					<h4 class="text-xs font-medium tracking-[0.2em] text-white/40 uppercase">
						{column.title}
					</h4>
					<ul class="mt-5 flex flex-col gap-3">
						{#each column.links as link}
							<li>
								<a
									href={link.href}
									class="text-sm text-white/65 transition-colors duration-300 hover:text-accent-light"
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}

			<!-- Contact Column -->
			<div class="col-span-1 lg:col-span-2">
				<h4 class="text-xs font-medium tracking-[0.2em] text-white/40 uppercase">Контакты</h4>
				<div class="mt-1 flex flex-col gap-1">
					{#if phone}
						<a
							href="tel:{phone}"
							class="text-sm text-white/65 transition-colors duration-300 hover:text-accent-light"
						>
							{phone}
						</a>
					{/if}
					{#if email}
						<a
							href="mailto:{email}"
							class="text-sm text-white/65 transition-colors duration-300 hover:text-accent-light"
						>
							{email}
						</a>
					{/if}
				</div>

				{#if address}
					<div class="mt-6">
						<p class="text-[10px] tracking-[0.2em] text-white/30 uppercase">Адрес</p>
						<p class="mt-1 text-sm text-white/65">{address}</p>
					</div>
				{/if}

				<div class="mt-6">
					<p class="text-[10px] tracking-[0.2em] text-white/30 uppercase">Режим работы</p>
					<p class="mt-1 text-sm text-white/65">{hours}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Bottom Bar -->
	<div class="border-t border-white/10">
		<div
			class="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row xl:px-1"
		>
			<p class="text-xs text-white/35">{copyright}</p>
			<div class="flex items-center gap-6">
				<a
					href={privacyLink}
					class="text-xs text-white/35 transition-colors duration-300 hover:text-white/60"
				>
					Политика конфиденциальности
				</a>
				<a
					href={termsLink}
					class="text-xs text-white/35 transition-colors duration-300 hover:text-white/60"
				>
					Пользовательское соглашение
				</a>
			</div>
		</div>
	</div>
</footer>
