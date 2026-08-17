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
		sectionHint = null,
		componentHint = null,
		align = 'right',
		placement = 'bottom'
	}: {
		article?: string | null;
		sectionLabel?: string;
		/** Уточнение к сегменту 2 в скобках, напр. slug страницы. */
		sectionHint?: string | null;
		/** Уточнение к сегменту 3 в скобках, напр. тип компонента. */
		componentHint?: string | null;
		/** Сторона выравнивания тултипа: 'right' (по умолчанию, для правого края) или 'left' (в узких панелях/дрверах). */
		align?: 'left' | 'right';
		/** Куда раскрывать тултип: 'bottom' (по умолчанию) или 'top' — когда бейдж стоит у нижнего края блока. */
		placement?: 'top' | 'bottom';
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

	// Клик копирует артикул: его часто переносят в задачи и в запросы к каталогу.
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => () => clearTimeout(copyTimer));

	async function writeToClipboard(text: string): Promise<boolean> {
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
				return true;
			}
		} catch {
			// Clipboard API есть, но отказал (нет фокуса у документа, политика
			// разрешений во фрейме) — не сдаёмся, пробуем старый способ.
		}
		try {
			// Фолбэк: и для небезопасного контекста (http не на localhost), где
			// Clipboard API вовсе недоступен, и для отказа выше.
			const ta = document.createElement('textarea');
			ta.value = text;
			ta.setAttribute('readonly', '');
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild(ta);
			ta.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(ta);
			return ok;
		} catch {
			return false;
		}
	}

	async function copyArticle() {
		if (!article) return;
		// Не скопировалось — не показываем подтверждение, чтобы не обмануть.
		if (!(await writeToClipboard(article))) return;
		copied = true;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = false), 1400);
	}

	function handleClick() {
		// Тач-устройства: тап и копирует, и раскрывает расшифровку (на десктопе её
		// показывает наведение).
		if (!canHover) showHint = !showHint;
		copyArticle();
	}
</script>

{#if article && segments}
	<button
		type="button"
		class="relative flex cursor-pointer items-center gap-1.5 rounded-2xl border bg-ink-950 px-3 py-2 font-mono text-[11px] font-semibold tracking-wider shadow-2xl transition-colors duration-200 select-none {copied
			? 'border-cat-2-500/40 text-cat-2-200'
			: 'border-on-dark/10 text-on-dark hover:border-on-dark/25'}"
		onmouseenter={() => canHover && (showHint = true)}
		onmouseleave={() => canHover && (showHint = false)}
		onclick={handleClick}
		aria-expanded={showHint}
		aria-label="Артикул {article} — скопировать"
		title="Скопировать артикул"
	>
		{article}
		{#if copied}
			<svg
				class="h-3 w-3 shrink-0"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="3"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
			</svg>
		{/if}
		<span class="sr-only" aria-live="polite">{copied ? 'Артикул скопирован' : ''}</span>

		{#if showHint}
			<div
				class="absolute {placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} {align ===
				'right'
					? 'right-0'
					: 'left-0'} z-[300] w-64 rounded-2xl border border-on-dark/10 bg-ink-950 p-3 font-sans shadow-2xl"
				role="tooltip"
				transition:fade={{ duration: 120 }}
			>
				<div class="mb-2 flex items-center justify-between gap-2 border-b border-on-dark/10 pb-2">
					<span class="text-[10px] font-bold tracking-wider text-ink-400 uppercase">Артикул</span>
					<span class="font-mono text-xs font-bold text-on-dark">{article}</span>
				</div>
				<!-- Четыре сегмента артикула раскрашены категориальной шкалой системы:
				     шаблон — cat-2, раздел — cat-5, компонент — cat-3, версия — cat-1.
				     Здесь хью действительно различает: все четыре цифры видны разом, и
				     цвет — единственное, что связывает цифру со строкой расшифровки.
				     Этим случай отличается от списка вариантов в VersionSwitcher, где
				     выбран всегда один и разные подсветки не различали ничего. -->
				<ul class="flex flex-col gap-1.5 text-[11px] leading-tight">
					<li class="flex items-baseline gap-2">
						<span class="w-3 text-center font-mono font-bold text-cat-2-300"
							>{segments.template}</span
						>
						<span class="text-ink-300"
							>Шаблон{#if TEMPLATE_NAMES[Number(segments.template)]}<span class="text-ink-500">
									({TEMPLATE_NAMES[Number(segments.template)]})</span
								>{/if}</span
						>
					</li>
					<li class="flex items-baseline gap-2">
						<span class="w-3 text-center font-mono font-bold text-cat-5-300"
							>{segments.section}</span
						>
						<span class="text-ink-300"
							>{sectionLabel}{#if sectionHint}<span class="text-ink-500">
									({sectionHint})</span
								>{/if}</span
						>
					</li>
					<li class="flex items-baseline gap-2">
						<span class="w-3 text-center font-mono font-bold text-cat-3-300"
							>{segments.component}</span
						>
						<span class="text-ink-300"
							>Компонент{#if componentHint}<span class="text-ink-500">
									({componentHint})</span
								>{/if}</span
						>
					</li>
					{#if segments.version}
						<li class="flex items-baseline gap-2">
							<span class="w-3 text-center font-mono font-bold text-cat-1-300"
								>{segments.version}</span
							>
							<span class="text-ink-300">Версия (v{segments.version})</span>
						</li>
					{/if}
				</ul>
			</div>
		{/if}
	</button>
{/if}
