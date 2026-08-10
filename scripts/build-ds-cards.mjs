#!/usr/bin/env node
/**
 * Собирает самодостаточные превью-карточки компонентов для Claude Design
 * из пререндеренного каталога /_ds.
 *
 * Зачем не инлайнить бандл целиком: собранный CSS весит ~455 КБ, карточек больше двухсот.
 * Поэтому каждой карточке достаётся только тот CSS, который она реально использует —
 * подмножество вырезается из уже собранного бандла, а не генерируется заново Tailwind'ом.
 * Так карточка выглядит ровно как прод: в бандле помимо утилит лежат scoped-стили
 * Svelte-компонентов, @font-face и переменные темы, которых Tailwind сам по себе не знает.
 *
 * Шрифты вшиваются в data: URI и режутся дважды: сначала отбрасываются @font-face, чей
 * unicode-range не пересекается с текстом карточки (русская карточка не тащит latin-ext /
 * cyrillic-ext), потом оставшиеся сабсетятся по глифам — в шрифте остаются только символы,
 * которые на карточке есть. Без второго шага каталог весил 48 МБ вместо 16.
 *
 * Предварительно нужен пререндер каталога:
 *   DS_CATALOG=1 npm run build
 *
 * Запуск (из ms/leget-main):
 *   node scripts/build-ds-cards.mjs              собрать в build/ds-cards
 *   node scripts/build-ds-cards.mjs --no-fonts   без вшитых шрифтов (кратно легче)
 *   node scripts/build-ds-cards.mjs --report     только отчёт, ничего не писать
 *
 * Ненулевой код возврата — пререндера нет или все карточки пустые.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import subsetFont from 'subset-font';
import selectorParser from 'postcss-selector-parser';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PRERENDERED = join(ROOT, 'build/prerendered/_ds');
const CLIENT = join(ROOT, 'build/client');
const OUT = join(ROOT, 'build/ds-cards');

const noFonts = process.argv.includes('--no-fonts');
const reportOnly = process.argv.includes('--report');

/** Ниже этого числа видимых символов блок считается пустым и в каталог не идёт. */
const MIN_TEXT = 40;

/* ------------------------------------------------------------------ утилиты */

function walkFiles(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		statSync(p).isDirectory() ? walkFiles(p, out) : out.push(p);
	}
	return out;
}

/**
 * Видимый текст: без script/style и без разметки.
 *
 * По нему решается и «пустая ли карточка», и какие глифы оставить в шрифте. Символы,
 * которые CSS дорисовывает через `content:`, сюда не попадают — на 08.08.2026 таких
 * в каталоге нет ни одного (проверено по всем карточкам), но если появятся, их надо
 * будет добавлять в набор для сабсеттинга, иначе вместо них будут пустые квадраты.
 */
function visibleText(html) {
	const body = html.slice(html.indexOf('<body'));
	return body
		.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&[a-z]+;|&#\d+;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/* ------------------------------------------------------- отбор CSS под карточку */

/**
 * Классы, идентификаторы и имена анимаций, встречающиеся в разметке карточки.
 * Имена анимаций нужны из-за инлайновых style="animation:..." — на них ссылаются
 * @keyframes, которые иначе были бы вырезаны как неиспользуемые.
 */
function collectUsage(html) {
	const classes = new Set();
	const ids = new Set();
	const inlineAnimations = new Set();

	for (const m of html.matchAll(/class="([^"]*)"/g)) {
		for (const c of m[1].split(/\s+/)) if (c) classes.add(c);
	}
	for (const m of html.matchAll(/\sid="([^"]*)"/g)) ids.add(m[1]);
	for (const m of html.matchAll(/animation(?:-name)?\s*:\s*([a-zA-Z0-9_-]+)/g)) {
		inlineAnimations.add(m[1]);
	}

	return { classes, ids, inlineAnimations };
}

/**
 * Подходит ли селектор карточке.
 *
 * Правило: селектор оставляем, если КАЖДЫЙ упомянутый в нём класс и идентификатор
 * присутствует в разметке. Селектор без классов и идентификаторов (`*`, `:root`,
 * `h1`, `::selection`, `body`) оставляем всегда — это базовый слой и переменные темы,
 * без которых карточка развалится.
 */
