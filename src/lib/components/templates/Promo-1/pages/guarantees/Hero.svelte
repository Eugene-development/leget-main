<script lang="ts">
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
	 * Палитра Hero «Гарантий»: тёмный slate + emerald/cyan.
	 *
	 * ВНИМАНИЕ — `wave` обязан совпадать с фоном следующей секции
	 * (GuaranteeTerms, `bg-slate-50` = #f8fafc).
	 */
	const palette: HeroPalette = {
		section: 'bg-linear-to-br from-slate-900 via-slate-800 to-slate-900',
		patternOpacity: 'opacity-20',
		patternColor: '%239C92AC',
		glowA: 'bg-emerald-500/20',
		glowB: 'bg-cyan-400/15',
		iconTile:
			'bg-linear-to-br from-emerald-400 to-cyan-500 ring-1 ring-white/25 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.9)]',
		rule: 'bg-white/15',
		diamond: 'border-emerald-400/80',
		text: 'text-slate-300',
		wave: '#f8fafc'
	};
</script>

<PageHero
	bind:data
	{editContext}
	{isEditable}
	componentType="GuaranteesHero"
	{palette}
	title={{ key: 'title', label: 'Заголовок', value: String(data?.title ?? 'Гарантия качества') }}
	text={{
		key: 'subtitle',
		label: 'Подзаголовок',
		value: String(
			data?.subtitle ??
				'Мы уверены в качестве продукции наших партнёров. Вся продукция имеет расширенную гарантию на материалы и работу мастеров.'
		)
	}}
>
	{#snippet icon()}
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
	{/snippet}
</PageHero>
