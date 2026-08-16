/**
 * Утилита для inline-редактирования компонентов страницы.
 *
 * Вызывает мутацию upsertPageComponent через GraphQL API
 * с токеном авторизации из localStorage.
 */

import { getGraphQLUrl } from '$lib/utils/config';

const UPSERT_MUTATION = `
  mutation UpsertPageComponent($pageId: ID!, $licenseId: ID!, $type: String!, $data: JSON!) {
    upsertPageComponent(pageId: $pageId, licenseId: $licenseId, type: $type, data: $data) {
      id
      type
      data
      isActive
    }
  }
`;

const UPDATE_LICENSE_MUTATION = `
  mutation UpdateLicense($id: ID!, $headerData: JSON, $footerData: JSON) {
    updateLicense(id: $id, headerData: $headerData, footerData: $footerData) {
      id
      headerData
      footerData
    }
  }
`;

export interface EditContext {
	pageId: string;
	licenseId: string;
	templateId?: number | null;
	slug?: string | null;
}

export interface PageSeoVariable {
	token: string;
	label: string;
	value: string;
}

export interface PageSeoData {
	title: string | null;
	description: string | null;
	keywords: string | null;
	rawTitle: string | null;
	rawDescription: string | null;
	isDynamic: boolean;
	pattern: string;
	variables: PageSeoVariable[];
}

const UPDATE_PAGE_SEO_MUTATION = `
  mutation UpdatePageSeo(
    $id: ID!
    $licenseId: ID!
    $seoTitle: String
    $seoDescription: String
    $seoKeywords: String
  ) {
    updatePage(
      id: $id
      licenseId: $licenseId
      seoTitle: $seoTitle
      seoDescription: $seoDescription
      seoKeywords: $seoKeywords
    ) {
      id
      seoTitle
      seoDescription
      seoKeywords
    }
  }
`;

/** Save metadata for the current page; blank values remove the override. */
export async function savePageSeo(
	context: EditContext,
	values: { title: string; description: string; keywords: string }
): Promise<void> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

	if (!token) {
		throw new Error('Не авторизован');
	}

	const response = await fetch(getGraphQLUrl(), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			query: UPDATE_PAGE_SEO_MUTATION,
			variables: {
				id: context.pageId,
				licenseId: context.licenseId,
				seoTitle: values.title.trim() || null,
				seoDescription: values.description.trim() || null,
				seoKeywords: values.keywords.trim() || null
			}
		})
	});

	if (!response.ok) {
		throw new Error('Не удалось сохранить настройки страницы. Повторите попытку.');
	}

	const result = await response.json();
	if (result.errors?.length) {
		throw new Error(result.errors[0]?.message ?? 'Не удалось сохранить настройки страницы.');
	}
}

const COMPONENT_ARTICLE_QUERY = `
  query Component($templateId: Int!, $slug: String!, $type: String!) {
    component(templateId: $templateId, slug: $slug, type: $type) {
      article
      variants {
        version
        article
        morph
        roles
      }
    }
  }
`;

export interface ComponentVariantArticle {
	version: number;
	article: string;
	/** Конструкция версии: «plain : cards.grid.3-6.icon». null — ещё не выписана. */
	morph?: string | null;
	/** Роли, которые способна исполнить конструкция. Это ВОЗМОЖНОСТИ, а не выбор тенанта. */
	roles?: string[];
}

export interface ComponentArticle {
	article: string;
	variants: ComponentVariantArticle[];
}

// In-memory cache to avoid refetching the same component's article on re-renders.
const componentArticleCache = new Map<string, ComponentArticle | null>();

/**
 * Загружает артикул компонента каталога (и его вариантов) по координатам.
 * Возвращает null, если компонент не найден в каталоге или запрос не удался.
 *
 * @param templateId - id шаблона (licenses.template_id)
 * @param slug       - slug страницы внутри шаблона
 * @param type       - тип компонента (совпадает с page_components.type)
 */
export async function fetchComponentArticle(
	templateId: number,
	slug: string,
	type: string
): Promise<ComponentArticle | null> {
	const cacheKey = `${templateId}:${slug}:${type}`;
	if (componentArticleCache.has(cacheKey)) {
		return componentArticleCache.get(cacheKey) ?? null;
	}

	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
	if (!token) {
		return null;
	}

	try {
		const apiUrl = getGraphQLUrl();
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({
				query: COMPONENT_ARTICLE_QUERY,
				variables: { templateId, slug, type }
			})
		});

		// Сбои (сеть, 5xx, Unauthenticated от @guard) не кэшируем: иначе одна неудачная
		// попытка — например, до того как подхватился токен — навсегда гасила бы бейдж
		// артикула для этого компонента до перезагрузки страницы.
		if (!response.ok) {
			return null;
		}

		const result = await response.json();
		if (result.errors?.length) {
			return null;
		}

		const data = result.data?.component;
		const value = data
			? {
					article: data.article as string,
					variants: (data.variants ?? []) as ComponentVariantArticle[]
				}
			: null;
		componentArticleCache.set(cacheKey, value);
		return value;
	} catch {
		return null;
	}
}

// ── Артикулы layout-компонентов (баннер/меню/футер) ──────────────────────────
// Эти компоненты общие для всех страниц и не привязаны к slug страницы, поэтому
// их артикул не лежит в каталожной системе (template_pages/components). Сегмент 2 —
// буквенный код раздела вместо номера страницы: Б — баннер, М — меню (хэдер),
// Ф — футер. Формат: {template}.{код}.1.{version} (component_number = 1 — один
// слот на раздел). Артикул детерминирован и стабилен (как и каталожные).
export const LAYOUT_SECTION_CODES: Record<string, string> = {
	Banner: 'Б',
	Header: 'М',
	Footer: 'Ф'
};

