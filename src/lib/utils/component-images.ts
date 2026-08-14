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

function humanize(key: string): string {
	const labels: Record<string, string> = {
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
		photo: 'Фотография',
		poster: 'Обложка',
		thumbnail: 'Миниатюра'
	};
	if (labels[key]) return labels[key];
	return key
		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.replace(/\b\w/g, (letter) => letter.toLocaleUpperCase('ru-RU'));
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
