<script lang="ts">
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { blockTheme } from '$lib/utils/block-theme';
	import type { EditContext } from '$lib/utils/page-edit';
	import FacadeField from './FacadeField.svelte';
	import { resolveFacades, detailLabels } from './data';
	import '../../../../Promo-1/theme.css';
	import './catalog.css';
	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		layout
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
		layout: 'gallery' | 'selector' | 'comparison';
	} = $props();
	const facades = $derived(resolveFacades(data));
	// Меняем только порядок показа: индексы редактирования остаются в исходном массиве.
	const galleryItems = $derived(
		facades
			.map((facade, index) => ({ facade, index }))
			.sort((a, b) => {
				const rank = (id: string, index: number) =>
					id === 'enamel' ? 0 : id === 'glass-aluminium' ? 1 : index + 2;
				return rank(a.facade.id, a.index) - rank(b.facade.id, b.index);
			})
	);
	let selectedId = $state('enamel');
	const selectedIndex = $derived(
		Math.max(
			0,
			facades.findIndex((f) => f.id === selectedId)
		)
	);
	const selected = $derived(facades[selectedIndex]);
</script>

{#snippet field(index: number, name: string, detail = false, multiline = false)}
	<FacadeField bind:data {editContext} {isEditable} {index} field={name} {detail} {multiline} />
{/snippet}
{#snippet image(index: number, eager = false)}
	<ImageFallback
		imagePath={['facades', index, 'image']}
		imageDefaults={{ facades }}
		src={facades[index].image}
		alt={facades[index].title}
		loading={eager ? 'eager' : 'lazy'}
		class="p2fc-photo"
	/>
{/snippet}
{#snippet specs(index: number)}
	<dl class="p2fc-specs">
		{#each Object.entries(detailLabels) as [key, label]}
			<div>
				<dt>{label}</dt>
				<dd>{@render field(index, key, true)}</dd>
			</div>
		{/each}
	</dl>
{/snippet}
<section id="facades-catalog" class="facades-collection" data-p1-theme={blockTheme(data)}>
	<div class="p2fc-shell">
		<header class="p2fc-header" class:p2fc-header-stacked={layout === 'gallery'}>
			<h2>Коллекция фасадов</h2>
			<p>
				{layout === 'comparison'
					? 'Сравните покрытия, основу и размеры — найдите материал для вашего проекта.'
					: layout === 'selector'
						? 'Рассмотрите фактуру. Изучите детали. Выберите характер вашей мебели.'
						: 'От натурального дерева до безупречного глянца — у каждого материала свой характер. Подберите фактуру и покрытие под ваш интерьер.'}
			</p>
		</header>
		{#if layout === 'gallery'}
			<div class="p2fc-gallery-grid">
				{#each galleryItems as { facade, index }}
					<article class="p2fc-gallery-item">
						<div class="p2fc-media">{@render image(index)}</div>
						<div class="p2fc-item-heading">
							<h3>{@render field(index, 'title')}</h3>
							<span class="p2fc-thickness">{facade.details.thickness}</span>
						</div>
						<div class="p2fc-description">{@render field(index, 'description', false, true)}</div>
						<details class="p2fc-disclosure">
							<summary>Характеристики <span aria-hidden="true">+</span></summary>{@render specs(
								index
							)}
						</details>
					</article>
				{/each}
			</div>
		{:else if layout === 'selector'}
			<div class="p2fc-selector">
				<div class="p2fc-material-list" aria-label="Выбор материала">
					{#each facades as facade, index}
						<button
							type="button"
							class:p2fc-active={selectedIndex === index}
							aria-pressed={selectedIndex === index}
							aria-controls="facade-detail"
							data-goal-ignore="Переключение материала в коллекции фасадов"
							onclick={() => (selectedId = facade.id)}
						>
							<span>{facade.title}</span><svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"><path d="M4 12h15m-6-6 6 6-6 6" /></svg
							>
						</button>
					{/each}
				</div>
				<div id="facade-detail" class="p2fc-detail">
					{#key selectedIndex}<div class="p2fc-media">
							{@render image(selectedIndex, true)}
						</div>{/key}
					<div class="p2fc-detail-copy">
						<div>
							<h3>{@render field(selectedIndex, 'title')}</h3>
							<div class="p2fc-description">
								{@render field(selectedIndex, 'description', false, true)}
							</div>
						</div>
						{@render specs(selectedIndex)}
					</div>
				</div>
			</div>
		{:else}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex — клавиатурная прокрутка фотографий. -->
			<div
				class="p2fc-comparison-photos"
				style={`--facade-count: ${facades.length}`}
				tabindex="0"
				role="region"
				aria-label="Фотографии материалов фасадов"
			>
				{#each facades as facade, index}
					<figure>
						<div class="p2fc-media">{@render image(index)}</div>
						<figcaption>{@render field(index, 'title')}</figcaption>
					</figure>
				{/each}
			</div>
			<p class="p2fc-scroll-hint">Прокрутите таблицу, чтобы сравнить все материалы</p>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex — клавиатурная прокрутка широкой таблицы. -->
			<div
				class="p2fc-table-scroll"
				tabindex="0"
				role="region"
				aria-label="Сравнение характеристик фасадов"
			>
				<table style={`min-width: ${Math.max(900, (facades.length + 1) * 170)}px`}>
					<caption class="sr-only">Материалы и технические характеристики фасадов</caption>
					<thead
						><tr
							><th scope="col">Характеристики</th>{#each facades as facade, index}<th scope="col"
									>{@render field(index, 'title')}</th
								>{/each}</tr
						></thead
					>
					<tbody
						>{#each Object.entries(detailLabels) as [key, label]}<tr
								><th scope="row">{label}</th>{#each facades as facade, index}<td
										>{@render field(index, key, true)}</td
									>{/each}</tr
							>{/each}</tbody
					>
				</table>
			</div>
			<div class="p2fc-material-notes">
				{#each facades as facade, index}<details class="p2fc-disclosure">
						<summary>{facade.title}<span aria-hidden="true">+</span></summary>
						<div class="p2fc-description">{@render field(index, 'description', false, true)}</div>
					</details>{/each}
			</div>
		{/if}
	</div>
</section>
