export type ImagePathPart = string | number;

export interface ComponentImageField {
	path: ImagePathPart[];
	pathKey: string;
	label: string;
	value: string;
}

export interface ComponentImageSlot {
	path: ImagePathPart[];
	label?: string;
}

const IMAGE_KEY =
	/(?:^|[_-])(image|images|img|photo|photos|picture|pictures|logo|avatar|poster|thumbnail|thumb|background|bg)(?:[_-]?(url|src))?s?$/i;
const IMAGE_URL =
	/(?:^data:image\/|\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$|\/(?:images?|logos?|bg|foto|photos?|media)\/)/i;
const NON_CONTENT_KEY = /(?:href|link|video|map|route|slug)$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isImageKey(key: string): boolean {
	const compact = key.replace(/([a-z\d])([A-Z])/g, '$1_$2');
	return !NON_CONTENT_KEY.test(compact) && IMAGE_KEY.test(compact);
}

function isImageValue(value: string): boolean {
	return IMAGE_URL.test(value.trim());
}

/**
 * Подписи image-полей панели настроек: ключ данных → человекочитаемое имя.
 * Собраны по всем шаблонам; для коллекций подпись становится префиксом
 * карточки («Бренд: Логотип 2»), для массивов строк — основой с номером
 * («Фото фабрики 1»). Неизвестные ключи разбирает `humanize` ниже.
 */
const FIELD_LABELS: Record<string, string> = {
	// Общие поля
	bg: 'Фон',
	bgImage: 'Фоновое изображение',
	background: 'Фон',
	backgroundImage: 'Фоновое изображение',
	heroImage: 'Изображение первого экрана',
	hero_image: 'Изображение первого экрана',
	mobileImage: 'Изображение для телефона',
	logo: 'Логотип',
	logoUrl: 'Логотип',
	image: 'Изображение',
	imageUrl: 'Изображение',
	images: 'Изображение',
	src: 'Изображение',
	photo: 'Фотография',
	poster: 'Обложка',
	thumbnail: 'Миниатюра',

	// Promo-1
	item1Image: 'Изображение карточки 1',
	item2Image: 'Изображение карточки 2',
	item3Image: 'Изображение карточки 3',
	item4Image: 'Изображение карточки 4',
	item5Image: 'Изображение карточки 5',
	mapImageUrl: 'Изображение карты',
	renderImage: 'Рендер интерьера',
	materialImage: 'Текстура материала',

	// Promo-2
	designImage: 'Изображение: проектирование',
	productionImage: 'Изображение: производство',
	assemblyImage: 'Изображение: сборка',
	factoryImages: 'Фото фабрики',

	// Коллекции: попадают в подпись как префикс или как основа с номером
	brands: 'Бренд',
	partners: 'Партнёр',
	shops: 'Магазин',
	cards: 'Карточка',
	items: 'Карточка',
	categories: 'Категория',
	collections: 'Коллекция',
	directions: 'Направление',
	facades: 'Фасад',
	styles: 'Стиль',
	types: 'Тип',
	gallery: 'Галерея',
	offers: 'Предложение',
	projects: 'Проект'
};

/**
 * Основы для ключей, которых нет в словаре: подпись остаётся русской
 * («partnerLogo» → «Логотип (partner)»), латиница в панель не попадает.
 */
const BASE_WORDS: Record<string, string> = {
	image: 'Изображение',
	images: 'Изображение',
	img: 'Изображение',
	picture: 'Изображение',
	pictures: 'Изображение',
	photo: 'Фотография',
	photos: 'Фотография',
	logo: 'Логотип',
	logos: 'Логотип',
	avatar: 'Аватар',
	poster: 'Обложка',
	cover: 'Обложка',
	banner: 'Баннер',
	icon: 'Иконка',
	thumb: 'Миниатюра',
	thumbnail: 'Миниатюра',
	bg: 'Фон',
	background: 'Фон',
	src: 'Изображение'
};

/** Хвосты, которые ничего не добавляют к подписи: `logoUrl`, `photoSrc`. */
const NOISE_WORDS = new Set(['url', 'urls', 'src', 'link']);

function humanize(key: string): string {
	const exact = FIELD_LABELS[key];
	if (exact) return exact;

	// Версионные слоты (`imageV2`, `bgImageV1`) — та же картинка, просто своя
	// на каждую версию блока. Номер в подпись не выносим: версия видна из
	// артикула компонента, в панели он был бы шумом.
	const base = key.replace(/V\d+$/, '');
	const knownBase = FIELD_LABELS[base];
	if (knownBase) return knownBase;

	const words = base
		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.split(' ')
		.filter(Boolean);
	let baseIndex = -1;
	for (let i = words.length - 1; i >= 0; i -= 1) {
		const word = words[i].toLocaleLowerCase('ru-RU');
		if (BASE_WORDS[word]) {
			baseIndex = i;
			break;
		}
	}

	if (baseIndex >= 0) {
		const label = BASE_WORDS[words[baseIndex].toLocaleLowerCase('ru-RU')];
		const rest = words
			.filter((word, index) => index !== baseIndex)
			.map((word) => word.toLocaleLowerCase('ru-RU'))
			.filter((word) => !NOISE_WORDS.has(word));
		return rest.length ? `${label} (${rest.join(' ')})` : label;
	}

	return words.join(' ').replace(/\b\w/g, (letter) => letter.toLocaleUpperCase('ru-RU'));
}

