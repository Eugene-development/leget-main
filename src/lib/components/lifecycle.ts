/**
 * Жизненный цикл компонентов на стороне фронта.
 *
 * Зеркало `ms/leget-api/config/component_lifecycle.php`. Дублирование вынужденное
 * и того же рода, что у `design-systems/registry.ts` и `config/component_variants.php`:
 * переключатель версий работает в браузере и решает, что предложить, ещё до того как
 * что-либо спрошено у API, — а конфиг живёт в PHP. Сверять по паре «шаблон + тип».
 *
 * ⚠️ Здесь только ПРЕДЛОЖЕНИЕ. Рендер выведенной версии этим файлом не управляется
 * и управляться не должен: блок, у которого тенант уже выбрал `v2`, обязан
 * продолжать рисовать `v2` — это и есть разница между «не предлагается» и
 * «не работает». Ветка рендера живёт в `<Тип>/index.svelte` и легаси не знает.
 *
 * Полная модель — docs/architecture/component-lifecycle.md.
 */

export type VersionKey = 'v1' | 'v2' | 'v3' | 'v4';

/** Версии, выведенные из обращения: [templateId][type] → номера версий. */
const LEGACY_VARIANTS: Record<number, Record<string, VersionKey[]>> = {
	1: {
		// 16.08.2026: блок заменён компонентом PartnerOffers целиком, поэтому
		// выведены обе версии — замены внутри компонента нет.
		Direction: ['v1', 'v2']
	}
};

/** Компоненты, выведенные со страницы: [templateId][slug] → типы. */
const RETIRED_COMPONENTS: Record<number, Record<string, string[]>> = {
	1: {
		'/': ['Direction']
	}
};

/** Выведенные версии компонента. Пустой массив, если ничего не выведено. */
export function legacyVersionsFor(
	templateId: number | string | null | undefined,
	componentType: string
): VersionKey[] {
	const tid = Number(templateId);
	if (!Number.isFinite(tid)) return [];
	return LEGACY_VARIANTS[tid]?.[componentType] ?? [];
}

/** Выведен ли сам компонент со страницы. */
export function isComponentRetired(
	templateId: number | string | null | undefined,
	slug: string | null | undefined,
	componentType: string
): boolean {
	const tid = Number(templateId);
	if (!Number.isFinite(tid) || !slug) return false;
	return (RETIRED_COMPONENTS[tid]?.[slug] ?? []).includes(componentType);
}
