/** An error message authored in the application for display to a user. */
export class UserError extends Error {
	/** @param {string} message @param {ErrorOptions & {code?: string}} [options] */
	constructor(message, options) {
		super(message, options);
		this.code = options?.code;
	}
}

/** @param {number} status @param {unknown} [code] */
export function requestError(status, code) {
	return Object.assign(new Error('Request failed'), { status, code });
}

/** @param {number} status @param {Array<{extensions?: {code?: string, category?: string, validation?: unknown}}>} [errors] */
export function graphQLError(status, errors) {
	const extensions = errors?.[0]?.extensions;
	const code = extensions?.code ?? ({
		authentication: 'UNAUTHENTICATED',
		authorization: 'FORBIDDEN',
		validation: 'VALIDATION'
	})[extensions?.category ?? ''];
	return Object.assign(requestError(status, code), { graphqlErrors: errors });
}

/** @param {unknown} error */
export function isCancelled(error) {
	return error instanceof Error && error.name === 'AbortError';
}

/** @param {unknown} error */
function isNetworkError(error) {
	return error instanceof TypeError &&
		/^(Failed to fetch|Load failed|NetworkError when attempting to fetch resource\.?|Network request failed|fetch failed)$/i.test(error.message);
}

function isOffline() {
	return typeof navigator !== 'undefined' && navigator.onLine === false;
}

/**
 * Convert an exception to safe UI copy. The status and code select local copy.
 * @param {unknown} error
 * @param {string} [action]
 */
export function userErrorMessage(error, action = 'Не удалось выполнить действие.') {
	if (error instanceof UserError) return error.message;

	const status = error && typeof error === 'object' && 'status' in error ? error.status : null;
	const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
	if (status === 401 || code === 'UNAUTHENTICATED') {
		return `${action} Сессия истекла. Войдите снова и повторите попытку.`;
	}
	if (status === 403 || code === 'FORBIDDEN') {
		return `${action} Для этого действия нужны дополнительные права. Обратитесь к владельцу сайта или администратору.`;
	}
	if (status === 404 || code === 'NOT_FOUND') {
		return `${action} Запись больше недоступна. Обновите страницу.`;
	}
	if (status === 409 || code === 'CONFLICT') {
		return `${action} Данные изменились. Обновите страницу и повторите действие.`;
	}
	if (status === 413) return `${action} Файл слишком большой. Выберите файл меньшего размера.`;
	if (status === 415 || code === 'UPLOAD_FORMAT') {
		return `${action} Формат файла не поддерживается. Выберите файл в одном из указанных форматов.`;
	}
	if (status === 422 || code === 'VALIDATION') {
		return `${action} Проверьте введённые данные и повторите попытку.`;
	}
	if (status === 429) return `${action} Слишком много попыток. Подождите минуту и попробуйте снова.`;
	if (code === 'PAYMENT_PROVIDER_NOT_CONFIGURED' || code === 'PAYMENT_PROVIDER_ERROR') {
		return `${action} Сервис оплаты временно недоступен. Попробуйте позже.`;
	}
	if ((error instanceof Error && error.name === 'TimeoutError') || status === 408 || status === 504) {
		return `${action} Сервис не ответил вовремя. Повторите попытку.`;
	}
	if (isOffline()) return `${action} Нет подключения к интернету. Подключитесь к сети и попробуйте снова.`;
	if (isNetworkError(error)) {
		return `${action} Не удалось связаться с сервисом. Проверьте соединение и попробуйте снова.`;
	}
	if ((typeof status === 'number' && status >= 500) || code === 'INTERNAL') {
		return `${action} Сервис временно недоступен. Попробуйте чуть позже.`;
	}
	return /(?:повторите|попробуйте|проверьте|обновите|подождите|войдите)/i.test(action)
		? action
		: `${action} Повторите попытку. Если ошибка повторится, обратитесь в поддержку.`;
}

/**
 * A direct browser connection to Object Storage failed. VPN is a possible cause.
 * @param {'network' | 'timeout' | number} failure
 */
export function storageUploadError(failure) {
	if (failure === 'network') {
		return new UserError(isOffline()
			? 'Файл не загружен. Подключитесь к интернету и повторите загрузку.'
			: 'Нет связи с хранилищем файлов. Если включён VPN, попробуйте отключить его и загрузить файл снова.');
	}
	if (failure === 'timeout') {
		return new UserError('Хранилище не ответило вовремя. Проверьте соединение и повторите загрузку.');
	}
	if (failure === 401 || failure === 403) {
		return new UserError('Хранилище отклонило загрузку. Выберите файл снова, чтобы обновить ссылку для загрузки.');
	}
	return requestError(failure);
}

