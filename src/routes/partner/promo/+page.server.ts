import { fail, redirect } from '@sveltejs/kit';
import { CLIENT_COOKIE, clearClientSession, readSessionProfile } from '$lib/server/client-session';
import { promoApi, promoPost, query } from '$lib/server/promo-api';
import { cabinetHref } from '$lib/utils/cabinet-href';
import type { Paginated, PromoCard, PromoEventRow } from '$lib/utils/promo';
import type { Actions, PageServerLoad } from './$types';

const ADMIN_COOKIE = 'leget_admin_jwt';

/**
 * Промокоды, назначенные партнёру.
 *
 * Страница показывает только то, что отдал leget-api, а он отдаёт только коды
 * этой организации и только начиная с активации. Ни рекламных меток, ни email
 * клиента в ответе нет вовсе — прятать их разметкой не требуется.
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
			status: null,
			code: null,
			selected: null,
			history: []
		};
	}

	if (!profile) {
		clearClientSession(cookies);
		redirect(303, '/?auth=client-login');
	}

	if (profile.role !== 'partner') {
		redirect(303, profile.role === 'admin' ? '/admin' : cabinetHref(profile.role));
	}

	const status = url.searchParams.get('status');
	const code = url.searchParams.get('code');
	const openId = url.searchParams.get('open');

	const list = await promoApi(
		`/promo/partner/codes${query({ status, code, page: url.searchParams.get('page'), per_page: 25 })}`,
		token
	);

	// Карточку с историей грузим только когда её открыли: тянуть журнал
	// на каждую строку списка значило бы платить за то, чего никто не смотрит.
	let selected: PromoCard | null = null;
	let history: PromoEventRow[] = [];

	if (openId) {
		const card = await promoApi(`/promo/partner/codes/${openId}`, token);
		if (card.ok) {
			selected = (card.data.promo_code ?? null) as PromoCard | null;
			history = (card.data.history ?? []) as PromoEventRow[];
		}
	}

	return {
		profile,
		serviceUnavailable: false,
		status,
		code,
		selected,
		history,
		promoCodes: list.ok ? ((list.data.promo_codes ?? null) as Paginated<PromoCard> | null) : null,
		apiError: list.ok ? null : list.message
	};
};

/**
 * Действия партнёра.
 *
 * Подтверждения и закрытия здесь нет: партнёр не может признать
 * состоявшейся сделку, из которой сам получает выгоду. Это не выбор
 * разметки — маршрута для него не существует, а способность `promo.confirm`
 * роли не выдана.
 */
export const actions = {
	present: async (event) => run(event, 'present'),

	order: async (event) => run(event, 'order'),

	reportDeal: async ({ request, cookies }) => {
		const token = cookies.get(CLIENT_COOKIE);
		if (!token) redirect(303, '/?auth=client-login');

		const form = await request.formData();
		const id = String(form.get('id') ?? '');

		if (!id) return fail(422, { message: 'Промокод не выбран.', id });

		const result = await promoPost(`/promo/partner/codes/${id}/deal`, token, {
			order_number: String(form.get('order_number') ?? '').trim(),
			deal_date: String(form.get('deal_date') ?? ''),
			// Суммы уходят строками: число в JSON прошло бы через float,
			// а деньги в двоичной дроби теряют копейку.
			gross_amount: String(form.get('gross_amount') ?? '').replace(',', '.'),
			discount_amount: String(form.get('discount_amount') ?? '').replace(',', '.'),
			category: String(form.get('category') ?? '').trim() || null,
			comment: String(form.get('comment') ?? '').trim() || null,
			document_url: String(form.get('document_url') ?? '').trim() || null
		});

		if (!result.ok) {
			return fail(result.status >= 400 ? result.status : 422, {
				message: result.message ?? 'Не удалось заявить сделку.',
				id,
				action: 'reportDeal'
			});
		}

		return { success: true, id, action: 'reportDeal', message: null };
	}
} satisfies Actions;

/** Общий путь для действий без тела: отметить предъявление и оформить заказ. */
async function run(
	{ request, cookies }: { request: Request; cookies: import('@sveltejs/kit').Cookies },
	action: 'present' | 'order'
) {
	const token = cookies.get(CLIENT_COOKIE);
	if (!token) redirect(303, '/?auth=client-login');

	const form = await request.formData();
	const id = String(form.get('id') ?? '');

	if (!id) return fail(422, { message: 'Промокод не выбран.', id, action });

	const result = await promoPost(`/promo/partner/codes/${id}/${action}`, token, {});

	if (!result.ok) {
		return fail(result.status >= 400 ? result.status : 422, {
			message: result.message ?? 'Действие не выполнено.',
			id,
			action
		});
	}

	return { success: true, id, action, message: null };
}
