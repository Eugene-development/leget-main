/**
 * Глобальный store для выбранного города
 */

const STORAGE_KEY = 'leget_city';
const DEFAULT_CITY = 'Москва и МО';

function getInitialCity() {
	if (typeof window !== 'undefined') {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) return saved;
	}
	return DEFAULT_CITY;
}

let _city = $state(DEFAULT_CITY);

// Only run this on the client
if (typeof window !== 'undefined') {
	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved) {
		_city = saved;
	}
}

export const cityStore = {
	get city() {
		return _city;
	},
	set(newCity: string) {
		_city = newCity;
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, newCity);
		}
	}
};
