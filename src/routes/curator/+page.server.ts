import { fail, redirect } from '@sveltejs/kit';
import { CLIENT_COOKIE, clearClientSession, readSessionProfile } from '$lib/server/client-session';
import { promoApi, promoPost, query } from '$lib/server/promo-api';
import { cabinetHref } from '$lib/utils/cabinet-href';
import type { Paginated, PromoCard } from '$lib/utils/promo';
import type { Actions, PageServerLoad } from './$types';

const ADMIN_COOKIE = 'leget_admin_jwt';

/** Клиент из очереди новых — тот, кому ещё не выдали промокод. */
export interface QueuedClient {
	id: number;
	name: string;
	email: string;
	phone: string | null;
	region: string | null;
	registered_at: string | null;
	/** Признак «пришёл из рекламы» без самих идентификаторов. */
	from_advertising: boolean;
}

/** Партнёр в справочнике назначения — реквизиты, а не выгрузка пользователей. */
export interface PartnerOption {
	id: number;
	name: string;
	company: string | null;
	partner_type: string | null;
	city: string | null;
	phone: string | null;
}

export interface CuratorReport {
	closed_deals: number;
	deals_total: string;
	discount_total: string;
	net_total: string;
	commission_rule: string;
	commission_configured: boolean;
	commission_total: string | null;
	entries_without_amount: number;
	reversals: number;
}

/**
 * Кабинет куратора.
 *
 * Куратор ведёт клиента от рекламного перехода до сделки: создаёт и активирует
 * промокод, назначает партнёра, при необходимости вносит сведения о сделке
 * от его имени — с обязательным основанием.
 *
 * Кнопок «подтвердить» и «закрыть» здесь нет, и это не оформление: у роли нет
 * способности `promo.confirm`, а маршрутов подтверждения в группе куратора
 * не существует. Куратор получает вознаграждение за закрытые сделки и потому
 * не может признать состоявшейся сделку, которую сам же и заявил.
 */
export const load: PageServerLoad = async ({ cookies, url }) => {
	const token = cookies.get(CLIENT_COOKIE);

	if (!token) {
		redirect(303, cookies.get(ADMIN_COOKIE) ? '/admin' : '/?auth=client-login');
	}

	let profile: Awaited<ReturnType<typeof readSessionProfile>> = null;
	try {
		profile = await readSessionProfile(token);
	} catch {
		return {
			profile: null,
			serviceUnavailable: true,
			promoCodes: null,
			queue: [],
			report: null,
			partners: [],
			status: null,
			overdue: false
		};
	}

	if (!profile) {
		clearClientSession(cookies);
		redirect(303, '/?auth=client-login');
	}

	if (profile.role !== 'curator') {
		redirect(303, profile.role === 'admin' ? '/admin' : cabinetHref(profile.role));
	}

	const status = url.searchParams.get('status');
	const overdue = url.searchParams.get('overdue') === '1';

	// Три независимых запроса — параллельно: последовательно они втрое дольше,
	// а зависимости между ними нет.
	const [list, queue, report, partners] = await Promise.all([
		promoApi(
			`/promo/curator/codes${query({ status, overdue: overdue ? 1 : null, page: url.searchParams.get('page'), per_page: 25 })}`,
			token
		),
		promoApi('/promo/curator/queue?per_page=10', token),
		promoApi('/promo/curator/report', token),
		promoApi('/promo/curator/partners', token)
	]);

	return {
		profile,
		serviceUnavailable: false,
		status,
		overdue,
		promoCodes: list.ok ? ((list.data.promo_codes ?? null) as Paginated<PromoCard> | null) : null,
		summary: list.ok ? ((list.data.summary ?? null) as Record<string, number> | null) : null,
		queue: queue.ok
			? (((queue.data.clients as { data?: QueuedClient[] })?.data ?? []) as QueuedClient[])
			: [],
		report: report.ok ? ((report.data.report ?? null) as CuratorReport | null) : null,
		partners: partners.ok ? ((partners.data.partners ?? []) as PartnerOption[]) : [],
		apiError: list.ok ? null : list.message
	};
};

