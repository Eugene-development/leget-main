<script lang="ts">
	import { fade } from 'svelte/transition';
	import { browser } from '$app/environment';

	/**
	 * Компактный бейдж артикула с тултипом-расшифровкой сегментов.
	 * Применяется в переключателях layout-компонентов (баннер/футер), где не используется
	 * общий VersionSwitcher (у которого свой встроенный бейдж).
	 *
	 * article — строка вида "{template}.{section}.{component}.{version}" (4 сегмента)
	 *           либо 3 сегмента (без version).
	 * sectionLabel — подпись сегмента 2 («Страница» для page-компонентов,
	 *                «Раздел» для layout-компонентов с буквенным кодом).
	 */
	let {
		article = null,
		sectionLabel = 'Страница',
		align = 'right'
	}: {
		article?: string | null;
		sectionLabel?: string;
		/** Сторона выравнивания тултипа: 'right' (по умолчанию, для правого края) или 'left' (в узких панелях/дрверах). */
		align?: 'left' | 'right';
	} = $props();

	const TEMPLATE_NAMES: Record<number, string> = { 1: 'Promo-1', 2: 'Promo-2', 3: 'Promo-3' };

	let showHint = $state(false);

	// Десктоп (есть hover) — раскрываем по наведению. Тач-устройства — по клику:
	// первый тап открывает, повторный — закрывает.
	let canHover = $state(true);
	$effect(() => {
		if (!browser) return;
		const mq = window.matchMedia('(hover: hover)');
		canHover = mq.matches;
		const update = () => (canHover = mq.matches);
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	const segments = $derived.by(() => {
		if (!article) return null;
		const parts = article.split('.');
		if (parts.length < 3) return null;
		return {
			template: parts[0],
			section: parts[1],
			component: parts[2],
			version: parts[3] ?? null
		};
	});
</script>

{#if article && segments}
	<button
		type="button"
		class="relative flex cursor-default items-center rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 font-mono text-[11px] font-semibold tracking-wider text-white shadow-2xl select-none"
		onmouseenter={() => canHover && (showHint = true)}
		onmouseleave={() => canHover && (showHint = false)}
		onclick={() => !canHover && (showHint = !showHint)}
		aria-expanded={showHint}
		aria-label="Артикул {article}"
	>
		{article}

		{#if showHint}
			<div
				class="absolute top-full {align === 'right' ? 'right-0' : 'left-0'} z-[300] mt-2 w-64 rounded-2xl border border-white/10 bg-slate-950 p-3 font-sans shadow-2xl"
				role="tooltip"
				transition:fade={{ duration: 120 }}
			>
				<div class="mb-2 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
					<span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Артикул</span>
					<span class="font-mono text-xs font-bold text-white">{article}</span>
				</div>
				<ul class="flex flex-col gap-1.5 text-[11px] leading-tight">
					<li class="flex items-baseline gap-2">
						<span class="w-3 text-center font-mono font-bold text-emerald-300">{segments.template}</span>
						<span class="text-slate-300"
							>Шаблон{#if TEMPLATE_NAMES[Number(segments.template)]}<span class="text-slate-500">
									({TEMPLATE_NAMES[Number(segments.template)]})</span
								>{/if}</span
						>
					</li>
					<li class="flex items-baseline gap-2">
						<span class="w-3 text-center font-mono font-bold text-sky-300">{segments.section}</span>
						<span class="text-slate-300">{sectionLabel}</span>
					</li>
					<li class="flex items-baseline gap-2">
						<span class="w-3 text-center font-mono font-bold text-violet-300">{segments.component}</span>
						<span class="text-slate-300">Компонент</span>
					</li>
					{#if segments.version}
						<li class="flex items-baseline gap-2">
							<span class="w-3 text-center font-mono font-bold text-amber-300">{segments.version}</span>
							<span class="text-slate-300">Версия (v{segments.version})</span>
						</li>
					{/if}
				</ul>
			</div>
		{/if}
	</button>
{/if}
