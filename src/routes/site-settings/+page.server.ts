import { leadCatcherPolicy, supportsLeadCatcher } from '$lib/utils/lead-catcher';
import { normalizeHeaderButtonColor } from '$lib/site-settings/header-button';
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
const MAX_LOGO_SIZE = 2 * 1024 * 1024;
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
	mutation SaveSiteSettings($id: ID!, $headerDataPatch: JSON) {
		updateLicense(id: $id, headerDataPatch: $headerDataPatch) {
			id
			headerData
		}
	}
`;

const UPDATE_LOGO_MUTATION = `
	mutation SaveSiteLogo($id: ID!, $logoUrl: String) {
		updateLicense(id: $id, logoUrl: $logoUrl) {
			id
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
	const token = cookies.get(COOKIE_NAME) || cookies.get('leget_client_jwt');
	if (!token) redirect(303, '/');

	let response: Response;
	try {
		response = await adminAuthApi('/auth/me', {
			headers: { Authorization: `Bearer ${token}` }
		});
	} catch {
		error(502, 'Не удалось проверить сессию. Попробуйте позже.');
	}
	if (response.status === 401 || response.status === 403) {
		cookies.delete(COOKIE_NAME, { path: COOKIE_PATH });
		redirect(303, '/');
	}
	if (!response.ok) error(502, 'Не удалось проверить сессию. Попробуйте позже.');

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
		leadCatcherAvailable: supportsLeadCatcher(license.templateId),
		leadCatcherEnabled: headerData.leadCatcherEnabled === true,
		leadCatcherPolicyHref: leadCatcherPolicy(headerData.leadCatcherPolicyHref) || '/privacy',
		faviconUrl: license.faviconUrl,
		logoUrl: typeof headerData.logoUrl === 'string' ? headerData.logoUrl : null,
		yandexMetrica: normalizeYandexCounterId(headerData.yandexMetrica),
		googleAnalytics: normalizeGoogleTagId(headerData.googleAnalytics),
		appearanceEnabled: hasSiteAppearance(headerData.siteAppearance),
		headerButtonColor: normalizeHeaderButtonColor(headerData.headerButtonColor),
		appearance: normalizeSiteAppearance(headerData.siteAppearance),
		designSystem: readDesignSystem(license.headerData)
	};
}

function parseAppearance(formData: FormData): {
	appearance?: SiteAppearance;
	values: SiteAppearance;
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

	return {
		errors,
		values: { primaryColor, accentColor, surfaceColor, textColor, fontPreset, radiusPreset },
		appearance: Object.keys(errors).length
			? undefined
			: { primaryColor, accentColor, surfaceColor, textColor, fontPreset, radiusPreset }
	};
}

