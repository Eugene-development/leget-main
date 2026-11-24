import type { PageOverrides } from '../page-overrides';

export const loadLayout = () => import('./page-modules/_layout').then((module) => module.default);

export const pageOverrides = {
	'/': () => import('./page-modules/_root'),
	'/about': () => import('./page-modules/about')
} satisfies PageOverrides;
