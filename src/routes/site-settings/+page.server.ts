import { error, fail, redirect } from '@sveltejs/kit';
import { adminAuthApi } from '$lib/server/admin-api';
import { createGraphQLClient } from '$lib/utils/graphql-client';
import {
	FONT_PRESETS,
	RADIUS_PRESETS,
	contrastRatio,
	hasSiteAppearance,
	isHexColor,
	normalizeSiteAppearance,
	type FontPreset,
	type RadiusPreset,
	type SiteAppearance
} from '$lib/site-settings/appearance';
import {
	isValidGoogleTagId,
	isValidYandexCounterId,
	normalizeGoogleTagId,
	normalizeYandexCounterId
} from '$lib/site-settings/analytics';
import {
	BASE_SLUG,
	DESIGN_SYSTEM_KEY,
	isKnownDesignSystem,
	readDesignSystem
} from '$lib/design-systems/registry';
import type { Actions, PageServerLoad } from './$types';
import type { Cookies } from '@sveltejs/kit';

const COOKIE_NAME = 'leget_site_settings_jwt';
const COOKIE_PATH = '/site-settings';
const MAX_FAVICON_SIZE = 1024 * 1024;

const MY_LICENSES_QUERY = `
	query SiteSettingsLicenses {
		myLicenses {
			id
			domain
			name
			faviconUrl
			templateId
			headerData
			footerData
		}
	}
`;

const DESIGN_SYSTEMS_QUERY = `
	query SiteSettingsDesignSystems($templateId: Int) {
		designSystems(templateId: $templateId) {
			slug
			name
			description
			isBase
			templates {
				templateId
				isPublished
			}
		}
	}
`;

const UPDATE_HEADER_MUTATION = `
	mutation SaveSiteSettings($id: ID!, $headerData: JSON) {
		updateLicense(id: $id, headerData: $headerData) {
			id
			headerData
		}
	}
`;

const UPDATE_FAVICON_MUTATION = `
	mutation SaveSiteFavicon($id: ID!, $faviconUrl: String) {
		updateLicense(id: $id, faviconUrl: $faviconUrl) {
			id
			faviconUrl
		}
	}
`;

const GENERATE_UPLOAD_URL_MUTATION = `
	mutation SiteSettingsUploadUrl(
		$filename: String!
		$mimeType: String!
		$folder: String
		$licenseId: ID
	) {
		generateUploadUrl(
			filename: $filename
			mimeType: $mimeType
			folder: $folder
			licenseId: $licenseId
		) {
			uploadUrl
			objectUrl
			expiresIn
		}
	}
`;

interface LicenseSettings {
	id: string;
	domain: string;
	name: string | null;
	faviconUrl: string | null;
	templateId: number | null;
	headerData: Record<string, unknown> | null;
	footerData: Record<string, unknown> | null;
}

interface LicensesResponse {
	myLicenses: LicenseSettings[];
}

interface DesignSystemOption {
	slug: string;
	name: string;
	description: string | null;
	isBase: boolean;
}

interface DesignSystemsResponse {
	designSystems: Array<{
		slug: string;
		name: string;
		description: string | null;
		isBase: boolean | null;
		templates: Array<{ templateId: number; isPublished: boolean }>;
	}>;
}

interface UploadResponse {
	generateUploadUrl: {
		uploadUrl: string;
		objectUrl: string;
		expiresIn: number;
	};
}

function normalizeHost(value: string): string {
	return value.trim().toLowerCase().replace(/\.$/, '');
}

function record(value: unknown): Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}

function field(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === 'string' ? value.trim() : '';
}