/**
 * Артикул layout-компонента: 4 сегмента (с version) или 3 (без).
 * Возвращает null для неизвестных layout-типов.
 */
export function getLayoutComponentArticle(
	templateId: number,
	type: string,
	version?: number | null
): string | null {
	const code = LAYOUT_SECTION_CODES[type];
	if (!code) return null;
	const base = `${templateId}.${code}.1`;
	return version ? `${base}.${version}` : base;
}

/**
 * Сохраняет обновлённые данные компонента через GraphQL мутацию.
 *
 * @param context - pageId и licenseId для идентификации компонента
 * @param type - тип компонента (например, "Hero", "Text")
 * @param data - полный объект данных компонента (все поля, включая изменённое)
 * @throws Error если запрос завершился с ошибкой
 */
export async function saveComponentData(
	context: EditContext,
	type: string,
	data: Record<string, unknown>
): Promise<string | null> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

	if (!token) {
		throw new Error('Не авторизован');
	}

	const apiUrl = getGraphQLUrl();

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			query: UPSERT_MUTATION,
			variables: {
				pageId: context.pageId,
				licenseId: context.licenseId,
				type,
				data
			}
		})
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	const result = await response.json();

	if (result.errors?.length) {
		const msg = result.errors[0]?.message ?? 'GraphQL error';
		throw new Error(msg);
	}

	// Сервер генерирует ULID `id` при первой записи компонента. Раньше он попадал
	// в клиентское состояние только через invalidateAll() (полный refetch после
	// каждого сохранения — причина «зависаний» 3–5 с). Refetch убран, поэтому
	// синхронизируем id прямо в переданный blob: чинит появление кнопки «Сброс»
	// сразу после первого сохранения нового блока (без перезагрузки) и для
	// свитчер-, и для не-свитчер-компонентов.
	const id = result.data?.upsertPageComponent?.id ?? null;
	if (id && !data._componentId) {
		data._componentId = id;
	}

	return id;
}

const DELETE_COMPONENT_MUTATION = `
  mutation DeletePageComponent($id: ID!, $licenseId: ID!) {
    deletePageComponent(id: $id, licenseId: $licenseId) {
      id
    }
  }
`;

/**
 * Удаляет изменённый пользователем компонент страницы (сбрасывает к стартовому состоянию).
 *
 * @param context - pageId и licenseId
 * @param componentId - ID записи PageComponent в базе данных
 */
export async function deleteComponentData(
	context: EditContext,
	componentId: string
): Promise<void> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

	if (!token) {
		throw new Error('Не авторизован');
	}

	const apiUrl = getGraphQLUrl();

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			query: DELETE_COMPONENT_MUTATION,
			variables: {
				id: componentId,
				licenseId: context.licenseId
			}
		})
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	const result = await response.json();

	if (result.errors?.length) {
		const msg = result.errors[0]?.message ?? 'GraphQL error';
		throw new Error(msg);
	}
}

/**
 * Сохраняет данные хэдера или футера (глобальные для всего сайта).
 */
export async function saveLayoutData(
	context: EditContext,
	type: 'Header' | 'Footer',
	data: Record<string, unknown>
): Promise<void> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

	if (!token) {
		throw new Error('Не авторизован');
	}

	const apiUrl = getGraphQLUrl();

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			query: UPDATE_LICENSE_MUTATION,
			variables: {
				id: context.licenseId,
				headerData: type === 'Header' ? data : undefined,
				footerData: type === 'Footer' ? data : undefined
			}
		})
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	const result = await response.json();

	if (result.errors?.length) {
		const msg = result.errors[0]?.message ?? 'GraphQL error';
		throw new Error(msg);
	}
}

const LIST_BUCKET_FILES_QUERY = `
  query ListBucketFiles($folder: String, $maxKeys: Int) {
    listBucketFiles(folder: $folder, maxKeys: $maxKeys) {
      key
      url
      size
      lastModified
    }
  }
`;

const TOGGLE_CATEGORY_MUTATION = `
  mutation ToggleCategory($id: ID!, $isEnabled: Boolean!) {
    toggleCategory(id: $id, isEnabled: $isEnabled) {
      id
      is_enabled
    }
  }
`;

export interface BucketFile {
	key: string;
	url: string;
	size: number | null;
	lastModified: string | null;
}

/**
 * Загружает список файлов из бакета для текущего лицензиата.
 *
 * @param folder  - папка внутри бакета (например «bg»). По умолчанию «bg».
 * @param maxKeys - максимальное количество файлов (до 200). По умолчанию 100.
 */
export async function listBucketFiles(folder = 'bg', maxKeys = 100): Promise<BucketFile[]> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

	if (!token) {
		throw new Error('Не авторизован');
	}

	const apiUrl = getGraphQLUrl();

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			query: LIST_BUCKET_FILES_QUERY,
			variables: { folder, maxKeys }
		})
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	const result = await response.json();

	if (result.errors?.length) {
		const msg = result.errors[0]?.message ?? 'GraphQL error';
		throw new Error(msg);
	}

	return (result.data?.listBucketFiles ?? []) as BucketFile[];
}

/**
 * Переключает активность категории (is_enabled) в каталоге.
 */
export async function toggleCategory(id: string, isEnabled: boolean): Promise<void> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

	if (!token) {
		throw new Error('Не авторизован');
	}

	const apiUrl = getGraphQLUrl();

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			query: TOGGLE_CATEGORY_MUTATION,
			variables: { id, isEnabled }
		})
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	const result = await response.json();

	if (result.errors?.length) {
		const msg = result.errors[0]?.message ?? 'GraphQL error';
		throw new Error(msg);
	}
}
