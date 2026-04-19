import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	// Layout не загружает pageData — каждая страница делает это сама.
	// Это гарантирует, что при клиентской навигации данные всегда актуальны.
	return {};
};
