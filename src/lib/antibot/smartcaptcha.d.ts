// Type declarations for smartcaptcha.js (оставлен как JS — не парсится tsc,
// типы берутся отсюда). См. https://yandex.cloud/en/docs/smartcaptcha

/** Sitekey виджета (публичный ключ ysс1_...) из env. Пусто = капча выключена. */
export const SITE_KEY: string;

/** Загружает captcha.js один раз (идемпотентно). На сервере — no-op. */
export function loadCaptchaScript(): Promise<SmartCaptchaApi | undefined>;

export interface SmartCaptchaApi {
	render: (
		container: HTMLElement,
		options: {
			sitekey: string;
			hl?: 'ru' | 'en';
			callback: (token: string) => void;
		}
	) => number;
	reset: (widgetId: number) => void;
	destroy: (widgetId: number) => void;
	subscribe: (
		widgetId: number,
		event: 'network-error' | 'javascript-error' | 'token-expired',
		callback: (error?: unknown) => void
	) => () => void;
}

declare global {
	interface Window {
		smartCaptcha?: SmartCaptchaApi;
	}
}
