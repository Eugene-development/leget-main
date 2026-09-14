export const FAVORITE_PROJECT_IDS_KEY = 'leget:favorite-project-ids';
export const FAVORITES_CHANGED_EVENT = 'leget:favorites-changed';

function normalizeProjectIds(value: unknown): string[] {
	if (!Array.isArray(value)) return [];

	return [...new Set(value.map((id) => String(id)).filter((id) => id !== ''))];
}

/** Избранное принадлежит браузеру посетителя и никогда не читается на сервере. */
export function readFavoriteProjectIds(): string[] {
	if (typeof window === 'undefined') return [];

	try {
		return normalizeProjectIds(
			JSON.parse(window.localStorage.getItem(FAVORITE_PROJECT_IDS_KEY) ?? '[]')
		);
	} catch {
		return [];
	}
}

function writeFavoriteProjectIds(ids: string[]): boolean {
	if (typeof window === 'undefined') return false;

	try {
		window.localStorage.setItem(FAVORITE_PROJECT_IDS_KEY, JSON.stringify(normalizeProjectIds(ids)));
		window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
		return true;
	} catch {
		// Недоступный localStorage не должен ломать просмотр каталога.
		return false;
	}
}

/** Переключает проект и возвращает его новое состояние. */
export function toggleFavoriteProject(projectId: string): boolean {
	const id = String(projectId);
	if (!id) return false;

	const ids = readFavoriteProjectIds();
	const isFavorite = ids.includes(id);
	const saved = writeFavoriteProjectIds(
		isFavorite ? ids.filter((item) => item !== id) : [...ids, id]
	);

	return saved ? !isFavorite : isFavorite;
}

/** Синхронизация нескольких сердец на странице и соседних вкладок браузера. */
export function subscribeToFavoriteProjects(listener: (ids: string[]) => void): () => void {
	if (typeof window === 'undefined') return () => {};

	const sync = () => listener(readFavoriteProjectIds());
	window.addEventListener(FAVORITES_CHANGED_EVENT, sync);
	window.addEventListener('storage', sync);

	return () => {
		window.removeEventListener(FAVORITES_CHANGED_EVENT, sync);
		window.removeEventListener('storage', sync);
	};
}
