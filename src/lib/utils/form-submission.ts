import { getAuthApiUrl } from '$lib/utils/config';

/** One instance per form. A retry keeps its key; a changed payload gets a new key. */
export type FormResult = {
	success: true;
	id: string;
	status: string;
	mail_status: 'pending' | 'sending' | 'sent' | 'failed';
	message: string;
};
type Pending = { key: string; promise: Promise<FormResult> | null };
export function createFormSender(formId: string) {
	const pending = new Map<string, Pending>();
	return async function sendForm(
		payload: FormData | Record<string, string | number | null | undefined>,
		endpoint = 'service-request'
	): Promise<FormResult> {
		const body = payload instanceof FormData ? payload : new FormData();
		if (!(payload instanceof FormData)) {
			for (const [key, value] of Object.entries(payload)) {
				if (value !== null && value !== undefined) body.append(key, String(value));
			}
		}
		body.set('form_id', formId);
		if (!body.has('source_url') && typeof window !== 'undefined')
			body.set('source_url', window.location.href.slice(0, 500));
		const signature: [string, string][] = [];
		for (const [key, value] of body.entries()) {
			if (key === 'captcha_token' || key === 'submission_key') continue;
			const item =
				typeof value === 'string'
					? value
					: Array.from(
							new Uint8Array(await crypto.subtle.digest('SHA-256', await value.arrayBuffer()))
						).join(',');
			signature.push([key, item]);
		}
		const fingerprint = JSON.stringify(signature.sort((a, b) => a[0].localeCompare(b[0])));
		let state = pending.get(fingerprint);
		if (!state) {
			state = { key: crypto.randomUUID(), promise: null };
			if (pending.size >= 20) pending.delete(pending.keys().next().value!);
			pending.set(fingerprint, state);
		}
		if (state.promise) return state.promise;
		body.set('submission_key', state.key);
		state.promise = (async () => {
			try {
				const response = await fetch(`${getAuthApiUrl()}/notify/${endpoint}`, {
					method: 'POST',
					headers: { Accept: 'application/json' },
					body,
					signal: AbortSignal.timeout(45000)
				});
				const result = await response.json().catch(() => null);
				if (!response.ok || !result?.success || !result?.id) {
					const error = new Error(
						response.status === 429
							? 'Слишком много попыток. Подождите минуту.'
							: 'Не удалось отправить заявку. Проверьте данные и попробуйте ещё раз.'
					);
					throw error;
				}
				pending.delete(fingerprint);
				return result as FormResult;
			} finally {
				state!.promise = null;
			}
		})();
		return state.promise;
	};
}
