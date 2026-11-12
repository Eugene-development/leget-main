export type FavoriteKind = 'kitchen' | 'wardrobe';
export interface FavoriteVariant {
	id: string;
	kind: FavoriteKind;
	title: string;
	description: string;
	image: string;
}

export const FAVORITES_KEY = 'leget:promo2:favorite-variants:v1';
const CHANGED_EVENT = 'leget:promo2:favorites-changed';

export function favoriteVariant(
	kind: FavoriteKind,
	item: { id?: string | number; title: string; description: string; image: string }
): FavoriteVariant {
	return {
		id: `${kind}:${item.id ?? item.image}`,
		kind,
		title: item.title,
		description: item.description,
		image: item.image
	};
}

function normalize(value: unknown): FavoriteVariant[] {
	if (!Array.isArray(value)) return [];
	const unique = new Map<string, FavoriteVariant>();
	for (const item of value) {
		if (
			!item ||
			typeof item !== 'object' ||
			!['kitchen', 'wardrobe'].includes(item.kind) ||
			!['id', 'title', 'description', 'image'].every((key) => typeof item[key] === 'string') ||
			!item.id
		)
			continue;
		try {
			const url = new URL(item.image);
			if (url.protocol !== 'https:') continue;
		} catch {
			continue;
		}
		unique.set(item.id, {
			id: item.id,
			kind: item.kind,
			title: item.title,
			description: item.description,
			image: item.image
		});
	}
	return [...unique.values()];
}

// localStorage изолирован origin сайта. Список посетителя не попадает в данные редактора.
export function readFavorites(): FavoriteVariant[] {
	if (typeof window === 'undefined') return [];
	try {
		return normalize(JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? '[]'));
	} catch {
		return [];
	}
}

export function toggleFavorite(item: FavoriteVariant): { saved: boolean; selected: boolean } {
	if (typeof window === 'undefined') return { saved: false, selected: false };
	const items = readFavorites();
	const selected = items.some((entry) => entry.id === item.id);
	try {
		window.localStorage.setItem(
			FAVORITES_KEY,
			JSON.stringify(
				normalize(selected ? items.filter((entry) => entry.id !== item.id) : [...items, item])
			)
		);
		window.dispatchEvent(new Event(CHANGED_EVENT));
		return { saved: true, selected: !selected };
	} catch {
		return { saved: false, selected };
	}
}

export function subscribeFavorites(listener: (items: FavoriteVariant[]) => void): () => void {
	if (typeof window === 'undefined') return () => {};
	const sync = () => listener(readFavorites());
	const storage = (event: StorageEvent) => {
		if (event.key === FAVORITES_KEY || event.key === null) sync();
	};
	window.addEventListener(CHANGED_EVENT, sync);
	window.addEventListener('storage', storage);
	return () => {
		window.removeEventListener(CHANGED_EVENT, sync);
		window.removeEventListener('storage', storage);
	};
}
