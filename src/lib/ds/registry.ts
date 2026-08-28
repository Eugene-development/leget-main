/**
 * Реестр каталога дизайн-системы для роута /_ds.
 *
 * Сводит две половины, живущие в разных контейнерах:
 *   - какие блоки есть у шаблона и какой Svelte-компонент за них отвечает — из
 *     `pageOverrides` самого шаблона;
 *   - чем их наполнять — из `defaults.json`, выгруженного из config/templates.php
 *     командой `php artisan component-defaults:export` в leget-api.
 *
 * Демо-контент не выдуман: это те же значения, которыми засеивается page_components
 * новому клиенту. Пересобрать после правок в config/templates.php:
 *
 *   cd ms/leget-api && php artisan component-defaults:export \
 *     > ../leget-main/src/lib/ds/defaults.json
 */
import type { Component } from 'svelte';
import type { PageComponentProps } from '$lib/components/templates/types';

import * as Promo1 from '$lib/components/templates/Promo-1';
import * as Promo2 from '$lib/components/templates/Promo-2';
import * as Promo3 from '$lib/components/templates/Promo-3';
import * as TestTemplate from '$lib/components/templates/Test';

import defaultsJson from './defaults.json';

type ComponentMap = Record<string, Component<PageComponentProps>>;

type TemplateModule = {
	pageOverrides?: Record<string, ComponentMap>;
};

type CatalogLayout = {
	component: Component<PageComponentProps>;
	versionCount: number;
	versionKey: string;
	data: Record<string, unknown>;
};

type TemplateDefaults = {
	name: string;
	pages: Record<string, Record<string, Record<string, unknown>>>;
};

type DefaultsFile = Record<string, TemplateDefaults> & {
	/**
	 * «шаблон → тип компонента → число версий», из config/component_variants.php.
	 *
	 * Ключ обязательно двухуровневый: имена типов пересекаются между шаблонами
	 * (`ActionsCTA`, `Brands`), а папки v1…vN есть только у Promo-1.
	 */
	_versions: Record<string, Record<string, number>>;
};

const defaults = defaultsJson as unknown as DefaultsFile;

const templateDefaults = (templateId: number): TemplateDefaults | undefined =>
	defaults[String(templateId)] as TemplateDefaults | undefined;

const MODULES: Record<number, TemplateModule> = {
	1: Promo1 as TemplateModule,
	2: Promo2 as TemplateModule,
	3: Promo3 as TemplateModule,
	0: TestTemplate as TemplateModule
};

/**
 * Layout-компоненты не входят в `pageOverrides` и не регистрируются в каталоге БД:
 * их артикулы с буквенным сегментом считаются детерминированно. Поэтому для `/_ds`
 * у них отдельный, явный реестр. Он одновременно фиксирует число реально доступных
 * вариантов и ключ, которым layout-обёртка переключает версию при SSR.
 */
const CATALOG_LAYOUTS: Record<number, Record<string, CatalogLayout>> = {
	1: {
		Header: {
			component: Promo1.Header as Component<PageComponentProps>,
			versionCount: 4,
			versionKey: 'menuVersion',
			data: { siteName: 'LEGET' }
		}
	}
};

