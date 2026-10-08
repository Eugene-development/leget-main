/**
 * Yandex SmartCaptcha — общие хелперы для форм LEGET Main.
 *
 * Видимый виджет рендерится прямо в форме (см. SmartCaptcha.svelte).
 * После решения юзером колбэк отдаёт одноразовый токен, который форма
 * отправляет в теле запроса как `captcha_token`; бэкенд (leget-auth)
 * верифицирует его через https://smartcaptcha.cloud.yandex.ru/validate.
 *
 * Fail-open: без sitekey капча не рендерится и формы не блокируются
 * (dev/staging, где ключ может быть не прописан).
 *
 * Sitekey вшивается Vite во время production-сборки — так же, как в
 * leget-front. Отсутствие ключа сохраняет fail-open behaviour.
 *
 * @see https://yandex.cloud/en/docs/smartcaptcha
 */

/** Sitekey виджета (публичный ключ ysс1_...) из env. Пусто = капча выключена. */
export const SITE_KEY = import.meta.env.VITE_SMARTCAPTCHA_SITE_KEY;

const CAPTCHA_SCRIPT_SRC = 'https://smartcaptcha.cloud.yandex.ru/captcha.js';

/** Глобальный объект виджета Яндекса, доступный после загрузки captcha.js. */
/** (объявлен неявно на window; обращения идут через window.smartCaptcha) */

let scriptPromise = null;
let loadAttempt = 0;

function readyApi() {
	const api = window.smartCaptcha;
	return api &&
		['render', 'subscribe', 'reset', 'destroy'].every((method) => typeof api[method] === 'function')
		? api
		: undefined;
}

/**
 * Загружает captcha.js один раз (защита от повторной вставки и гонок при
 * одновременном монтировании нескольких виджетов — один общий промис).
 * После ошибки следующая попытка загружает скрипт заново. Callback уникален,
 * чтобы запоздавший ответ старого запроса не завершил новую попытку.
 */
export function loadCaptchaScript() {
	if (typeof window === 'undefined') return Promise.resolve();
	if (scriptPromise) return scriptPromise;
	if (readyApi()) return Promise.resolve(readyApi());

	scriptPromise = new Promise((resolve, reject) => {
		const existing = document.querySelector(`script[src^="${CAPTCHA_SCRIPT_SRC}"]`);
		const script = existing ?? document.createElement('script');
		const callbackName = `__legetSmartCaptchaLoaded${++loadAttempt}`;
		let settled = false;
		const timer = setTimeout(() => finish(new Error('SmartCaptcha load timeout')), 15000);

		function finish(error) {
			if (settled) return;
			const api = readyApi();
			if (!error && !api) return;
			settled = true;
			clearTimeout(timer);
			script.removeEventListener('load', onLoad);
			script.removeEventListener('error', onError);
			delete window[callbackName];
			if (error) {
				script.remove();
				reject(error);
			} else resolve(api);
		}
		function onLoad() {
			finish(readyApi() ? undefined : new Error('SmartCaptcha API unavailable'));
		}
		function onError() {
			finish(new Error('SmartCaptcha script could not be loaded'));
		}

		window[callbackName] = () => finish();
		script.addEventListener('load', onLoad);
		script.addEventListener('error', onError);
		if (!existing) {
			script.src = `${CAPTCHA_SCRIPT_SRC}?render=onload&onload=${callbackName}`;
			script.async = true;
			try {
				document.head.appendChild(script);
			} catch (error) {
				finish(error);
			}
		}
	}).catch((error) => {
		scriptPromise = null;
		throw error;
	});

	return scriptPromise;
}
