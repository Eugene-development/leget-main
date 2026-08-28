<script lang="ts">
	// Артикул: 1.27.1.1 — см. docs/architecture/component-articles-map.md
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
	 * Палитра Hero «Вакансий»: тёмный slate с индиговым акцентом (`cat-4`).
	 *
	 * Акцент страницы один и тот же во всех трёх блоках — индиго. Красную
	 * шкалу `brand-*` здесь не берём даже на тень: под синим акцентом она
	 * читается как посторонний цвет, а не как подсветка.
	 *
	 * ВНИМАНИЕ — `wave` обязан совпадать с фоном следующей секции
	 * (VacancyList стоит на `p1-surface-alt`). Значение взято переменной
	 * дизайн-системы, а не литералом: смена системы двигает обе стороны стыка
	 * разом. Тема у блоков независимая — если список перевести в тёмную,
	 * а Hero оставить, на стыке будет видна полоса: страницу переключают
	 * целиком.
	 */
	const palette: HeroPalette = {
		section: 'bg-linear-to-br from-ink-900 via-ink-800 to-ink-900',
		patternOpacity: 'opacity-20',
		patternColor: '%239C92AC',
		glowA: 'bg-cat-4-500/20',
		glowB: 'bg-link-400/15',
		iconTile:
			'bg-linear-to-br from-cat-4-400 to-cat-4-500 ring-1 ring-on-accent/25 shadow-[0_20px_50px_-20px] shadow-cat-4-500/90',
		rule: 'bg-on-dark/15',
		diamond: 'border-cat-4-400/80',
		text: 'text-ink-300',
		wave: 'var(--ds-light-surface-alt)'
	};

	/** Светлый вариант: та же композиция и тот же индиговый акцент. */
	const paletteLight: HeroPalette = {
		section: 'bg-linear-to-br from-ink-100 via-on-accent to-cat-4-50',
		patternOpacity: 'opacity-10',
		patternColor: '%230f172a',
		glowA: 'bg-cat-4-500/10',
		glowB: 'bg-link-400/10',
		iconTile:
			'bg-linear-to-br from-cat-4-400 to-cat-4-500 ring-1 ring-on-accent/25 shadow-[0_20px_50px_-20px] shadow-cat-4-500/90',
		rule: 'bg-ink-900/15',
		diamond: 'border-cat-4-500/80',
		text: 'text-ink-600',
		title: 'text-ink-900',
		wave: 'var(--ds-light-surface-alt)'
	};
</script>

<PageHero
	bind:data
	{editContext}
	{isEditable}
	componentType="VacancyHero"
	{palette}
	{paletteLight}
	title={{ key: 'title', label: 'Заголовок', value: String(data?.title ?? 'Вакансии') }}
	text={{
		key: 'subtitle',
		label: 'Подзаголовок',
		value: String(
			data?.subtitle ??
				'Мы строим команду профессионалов, которым важно качество. Присоединяйтесь — вместе создаём пространства, которыми гордятся.'
		)
	}}
>
	{#snippet icon()}
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
		/>
	{/snippet}
</PageHero>