/** Слаг страницы в сегмент URL: `/` → `_root`, `/mebel/kuhni` → `mebel~kuhni`. */
export function encodePage(slug: string): string {
	if (slug === '(layout)') return '_layout';
	const trimmed = slug.replace(/^\//, '');
	return trimmed === '' ? '_root' : trimmed.replaceAll('/', '~');
}

/** Обратное преобразование сегмента URL в слаг страницы. */
export function decodePage(segment: string): string {
	if (segment === '_layout') return '(layout)';
	return segment === '_root' ? '/' : '/' + segment.replaceAll('~', '/');
}

/**
 * Ключ версии в data — тот же, что вычисляет VersionSwitcher.
 *
 * Компонент объявляет версию не пропсом, а полем в собственных данных
 * (`data.incentivesVersion = 'v2'`), поэтому чтобы каталог показал версию,
 * достаточно подложить это поле. Правило повторяет
 * `actualVersionKey` в VersionSwitcher.svelte, включая исключение для HeroMain —
 * при расхождении версия молча не переключится, поэтому правила надо держать
 * синхронными.
 */
export function versionKey(type: string): string {
	if (type === 'HeroMain') return 'heroVersion';

	return `${type.charAt(0).toLowerCase()}${type.slice(1)}Version`;
}

/**
 * Сколько версий у блока. Пары «шаблон + тип» вне config/component_variants.php
 * имеют одну.
 *
 * Считать по одному имени типа нельзя: `ActionsCTA` и `Brands` есть в нескольких
 * шаблонах, а папки v1…vN — только у Promo-1.
 */
export function versionCount(templateId: number, type: string): number {
	const layout = CATALOG_LAYOUTS[templateId]?.[type];
	if (layout) return layout.versionCount;

	return defaults._versions?.[String(templateId)]?.[type] ?? 1;
}

export type CatalogEntry = {
	templateId: number;
	templateName: string;
	pageSlug: string;
	/** Сегмент URL для pageSlug. */
	page: string;
	type: string;
	/** Версия блока: 1…N. */
	version: number;
	/** Всего версий у типа — чтобы в индексе не показывать «v1 из 1». */
	versionCount: number;
	/** Есть ли для блока демо-контент. false → карточка покажет пустую рамку. */
	hasData: boolean;
};

/**
 * Плоский список всего, что каталог умеет отрендерить.
 *
 * Источник истины для блоков страниц — `pageOverrides` шаблона, а не defaults.json:
 * показываем то, что реально существует в коде. Layout-варианты перечислены отдельно
 * в `CATALOG_LAYOUTS`, потому что в БД и `pageOverrides` они намеренно не живут.
 * Блок, описанный в конфиге, но не имеющий компонента, отрендерить нельзя, поэтому
 * в список он не попадает.
 */
export function catalogEntries(): CatalogEntry[] {
	const entries: CatalogEntry[] = [];

	for (const [idRaw, module] of Object.entries(MODULES)) {
		const templateId = Number(idRaw);

		// Test — служебный фолбэк, в каталоге дизайн-системы ему не место.
		if (templateId === 0) continue;

		const overrides = module.pageOverrides ?? {};
		const templateName = templateDefaults(templateId)?.name ?? `Template ${templateId}`;

		for (const [pageSlug, map] of Object.entries(overrides)) {
			for (const type of Object.keys(map)) {
				const count = versionCount(templateId, type);
				const hasData = hasDemoData(templateId, pageSlug, type);

				for (let version = 1; version <= count; version++) {
					entries.push({
						templateId,
						templateName,
						pageSlug,
						page: encodePage(pageSlug),
						type,
						version,
						versionCount: count,
						hasData
					});
				}
			}
		}

		for (const [type, layout] of Object.entries(CATALOG_LAYOUTS[templateId] ?? {})) {
			for (let version = 1; version <= layout.versionCount; version++) {
				entries.push({
					templateId,
					templateName,
					pageSlug: '(layout)',
					page: encodePage('(layout)'),
					type,
					version,
					versionCount: layout.versionCount,
					hasData: true
				});
			}
		}
	}

	return entries;
}

/** Svelte-компонент по координатам, либо null если такого блока нет. */
export function resolveComponent(
	templateId: number,
	pageSlug: string,
	type: string
): Component<PageComponentProps> | null {
	return (
		MODULES[templateId]?.pageOverrides?.[pageSlug]?.[type] ??
		(pageSlug === '(layout)' ? CATALOG_LAYOUTS[templateId]?.[type]?.component : undefined) ??
		null
	);
}

/**
 * Демо-контент блока с проставленной версией.
 *
 * Версия кладётся в те же данные, откуда её читает сам компонент, — иначе он
 * покажет v1 независимо от адреса.
 */
export function demoData(
	templateId: number,
	pageSlug: string,
	type: string,
	version = 1
): Record<string, unknown> {
	const layout = CATALOG_LAYOUTS[templateId]?.[type];
	if (pageSlug === '(layout)' && layout) {
		return { ...layout.data, [layout.versionKey]: `v${version}` };
	}

	const base = templateDefaults(templateId)?.pages?.[pageSlug]?.[type] ?? {};

	return { ...base, [versionKey(type)]: `v${version}` };
}

/**
 * Считается ли демо-контент пригодным для карточки.
 *
 * «Тонкий» контент — пустой или наполовину пустой — даёт визуально пустой блок.
 * Такие места честнее пометить, чем показывать пустую рамку как готовую карточку.
 * Порог совпадает с `--stats` у component-defaults:export, чтобы обе стороны
 * считали одинаково.
 */
function hasDemoData(templateId: number, pageSlug: string, type: string): boolean {
	// Именно исходный контент, без служебного ключа версии: он есть всегда
	// и иначе любой блок выглядел бы наполненным.
	const data = templateDefaults(templateId)?.pages?.[pageSlug]?.[type] ?? {};
	const values = Object.values(data);

	if (values.length === 0) return false;

	const blanks = values.filter(
		(v) => v === '' || v === null || (Array.isArray(v) && v.length === 0)
	).length;

	return !(blanks > 0 && blanks >= values.length / 2);
}
