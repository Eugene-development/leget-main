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

export interface ComponentVariantArticle {
	version: number;
	article: string;
}

export interface ComponentArticle {
	article: string;
	variants: ComponentVariantArticle[];
}

// In-memory cache to avoid refetching the same component's article on re-renders.
const componentArticleCache = new Map<string, ComponentArticle | null>();

interface ArticleRequest {
	key: string;
	templateId: number;
	slug: string;
	type: string;
	resolve: (value: ComponentArticle | null) => void;
}

interface ComponentArticleNode {
	article?: string;
	variants?: ComponentVariantArticle[];
}

/**
 * Очередь запросов артикула на ближайшую микрозадачу.
 *
 * Артикул просят все блоки страницы разом: эффект-загрузчик в VersionSwitcher
 * взводится у каждого в один и тот же флаш эффектов — при входе или при загрузке
 * страницы с токеном. Раньше каждый блок бил в API своим запросом: десяток кругов
 * до удалённого API, из которых браузер держит открытыми лишь несколько зараз, и
 * каждый со своим разбором токена под @guard на стороне API. Бейдж артикула из-за
 * этого проступал через секунды после самого редактора.
 *
 * Теперь такт собирается в ОДИН запрос с алиасами (a0, a1, …) — один круг на всю
 * страницу. Блок, смонтированный позже (ленивый маршрут, повторное монтирование),
 * просто попадёт в следующую пачку.
 */
let articleQueue: ArticleRequest[] = [];
let articleFlushScheduled = false;

function scheduleArticleFlush(): void {
	if (articleFlushScheduled) return;
	articleFlushScheduled = true;
	// Микрозадача, а не таймер: Svelte прогоняет эффекты всех блоков синхронно
	// одним флашем, поэтому к моменту её выполнения очередь уже собрана целиком.
	queueMicrotask(() => {
		articleFlushScheduled = false;
		void flushArticleQueue();
	});
}

async function flushArticleQueue(): Promise<void> {
	const batch = articleQueue;
	articleQueue = [];
	if (batch.length === 0) return;

	// На странице тип встречается один раз, но дедуп страхует от повторного
	// монтирования в том же такте: каждый ключ уходит в запрос ровно однажды.
	const groups = new Map<string, ArticleRequest[]>();
	for (const request of batch) {
		const waiting = groups.get(request.key);
		if (waiting) waiting.push(request);
		else groups.set(request.key, [request]);
	}
	const entries = [...groups.values()];
	const settle = (index: number, value: ComponentArticle | null) => {
		for (const request of entries[index]) request.resolve(value);
	};

	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
	if (!token) {
		entries.forEach((_, i) => settle(i, null));
		return;
	}

	const varDefs = entries
		.map((_, i) => `$t${i}: Int!, $s${i}: String!, $y${i}: String!`)
		.join(', ');
	const fields = entries
		.map(
			(_, i) =>
				`  a${i}: component(templateId: $t${i}, slug: $s${i}, type: $y${i}) { article variants { version article } }`
		)
		.join('\n');
	const variables: Record<string, unknown> = {};
	entries.forEach((requests, i) => {
		variables[`t${i}`] = requests[0].templateId;
		variables[`s${i}`] = requests[0].slug;
		variables[`y${i}`] = requests[0].type;
	});

	try {
		const response = await fetch(getGraphQLUrl(), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({
				query: `query ComponentArticles(${varDefs}) {\n${fields}\n}`,
				variables
			})
		});

		// Сбои (сеть, 5xx, Unauthenticated от @guard) не кэшируем: иначе одна неудачная
		// попытка — например, до того как подхватился токен — навсегда гасила бы бейдж
		// артикула для этого компонента до перезагрузки страницы.
		if (!response.ok) {
			entries.forEach((_, i) => settle(i, null));
			return;
		}

		const result = await response.json();

		// Ошибка в общем ответе может относиться к одному полю (path: ['a3']) —
		// тогда гасим только его: остальные алиасы того же ответа валидны. Ошибка
		// без пути (сломан весь запрос, Unauthenticated) гасит всю пачку.
		const failed = new Set<string>();
		for (const error of (result.errors ?? []) as { path?: (string | number)[] }[]) {
			const alias = error?.path?.[0];
			if (typeof alias === 'string') failed.add(alias);
			else entries.forEach((_, i) => failed.add(`a${i}`));
		}

		const data = (result.data ?? {}) as Record<string, ComponentArticleNode | null>;
		entries.forEach((requests, i) => {
			const alias = `a${i}`;
			if (failed.has(alias)) {
				settle(i, null);
				return;
			}
			const node = data[alias];
			const value: ComponentArticle | null = node
				? {
						article: node.article as string,
						variants: (node.variants ?? []) as ComponentVariantArticle[]
					}
				: null;
			componentArticleCache.set(requests[0].key, value);
			settle(i, value);
		});
	} catch {
		entries.forEach((_, i) => settle(i, null));
	}
}

/**
 * Загружает артикул компонента каталога (и его вариантов) по координатам.
 * Возвращает null, если компонент не найден в каталоге или запрос не удался.
 *
 * Запросы, поданные в одном такте, уходят в API одной пачкой (см. очередь выше).
 *
 * @param templateId - id шаблона (licenses.template_id)
 * @param slug       - slug страницы внутри шаблона
 * @param type       - тип компонента (совпадает с page_components.type)
 */
export function fetchComponentArticle(
	templateId: number,
	slug: string,
	type: string
): Promise<ComponentArticle | null> {
	const cacheKey = `${templateId}:${slug}:${type}`;
	if (componentArticleCache.has(cacheKey)) {
		return Promise.resolve(componentArticleCache.get(cacheKey) ?? null);
	}

	return new Promise((resolve) => {
		articleQueue.push({ key: cacheKey, templateId, slug, type, resolve });
		scheduleArticleFlush();
	});
}

// ── Артикулы layout-компонентов (полоса акций/баннер/меню/футер) ─────────────
// Эти компоненты общие для всех страниц и не привязаны к slug страницы, поэтому
// их артикул не лежит в каталожной системе (template_pages/components). Сегмент 2 —
// буквенный код раздела вместо номера страницы: П — полоса акций (над баннером),
// Б — баннер, М — меню (хэдер), Ф — футер. Формат: {template}.{код}.1.{version}
// (component_number = 1 — один слот на раздел). Артикул детерминирован и
// стабилен (как и каталожные). Порядок ключей ниже — сверху вниз по странице.
export const LAYOUT_SECTION_CODES: Record<string, string> = {
	PromoStrip: 'П',
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
