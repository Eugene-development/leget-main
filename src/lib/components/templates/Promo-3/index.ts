import type { PageOverrides } from '../page-overrides';

export const loadLayout = () => import('./page-modules/_layout').then((module) => module.default);

export const pageOverrides = {
	'/privacy': () => import('./page-modules/privacy'),
	'/': () => import('./page-modules/_root'),
	'/about': () => import('./page-modules/about'),
	'/brands': () => import('./page-modules/brands'),
	'/collections': () => import('./page-modules/collections'),
	'/contacts': () => import('./page-modules/contacts'),
	'/materials': () => import('./page-modules/materials'),
	'/services': () => import('./page-modules/services'),
	'/vacancies': () => import('./page-modules/vacancies'),
	'/yandex-direct': () => import('./page-modules/yandex-direct')
} satisfies PageOverrides;
