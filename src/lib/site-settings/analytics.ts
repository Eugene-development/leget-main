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

/** Compares the form draft with persisted settings, without claiming delivery of analytics events. */
export function analyticsSettingsStatus(
	value: string,
	savedValue: string,
	provider: 'yandex' | 'google'
): string {
	const current = value.trim();
	const normalize = provider === 'yandex' ? normalizeYandexCounterId : normalizeGoogleTagId;
	const normalized = normalize(current);
	if (current && !normalized) return 'Некорректный ID';
	if (normalized === normalize(savedValue)) {
		if (normalized) return provider === 'yandex' ? 'Подключена' : 'Подключён';
		return provider === 'yandex' ? 'Отключена' : 'Отключён';
	}
	if (!normalized) {
		return provider === 'yandex'
			? 'Будет отключена после сохранения'
			: 'Будет отключён после сохранения';
	}
	return provider === 'yandex'
		? 'Будет подключена после сохранения'
		: 'Будет подключён после сохранения';
}