function detectLogoType(bytes: Uint8Array): 'image/png' | 'image/jpeg' | 'image/webp' | null {
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
	if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		return 'image/jpeg';
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

function hasIcoDirectory(buffer: ArrayBuffer): boolean {
	const headerSize = 6;
	const entrySize = 16;
	const view = new DataView(buffer);
	if (
		view.byteLength < headerSize ||
		view.getUint16(0, true) !== 0 ||
		view.getUint16(2, true) !== 1
	) return false;

	const count = view.getUint16(4, true);
	const directoryEnd = headerSize + count * entrySize;
	if (count === 0 || directoryEnd >= view.byteLength) return false;

	for (let entry = headerSize; entry < directoryEnd; entry += entrySize) {
		const size = view.getUint32(entry + 8, true);
		const offset = view.getUint32(entry + 12, true);
		if (size === 0 || offset < directoryEnd || offset + size > view.byteLength) return false;
	}
	return true;
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

async function uploadBrandingImage(
	client: ReturnType<typeof createGraphQLClient>,
	licenseId: string,
	file: File,
	mimeType: string,
	filename: string,
	folder: 'logos' | 'favicons'
): Promise<string> {
	const upload = await client.request<UploadResponse>(GENERATE_UPLOAD_URL_MUTATION, {
		filename,
		mimeType,
		folder,
		licenseId
	});
	const uploadResponse = await fetch(upload.generateUploadUrl.uploadUrl, {
		method: 'PUT',
		headers: { 'Content-Type': mimeType },
		body: file,
		signal: AbortSignal.timeout(15000)
	});

	if (!uploadResponse.ok) throw new Error('Upload failed');

	const publicResponse = await fetch(upload.generateUploadUrl.objectUrl, {
		method: 'HEAD',
		redirect: 'error',
		signal: AbortSignal.timeout(5000)
	});
	if (!publicResponse.ok) throw new Error('Public readback failed');
	return upload.generateUploadUrl.objectUrl;
}

export const actions: Actions = {
	save: async ({ cookies, request, url }) => {
		const token = await requireSession(cookies);
		const license = await ownedLicense(url.hostname, token);
		const formData = await request.formData();
		const yandexMetrica = field(formData, 'yandexMetrica');
		const googleAnalytics = field(formData, 'googleAnalytics').toUpperCase();
		const designSystem = field(formData, 'designSystem');
		const appearanceEnabled = formData.get('appearanceEnabled') === 'on';
		const updateLeadCatcher =
			supportsLeadCatcher(license.templateId) && formData.get('leadCatcherSettings') === '1';
		const leadCatcherEnabled = formData.get('leadCatcherEnabled') === 'on';
		const leadCatcherPath = field(formData, 'leadCatcherPolicyHref') || '/privacy';
		const leadCatcherPolicyHref = leadCatcherPolicy(leadCatcherPath);
		const headerButtonSettings = formData.get('headerButtonSettings') === '1';
		const headerButtonColor = headerButtonSettings
			? formData.get('headerButtonCustom') === 'on'
				? field(formData, 'headerButtonColor').toLowerCase()
				: null
			: normalizeHeaderButtonColor(record(license.headerData).headerButtonColor);

		const {
			appearance,
			values: appearanceValues,
			errors
		} = appearanceEnabled
			? parseAppearance(formData)
			: { appearance: undefined, values: undefined, errors: {} as Record<string, string> };

		if (updateLeadCatcher && !leadCatcherPolicyHref)
			errors.leadCatcherPolicyHref = 'Укажите путь к политике на этом сайте, например /privacy.';

		if (headerButtonColor !== null && !isHexColor(headerButtonColor))
			errors.headerButtonColor = 'Выберите цвет в формате #RRGGBB.';

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
			headerButtonColor,
			...(updateLeadCatcher ? { leadCatcherEnabled, leadCatcherPolicyHref: leadCatcherPath } : {}),
			yandexMetrica,
			googleAnalytics,
			appearanceEnabled,
			designSystem,
			...(appearanceValues ?? {})
		};
		if (Object.keys(errors).length || (appearanceEnabled && !appearance)) {
			return fail(400, { success: false, message: 'Проверьте отмеченные поля.', errors, values });
		}

		const headerDataPatch = {
			...(updateLeadCatcher ? { leadCatcherEnabled, leadCatcherPolicyHref } : {}),
			yandexMetrica: yandexMetrica || null,
			googleAnalytics: googleAnalytics || null,
			siteAppearance: appearanceEnabled ? appearance : null,
			headerButtonColor,
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
				headerDataPatch
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

	uploadLogo: async ({ cookies, request, url }) => {
		const token = await requireSession(cookies);
		const license = await ownedLicense(url.hostname, token);
		const file = (await request.formData()).get('logo');

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { success: false, message: 'Выберите файл логотипа.' });
		}
		if (file.size > MAX_LOGO_SIZE) {
			return fail(400, { success: false, message: 'Файл должен быть не больше 2 МБ.' });
		}

		const mimeType = detectLogoType(new Uint8Array(await file.slice(0, 12).arrayBuffer()));
		if (!mimeType) {
			return fail(400, {
				success: false,
				message: 'Поддерживаются только PNG, JPEG и WEBP.'
			});
		}

		try {
			const client = createGraphQLClient({ Authorization: `Bearer ${token}` });
			const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1];
			const logoUrl = await uploadBrandingImage(
				client,
				license.id,
				file,
				mimeType,
				`logo.${extension}`,
				'logos'
			);
			await client.request(UPDATE_LOGO_MUTATION, { id: license.id, logoUrl });
			return { success: true, message: 'Логотип загружен и опубликован.' };
		} catch {
			return fail(502, {
				success: false,
				message: 'Не удалось загрузить логотип. Попробуйте ещё раз.'
			});
		}
	},

	deleteLogo: async ({ cookies, url }) => {
		const token = await requireSession(cookies);
		const license = await ownedLicense(url.hostname, token);

		try {
			const client = createGraphQLClient({ Authorization: `Bearer ${token}` });
			await client.request(UPDATE_LOGO_MUTATION, { id: license.id, logoUrl: null });
			return { success: true, message: 'Логотип удалён.' };
		} catch {
			return fail(502, { success: false, message: 'Не удалось удалить логотип.' });
		}
	},

	uploadFavicon: async ({ cookies, request, url }) => {
		const token = await requireSession(cookies);
		const license = await ownedLicense(url.hostname, token);
		const formData = await request.formData();
		const file = formData.get('favicon');

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { success: false, message: 'Выберите файл фавиконки.' });
		}
		if (!file.name.toLowerCase().endsWith('.ico')) {
			return fail(400, { success: false, message: 'Выберите файл с расширением .ico.' });
		}
		if (file.size > MAX_FAVICON_SIZE) {
			return fail(400, { success: false, message: 'Файл должен быть не больше 1 МБ.' });
		}

		if (!hasIcoDirectory(await file.arrayBuffer())) {
			return fail(400, { success: false, message: 'Файл повреждён или не является фавиконкой ICO.' });
		}

		try {
			const client = createGraphQLClient({ Authorization: `Bearer ${token}` });
			const faviconUrl = await uploadBrandingImage(
				client,
				license.id,
				file,
				'image/x-icon',
				'favicon.ico',
				'favicons'
			);

			await client.request(UPDATE_FAVICON_MUTATION, {
				id: license.id,
				faviconUrl
			});

			return {
				success: true,
				message: 'Фавиконка загружена и опубликована.',
				faviconUrl
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
