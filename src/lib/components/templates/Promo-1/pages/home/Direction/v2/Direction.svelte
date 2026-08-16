<script lang="ts">
	// Артикул: 1.1.7.2 — см. docs/architecture/component-articles-map.md
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
	// лежит НА кадре, теме не подчиняется: под текстом фотография, а не
	// поверхность секции, и её темнота не зависит от того, светлый блок или
	// тёмный. Поэтому внутри карточки роли `on-dark` / `scrim` / `accent-*`,
	// а не `p1-title` / `p1-body` / `p1-border`, как было до 16.08.2026.
	const isLight = $derived(isLightBlock(data, 'dark'));

	const directions = $derived(
		Array.isArray(data?.directions) && data.directions.length > 0
			? (data.directions as {
					image: string;
					alt: string;
					badge: string;
					title: string;
					buttonText: string;
					buttonHref: string;
				}[])
			: [
					{
						image: 'https://storage.yandexcloud.net/novostroy/bg/vector-kitchen.jpg',
						alt: 'Кухонные гарнитуры',
						badge: 'Основное направление',
						title: 'Кухонные гарнитуры',
						buttonText: 'Просчитать ваш проект',
						buttonHref: '/contact'
					},
					{
						image: 'https://storage.yandexcloud.net/novostroy/bg/prih.jpg',
						alt: 'Шкафы и гардеробы',
						badge: 'Основное направление',
						title: 'Шкафы и гардеробы',
						buttonText: 'Просчитать ваш проект',
						buttonHref: '/contact'
					}
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Direction', updated);
		data = updated;
	}
</script>

<!-- Направления (Direction) — кадр во всю карточку, подпись поверх -->
<section
	class="p1-surface grid min-h-140 grid-cols-1 gap-4 p-4 font-sans select-none md:grid-cols-2"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	{#each directions as dir}
		<!-- Рамка карточки — единственное место в блоке, где тема ещё уместна:
		     эта линия отделяет плитку от подложки секции, а не лежит на кадре. -->
		<div
			class="group p1-border relative flex min-h-100 overflow-hidden rounded-3xl border shadow-2xl sm:min-h-125"
		>
			<!-- Фоновая картинка с зумом. Длительность — роль «медленной
			     перестройки» системы (Базовая 500ms, Графит 300ms); стояло
			     `duration-[1.2s]` — единственное произвольное значение
			     длительности во всём Promo-1, до которого пластика системы
			     не доходила. Кривая приходит из `--default-transition-timing-function`,
			     поэтому своей `ease-*` здесь нет. -->
			<ImageFallback
				src={dir.image}
				alt={dir.alt}
				class="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui-slow)] group-hover:scale-105"
			/>
			<!-- Скрим. Роль `--ds-scrim` вместо ступени `ink-950`: затемнение
			     поверх медиа система задаёт отдельно от нейтральной шкалы.
			     Ховер углубляет ту же темноту, а не подмешивает чужой хью
			     (было `from-cat-4-950/80` — индиго из категориальной палитры,
			     то есть цвет пер-карточного акцента в роли настроения).

			     Ослаблен 16.08.2026 вслед за удалением заголовка. Прежние
			     90/40% до половины кадра держали читаемость букв на
			     непредсказуемом снимке; читать здесь больше нечего — кнопка
			     непрозрачна и свой контраст (5,86:1 Базовая, 6,83:1 Графит)
			     несёт сама, от кадра он не зависит. Остаётся ровно две
			     задачи: дать кнопке отделиться от пёстрой фотографии и дать
			     её `shadow-xl` во что упасть — на светлом снимке тень иначе
			     не видна. Отсюда и меньшая плотность, и короткий градиент:
			     затемнение гаснет к середине нижней трети, а не тянется
			     до середины карточки. -->
			<div
				class="absolute inset-0 bg-linear-to-t from-scrim/55 from-0% via-scrim/15 via-18% to-transparent to-40% transition-colors group-hover:from-scrim/70 group-hover:via-scrim/25"
			></div>

			<!-- Декоративная контурная рамка сзади. `border-on-dark/15`, а не
			     `p1-border`: она лежит на кадре, и в светлой теме тёмная линия
			     системы на фотографии не видна вовсе. -->
			<div
				class="pointer-events-none absolute inset-4 rounded-2xl border border-on-dark/15 transition-colors duration-[var(--ds-motion-duration-ui-slow)] group-hover:border-on-dark/40"
			></div>

			<!-- Текстовое наполнение -->
			<div class="relative z-10 flex w-full flex-col items-start justify-end p-8 sm:p-12">
				<!-- Пилюля «Основное направление» и заголовок направления удалены
				     16.08.2026 по решению владельца: на кадре остаётся только
				     кнопка. Ключи `badge` и `title` в данных и в типе остаются —
				     удаление ключа обнулило бы поле у тенантов, которые его
				     правили; тот же порядок, что при снятии метки «Выгода»
				     в `Incentives` 12.08.2026.

				     Заголовка у секции теперь нет вообще, поэтому единственное,
				     что называет направление, — `alt` картинки и `aria-label`
				     кнопки: обе ссылки ведут по одному адресу и несут одну и ту
				     же надпись, и без имени скринридер прочитает их как два
				     одинаковых пункта. -->
				<!-- Кнопка. Пара ролей `accent-surface` / `on-accent` вместо
				     градиента из сырых шкал `link-500 → cat-4-600`: белый на
				     `link-500` даёт 2,71:1 на Базовой и 2,36:1 на Графите при
				     пороге 4,5 для 14px bold. Длительность и кривая — из
				     дефолтов `@theme`, поэтому голый `transition-all`. -->
				<a
					href={dir.buttonHref}
					aria-label={`${dir.buttonText} — ${dir.title}`}
					class="p1-label inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-accent-surface to-accent-surface-deep px-6 py-4.5 text-on-accent uppercase shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
				>
					<span>{dir.buttonText}</span>
					<!-- Штрих иконки — роль системы (Базовая 2, Графит 1,75);
					     стояло `stroke-width="2.5"`. Атрибут `var()` не парсит,
					     поэтому ключ берётся через `style`, как в
					     YandexDirectGoalsButton. -->
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