function selectorMatches(selectorAst, usage) {
	let ok = true;

	selectorAst.walk((node) => {
		if (node.type === 'class' && !usage.classes.has(node.value)) ok = false;
		if (node.type === 'id' && !usage.ids.has(node.value)) ok = false;
	});

	return ok;
}

function filterSelectorList(selector, usage) {
	const kept = [];

	selectorParser((root) => {
		root.each((sel) => {
			if (selectorMatches(sel, usage)) kept.push(String(sel).trim());
		});
	}).processSync(selector);

	return kept;
}

/**
 * Вырезает из CSS всё, что карточке не нужно.
 *
 * Работает в два прохода: сначала отбираются обычные правила, потом — @keyframes,
 * потому что понять, какая анимация используется, можно только по уже отобранным
 * объявлениям.
 */
function subsetCss(css, usage) {
	const root = postcss.parse(css);
	const usedAnimations = new Set(usage.inlineAnimations);
	const fontFaces = [];

	root.walkAtRules('font-face', (at) => {
		fontFaces.push(at);
		at.remove();
	});

	const keyframes = [];
	root.walkAtRules(/^(-\w+-)?keyframes$/, (at) => {
		keyframes.push(at);
		at.remove();
	});

	root.walkRules((rule) => {
		// Правила внутри @keyframes уже вынесены выше; сюда попадают только обычные.
		const kept = filterSelectorList(rule.selector, usage);

		if (kept.length === 0) {
			rule.remove();
			return;
		}

		rule.selector = kept.join(',');

		rule.walkDecls(/^animation(-name)?$/, (decl) => {
			for (const part of decl.value.split(',')) {
				const name = part.trim().split(/\s+/).find((t) => /^[a-zA-Z_-][\w-]*$/.test(t) && !isCssKeyword(t));
				if (name) usedAnimations.add(name);
			}
		});
	});

	// Пустые обёртки (@media/@supports/@layer, из которых всё вычистили) не нужны.
	let removed = true;
	while (removed) {
		removed = false;
		root.walkAtRules((at) => {
			if (at.nodes && at.nodes.length === 0) {
				at.remove();
				removed = true;
			}
		});
	}

	for (const at of keyframes) {
		if (usedAnimations.has(at.params)) root.append(at);
	}

	revealFinalState(root);

	return { css: root.toString(), fontFaces };
}

/**
 * Приводит анимации появления к конечному состоянию.
 *
 * Блоки приезжают из SSR скрытыми, а раскрывает их JS: в шаблонах два механизма —
 * класс `opacity-0` в разметке плюс `class:animate-fade-up={visible}` (76 файлов)
 * и правило `.{p}-reveal .{p}-item { opacity: 0 }`, которое снимается добавлением
 * `.{p}-reveal-visible` через action revealOnScroll (7 файлов).
 *
 * В карточке скриптов нет, поэтому без этой правки половина превью — пустой экран.
 * Сдвиги, идущие в паре с opacity-0, не трогаем: они не больше 8px
 * (translate-y-2, translate-x-1) и на превью незаметны, а глушить transform скопом
 * рискованно — им пользуется и обычная вёрстка.
 */
function revealFinalState(root) {
	root.walkRules(/-reveal(\s|\.|$)/, (rule) => {
		rule.walkDecls('opacity', (decl) => {
			if (decl.value.trim() === '0') decl.value = '1';
		});
	});

	root.append('.opacity-0{opacity:1 !important}');
}

const CSS_KEYWORDS = new Set([
	'infinite', 'alternate', 'normal', 'reverse', 'forwards', 'backwards', 'both', 'none',
	'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'running', 'paused', 'step-start',
	'step-end', 'initial', 'inherit', 'unset'
]);

function isCssKeyword(token) {
	return CSS_KEYWORDS.has(token) || /^\d/.test(token) || token.includes('(');
}

/* --------------------------------------------------------------------- шрифты */

/** Диапазоны unicode-range в виде массива [from, to]. */
function parseUnicodeRange(value) {
	const ranges = [];

	for (const part of value.split(',')) {
		const t = part.trim().replace(/^U\+/i, '');
		if (t.includes('-')) {
			const [a, b] = t.split('-');
			ranges.push([parseInt(a, 16), parseInt(b, 16)]);
		} else if (t.includes('?')) {
			ranges.push([parseInt(t.replaceAll('?', '0'), 16), parseInt(t.replaceAll('?', 'F'), 16)]);
		} else {
			const c = parseInt(t, 16);
			ranges.push([c, c]);
		}
	}

	return ranges;
}

