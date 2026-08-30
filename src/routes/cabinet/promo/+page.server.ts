import { fail, redirect } from '@sveltejs/kit';
import { promoApi, promoPost, query } from '$lib/server/promo-api';
import { CLIENT_COOKIE, clearClientSession, readSessionProfile } from '$lib/server/client-session';
import { cabinetHref } from '$lib/utils/cabinet-href';
import type { Paginated, PromoCard } from '$lib/utils/promo';
import type { Actions, PageServerLoad } from './$types';

const ADMIN_COOKIE = 'leget_admin_jwt';

/**
 * Промокоды клиента.
 *
 * Защита та же, что у `/cabinet`: cookie → роль из ответа leget-auth. Но она
 * здесь не единственная и даже не главная — сам список приходит из leget-api,
 * где выборка сужена до `client_id` вошедшего. Даже если бы страница пустила
 * не того, чужих промокодов ей бы не отдали.
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
		return { profile: null, serviceUnavailable: true, promoCodes: null, status: null };
	}

	if (!profile) {
		clearClientSession(cookies);
		redirect(303, '/?auth=client-login');
	}

	if (profile.role !== 'client') {
		redirect(303, profile.role === 'admin' ? '/admin' : cabinetHref(profile.role));
	}

	const status = url.searchParams.get('status');
	const page = url.searchParams.get('page');

	const result = await promoApi(
		`/promo/client/codes${query({ status, page, per_page: 25 })}`,
		token
	);

	return {
		profile,
		serviceUnavailable: false,
		status,
		promoCodes: result.ok
			? ((result.data.promo_codes ?? null) as Paginated<PromoCard> | null)
			: null,
		apiError: result.ok ? null : result.message
	};
};

export const actions = {
	/**
	 * Ответ клиента на заявленную сделку.
	 *
	 * Идентификатор промокода приходит формой, но чужой сюда не пройдёт:
	 * leget-api ищет его только среди кодов вошедшего и на чужой отвечает 404.
	 */
	respond: async ({ request, cookies }) => {
		const token = cookies.get(CLIENT_COOKIE);
		if (!token) redirect(303, '/?auth=client-login');

		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const response = String(form.get('response') ?? '');
		const comment = String(form.get('comment') ?? '').trim();

		if (!id || !response) {
			return fail(422, { message: 'Выберите вариант ответа.' });
		}

		const result = await promoPost(`/promo/client/codes/${id}/respond`, token, {
			response,
			comment: comment === '' ? null : comment
		});

		if (!result.ok) {
			return fail(result.status >= 400 ? result.status : 422, {
				message: result.message ?? 'Не удалось отправить ответ.',
				id
			});
		}

		// `message: null` в успешном ответе — не украшение: без него union
		// формы не содержит поля, и разметка не может спросить про ошибку.
		return { success: true, id, response, message: null };
	}
	// `satisfies`, а не `: Actions`: аннотация типом стирает конкретные формы
	// возврата, и `form` в разметке становится `never` — спросить у него
	// про `message` уже нельзя.
} satisfies Actions;
