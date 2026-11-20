<script lang="ts">
	import { catalogEntries, resolveComponent, demoData } from '$lib/ds/registry';
	import SiteAppearance from '$lib/components/SiteAppearance.svelte';
	import { catalogRubricFromSlug } from '$lib/utils/catalog-rubric';
	const entries = catalogEntries().filter((e) => e.templateId === 1);
	let index = $state(0),
		theme = $state('light'),
		palette = $state('default'),
		system = $state('base'),
		allBlocks = $state(false),
		accentColor = $state('#8b3f35');
	const entry = $derived(entries[Math.max(0, Math.min(entries.length - 1, index))]);
	const Block = $derived(resolveComponent(1, entry.pageSlug, entry.type)!);
	const data = $derived({
		...demoData(1, entry.pageSlug, entry.type, entry.version),
		theme,
		bannerTheme: theme,
		menuTheme: theme,
		footerTheme: theme
	});
	const value = $derived(
		palette === 'default'
			? null
			: {
					primaryColor: '#2c2c2c',
					accentColor,
					surfaceColor: palette === 'light' ? '#faf9f7' : '#141414',
					textColor: palette === 'light' ? '#1a1a1a' : '#ededed',
					fontPreset: 'editorial',
					radiusPreset: 'balanced'
				}
	);
	$effect(() => {
		document.documentElement.dataset.ds = system;
	});
</script>

<SiteAppearance {value} designSystem={system} />
<header style="position:relative;z-index:10000;background:white;color:black;padding:10px">
	<label
		>Блок <input
			type="number"
			aria-label="Блок"
			bind:value={index}
			min="0"
			max={entries.length - 1}
		/></label
	>
	<label
		>Тема <select aria-label="Тема" bind:value={theme}
			><option>light</option><option>dark</option></select
		></label
	>
	<label
		>Палитра <select aria-label="Палитра" bind:value={palette}
			><option>default</option><option>light</option><option>dark</option></select
		></label
	>
	<label
		>Система <select aria-label="Система" bind:value={system}
			>{#each ['base', 'graphite', 'ochre', 'iris', 'apple'] as ds}<option>{ds}</option
				>{/each}</select
		></label
	>
	<label>Акцент <input aria-label="Акцент" type="color" bind:value={accentColor} /></label>
	<label
		><input aria-label="Пакет блоков" type="checkbox" bind:checked={allBlocks} /> Пакет из 12 блоков</label
	>
	<p data-testid="entry">{index}/{entries.length} {entry.pageSlug} {entry.type} v{entry.version}</p>
</header>
{#if allBlocks}
	{#each entries.slice(index, index + 12) as sample, sampleIndex}
		{@const SampleBlock = resolveComponent(1, sample.pageSlug, sample.type)!}
		<div
			data-testid="sample"
			data-ds-contrast-root
			data-site-template="1"
			data-catalog-rubric={catalogRubricFromSlug(1, sample.pageSlug)}
			data-entry={index + sampleIndex}
			data-component={`${sample.pageSlug} ${sample.type} v${sample.version}`}
		>
			{#key `${theme}:${palette}:${system}:${accentColor}`}
				<SampleBlock
					data={{
						...demoData(1, sample.pageSlug, sample.type, sample.version),
						theme,
						bannerTheme: theme,
						menuTheme: theme,
						footerTheme: theme
					}}
				/>
			{/key}
		</div>
	{/each}
{:else}
	<div
		data-testid="sample"
		data-ds-contrast-root
		data-site-template="1"
		data-entry={index}
		data-catalog-rubric={catalogRubricFromSlug(1, entry.pageSlug)}
	>
		{#key `${index}:${theme}:${palette}:${system}`}<Block {data} />{/key}
	</div>
{/if}

<style>
	:global([data-testid='sample'] *) {
		transition: none !important;
		animation-duration: 0s !important;
		animation-delay: 0s !important;
	}
</style>