async function requireSession(cookies: Cookies): Promise<string> {
	const token = cookies.get(COOKIE_NAME);
	if (!token) redirect(303, '/');

	try {
		const response = await adminAuthApi('/auth/me', {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!response.ok) {
			cookies.delete(COOKIE_NAME, { path: COOKIE_PATH });
			redirect(303, '/');
		}
	} catch {
		cookies.delete(COOKIE_NAME, { path: COOKIE_PATH });
		redirect(303, '/');
	}

	return token;
}

async function ownedLicense(hostname: string, token: string): Promise<LicenseSettings> {
	const client = createGraphQLClient({ Authorization: `Bearer ${token}` });
	let data: LicensesResponse;

	try {
		data = await client.request<LicensesResponse>(MY_LICENSES_QUERY);
	} catch {
		error(502, 'Не удалось загрузить настройки сайта. Попробуйте позже.');
	}

	const host = normalizeHost(hostname);
	const license = data.myLicenses.find((item) => normalizeHost(item.domain) === host);
	if (!license) error(403, 'У вас нет доступа к настройкам этого сайта.');

	return license;
}

/**
 * Дизайн-системы, которые владельцу этого сайта можно предложить.
 *
 * Три фильтра, и ни один не лишний:
 *
 *   1. Резолвер API отдаёт системы, ОТНОСЯЩИЕСЯ к шаблону, — это ещё не
 *      готовность. Готовность живёт на паре «система × шаблон»: `isPublished`.
 *      Без этого фильтра владелец выберет систему, у которой покрыта половина
 *      блоков, и получит страницу с дырой (design-system-invariants.md).
 *   2. Базовая — исключение: пары «система × шаблон» у неё нет вовсе, поэтому
 *      проверять `isPublished` не на чем. Она предлагается, пока в ней лежат
 *      версии этого шаблона (это и решает резолвер), и помечается как legacy.
 *   3. Система обязана быть в реестре фронта. Строка в БД может опережать
 *      выкатку CSS; такой выбор отрисовался бы Базовой, то есть предложение
 *      было бы враньём.
 *
 * Текущий выбор добавляется в список всегда, даже если он через все три
 * фильтра не прошёл: иначе `<select>` показал бы не то, чем сайт нарисован,
 * и первое же сохранение молча сменило бы его облик.
 *
 * Сбой запроса — не повод ронять страницу настроек: остаётся один вариант,
 * текущий, и раздел честно говорит, что список получить не удалось.
 */
async function designSystemOptions(
	license: LicenseSettings,
	token: string
): Promise<{ options: DesignSystemOption[]; available: boolean }> {
	const current = readDesignSystem(license.headerData);
	const fallback: DesignSystemOption[] = [
		{
			slug: current,
			name: current === BASE_SLUG ? 'Базовая' : current,
			description: null,
			isBase: current === BASE_SLUG
		}
	];

	if (license.templateId === null) return { options: fallback, available: false };

	let data: DesignSystemsResponse;
	try {
		const client = createGraphQLClient({ Authorization: `Bearer ${token}` });
		data = await client.request<DesignSystemsResponse>(DESIGN_SYSTEMS_QUERY, {
			templateId: license.templateId
		});
	} catch {
		return { options: fallback, available: false };
	}

	const options = data.designSystems
		.filter((system) => isKnownDesignSystem(system.slug))
		.filter(
			(system) =>
				system.isBase === true ||
				system.templates.some(
					(scope) => scope.templateId === license.templateId && scope.isPublished
				)
		)
		.map((system) => ({
			slug: system.slug,
			name: system.name,
			description: system.description,
			isBase: system.isBase === true
		}));

	if (!options.some((option) => option.slug === current)) {
		options.unshift(...fallback);
	}

	return { options, available: true };
}

function publicSettings(license: LicenseSettings) {
	const headerData = record(license.headerData);
	return {
		id: license.id,
		domain: license.domain,
		name: license.name,
		templateId: license.templateId,
		faviconUrl: license.faviconUrl,
		yandexMetrica: normalizeYandexCounterId(headerData.yandexMetrica),
		googleAnalytics: normalizeGoogleTagId(headerData.googleAnalytics),
		appearanceEnabled: hasSiteAppearance(headerData.siteAppearance),
		appearance: normalizeSiteAppearance(headerData.siteAppearance),
		designSystem: readDesignSystem(license.headerData)
	};
}

function parseAppearance(formData: FormData): {
	appearance?: SiteAppearance;
	errors: Record<string, string>;
} {
	const errors: Record<string, string> = {};
	const primaryColor = field(formData, 'primaryColor').toLowerCase();
	const accentColor = field(formData, 'accentColor').toLowerCase();
	const surfaceColor = field(formData, 'surfaceColor').toLowerCase();
	const textColor = field(formData, 'textColor').toLowerCase();
	const fontPreset = field(formData, 'fontPreset') as FontPreset;
	const radiusPreset = field(formData, 'radiusPreset') as RadiusPreset;

	for (const [name, value] of Object.entries({
		primaryColor,
		accentColor,
		surfaceColor,
		textColor
	})) {
		if (!isHexColor(value)) errors[name] = 'Выберите цвет в формате #RRGGBB.';
	}
	if (!FONT_PRESETS.includes(fontPreset)) errors.fontPreset = 'Выберите доступную пару шрифтов.';
	if (!RADIUS_PRESETS.includes(radiusPreset))
		errors.radiusPreset = 'Выберите доступную форму углов.';
	if (
		isHexColor(surfaceColor) &&
		isHexColor(textColor) &&
		contrastRatio(surfaceColor, textColor) < 4.5
	) {
		const message = 'Контраст текста и фона должен быть не ниже 4,5:1.';
		errors.surfaceColor = message;
		errors.textColor = message;
	}
	if (
		isHexColor(accentColor) &&
		isHexColor(surfaceColor) &&
		contrastRatio(accentColor, surfaceColor) < 4.5
	) {
		errors.accentColor = 'Контраст акцента и фона должен быть не ниже 4,5:1.';
	}

	return {
		errors,
		appearance: Object.keys(errors).length
			? undefined
			: { primaryColor, accentColor, surfaceColor, textColor, fontPreset, radiusPreset }
	};
}

function detectFaviconType(bytes: Uint8Array): 'image/png' | 'image/x-icon' | 'image/webp' | null {
	if (
		bytes.length >= 8 &&
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47 &&
		bytes[4] === 0x0d &&
		bytes[5] === 0x0a &&
		bytes[6] === 0x1a &&
		bytes[7] === 0x0a
	) {
		return 'image/png';
	}
	if (bytes.length >= 4 && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0) {
		return 'image/x-icon';
	}
	if (
		bytes.length >= 12 &&
		String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
		String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
	) {
		return 'image/webp';
	}
	return null;
}

export const load: PageServerLoad = async ({ cookies, url }) => {
	const token = await requireSession(cookies);
	const license = await ownedLicense(url.hostname, token);
	const designSystems = await designSystemOptions(license, token);

	return {
		site: publicSettings(license),
		designSystems: designSystems.options,
		designSystemsAvailable: designSystems.available
	};
};

export const actions: Actions = {
	save: async ({ cookies, request, url }) => {
		const token = await requireSession(cookies);
		const license = await ownedLicense(url.hostname, token);
		const formData = await request.formData();
		const yandexMetrica = field(formData, 'yandexMetrica');
		const googleAnalytics = field(formData, 'googleAnalytics').toUpperCase();
		const designSystem = field(formData, 'designSystem');
		const appearanceEnabled = formData.get('appearanceEnabled') === 'on';
		const { appearance, errors } = appearanceEnabled
			? parseAppearance(formData)
			: { appearance: undefined, errors: {} as Record<string, string> };

		if (!isValidYandexCounterId(yandexMetrica)) {
			errors.yandexMetrica = 'Укажите только числовой ID счётчика Яндекс Метрики.';
		}
		if (!isValidGoogleTagId(googleAnalytics)) {
			errors.googleAnalytics = 'Используйте ID вида G-, GT-, AW- или DC-XXXXXXXX.';
		}

		// Список пересчитывается на сервере, а не берётся из формы: `<select>` —
		// это подсказка пользователю, а не источник правды. Иначе подменённым
		// полем можно было бы поставить сайту систему, которая для его шаблона
		// не опубликована или которой в этой сборке фронта вообще нет.
		const { options: allowedSystems } = await designSystemOptions(license, token);
		if (!allowedSystems.some((option) => option.slug === designSystem)) {
			errors.designSystem = 'Выберите доступную дизайн-систему.';
		}

		const values = {
			yandexMetrica,
			googleAnalytics,
			appearanceEnabled,
			designSystem,
			...(appearance ?? {})
		};
		if (Object.keys(errors).length || (appearanceEnabled && !appearance)) {
			return fail(400, { success: false, message: 'Проверьте отмеченные поля.', errors, values });
		}

		const headerData = {
			...record(license.headerData),
			yandexMetrica: yandexMetrica || null,
			googleAnalytics: googleAnalytics || null,
			siteAppearance: appearanceEnabled ? appearance : null,
			// Базовая пишется значением, а не null: у выбора системы нет состояния
			// «выключено» — сайт всегда нарисован какой-то одной. null здесь означал
			// бы «владелец не выбирал», а это неотличимо от выбора Базовой и только
			// путало бы чтение.
			[DESIGN_SYSTEM_KEY]: designSystem
		};

		try {
			const client = createGraphQLClient({ Authorization: `Bearer ${token}` });
			await client.request(UPDATE_HEADER_MUTATION, {
				id: license.id,
				headerData
			});
		} catch {
			return fail(502, {
				success: false,
				message: 'Не удалось сохранить настройки. Попробуйте ещё раз.',
				errors: {},
				values
			});
		}

		return {
			success: true,
			message: 'Настройки сайта сохранены.',
			errors: {},
			values
		};
	},

	uploadFavicon: async ({ cookies, request, url }) => {
		const token = await requireSession(cookies);
		const license = await ownedLicense(url.hostname, token);
		const formData = await request.formData();
		const file = formData.get('favicon');

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { success: false, message: 'Выберите файл фавиконки.' });
		}
		if (file.size > MAX_FAVICON_SIZE) {
			return fail(400, { success: false, message: 'Файл должен быть не больше 1 МБ.' });
		}

		const bytes = new Uint8Array(await file.arrayBuffer());
		const mimeType = detectFaviconType(bytes);
		if (!mimeType) {
			return fail(400, { success: false, message: 'Поддерживаются только PNG, ICO и WEBP.' });
		}

		try {
			const client = createGraphQLClient({ Authorization: `Bearer ${token}` });
			const upload = await client.request<UploadResponse>(GENERATE_UPLOAD_URL_MUTATION, {
				filename: `favicon.${mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'ico'}`,
				mimeType,
				folder: 'favicons',
				licenseId: license.id
			});
			const uploadResponse = await fetch(upload.generateUploadUrl.uploadUrl, {
				method: 'PUT',
				headers: { 'Content-Type': mimeType },
				body: bytes
			});

			if (!uploadResponse.ok) throw new Error('Upload failed');

			await client.request(UPDATE_FAVICON_MUTATION, {
				id: license.id,
				faviconUrl: upload.generateUploadUrl.objectUrl
			});

			return {
				success: true,
				message: 'Фавиконка загружена и опубликована.',
				faviconUrl: upload.generateUploadUrl.objectUrl
			};
		} catch {
			return fail(502, {
				success: false,
				message: 'Не удалось загрузить фавиконку. Попробуйте ещё раз.'
			});
		}
	},

	deleteFavicon: async ({ cookies, url }) => {
		const token = await requireSession(cookies);
		const license = await ownedLicense(url.hostname, token);

		try {
			const client = createGraphQLClient({ Authorization: `Bearer ${token}` });
			await client.request(UPDATE_FAVICON_MUTATION, {
				id: license.id,
				faviconUrl: null
			});
			return { success: true, message: 'Фавиконка удалена.', faviconUrl: null };
		} catch {
			return fail(502, { success: false, message: 'Не удалось удалить фавиконку.' });
		}
	}
};
