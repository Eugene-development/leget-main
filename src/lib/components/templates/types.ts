import type { Component } from 'svelte';
import type { EditContext } from '$lib/utils/page-edit';

/** Пропсы, которые получает любой компонент страницы или layout'а. */
export type PageComponentProps = {
	data: Record<string, unknown>;
	editContext?: EditContext | null;
	isEditable?: boolean;
	/** Идентификатор строки page_components для встроенных контролов настройки. */
	componentId?: string | null;
	/**
	 * Телефон сайта из layout-данных (header_data.phone) — тот же номер, что
	 * показывает баннер хэдера. Read-only мост: блоки с кнопкой «Позвонить»
	 * читают его отсюда, а не из своего data, чтобы номер не хранился в двух
	 * местах. null — когда layout не смонтирован (каталог /_ds).
	 */
	sitePhone?: string | null;
};

/** Карта «тип компонента из БД» → Svelte-компонент. */
export type ComponentMap = Record<string, Component<PageComponentProps>>;

/** Layout шаблона. Banner есть только у Promo-1. */
export type TemplateLayout = {
	Banner?: Component<PageComponentProps> | null;
	Header?: Component<PageComponentProps> | null;
	Footer?: Component<PageComponentProps> | null;
};

/**
 * Карты компонентов одной страницы по шаблонам. Ключ — templateId лицензии,
 * ключ `0` — фолбэк для неизвестного/пустого templateId (шаблон Test).
 *
 * Ключ отсутствует → страница в этом шаблоне не описана, карта пустая:
 * layout при этом всё равно рендерится (см. resolveLayout).
 */
export type ComponentMapsByTemplate = Record<number, ComponentMap>;

/**
 * Резолв карты компонентов по templateId. Повторяет поведение
 * ComponentResolver: 1 → Promo-1, 2 → Promo-2, 3 → Promo-3, иначе Test.
 */
export function resolveComponentMap(
	templateId: number | null,
	maps: ComponentMapsByTemplate
): ComponentMap {
	const key = templateId === 1 || templateId === 2 || templateId === 3 ? templateId : 0;
	return maps[key] ?? {};
}
