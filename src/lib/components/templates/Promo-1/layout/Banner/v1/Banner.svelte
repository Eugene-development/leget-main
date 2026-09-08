<script lang="ts">
	// Артикул: 1.Б.1.1 — см. docs/architecture/component-articles-map.md
	import { page } from '$app/stores';
	import EditableField from '$lib/components/EditableField.svelte';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { saveLayoutData, type EditContext } from '$lib/utils/page-edit';
	import { resolveBannerLinks } from '../../bannerLinks';
	import '../../../theme.css';

	// Вариант 1 баннера (верхняя полоса Promo-1) — тихая строка контактов.
	//
	// Тема. Полоса участвует в теме шаблона: корень объявляет `data-p1-theme`,
	// элементы внутри набраны семантическими ролями (`p1-chrome-quiet`,
	// `p1-title`, `p1-muted`, `p1-line`), а не абсолютными шкалами `ink`/`on-dark`.
	// Значения приходят из выбранной дизайн-системы, поэтому светлая половина —
	// не «инверсия чёрного», а тихий хром системы. В светлой теме он повторяет
	// чеканку кнопок меню 1.М.1.1; в тёмной сохраняет прежний `surface-alt`.
	//
	// Дефолт темы — 'dark': таким баннер нарисован и таким стоит на живых
	// сайтах, поэтому нетронутый блок не меняет вида, а тумблер (в панели
	// настроек баннера) просто инвертирует исходное состояние.
	//
	// Почему снизу линия, а сверху нет. Тёмная полоса отделяется от страницы
	// сама — темнотой; светлая садится на светлый хэдер и без границы
	// сливается с ним в одно поле. Линия принадлежит роли `p1-line` и в тёмной
	// теме уходит в фон (0,06 белого), то есть одно правило обслуживает обе
	// половины без условий в разметке.
	//
	// Подложка непрозрачна, `backdrop-blur` снят: баннер стоит первым в потоке
	// (его высота публикуется в `--banner-h` и вычитается из первого экрана),
	// под ним ничего нет — размывать нечего.
	//
	// Ниже `lg` баннер не рисует ничего (с 25.08.2026). Его мобильная
	// половина была строкой шапки — логотип, «Контакты», телефон, вход,
	// избранное и бургер, — то есть баннер на узком экране подменял собой
	// хэдер. Строка переехала в `Header.svelte`, внутрь липкого `<header>`;
	// телефон, почта и «Контакты» остались доступны с мобильного — они
	// теперь в строке и в листе меню. `--banner-h` на узком экране
	// становится нулём, и первый экран считается верно: высоту хрома
	// целиком несёт `--header-h`.
	//
	// Контракт данных не тронут: те же поля, те же ключи, то же сохранение.
	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
	} = $props();

	const links = $derived(resolveBannerLinks(data));

	const phone = $derived(data?.phone ? String(data.phone) : '+7 (999) 000-00-00');
	const email = $derived(data?.email ? String(data.email) : 'info@leget.ru');

	// Тема читается прямо из пропса, без $state-зеркала: зеркало, заполняемое
	// в $effect, на сервере осталось бы пустым, и SSR всегда отдавал бы дефолт.
	// Ключ свой (`bannerTheme`), а не общий `theme`: blob `headerData` баннер
	// делит с хэдером — как и версию (`bannerVersion`).
	const isLight = $derived(isLightBlock(data, 'dark', 'bannerTheme'));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveLayoutData(editContext, 'Header', updated);
		data = updated;
	}
</script>

<div data-p1-theme={isLight ? 'light' : 'dark'}>
	<!-- Desktop Banner -->
	<div class="p1-chrome-quiet p1-line z-50 hidden items-center border-b px-4 sm:px-8 lg:flex">
		<!-- Левая часть: навигационные ссылки -->
		<div class="hidden flex-1 justify-start lg:flex">
			<div class="flex items-center space-x-3.5 tracking-wide">
				{#each links as link, i}
					<a
						href={link.href}
						class={$page.url.pathname === link.href
							? 'p1-accent text-xs whitespace-nowrap'
							: `${isLight ? 'p1-title' : 'p1-muted'} p1-accent-hover text-xs whitespace-nowrap transition-colors`}
						class:brightness-90={isLight}
					>
						{link.label}
					</a>
					{#if i < links.length - 1}
						<svg
							viewBox="0 0 2 2"
							class="p1-muted inline h-0.5 w-0.5 shrink-0 fill-current opacity-60"
							aria-hidden="true"
						>
							<circle cx={1} cy={1} r={1} />
						</svg>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Правая часть: контакты + вход -->
		<div class="hidden flex-1 justify-between lg:flex">
			<div class="flex flex-1">
				<div class="items-center py-1.5 lg:flex lg:min-w-0 lg:flex-1 lg:justify-end">
					{#if phone}
						<div class="flex items-center justify-center px-2 py-1 text-xs xl:px-4">
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
										class="p1-title p1-accent-hover text-xs font-normal tracking-wide antialiased transition-colors"
										class:brightness-90={isLight}
									>
										{displayValue}
									</a>
								{/snippet}
							</EditableField>
						</div>
					{/if}

					{#if phone && email}
						<svg
							viewBox="0 0 2 2"
							class="p1-muted mx-1 inline h-0.5 w-0.5 shrink-0 fill-current opacity-60"
							aria-hidden="true"
						>
							<circle cx={1} cy={1} r={1} />
						</svg>
					{/if}

					{#if email}
						<div class="flex items-center justify-center px-2 py-1 text-xs xl:px-4">
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
										class="p1-title p1-accent-hover text-xs font-normal tracking-wide antialiased transition-colors"
										class:brightness-90={isLight}
									>
										{displayValue}
									</a>
								{/snippet}
							</EditableField>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
