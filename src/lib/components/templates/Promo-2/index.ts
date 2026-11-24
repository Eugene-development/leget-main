import type { PageOverrides } from '../page-overrides';

export const loadLayout = () => import('./page-modules/_layout').then((module) => module.default);

export const pageOverrides = {
	'/404': () => import('./page-modules/404'),
	'/equipment': () => import('./page-modules/equipment'),
	'/privacy': () => import('./page-modules/privacy'),
	'/favorites': () => import('./page-modules/favorites'),
	'/': () => import('./page-modules/_root'),
	'/about': () => import('./page-modules/about'),
	'/contact': () => import('./page-modules/contact'),
	'/actions': () => import('./page-modules/actions'),
	'/news': () => import('./page-modules/news'),
	'/styles': () => import('./page-modules/styles'),
	'/facades': () => import('./page-modules/facades'),
	'/furniture': () => import('./page-modules/furniture'),
	'/kitchens': () => import('./page-modules/kitchens'),
	'/wardrobes': () => import('./page-modules/wardrobes'),
	'/showrooms': () => import('./page-modules/showrooms'),
	'/careers': () => import('./page-modules/careers'),
	'/designers': () => import('./page-modules/designers'),
	'/yandex-direct': () => import('./page-modules/yandex-direct')
} satisfies PageOverrides;
