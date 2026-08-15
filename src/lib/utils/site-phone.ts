export const SITE_PHONE_FALLBACK = '+7 (999) 000-00-00';

/**
 * Единый отображаемый номер сайта. Источник — header_data.phone (баннер).
 * Фолбэк совпадает с обоими вариантами Banner в Promo-1.
 */
export function resolveSitePhone(phone: string | null | undefined): string {
	return phone?.trim() || SITE_PHONE_FALLBACK;
}

/** Преобразует отображаемый номер со скобками и пробелами в безопасный tel: href. */
export function sitePhoneHref(phone: string | null | undefined): string {
	return `tel:${resolveSitePhone(phone).replace(/[^+\d]/g, '')}`;
}
