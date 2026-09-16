/** Read current sibling data through a page-local getter, including during SSR. */
export const PAGE_COMPONENT_DATA_CONTEXT = Symbol('page-component-data');
export type PageComponentDataLookup = (type: string) => Record<string, unknown> | null;
