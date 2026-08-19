import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Сторож токенного слоя дизайн-систем.
 *
 * Ловит провал, который иначе не виден ни в сборке, ни на глаз: система
 * с пропущенным ключом не остаётся без него, а ДОСТАЁТ его от Базовой —
 * та объявлена и на голом `:root`. Страница молча становится смесью двух
 * палитр, и заметно это только там, где палитры расходятся сильно.
 *
 * Три проверки:
 *   1. Набор ключей каждой системы совпадает с Базовой до последнего.
 *   2. Каждый `var(--ds-…)` в `@theme` разрешается в существующий токен —
 *      ключ, ссылающийся в пустоту, утилиту даёт, а цвета не даёт.
 *   3. Система зарегистрирована: импорт в `tokens.css` + строка в `registry.ts`.
 *
 * Обратное направление (у каждого `--ds-*` есть ключ в `@theme`) намеренно
 * НЕ проверяется: часть токенов берётся в CSS и JS напрямую, потому что
 * namespace в Tailwind v4 у них нет — `--ds-icon-stroke`, `--ds-motion-lift`,
 * `--ds-motion-dwell`, длительности интерактива.
 *
 * Устройство слоя — docs/architecture/design-system-tokens.md
 */

const root = process.cwd();
const systemsDir = join(root, 'src/lib/design-systems');
const BASE_FILE = 'base.css';

/** Объявления — только строки вида `\t--ds-…:`. Ссылки в комментариях мимо. */
function declaredKeys(source) {
	const keys = new Set();
	for (const line of source.split('\n')) {
		const match = line.match(/^\t(--ds-[a-zA-Z0-9-]+)\s*:/);
		if (match) keys.add(match[1]);
	}
	return keys;
}

const errors = [];

const systemFiles = readdirSync(systemsDir)
	.filter((name) => name.endsWith('.css') && name !== 'tokens.css')
	.sort();

if (!systemFiles.includes(BASE_FILE)) {
	console.error(`✗ ${relative(root, join(systemsDir, BASE_FILE))} не найден`);
	process.exit(1);
}

const baseKeys = declaredKeys(readFileSync(join(systemsDir, BASE_FILE), 'utf8'));
const tokensIndex = readFileSync(join(systemsDir, 'tokens.css'), 'utf8');
const registry = readFileSync(join(systemsDir, 'registry.ts'), 'utf8');

const allKeys = new Set(baseKeys);

for (const file of systemFiles) {
	const source = readFileSync(join(systemsDir, file), 'utf8');
	const slug = file.replace(/\.css$/, '');
	const keys = declaredKeys(source);
	for (const key of keys) allKeys.add(key);

	if (file !== BASE_FILE) {
		const missing = [...baseKeys].filter((key) => !keys.has(key)).sort();
		const extra = [...keys].filter((key) => !baseKeys.has(key)).sort();

		if (missing.length) {
			errors.push(
				`${file}: не объявлено ${missing.length} ключей Базовой — они достанутся ` +
					`от :root, и система станет смесью двух палитр:\n    ${missing.join('\n    ')}`
			);
		}
		if (extra.length) {
			errors.push(
				`${file}: ${extra.length} ключей нет в Базовой. Новый токен заводится в base.css, ` +
					`во всех остальных системах и в @theme layout.css — иначе на Базовой его нет:\n    ` +
					extra.join('\n    ')
			);
		}

		/* Селектор: система обязана сидеть на `:root[data-ds='<slug>']`.
		   На голом `:root` объявлена только Базовая — она дефолт. */
		if (!source.includes(`:root[data-ds='${slug}']`)) {
			errors.push(`${file}: нет селектора :root[data-ds='${slug}'] — система не включится`);
		}
		if (/^:root\s*[,{]/m.test(source)) {
			errors.push(
				`${file}: объявление на голом :root. Так объявлена Базовая (она дефолт); ` +
					`вторая такая система перебьёт её всюду, где не совпал порядок склейки`
			);
		}

		if (!tokensIndex.includes(`./${file}`)) {
			errors.push(`${file}: не импортирован в tokens.css — значения не попадут в сборку`);
		}
		if (!registry.includes(`slug: '${slug}'`)) {
			errors.push(`${file}: нет строки в registry.ts — resolveDesignSystem() откатит на Базовую`);
		}
	}
}

/* @theme ссылается только на существующие токены. */
const layoutCss = join(root, 'src/routes/layout.css');
const layout = readFileSync(layoutCss, 'utf8');
const dangling = [...new Set([...layout.matchAll(/var\((--ds-[a-zA-Z0-9-]+)/g)].map((m) => m[1]))]
	.filter((key) => !allKeys.has(key))
	.sort();

if (dangling.length) {
	errors.push(
		`${relative(root, layoutCss)}: ссылки на несуществующие токены — утилита создастся, ` +
			`а значения у неё не будет:\n    ${dangling.join('\n    ')}`
	);
}

if (errors.length) {
	console.error('✗ Токенный слой дизайн-систем:\n');
	for (const error of errors) console.error(`  ${error}\n`);
	process.exit(1);
}

const others = systemFiles.filter((file) => file !== BASE_FILE);
console.log(
	`✓ Токены дизайн-систем: ${baseKeys.size} ключей, ` +
		`${others.length} систем${others.length === 1 ? 'а' : ''} в паритете с Базовой ` +
		`(${others.map((file) => file.replace(/\.css$/, '')).join(', ')})`
);
