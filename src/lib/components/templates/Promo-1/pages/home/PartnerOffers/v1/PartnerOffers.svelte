<script lang="ts">
	// Артикул: 1.1.9.1 — см. docs/architecture/component-articles-map.md
	//
	// Номер 9, а не освободившийся 7: `component_number` не переприсваивается,
	// выведенный Direction оставляет дырку. Блок при этом рендерится вторым —
	// порядок задаёт `config/templates.php`, а не номер.
	//
	// Анатомия перенесена из `Direction/v2` (1.1.7.2) один в один: кадр во всю
	// карточку, скрим, контурная рамка на кадре, градиентная кнопка на паре ролей
	// `accent-surface` / `on-accent`, зум на наведении. Это не совпадение и не
	// копипаста по лени: 1.1.7.2 довели до чистых токенов, а потом решили сменить
	// ему назначение — блок переехал сюда вместе со всей проделанной работой,
	// а `Direction` выведен в legacy (config/component_lifecycle.php).
	//
	// На кадре только кнопка. Ключи `partner`, `offer`, `terms` и `validUntil`
	// в данных и в типе остаются, но не рисуются — как `badge`/`title` в 1.1.7.2:
	// удаление ключа обнуляет поле у тенантов, которые его правили, а понадобиться
	// на кадре они ещё могут. Ключ `logo` снят, а не оставлен: он прожил полчаса
	// внутри одной сессии, ни один тенант ничего под ним не сохранял, и обнулять
	// нечего — правило про неприкосновенность ключей защищает чужие данные,
	// а не собственные черновики.
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Тема блока красит только его собственную подложку (`p1-surface`). Всё, что
	// лежит НА кадре, теме не подчиняется: под контентом фотография, а не
	// поверхность секции, и её темнота не зависит от того, светлый блок или тёмный.
	// Поэтому внутри карточки роли `on-dark` / `scrim` / `accent-*`.
	const isLight = $derived(isLightBlock(data, 'dark'));

	type Offer = {
		image: string;
		alt: string;
		partner: string;
		offer: string;
		terms: string;
		validUntil: string;
		buttonText: string;
		buttonHref: string;
	};

	const offers = $derived(
		Array.isArray(data?.offers) && data.offers.length > 0
			? (data.offers as Offer[])
			: [
					{
						image: 'https://storage.yandexcloud.net/novostroy/bg/vector-kitchen.jpg',
						alt: 'Скидка 15% на фурнитуру Blum',
						partner: 'Blum',
						offer: 'Скидка 15% на фурнитуру',
						terms: 'При заказе кухни от 150 000 ₽',
						validUntil: '31.12.2026',
						buttonText: 'Получить предложение',
						buttonHref: '/contact'
					},
					{
						image: 'https://storage.yandexcloud.net/novostroy/bg/prih.jpg',
						alt: 'Столешница в подарок от Egger',
						partner: 'Egger',
						offer: 'Столешница в подарок',
						terms: 'К любому кухонному гарнитуру от 200 000 ₽',
						validUntil: '30.11.2026',
						buttonText: 'Получить предложение',
						buttonHref: '/contact'
					}
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'PartnerOffers', updated);
		data = updated;
	}
</script>

<!-- Спецпредложения партнёров (PartnerOffers) — кадр во всю карточку, кнопка поверх -->
<section
	class="p1-surface grid min-h-140 grid-cols-1 gap-4 p-4 font-sans select-none md:grid-cols-2"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	{#each offers as item}
		<!-- Рамка карточки — единственное место в блоке, где тема ещё уместна:
		     эта линия отделяет плитку от подложки секции, а не лежит на кадре. -->
		<div
			class="group p1-border relative flex min-h-100 overflow-hidden rounded-3xl border shadow-2xl sm:min-h-125"
		>
			<!-- Фоновая картинка с зумом. Длительность — роль «медленной
			     перестройки» системы (Базовая 500ms, Графит 300ms). Кривая приходит
			     из `--default-transition-timing-function`, поэтому своей `ease-*`
			     здесь нет. -->
			<ImageFallback
				src={item.image}
				alt={item.alt}
				class="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui-slow)] group-hover:scale-105"
			/>
			<!-- Скрим. Роль `--ds-scrim` вместо ступени `ink-950`: затемнение поверх
			     медиа система задаёт отдельно от нейтральной шкалы. Ховер углубляет
			     ту же темноту, а не подмешивает чужой хью.

			     Плотность ослабленная, как в 1.1.7.2: читать на кадре нечего,
			     кнопка непрозрачна и свой контраст несёт сама. Остаются две задачи —
			     отделить кнопку от пёстрой фотографии и дать её `shadow-xl` во что
			     упасть. -->
			<div
				class="absolute inset-0 bg-linear-to-t from-scrim/55 from-0% via-scrim/15 via-18% to-transparent to-40% transition-colors group-hover:from-scrim/70 group-hover:via-scrim/25"
			></div>

			<!-- Декоративная контурная рамка сзади. `border-on-dark/15`, а не
			     `p1-border`: она лежит на кадре, и в светлой теме тёмная линия
			     системы на фотографии не видна вовсе. -->
			<div
				class="pointer-events-none absolute inset-4 rounded-2xl border border-on-dark/15 transition-colors duration-[var(--ds-motion-duration-ui-slow)] group-hover:border-on-dark/40"
			></div>

			<div class="relative z-10 flex w-full flex-col items-start justify-end p-8 sm:p-12">
				<!-- Кнопка. Пара ролей `accent-surface` / `on-accent`: белый даёт
				     5,86:1 на Базовой и 6,83:1 на Графите. Длительность и кривая —
				     из дефолтов `@theme`, поэтому голый `transition-all`.

				     `aria-label` собран из партнёра и предложения: заголовка у секции
				     нет, обе ссылки ведут по одному адресу и несут одну надпись, и
				     без имени скринридер прочитает их как два одинаковых пункта. -->
				<a
					href={item.buttonHref}
					aria-label={`${item.buttonText} — ${item.partner}, ${item.offer}`}
					class="p1-label inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-accent-surface to-accent-surface-deep px-6 py-4.5 text-on-accent uppercase shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
				>
					<span>{item.buttonText}</span>
					<!-- Штрих иконки — роль системы (Базовая 2, Графит 1,75). Атрибут
					     `var()` не парсит, поэтому ключ берётся через `style`. -->
					<svg
						class="h-4 w-4 translate-x-0 transform transition-transform group-hover:translate-x-1.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						style="stroke-width: var(--ds-icon-stroke-bold)"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
					</svg>
				</a>
			</div>
		</div>
	{/each}
</section>
