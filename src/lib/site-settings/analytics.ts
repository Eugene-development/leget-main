const YANDEX_COUNTER_ID = /^\d{1,20}$/;
const GOOGLE_TAG_ID = /^(?:G|GT|AW|DC)-[A-Z0-9-]{4,32}$/;

export function normalizeYandexCounterId(value: unknown): string {
	if (typeof value !== 'string') return '';
	const normalized = value.trim();
	return YANDEX_COUNTER_ID.test(normalized) ? normalized : '';
}

export function normalizeGoogleTagId(value: unknown): string {
	if (typeof value !== 'string') return '';
	const normalized = value.trim().toUpperCase();
	return GOOGLE_TAG_ID.test(normalized) ? normalized : '';
}

export function isValidYandexCounterId(value: string): boolean {
	return value === '' || YANDEX_COUNTER_ID.test(value);
}

export function isValidGoogleTagId(value: string): boolean {
	return value === '' || GOOGLE_TAG_ID.test(value);
}
