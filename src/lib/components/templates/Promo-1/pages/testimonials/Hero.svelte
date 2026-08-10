<script lang="ts">
	// Артикул: 1.7.1.1 — см. docs/architecture/component-articles-map.md
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
	 * Палитра Hero «Отзывов»: pink → rose → fuchsia.
	 *
	 * ВНИМАНИЕ — `wave` обязан совпадать с фоном следующих секций
	 * (TestimonialsSummary и TestimonialsGrid стоят на `bg-surface`,
	 * это токен `--color-surface` из src/routes/layout.css).
	 */
	const palette: HeroPalette = {
		section: 'bg-linear-to-br from-cat-7-600 via-cat-6-500 to-cat-14-600',
		patternOpacity: 'opacity-30',
		patternColor: '%23ffffff',
		glowA: 'bg-on-dark/15',
		glowB: 'bg-cat-14-300/25',
		iconTile:
			'bg-on-dark/15 ring-1 ring-on-dark/25 shadow-[0_20px_50px_-20px] shadow-cat-14-900/80',
		rule: 'bg-on-dark/30',
		diamond: 'border-on-dark/70',
		text: 'text-cat-7-50/90',
		wave: 'var(--color-surface, #faf9f7)'
	};
</script>

<!--
	Надзаголовок «Отзывы» и кнопка «Оставить отзыв» из Hero убраны: структура Hero
	внутренних страниц фиксирована (значок → заголовок → линия → текст).
	Поля `eyebrow`, `buttonText` и `buttonHref` в данных сохраняются.
-->
<PageHero
	bind:data
	{editContext}
	{isEditable}
	componentType="Hero"
	{palette}
	title={{ key: 'title', label: 'Заголовок', value: String(data?.title ?? 'Отзывы о нас') }}
	text={{
		key: 'subtitle',
		label: 'Подзаголовок',
		value: String(data?.subtitle ?? 'Мы работаем ради таких отзывов клиентов о нашей работе')
	}}
>
	{#snippet icon()}
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
		/>
	{/snippet}
</PageHero>