export const actions = {
	/** Создать промокод. Куратором становится тот, кто создаёт. */
	create: async ({ request, cookies }) => {
		const token = cookies.get(CLIENT_COOKIE);
		if (!token) redirect(303, '/?auth=client-login');

		const form = await request.formData();
		const discountType = String(form.get('discount_type') ?? 'percent');

		const result = await promoPost('/promo/curator/codes', token, {
			client_id: Number(form.get('client_id') ?? 0),
			partner_id: form.get('partner_id') ? Number(form.get('partner_id')) : null,
			subject_type: String(form.get('subject_type') ?? 'custom'),
			subject_title: String(form.get('subject_title') ?? '').trim(),
			discount_type: discountType,
			discount_value: String(form.get('discount_value') ?? '').replace(',', '.'),
			// Валюта принадлежит только фиксированной скидке: «15 % в рублях»
			// сервер отверг бы как бессмыслицу.
			currency: discountType === 'fixed' ? 'RUB' : null,
			minimum_order_amount:
				String(form.get('minimum_order_amount') ?? '').replace(',', '.') || null,
			terms: String(form.get('terms') ?? '').trim() || null,
			expires_at: String(form.get('expires_at') ?? '') || null
		});

		if (!result.ok) {
			return fail(result.status >= 400 ? result.status : 422, {
				message: result.message ?? 'Не удалось создать промокод.',
				action: 'create'
			});
		}

		return { success: true, action: 'create', message: null };
	},

	activate: async ({ request, cookies }) => simple({ request, cookies }, 'activate'),

	assignPartner: async ({ request, cookies }) => {
		const token = cookies.get(CLIENT_COOKIE);
		if (!token) redirect(303, '/?auth=client-login');

		const form = await request.formData();
		const id = String(form.get('id') ?? '');

		const result = await promoPost(`/promo/curator/codes/${id}/partner`, token, {
			partner_id: Number(form.get('partner_id') ?? 0)
		});

		if (!result.ok) {
			return fail(result.status >= 400 ? result.status : 422, {
				message: result.message ?? 'Не удалось назначить партнёра.',
				id,
				action: 'assignPartner'
			});
		}

		return { success: true, id, action: 'assignPartner', message: null };
	},

	/**
	 * Внести сведения о сделке от имени партнёра.
	 *
	 * Отметка «от имени партнёра» и основание уходят на сервер всегда: куратор
	 * иначе вносить сделку не может, и притвориться партнёром форма не даёт.
	 */
	reportDeal: async ({ request, cookies }) => {
		const token = cookies.get(CLIENT_COOKIE);
		if (!token) redirect(303, '/?auth=client-login');

		const form = await request.formData();
		const id = String(form.get('id') ?? '');

		const result = await promoPost(`/promo/curator/codes/${id}/deal`, token, {
			order_number: String(form.get('order_number') ?? '').trim(),
			deal_date: String(form.get('deal_date') ?? ''),
			gross_amount: String(form.get('gross_amount') ?? '').replace(',', '.'),
			discount_amount: String(form.get('discount_amount') ?? '').replace(',', '.'),
			category: String(form.get('category') ?? '').trim() || null,
			comment: String(form.get('comment') ?? '').trim() || null,
			on_behalf_of_partner: true,
			behalf_reason: String(form.get('behalf_reason') ?? '').trim()
		});

		if (!result.ok) {
			return fail(result.status >= 400 ? result.status : 422, {
				message: result.message ?? 'Не удалось заявить сделку.',
				id,
				action: 'reportDeal'
			});
		}

		return { success: true, id, action: 'reportDeal', message: null };
	},

	cancel: async ({ request, cookies }) => {
		const token = cookies.get(CLIENT_COOKIE);
		if (!token) redirect(303, '/?auth=client-login');

		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const reason = String(form.get('reason') ?? '').trim();

		if (reason.length < 3) {
			return fail(422, { message: 'Укажите основание отмены.', id, action: 'cancel' });
		}

		const result = await promoPost(`/promo/curator/codes/${id}/cancel`, token, { reason });

		if (!result.ok) {
			return fail(result.status >= 400 ? result.status : 422, {
				message: result.message ?? 'Не удалось отменить промокод.',
				id,
				action: 'cancel'
			});
		}

		return { success: true, id, action: 'cancel', message: null };
	}
} satisfies Actions;

async function simple(
	{ request, cookies }: { request: Request; cookies: import('@sveltejs/kit').Cookies },
	action: 'activate'
) {
	const token = cookies.get(CLIENT_COOKIE);
	if (!token) redirect(303, '/?auth=client-login');

	const form = await request.formData();
	const id = String(form.get('id') ?? '');

	const result = await promoPost(`/promo/curator/codes/${id}/${action}`, token, {});

	if (!result.ok) {
		return fail(result.status >= 400 ? result.status : 422, {
			message: result.message ?? 'Действие не выполнено.',
			id,
			action
		});
	}

	return { success: true, id, action, message: null };
}
