// Type declarations for smartcaptcha.js (оставлен как JS — не парсится tsc,
// типы берутся отсюда). См. https://yandex.cloud/en/docs/smartcaptcha

/** Sitekey виджета (публичный ключ ysс1_...) из env. Пусто = капча выключена. */
export const SITE_KEY: string;

/** Загружает captcha.js один раз (идемпотентно). На сервере — no-op. */
export function loadCaptchaScript(): Promise<void>;

declare global {
	interface Window {
		smartCaptcha?: {
			render: (container: HTMLElement, options: Record<string, unknown>) => number;
			reset: (widgetId: number) => void;
		};
		onloadSmartCaptchaScript?: () => void;
	}
}
