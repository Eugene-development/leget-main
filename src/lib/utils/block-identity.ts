/**
 * Имя и назначение блока на конкретном сайте.
 *
 * Три слоя, которые тут сходятся:
 *   что блок ЕСТЬ   — морфотип версии (приходит из каталога вместе с артикулом)
 *   что блок МОЖЕТ  — роли конструкции (оттуда же)
 *   чем блок СТАЛ   — `label` и `roleSlug` экземпляра (эти функции их читают и пишут)
 *
 * Тип компонента (`Incentives`, `Equipment`) человеку не показывается: он присвоен
 * тогда, когда назначение блока ещё не было известно, и потому врёт. Показываем
 * каскад `resolveBlockName`, который никогда не пуст и никогда не врёт.
 *
 * Модель целиком: docs/architecture/component-morphotypes.md
 */

import { getGraphQLUrl } from '$lib/utils/config';
import { blockNameFromMorph } from '$lib/utils/morphotype';

export { parseMorph, blockNameFromMorph, describeMorph } from '$lib/utils/morphotype';

export interface ComponentRole {
	slug: string;
	name: string;
	group: string;
	groupName: string;
	description: string | null;
}

export interface BlockIdentity {
	label: string | null;
	roleSlug: string | null;
}

const ROLES_QUERY = `
  query ComponentRoles {
    componentRoles {
      slug
      name
      group
      groupName
      description
    }
  }
`;

const IDENTITY_QUERY = `
  query PageComponentsIdentity($licenseId: ID!, $pageId: ID!) {
    pageComponents(licenseId: $licenseId, pageId: $pageId) {
      type
      label
      roleSlug
    }
  }
`;

const RENAME_MUTATION = `
  mutation RenamePageComponent($pageId: ID!, $licenseId: ID!, $type: String!, $label: String, $roleSlug: String) {
    renamePageComponent(pageId: $pageId, licenseId: $licenseId, type: $type, label: $label, roleSlug: $roleSlug) {
      id
      type
      label
      roleSlug
    }
  }
`;

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
	if (!token) return null;

	const response = await fetch(getGraphQLUrl(), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ query, variables })
	});

	if (!response.ok) return null;

	const result = await response.json();
	if (result.errors?.length) {
		throw new Error(result.errors[0]?.message ?? 'GraphQL error');
	}

	return (result.data ?? null) as T | null;
}

// ── Справочник ролей ────────────────────────────────────────────────────────
// Один на всё приложение: состав ролей задан конфигом бэкенда и в пределах сессии
// не меняется. Промис, а не результат: несколько блоков открывают панель почти
// одновременно, и без него ушло бы столько же одинаковых запросов, сколько блоков.
let rolesPromise: Promise<ComponentRole[]> | null = null;

export function fetchComponentRoles(): Promise<ComponentRole[]> {
	if (!rolesPromise) {
		rolesPromise = gql<{ componentRoles: ComponentRole[] }>(ROLES_QUERY, {})
			.then((data) => data?.componentRoles ?? [])
			.catch(() => {
				// Неудачу не запоминаем: запрос идёт под @guard, и единственная попытка
				// до того, как подхватился токен, навсегда оставила бы список ролей
				// пустым до перезагрузки страницы.
				rolesPromise = null;
				return [];
			});
	}

	return rolesPromise;
}

// ── Имя и роль экземпляра ───────────────────────────────────────────────────
// Кэш на страницу, а не на блок: `pageComponents` отдаёт всю страницу разом,
// и открытие второй панели на той же странице не должно стоить второго запроса.
const identityCache = new Map<string, Map<string, BlockIdentity>>();

export async function fetchBlockIdentity(
	licenseId: string,
	pageId: string,
	type: string
): Promise<BlockIdentity> {
	const key = `${licenseId}:${pageId}`;
	let page = identityCache.get(key);

	if (!page) {
		const data = await gql<{
			pageComponents: { type: string; label: string | null; roleSlug: string | null }[];
		}>(IDENTITY_QUERY, { licenseId, pageId }).catch(() => null);

		page = new Map();
		for (const item of data?.pageComponents ?? []) {
			page.set(item.type, { label: item.label ?? null, roleSlug: item.roleSlug ?? null });
		}

		// Кэшируем и пустой ответ: страница без единого переименованного блока —
		// нормальное состояние, и переспрашивать его на каждое открытие панели незачем.
		identityCache.set(key, page);
	}

	return page.get(type) ?? { label: null, roleSlug: null };
}

/**
 * Сохранить имя и назначение блока.
 *
 * Пустая строка — осмысленная операция «убрать»: блок возвращается к каскаду.
 * Поэтому пустые значения не отфильтровываются, а передаются как есть.
 */
export async function saveBlockIdentity(
	licenseId: string,
	pageId: string,
	type: string,
	identity: BlockIdentity
): Promise<BlockIdentity> {
	const data = await gql<{
		renamePageComponent: { label: string | null; roleSlug: string | null };
	}>(RENAME_MUTATION, {
		pageId,
		licenseId,
		type,
		label: identity.label ?? '',
		roleSlug: identity.roleSlug ?? ''
	});

	const saved: BlockIdentity = {
		label: data?.renamePageComponent?.label ?? null,
		roleSlug: data?.renamePageComponent?.roleSlug ?? null
	};

	// Кэш страницы правим на месте, а не сбрасываем: панель закрывают и открывают
	// сразу же, и повторный запрос показал бы старое имя, пока не долетит ответ.
	const page = identityCache.get(`${licenseId}:${pageId}`);
	if (page) page.set(type, saved);

	return saved;
}

/**
 * Каскад подписи блока. Никогда не пуст и никогда не врёт: худшее, что увидит
 * тенант, — «Сетка карточек», что как минимум правда, в отличие от `Equipment`
 * на блоке услуг.
 *
 * `fallback` — имя блока из шаблона, то, что раньше приходило пропом `title`.
 * Стоит ПОСЛЕ роли: «Главный экран» написал разработчик, не зная, чем блок станет
 * у тенанта, а выбранная роль — это уже решение самого тенанта.
 */
export function resolveBlockName(input: {
	label?: string | null;
	roleSlug?: string | null;
	roles?: ComponentRole[];
	morph?: string | null;
	fallback?: string | null;
}): string {
	const label = input.label?.trim();
	if (label) return label;

	if (input.roleSlug) {
		const role = input.roles?.find((item) => item.slug === input.roleSlug);
		if (role) return role.name;
	}

	return input.fallback?.trim() || blockNameFromMorph(input.morph) || 'Блок';
}
