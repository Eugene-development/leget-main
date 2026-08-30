import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import { adminApi, readApiJson } from '$lib/server/admin-api';

/**
 * Рекламная атрибуция посетителя: захват в браузере и перенос в БД.
 *
 * Хранится в обычной (не httpOnly) cookie до регистрации — сервером она
 * читается и пишется, а до появления аккаунта переносить её некуда: строка
 * в `ad_attributions` привязана к пользователю. После входа или регистрации
 * серверная часть отдаёт содержимое cookie в leget-api, и там оно ложится
 * в БД под идентификатором того, чей токен предъявлен.
 *
 * ПЕРВОЕ КАСАНИЕ ЗАМОРАЖИВАЕТСЯ. Оно пишется один раз и здесь, и на сервере:
 * из него растёт вознаграждение куратора, и переписать источник не должен
 * никто. Последующие рекламные переходы обновляют только `last`.
 *
 * Обычный визит без меток атрибуцию НЕ трогает: затирать источник переходом
 * по закладке нельзя.
 */
export const ATTRIBUTION_COOKIE = 'leget_attr';

/** Год: воронка «реклама → регистрация → сделка» растягивается на месяцы. */
const MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Cookie отдаётся серверу с каждым запросом, поэтому её размер — цена каждой
 * страницы. URL режем: полный лендинг с длинным хвостом меток съедал бы
 * килобайт на пустом месте.
 */
const MAX_URL = 512;
const MAX_VALUE = 200;

export interface AdTouch {
	yclid?: string;
	utm_source?: string;
	utm_medium?: string;
	utm_campaign?: string;
	utm_content?: string;
	utm_term?: string;
	campaign_id?: string;
	ad_group_id?: string;
	ad_id?: string;
	keyword_id?: string;
	landing_url?: string;
	referrer?: string;
	touched_at?: string;
}

export interface AttributionPayload {
	visitor_id?: string;
	first?: AdTouch;
	last?: AdTouch;
}

/**
 * Имена параметров, под которыми приходят идентификаторы Яндекс.Директа.
 *
 * Их несколько на каждое поле: ValueTrack-макросы подставляются в ссылку
 * тем, кто настраивает кампанию, и единого канонического имени у них нет.
 * Принимаем распространённые варианты, а не диктуем один — иначе метка,
 * названная иначе, молча потерялась бы.
 */
const AD_PARAMS: Record<keyof AdTouch, string[]> = {
	yclid: ['yclid'],
	utm_source: ['utm_source'],
	utm_medium: ['utm_medium'],
	utm_campaign: ['utm_campaign'],
	utm_content: ['utm_content'],
	utm_term: ['utm_term'],
	campaign_id: ['campaign_id', 'ym_campaign_id', 'cid'],
	ad_group_id: ['gbid', 'ad_group_id', 'group_id'],
	ad_id: ['ym_ad_id', 'ad_id', 'banner_id'],
	keyword_id: ['phrase_id', 'keyword_id', 'ym_phrase_id'],
	landing_url: [],
	referrer: [],
	touched_at: []
};

function trim(value: string | null, limit: number): string | undefined {
	if (!value) return undefined;
	const clean = value.trim();
	return clean === '' ? undefined : clean.slice(0, limit);
}

/**
 * Собрать касание из адреса страницы.
 *
 * `null`, если рекламных меток нет вовсе: обычный заход не должен ни создавать
 * атрибуцию, ни обновлять существующую.
 */
export function touchFromUrl(url: URL, referrer: string | null): AdTouch | null {
	const touch: AdTouch = {};
	let hasMarker = false;

	for (const [field, names] of Object.entries(AD_PARAMS) as [keyof AdTouch, string[]][]) {
		for (const name of names) {
			const value = trim(url.searchParams.get(name), MAX_VALUE);
			if (value !== undefined) {
				touch[field] = value;
				hasMarker = true;
				break;
			}
		}
	}

	if (!hasMarker) return null;

	touch.landing_url = trim(url.toString(), MAX_URL);
	// Реферер сохраняем только внешний: переход между своими страницами
	// источником не является.
	const ref = trim(referrer, MAX_URL);
	if (ref && !ref.startsWith(url.origin)) touch.referrer = ref;

	touch.touched_at = new Date().toISOString();

	return touch;
}

export function readAttribution(cookies: Cookies): AttributionPayload | null {
	const raw = cookies.get(ATTRIBUTION_COOKIE);
	if (!raw) return null;

	try {
		const parsed = JSON.parse(raw) as AttributionPayload;
		return parsed && typeof parsed === 'object' ? parsed : null;
	} catch {
		return null;
	}
}

/**
 * Записать касание в cookie.
 *
 * Возвращает `true`, если что-то изменилось, — вызывающему это нужно, чтобы
 * не переписывать cookie на каждой странице сайта.
 */
export function captureAttribution(url: URL, referrer: string | null, cookies: Cookies): boolean {
	const touch = touchFromUrl(url, referrer);
	const existing = readAttribution(cookies);

	if (!touch) {
		// Меток нет. Заводим только идентификатор посетителя, и только если
		// атрибуция уже существует, — иначе каждый гость получал бы cookie
		// ни за чем.
		return false;
	}

	const payload: AttributionPayload = {
		// Идентификатор посетителя не является персональными данными: он нужен,
		// чтобы связать визиты до регистрации с аккаунтом после неё.
		visitor_id: existing?.visitor_id ?? crypto.randomUUID(),
		// Первое касание НЕ перезаписывается — ни здесь, ни на сервере.
		first: existing?.first ?? touch,
		last: touch
	};

	cookies.set(ATTRIBUTION_COOKIE, JSON.stringify(payload), {
		path: '/',
		// Не httpOnly: значение неконфиденциально, а видимость в браузере
		// позволит подключить клиентскую аналитику, не заводя вторую копию.
		httpOnly: false,
		secure: !dev,
		sameSite: 'lax',
		maxAge: MAX_AGE
	});

	return true;
}

/**
 * Перенести атрибуцию в БД под аккаунтом вошедшего.
 *
 * Никогда не роняет вход: сервис атрибуции недоступен — человек всё равно
 * должен попасть в кабинет. Потерянное касание хуже, чем потерянная сессия,
 * ровно наоборот.
 */
export async function claimAttribution(token: string, cookies: Cookies): Promise<void> {
	const payload = readAttribution(cookies);
	if (!payload || (!payload.first && !payload.last)) return;

	try {
		const response = await adminApi('/promo/attribution', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(payload)
		});

		await readApiJson(response);
	} catch {
		// Тишина намеренная: атрибуция остаётся в cookie и уедет при следующем
		// входе. Сообщать посетителю о неудаче нечего — он про неё не знает.
	}
}
