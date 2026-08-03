<script lang="ts">
	// Артикул: 1.2.1.1 — см. docs/architecture/component-articles-map.md
	import PageHero from '../_shared/PageHero.svelte';
	import type { HeroPalette } from '../_shared/hero';
	import type { EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	/**
	 * Палитра Hero «О компании»: тёмный slate с красным акцентом.
	 *
	 * ВНИМАНИЕ — `wave` обязан совпадать с фоном следующих секций
	 * (Text и Statistics стоят на `bg-slate-50` = #f8fafc; фон одинаковый,
	 * чтобы стык держался, даже когда блок Text пуст и не рендерится).
	 */
	const palette: HeroPalette = {
		section: 'bg-linear-to-br from-slate-900 via-slate-800 to-red-900',
		patternOpacity: 'opacity-20',
		patternColor: '%239C92AC',
		glowA: 'bg-red-500/20',
		glowB: 'bg-red-400/15',
		iconTile:
			'bg-linear-to-br from-red-500 to-red-600 ring-1 ring-white/25 shadow-[0_20px_50px_-20px_rgba(220,38,38,0.9)]',
		rule: 'bg-white/15',
		diamond: 'border-red-500/80',
		text: 'text-slate-300',
		wave: '#f8fafc'
	};

	// Светлый вариант: та же композиция и тот же красный акцент, светлая поверхность.
	const paletteLight: HeroPalette = {
		section: 'bg-linear-to-br from-slate-100 via-white to-red-50',
		patternOpacity: 'opacity-10',
		patternColor: '%230f172a',
		glowA: 'bg-red-500/10',
		glowB: 'bg-red-400/10',
		iconTile:
			'bg-linear-to-br from-red-500 to-red-600 ring-1 ring-white/25 shadow-[0_20px_50px_-20px_rgba(220,38,38,0.9)]',
		rule: 'bg-slate-900/15',
		diamond: 'border-red-500/80',
		text: 'text-slate-600',
		title: 'text-slate-900',
		wave: '#f8fafc'
	};

	/** Стартовый текст под заголовком: в данных `lead` и `text` по умолчанию пустые. */
	const defaultLead =
		'Мы помогаем пройти путь от идеи до готового интерьера: подбираем материалы, считаем проект и ведём его до финальной сборки.';

	/**
	 * В Hero один текстовый блок, а в данных страницы их два: `lead` и `text`.
	 * Показываем и даём править тот, что заполнен, отдавая приоритет `lead`.
	 * Если пусты оба — подставляем стартовый текст в `lead`, чтобы под заголовком
	 * не было пустоты. Второе поле остаётся в данных нетронутым.
	 */
	const lead = $derived(String(data?.lead ?? '').trim());
	const text = $derived(String(data?.text ?? '').trim());

	const textField = $derived(
		lead
			? { key: 'lead', label: 'Вводный текст', value: lead }
			: text
				? { key: 'text', label: 'Основной текст', value: text }
				: { key: 'lead', label: 'Вводный текст', value: defaultLead }
	);
</script>

<!--
	Бейдж «О компании», кнопка «Связаться с нами» и коллаж фото (img1…img4)
	в Hero больше не выводятся: структура Hero внутренних страниц фиксирована
	(значок → заголовок → линия → текст). Поля `badge`, `buttonText` и `img1…img4`
	в данных сохраняются — если фото нужны на странице, для них стоит завести
	отдельный блок-галерею.
-->
<PageHero
	bind:data
	{editContext}
	{isEditable}
	componentType="Hero"
	{palette}
	{paletteLight}
	title={{ key: 'title', label: 'Заголовок', value: String(data?.title ?? 'О нас') }}
	text={textField}
>
	{#snippet icon()}
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
		/>
	{/snippet}
</PageHero>