function textHitsRanges(codepoints, ranges) {
	for (const cp of codepoints) {
		for (const [a, b] of ranges) if (cp >= a && cp <= b) return true;
	}
	return false;
}

/** Кэш сабсетов: один и тот же шрифт с тем же набором символов режем один раз. */
const subsetCache = new Map();

async function subsetWoff2(file, chars) {
	const key = `${file}|${chars}`;

	if (!subsetCache.has(key)) {
		subsetCache.set(key, await subsetFont(readFileSync(file), chars, { targetFormat: 'woff2' }));
	}

	return subsetCache.get(key);
}

/**
 * Вшивает шрифты в data: URI — внешние запросы в панели Design System заблокированы CSP.
 *
 * Два уровня отсечения, и второй даёт основную экономию:
 *
 *   1. Отбрасываются @font-face, чей unicode-range не пересекается с текстом карточки:
 *      русская карточка не тащит latin-ext / cyrillic-ext.
 *   2. Оставшиеся режутся по глифам — в шрифте остаются только символы, которые на
 *      карточке реально есть. Их около сотни, а не весь диапазон, поэтому файл
 *      сжимается в десятки раз. Без этого шага одни только шрифты давали 39 МБ
 *      на каталог: один и тот же woff2, повторённый в каждой из 232 карточек.
 */
