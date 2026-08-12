<script lang="ts">
	import { dev } from '$app/environment';
	import { resolveComponent } from '$lib/ds/registry';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// load уже проверил, что компонент существует, — иначе была бы 404.
	const Block = $derived(resolveComponent(data.templateId, data.pageSlug, data.type)!);

	/**
	 * Замер блока против липкого хрома сайта.
	 *
	 * Каталог монтирует блок голым (см. `_ds/+layout.svelte`), и это правильно
	 * для карточек — но именно поэтому автор блока не видит, что на живой
	 * странице верх секции закрыт хедером. Слепое пятно стоило анатомии
	 * `Incentives/v3`: блок был сверстан «в экран» по превью, а на сайте в
	 * экран не влезал.
	 *
	 * Здесь не хедер, а его габарит: настоящий хедер сломал бы 232 карточки
	 * в Claude Design, подставив в каждую чужую шапку.
	 *
	 * Высоты берутся из `--banner-h` / `--header-h`. На этом маршруте ни
	 * Header.svelte, ни Banner.svelte не смонтированы, поэтому в дело идут
	 * SSR-дефолты из layout.css — ровно то, что и нужно превью: типовой габарит,
	 * а не габарит конкретного тенанта.
	 */
	let blockEl = $state<HTMLElement | null>(null);
	let blockH = $state(0);
	let viewportH = $state(0);
	let chromeH = $state(0);

	$effect(() => {
		const el = blockEl;
		if (!dev || !el) return;

		const read = () => {
			const px = (v: string) => Number.parseFloat(v) || 0;
			const root = getComputedStyle(document.documentElement);
			blockH = Math.round(el.getBoundingClientRect().height);
			viewportH = window.innerHeight;
			chromeH = Math.round(
				px(root.getPropertyValue('--banner-h')) + px(root.getPropertyValue('--header-h'))
			);
		};

		read();
		const observer = new ResizeObserver(read);
		observer.observe(el);
		window.addEventListener('resize', read);
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', read);
		};
	});

	const available = $derived(viewportH - chromeH);
	const fits = $derived(blockH > 0 && blockH <= available);
</script>

<svelte:head>
	<title>{data.templateId}{data.pageSlug}:{data.type} v{data.version}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<!--
	Блок монтируется голым: без layout сайта, без редакторской обвязки.
	Переключатель версий, бейдж артикула и панель настроек внутри компонентов
	условны по isEditable && editContext — передаём false/null и получаем чистую
	разметку, вырезать ничего не нужно.

	data передаём без bind: свойство объявлено $bindable, но писать в него компонент
	будет только при редактировании, которого здесь нет. Своя копия в $state тут лишь
	мешала бы — при переходе между карточками она бы залипала на первом значении.
-->
<div bind:this={blockEl}>
	<Block data={data.data} editContext={null} isEditable={false} />
</div>

{#if dev}
	<!--
		Инструмент разработчика, а не часть сайта: живёт поверх страницы, ничего
		не перехватывает и в сборку каталога не попадает — `dev` ложен при любом
		билде, включая `DS_CATALOG=1`. Палитра намеренно своя и вне дизайн-системы,
		по тому же основанию, что у VersionSwitcher: это хром платформы.
	-->
	<div class="ds-probe-chrome" style="height: {chromeH}px" aria-hidden="true">
		<span>хром сайта · {chromeH}px</span>
	</div>

	<output class="ds-probe-readout" class:ds-probe-readout--over={!fits}>
		блок {blockH}px · под хромом {available}px
		<b>{fits ? 'влезает' : `выше на ${blockH - available}px`}</b>
	</output>
{/if}

<style>
	.ds-probe-chrome {
		position: fixed;
		inset: 0 0 auto 0;
		z-index: 9999;
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		padding: 0 12px 4px;
		pointer-events: none;
		background: repeating-linear-gradient(
			135deg,
			rgb(220 38 38 / 0.06) 0 8px,
			transparent 8px 16px
		);
		border-bottom: 1px dashed rgb(220 38 38 / 0.5);
	}

	.ds-probe-chrome span,
	.ds-probe-readout {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 11px;
		line-height: 1;
		letter-spacing: 0.02em;
		color: #b91c1c;
	}

	.ds-probe-readout {
		position: fixed;
		right: 12px;
		bottom: 12px;
		z-index: 9999;
		display: block;
		padding: 7px 10px;
		border: 1px solid rgb(15 23 42 / 0.12);
		border-radius: 8px;
		background: #ffffff;
		box-shadow: 0 8px 24px rgb(15 23 42 / 0.12);
		color: #334155;
		pointer-events: none;
	}

	.ds-probe-readout b {
		font-weight: 600;
		color: #15803d;
	}

	.ds-probe-readout--over b {
		color: #b91c1c;
	}
</style>
