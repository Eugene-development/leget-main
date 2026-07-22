/**
 * Yandex SmartCaptcha — общие хелперы для форм LEGET Main.
 *
 * Видимый виджет рендерится прямо в форме (см. SmartCaptcha.svelte).
 * После решения юзером колбэк отдаёт одноразовый токен, который форма
 * отправляет в теле запроса как `captcha_token`; бэкенд (leget-auth)
 * верифицирует его через https://smartcaptcha.yandexcloud.net/validate.
 *
 * Fail-open: без sitekey капча не рендерится и формы не блокируются
 * (dev/staging, где ключ может быть не прописан).
 *
 * Sitekey берётся из $env/dynamic/public (а не static), чтобы отсутствие
 * ключа не ломало сборку и сохраняло fail-open behaviour.
 *
 * @see https://yandex.cloud/en/docs/smartcaptcha
 */

import { env } from '$env/dynamic/public';

/** Sitekey виджета (публичный ключ ysс1_...) из env. Пусто = капча выключена. */
export const SITE_KEY = env.PUBLIC_SMARTCAPTCHA_SITE_KEY;

const CAPTCHA_SCRIPT_SRC = 'https://smartcaptcha.yandexcloud.net/captcha.js';

/** Глобальный объект виджета Яндекса, доступный после загрузки captcha.js. */
/** (объявлен неявно на window; обращения идут через window.smartCaptcha) */

let scriptPromise = null;

/**
 * Загружает captcha.js один раз (защита от повторной вставки и гонок при
 * одновременном монтировании нескольких виджетов — один общий промис).
 * @returns {Promise<void>}
 */
export function loadCaptchaScript() {
	if (typeof window === 'undefined') return Promise.resolve();
	if (window.smartCaptcha) return Promise.resolve();
	if (scriptPromise) return scriptPromise;

	scriptPromise = new Promise((resolve) => {
		const existing = document.querySelector(`script[src^="${CAPTCHA_SCRIPT_SRC}"]`);
		if (existing) {
			if (window.smartCaptcha) {
				resolve();
				return;
			}
			existing.addEventListener('load', () => resolve());
			return;
		}

		// Глобальный onload-колбэк нужно назначить ДО вставки скрипта (требование Я.).
		window.onloadSmartCaptchaScript = () => resolve();

		const script = document.createElement('script');
		script.src = `${CAPTCHA_SCRIPT_SRC}?render=onload&onload=onloadSmartCaptchaScript`;
		script.async = true;
		document.head.appendChild(script);
	});

	return scriptPromise;
}