function fieldLabel(path: ImagePathPart[]): string {
	const key = String(path.at(-1) ?? 'image');
	if (typeof path.at(-1) === 'number') {
		const collection = [...path]
			.slice(0, -1)
			.reverse()
			.find((part) => typeof part === 'string');
		return `${humanize(String(collection ?? 'Изображение'))} ${Number(path.at(-1)) + 1}`;
	}
	const parentIndex = [...path].reverse().find((part) => typeof part === 'number');
	const parentKey = [...path]
		.slice(0, -1)
		.reverse()
		.find((part) => typeof part === 'string');
	const prefix = parentKey && parentKey !== key ? `${humanize(String(parentKey))}: ` : '';
	const index = typeof parentIndex === 'number' ? ` ${parentIndex + 1}` : '';
	return `${prefix}${humanize(key)}${index}`;
}

export function imagePathKey(path: ImagePathPart[]): string {
	return path.map((part) => (typeof part === 'number' ? `[${part}]` : part)).join('.');
}

/**
 * Возвращает все контентные изображения в JSON-данных компонента, включая пустые
 * image/logo-поля. Служебные ссылки и видео намеренно не считаются изображениями.
 */
function valueAtPath(data: Record<string, unknown>, path: ImagePathPart[]): unknown {
	let current: unknown = data;
	for (const part of path) {
		if (Array.isArray(current) && typeof part === 'number') current = current[part];
		else if (isRecord(current)) current = current[String(part)];
		else return undefined;
	}
	return current;
}

export function collectComponentImages(
	data: Record<string, unknown>,
	slots: ComponentImageSlot[] = []
): ComponentImageField[] {
	const result: ComponentImageField[] = [];
	const visited = new WeakSet<object>();

	function visit(value: unknown, path: ImagePathPart[], inheritedImageCollection = false) {
		if (path.length > 8) return;

		if (typeof value === 'string' || value == null) {
			const key = String(path.at(-1) ?? '');
			if (
				inheritedImageCollection ||
				isImageKey(key) ||
				(typeof value === 'string' && isImageValue(value))
			) {
				result.push({
					path,
					pathKey: imagePathKey(path),
					label: fieldLabel(path),
					value: typeof value === 'string' ? value : ''
				});
			}
			return;
		}

		if (typeof value !== 'object' || visited.has(value)) return;
		visited.add(value);

		if (Array.isArray(value)) {
			value.forEach((item, index) => visit(item, [...path, index], inheritedImageCollection));
			return;
		}

		if (isRecord(value)) {
			for (const [key, child] of Object.entries(value)) {
				if (key.startsWith('_')) continue;
				visit(child, [...path, key], isImageKey(key));
			}
		}
	}

	for (const [key, value] of Object.entries(data)) {
		if (key.startsWith('_')) continue;
		visit(value, [key], isImageKey(key));
	}

	const known = new Set(result.map((image) => image.pathKey));
	for (const slot of slots) {
		const pathKey = imagePathKey(slot.path);
		if (known.has(pathKey)) continue;
		const value = valueAtPath(data, slot.path);
		result.push({
			path: slot.path,
			pathKey,
			label: slot.label ?? fieldLabel(slot.path),
			value: typeof value === 'string' ? value : ''
		});
	}

	return result.sort((a, b) => a.pathKey.localeCompare(b.pathKey, 'ru'));
}

/** Не мутирует исходный JSON-blob: реактивность Svelte получает новый корневой объект. */
export function setComponentImage(
	data: Record<string, unknown>,
	path: ImagePathPart[],
	value: string
): Record<string, unknown> {
	if (path.length === 0) return data;

	function setAt(current: unknown, depth: number): unknown {
		const part = path[depth];
		const isLast = depth === path.length - 1;

		if (Array.isArray(current)) {
			const next = [...current];
			const index = typeof part === 'number' ? part : Number(part);
			next[index] = isLast ? value : setAt(next[index], depth + 1);
			return next;
		}

		if (!Array.isArray(current) && typeof part === 'number') {
			const next: unknown[] = [];
			next[part] = isLast ? value : setAt(undefined, depth + 1);
			return next;
		}

		const source = isRecord(current) ? current : {};
		const next: Record<string, unknown> = { ...source };
		const key = String(part);
		const childSeed = next[key] ?? (typeof path[depth + 1] === 'number' ? [] : {});
		next[key] = isLast ? value : setAt(childSeed, depth + 1);
		return next;
	}

	return setAt(data, 0) as Record<string, unknown>;
}
