import test from 'node:test';
import assert from 'node:assert/strict';
import {
	FAVORITES_KEY,
	favoriteVariant,
	readFavorites,
	subscribeFavorites,
	toggleFavorite
} from '../src/lib/components/templates/Promo-2/favorites/storage.ts';

const kitchen = favoriteVariant('kitchen', {
	title: 'Бостон',
	description: 'Крашеные фасады',
	image: 'https://storage.yandexcloud.net/zovtop/kitchens/cam-1-1600x0.webp'
});
const wardrobe = favoriteVariant('wardrobe', {
	title: 'Шкаф',
	description: 'Крашеные фасады',
	image: 'https://storage.yandexcloud.net/zovtop/wardrobes/hbhfbvjkfnvkdfjv.webp'
});

function browser() {
	const values = new Map();
	const target = new EventTarget();
	target.localStorage = {
		getItem: (key) => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, value)
	};
	globalThis.window = target;
	return target;
}

test('SSR does not read browser storage', () => {
	delete globalThis.window;
	assert.deepEqual(readFavorites(), []);
	assert.deepEqual(toggleFavorite(kitchen), { saved: false, selected: false });
	assert.doesNotThrow(subscribeFavorites(() => {}));
});

test('kitchens and wardrobes survive navigation, synchronize hearts and can be removed independently', () => {
	const win = browser();
	const updates = [];
	const unsubscribe = subscribeFavorites((items) => updates.push(items.map((item) => item.id)));
	assert.deepEqual(toggleFavorite(kitchen), { saved: true, selected: true });
	assert.deepEqual(toggleFavorite(wardrobe), { saved: true, selected: true });
	assert.deepEqual(readFavorites(), [kitchen, wardrobe]);
	assert.equal(updates.length, 2);
	assert.deepEqual(toggleFavorite(kitchen), { saved: true, selected: false });
	assert.deepEqual(readFavorites(), [wardrobe]);
	// Clearing data in another tab updates all subscribers.
	win.localStorage.setItem(FAVORITES_KEY, '[]');
	const event = new Event('storage');
	Object.defineProperty(event, 'key', { value: FAVORITES_KEY });
	win.dispatchEvent(event);
	assert.deepEqual(updates.at(-1), []);
	unsubscribe();
	toggleFavorite(kitchen);
	assert.equal(updates.length, 4);
});

test('broken and stale browser data cannot break the page or create duplicate cards', () => {
	const win = browser();
	win.localStorage.setItem(FAVORITES_KEY, '{invalid');
	assert.deepEqual(readFavorites(), []);
	win.localStorage.setItem(
		FAVORITES_KEY,
		JSON.stringify([null, {}, kitchen, kitchen, { ...wardrobe, image: 'javascript:alert(1)' }])
	);
	assert.deepEqual(readFavorites(), [kitchen]);
});

test('a denied write reports failure and retains the existing selection', () => {
	const win = browser();
	toggleFavorite(kitchen);
	win.localStorage.setItem = () => {
		throw new Error('QuotaExceededError');
	};
	assert.deepEqual(toggleFavorite(wardrobe), { saved: false, selected: false });
	assert.deepEqual(toggleFavorite(kitchen), { saved: false, selected: true });
	assert.deepEqual(readFavorites(), [kitchen]);
	delete globalThis.window;
});
