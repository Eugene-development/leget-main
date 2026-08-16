/**
 * Разбор морфотипа — грамматики v3 из docs/architecture/component-morphotypes.md.
 *
 *   <каркас>[(<медиа>)][.<управление>] : <группа>[ + <группа>…]
 *
 * Модуль намеренно чистый: ни одного импорта, ни обращения к сети или окружению.
 * Это делает его проверяемым в отрыве от приложения — `scripts/check-morphotype-names.mjs`
 * прогоняет через него все 256 морфотипов каталога и ловит расхождение разбора
 * с грамматикой до того, как тенант увидит блок без подписи.
 */

// ── Морфотип ────────────────────────────────────────────────────────────────
// Разбор грамматики v3: <каркас>[(<медиа>)][.<управление>] : <группа>[ + <группа>…]
// Группа-коллекция: <род>.<раскладка>.<кардинальность>.<медиа>[.<управление>]
// Группа без коллекции: <род>[(<медиа>)]

const SHELL: Record<string, string> = {
	plain: 'одна колонка',
	split: 'двухколонник',
	overlay: 'поверх медиа',
	aside: 'с залипающей колонкой',
	bar: 'полоса',
	dock: 'закреплённая панель'
};

const LAYOUT: Record<string, string> = {
	grid: 'сетка',
	row: 'ряд',
	stack: 'стопка',
	mosaic: 'мозаика',
	rail: 'лента'
};

const MEDIA: Record<string, string> = {
	none: 'без знака',
	icon: 'иконки',
	photo: 'фото',
	logo: 'логотипы',
	avatar: 'портреты',
	metric: 'крупные числа',
	video: 'видео',
	map: 'карта'
};

const CONTROL: Record<string, string> = {
	tabs: 'вкладки',
	filter: 'фильтр',
	accordion: 'аккордеон',
	carousel: 'карусель',
	pager: 'пагинация',
	picker: 'переключатель',
	submit: 'отправка',
	timer: 'таймер'
};

/**
 * Короткое имя конструкции — последняя ступень каскада подписи.
 *
 * Ключ — «род + раскладка» ведущей группы: именно эта пара отвечает на вопрос
 * «что это за блок», не приплетая назначения. Умышленно короткое: значение идёт
 * в заголовок панели, где длинная расшифровка не помещается, — для неё есть
 * `describeMorph`.
 */
const SHORT_NAME: Record<string, string> = {
	actions: 'Заголовок с кнопками',
	text: 'Текстовый блок',
	media: 'Изображение',
	table: 'Таблица',
	'cards.grid': 'Сетка карточек',
	'cards.mosaic': 'Мозаика карточек',
	'cards.rail': 'Лента карточек',
	'cards.stack': 'Карточки в столбец',
	'cards.row': 'Ряд карточек',
	'tiles.grid': 'Плитки с фото',
	'list.grid': 'Сетка строк',
	'list.stack': 'Список',
	'list.row': 'Строка пунктов',
	'list.rail': 'Бегущая строка',
	'logos.grid': 'Логотипы',
	'logos.row': 'Логотипы',
	'logos.rail': 'Лента логотипов',
	'fields.stack': 'Форма',
	'fields.row': 'Строка формы',
	'table.stack': 'Таблица'
};

interface MorphGroup {
	rod: string;
	layout?: string;
	cardinality?: string;
	media?: string;
	control?: string;
}

interface ParsedMorph {
	shell: { kind: string; media: string | null; control: string | null };
	groups: MorphGroup[];
}

export function parseMorph(morph: string | null | undefined): ParsedMorph | null {
	if (!morph) return null;

	const [shellRaw, groupsRaw] = morph.split(' : ');
	if (!shellRaw || !groupsRaw) return null;

	const shellMatch = shellRaw.trim().match(/^(\w+)(?:\((\w+)\))?(?:\.([\w&]+))?$/);
	if (!shellMatch) return null;

	const groups: MorphGroup[] = [];
	for (const raw of groupsRaw.split(' + ')) {
		const plain = raw.trim().match(/^(\w+)(?:\((\w+)\))?$/);
		if (plain) {
			groups.push({ rod: plain[1], media: plain[2] });
			continue;
		}
		const [rod, layout, cardinality, media, control] = raw.trim().split('.');
		groups.push({ rod, layout, cardinality, media, control });
	}

	if (groups.length === 0) return null;

	return {
		shell: { kind: shellMatch[1], media: shellMatch[2] ?? null, control: shellMatch[3] ?? null },
		groups
	};
}

/** Короткое имя конструкции для заголовка панели. */
export function blockNameFromMorph(morph: string | null | undefined): string | null {
	const parsed = parseMorph(morph);
	if (!parsed) return null;

	const lead = parsed.groups[0];
	const key = lead.layout ? `${lead.rod}.${lead.layout}` : lead.rod;

	return SHORT_NAME[key] ?? SHORT_NAME[lead.rod] ?? null;
}

/** Полная расшифровка конструкции — вторая строка в панели, где место есть. */
export function describeMorph(morph: string | null | undefined): string | null {
	const parsed = parseMorph(morph);
	if (!parsed) return null;

	const control = (value: string) =>
		value
			.split('&')
			.map((item) => CONTROL[item] ?? item)
			.join(' + ');

	const media = (value: string) =>
		value
			.split('/')
			.map((item) => (item === 'ord' ? 'с нумерацией' : (MEDIA[item] ?? item)))
			.join(', ');

	const cardinality = (value: string) =>
		value.startsWith('=') ? `ровно ${value.slice(1)}` : value === 'n' ? 'сколько угодно' : value;

	const shell =
		SHELL[parsed.shell.kind] +
		(parsed.shell.media ? ` (${MEDIA[parsed.shell.media] ?? parsed.shell.media})` : '') +
		(parsed.shell.control ? ` · ${control(parsed.shell.control)}` : '');

	const groups = parsed.groups
		.map((group) =>
			group.layout
				? [
						LAYOUT[group.layout] ?? group.layout,
						cardinality(group.cardinality ?? 'n'),
						media(group.media ?? 'none'),
						group.control ? control(group.control) : null
					]
						.filter(Boolean)
						.join(' · ')
				: (SHORT_NAME[group.rod]?.toLowerCase() ?? group.rod)
		)
		.join(' ⊕ ');

	return `${shell} → ${groups}`;
}
