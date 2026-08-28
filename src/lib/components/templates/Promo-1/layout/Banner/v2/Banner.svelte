<script lang="ts">
	// Артикул: 1.Б.1.2 — см. docs/architecture/component-articles-map.md
	import { page } from '$app/stores';
	import EditableField from '$lib/components/EditableField.svelte';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { saveLayoutData, type EditContext } from '$lib/utils/page-edit';
	import { resolveBannerLinks } from '../../bannerLinks';
	import '../../../theme.css';

	// Вариант 2 баннера — та же строка контактов, собранная плотнее: световая
	// линия сверху, вертикальные разделители вместо точек, телефон пилюлей.
	//
	// Тема. Полоса участвует в теме шаблона наравне с вариантом 1: корень
	// объявляет `data-p1-theme`, элементы набраны ролями. Ключ данных общий
	// (`bannerTheme`), поэтому переключение варианта тему не сбрасывает.
	//
	// Выход из карантина. До этого блок красился парой `--ds-alt-night-bar*` —
	// «синеватыми почти-чёрными полосами», заведёнными в base.css как
	// нарушение правила «версия не несёт собственную палитру» (см. блок
	// «Карантин» там же). У карантина было ровно два выхода, и это первый:
	// перевод на роли системы. Поверхность полосы теперь даёт выбранная
	// дизайн-система, а не сам блок.
	//
	// Вместе с полосой из блока ушла и голубизна: активный пункт, значок
	// телефона и световая линия стояли на шкале `link`, которая от темы не
	// зависит, — на светлой половине `link-300` даёт 1,67:1, то есть значок
	// исчезал. Акцент, который обязан читаться на обеих поверхностях, — это
	// роль `p1-accent`; она же стоит на активном пункте варианта 1, так что
	// оба варианта теперь говорят одним акцентом страницы.
	//
	// Отличия от варианта 1 остались там, где им и место, — в композиции:
	// линия сверху, разделители, пилюля, две ступени яркости у текста
	// (`p1-body` у пунктов, `p1-muted` у почты).
	//
	// Обе полосы стоят на `p1-surface-alt`, а не на `p1-surface`: пилюля
	// телефона набрана ролью карточки, а та в светлой половине равна белому —
	// на чистой `p1-surface` от неё осталась бы одна граница. Ступень «alt»
	// возвращает пилюле подложку, не трогая тёмную половину.
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

	// Те же поля/дефолты, что в v1 — редактирование и сохранение идентичны.
	const links = $derived(resolveBannerLinks(data));

	const phone = $derived(data?.phone ? String(data.phone) : '+7 (999) 000-00-00');
	const email = $derived(data?.email ? String(data.email) : 'info@leget.ru');

	// Ссылка на контакты для мобильной полосы — из того же списка, что и строка
	// ссылок на десктопе: переименование пункта в редакторе доезжает и сюда,
	// удаление убирает ссылку, а не оставляет мёртвую. Разбор — в v1.
	const contactsLink = $derived(links.find((l) => l.href === '/contacts') ?? null);

	// Тема читается прямо из пропса, без $state-зеркала: зеркало, заполняемое
	// в $effect, на сервере осталось бы пустым, и SSR всегда отдавал бы дефолт.
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
	<div
		class="p1-surface-alt p1-line relative z-50 hidden items-center border-b px-4 sm:px-8 lg:flex"
	>
		<!-- Световая акцентная линия сверху -->
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--p1-accent)_55%,transparent)] to-transparent"
		></div>

		<!-- Левая часть: навигационные ссылки с вертикальными разделителями -->
		<nav class="hidden flex-1 items-center justify-start gap-3 lg:flex">
			{#each links as link, i (link.href)}
				{#if i > 0}
					<span class="p1-line h-3 border-l" aria-hidden="true"></span>
				{/if}
				<a
					href={link.href}
					class={$page.url.pathname === link.href
						? 'p1-accent text-xs font-medium whitespace-nowrap'
						: 'p1-body p1-accent-hover text-xs whitespace-nowrap transition-colors duration-300'}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- Правая часть: телефон (пилюля) + email + вход -->
		<div class="hidden flex-1 items-center justify-end gap-3 py-1.5 lg:flex">
			{#if phone}
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
							class="p1-card p1-border p1-title p1-accent-border-hover flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-300"
						>
							<svg
								class="p1-accent h-3 w-3"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
								/>
							</svg>
							{displayValue}
						</a>
					{/snippet}
				</EditableField>
			{/if}

			{#if email}
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
							class="p1-muted p1-accent-hover text-xs whitespace-nowrap transition-colors duration-300"
						>
							{displayValue}
						</a>
					{/snippet}
				</EditableField>
			{/if}
		</div>
	</div>
</div>
