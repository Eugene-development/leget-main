<script lang="ts">
	// Артикул: 1.8.1.1 — см. docs/architecture/component-articles-map.md
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
	 * Палитра Hero «Рассрочки»: violet → purple → indigo.
	 *
	 * ВНИМАНИЕ — `wave` обязан совпадать с фоном следующей секции
	 * (InstallmentPlans, `bg-slate-50` = #f8fafc).
	 */
	const palette: HeroPalette = {
		section: 'bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700',
		patternOpacity: 'opacity-30',
		patternColor: '%23ffffff',
		glowA: 'bg-white/15',
		glowB: 'bg-indigo-400/25',
		iconTile: 'bg-white/15 ring-1 ring-white/25 shadow-[0_20px_50px_-20px_rgba(49,46,129,0.9)]',
		rule: 'bg-white/30',
		diamond: 'border-white/70',
		text: 'text-purple-50/90',
		wave: '#f8fafc'
	};
</script>

<!--
	Кнопка «Консультация по рассрочке» из Hero убрана: структура Hero внутренних
	страниц фиксирована (значок → заголовок → линия → текст). Поле `buttonText`
	в данных сохраняется, а призыв к действию у страницы есть ниже — в InstallmentCTA.
-->
<PageHero
	bind:data
	{editContext}
	{isEditable}
	componentType="InstallmentHero"
	{palette}
	title={{
		key: 'title',
		label: 'Заголовок',
		value: String(data?.title ?? 'Рассрочка без переплаты')
	}}
	text={{
		key: 'subtitle',
		label: 'Подзаголовок',
		value: String(
			data?.subtitle ??
				'Купите мебель и технику сейчас — платите частями до 12 месяцев. Быстрое одобрение, минимум документов.'
		)
	}}
>
	{#snippet icon()}
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
	{/snippet}
</PageHero>