async function inlineFonts(fontFaces, text) {
	if (noFonts) return '';

	const codepoints = new Set([...text].map((ch) => ch.codePointAt(0)));
	const out = [];

	for (const at of fontFaces) {
		const range = at.nodes?.find((n) => n.prop === 'unicode-range')?.value;
		const ranges = range ? parseUnicodeRange(range) : null;

		if (ranges && !textHitsRanges(codepoints, ranges)) continue;

		const src = at.nodes?.find((n) => n.prop === 'src');
		if (!src) continue;

		const m = /url\(([^)]+)\)/.exec(src.value);
		if (!m) continue;

		const file = join(CLIENT, m[1].replace(/["']/g, '').replace(/^(\.\.\/)+/, ''));
		if (!existsSync(file)) continue;

		// Режем по символам именно этого диапазона: иначе в сабсет попросились бы
		// глифы, которых в исходном файле нет, и harfbuzz просто их проигнорировал бы,
		// но ключ кэша стал бы бессмысленно уникальным для каждой карточки.
		const chars = [...new Set([...text])]
			.filter((ch) => !ranges || textHitsRanges([ch.codePointAt(0)], ranges))
			.sort()
			.join('');

		if (chars === '') continue;

		let data;
		try {
			data = await subsetWoff2(file, chars);
		} catch {
			// Сабсеттинг не удался — лучше вшить шрифт целиком, чем потерять начертание.
			data = readFileSync(file);
		}

		src.value = src.value.replace(m[0], `url("data:font/woff2;base64,${data.toString('base64')}")`);
		out.push(String(at));
	}

	return out.join('');
}

/* ------------------------------------------------------------------ карточка */

/**
 * Группа карточки в панели Design System.
 *
 * Целевая модель — «одна дизайн-система = одна группа», но сейчас все версии лежат
 * в Базовой (см. docs/architecture/design-systems.md), и такая группировка дала бы
 * одну кучу на 240 карточек. До распределения версий по настоящим системам группируем
 * по шаблону и странице; когда распределение появится, менять надо только эту функцию.
 */
function cardGroup({ templateName, pageSlug }) {
	return `${templateName} · ${pageSlug}`;
}

async function buildCard(htmlPath) {
	const html = readFileSync(htmlPath, 'utf8');
	const rel = relative(PRERENDERED, htmlPath).replace(/\.html$/, '');
	const [template, page, type, version] = rel.split('/');

	const text = visibleText(html);
	const hasImages = /<img|background-image/i.test(html);
	const usage = collectUsage(html);

	// Пути к стилям берём из самой карточки: у разных страниц набор чанков разный.
	const hrefs = [...html.matchAll(/<link href="([^"]+\.css)" rel="stylesheet">/g)].map((m) => m[1]);

	let css = '';
	let fontFaces = [];

	for (const href of hrefs) {
		const file = join(CLIENT, href.replace(/^(\.\.\/)+/, ''));
		if (!existsSync(file)) continue;

		const res = subsetCss(readFileSync(file, 'utf8'), usage);
		css += res.css;
		fontFaces = fontFaces.concat(res.fontFaces);
	}

	css = (await inlineFonts(fontFaces, text)) + css;

	// Скрипты и модульные предзагрузки карточке не нужны: она статична, Svelte-рантайм
	// в ней не запускается, а вес это добавляет заметный. Иконку тоже убираем — это
	// единственный оставшийся запрос к серверу, которого у карточки нет.
	let out = html
		.replace(/<link href="[^"]*" rel="modulepreload">/g, '')
		.replace(/<link href="[^"]*\.css" rel="stylesheet">/g, '')
		.replace(/<link rel="icon"[^>]*>/g, '')
		.replace(/<script[\s\S]*?<\/script>/g, '')
		.replace('</head>', `<style>${css}</style></head>`);

	// Картинки со сторонних доменов (логотипы партнёров) в панели Design System
	// заблокирует CSP. Вшивать их не станем: это чужие ассеты, и скачивать их
	// на сборке — отдельное решение. Просто считаем и показываем в отчёте.
	const externalImages = [
		...new Set([...out.matchAll(/<img[^>]+src="(https?:\/\/[^"]+)"/g)].map((m) => new URL(m[1]).host))
	];

	const templateName = { 1: 'Promo-1', 2: 'Promo-2', 3: 'Promo-3' }[template] ?? `Template ${template}`;
	const pageSlug = page === '_root' ? '/' : '/' + page.replaceAll('~', '/');
	const name = `${type} ${version}`;
	const marker = `<!-- @dsCard group="${cardGroup({ templateName, pageSlug })}" name="${name}" width="1280" -->\n`;

	return {
		rel,
		html: marker + out,
		bytes: Buffer.byteLength(marker + out),
		textLength: text.length,
		hasImages,
		externalImages,
		thin: text.length < MIN_TEXT && !hasImages
	};
}

/* ---------------------------------------------------------------------- main */

if (!existsSync(PRERENDERED)) {
	console.error('Нет build/prerendered/_ds — сначала: DS_CATALOG=1 npm run build');
	process.exit(1);
}

const files = walkFiles(PRERENDERED).filter((f) => f.endsWith('.html'));
// Последовательно, а не Promise.all: сабсеттинг упирается в CPU, а кэш
// эффективнее работает, когда соседние карточки идут подряд.
const cards = [];
for (const f of files) cards.push(await buildCard(f));
const good = cards.filter((c) => !c.thin);
const thin = cards.filter((c) => c.thin);

if (!reportOnly) {
	rmSync(OUT, { recursive: true, force: true });

	for (const card of good) {
		const dest = join(OUT, `${card.rel}.html`);
		mkdirSync(dirname(dest), { recursive: true });
		writeFileSync(dest, card.html, 'utf8');
	}
}

const totalKb = (arr) => Math.round(arr.reduce((s, c) => s + c.bytes, 0) / 1024);
const sorted = [...good].sort((a, b) => b.bytes - a.bytes);

console.log(`карточек:        ${cards.length}`);
console.log(`в каталог:       ${good.length}  (${totalKb(good)} КБ${noFonts ? ', без шрифтов' : ' со шрифтами'})`);
console.log(`отсеяно пустых:  ${thin.length}`);
console.log(`средний размер:  ${Math.round(totalKb(good) / Math.max(good.length, 1))} КБ`);

if (sorted.length) {
	console.log(`\nсамые тяжёлые:`);
	for (const c of sorted.slice(0, 5)) console.log(`  ${Math.round(c.bytes / 1024)} КБ  ${c.rel}`);
}

if (thin.length) {
	console.log(`\nпустые (нужны фикстуры руками):`);
	for (const c of thin.slice(0, 15)) console.log(`  ${c.textLength} симв.  ${c.rel}`);
	if (thin.length > 15) console.log(`  … ещё ${thin.length - 15}`);
}

const withExternal = good.filter((c) => c.externalImages.length);

if (withExternal.length) {
	console.log(`\nкартинки со сторонних доменов — их заблокирует CSP панели:`);
	for (const c of withExternal) console.log(`  ${c.rel}  (${c.externalImages.join(', ')})`);
}

if (!reportOnly) console.log(`\nзаписано в ${relative(ROOT, OUT)}`);

process.exit(good.length === 0 ? 1 : 0);
