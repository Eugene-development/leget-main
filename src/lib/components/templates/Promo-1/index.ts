import type { PageOverrides } from '../page-overrides';

export const loadLayout = () => import('./page-modules/_layout').then((module) => module.default);

export const pageOverrides = {
	'/b2b': () => import('./page-modules/b2b'),
	'/b2b/{company}': () => import('./page-modules/b2b~{company}'),
	'/privacy': () => import('./page-modules/privacy'),
	'/steklo-i-zerkala': () => import('./page-modules/steklo-i-zerkala'),
	'/university': () => import('./page-modules/university'),
	// Страница 404. Рендерится и по прямому адресу /404, и как тело ошибки
	// в src/routes/+error.svelte — см. loadRenderPage().
	'/404': () => import('./page-modules/404'),
	'/': () => import('./page-modules/_root'),
	'/about': () => import('./page-modules/about'),
	'/contact': () => import('./page-modules/contact'),
	'/contacts': () => import('./page-modules/contacts'),
	'/actions': () => import('./page-modules/actions'),
	'/partnership': () => import('./page-modules/partnership'),
	'/testimonials': () => import('./page-modules/testimonials'),
	'/installment': () => import('./page-modules/installment'),
	'/guarantees': () => import('./page-modules/guarantees'),
	'/yandex-direct': () => import('./page-modules/yandex-direct'),
	'/consultation': () => import('./page-modules/consultation'),
	'/design-project': () => import('./page-modules/design-project'),
	'/measurement': () => import('./page-modules/measurement'),
	'/furniture-project': () => import('./page-modules/furniture-project'),
	'/assembly': () => import('./page-modules/assembly'),
	'/mebel': () => import('./page-modules/mebel'),
	'/mebel/{category}': () => import('./page-modules/mebel~{category}'),
	'/mebel/{category}/{project}': () => import('./page-modules/mebel~{category}~{project}'),
	// Страница «Проекты»: те же работы, что в рубрике «Мебель» каталога, но
	// сплошной лентой. Сайдбара каталога здесь нет намеренно — это страница
	// верхнего уровня из меню шапки, а не рубрика.
	'/projects': () => import('./page-modules/projects'),
	'/favorites': () => import('./page-modules/favorites'),
	// Страница «Вакансии». Слаг — `/vacancy`: именно на него ведёт ссылка
	// «Вакансии» в подвале всех трёх версий Footer шаблона.
	'/vacancy': () => import('./page-modules/vacancy'),
	'/stoleshnica': () => import('./page-modules/stoleshnica'),
	'/stoleshnica/{material}': () => import('./page-modules/stoleshnica~{material}'),
	'/stoleshnica/{material}/{brand}': () => import('./page-modules/stoleshnica~{material}~{brand}'),
	'/bytovaya-tehnika': () => import('./page-modules/bytovaya-tehnika'),
	// Страница бренда бытовой техники. Товарной сетки здесь нет и быть пока
	// нечему: каталога позиций у техники не существует (у мебели её наполняют
	// `mebel_projects`), поэтому страница — шапка бренда из справочника плюс
	// общие блоки рубрики.
	'/bytovaya-tehnika/{brand}': () => import('./page-modules/bytovaya-tehnika~{brand}'),
	'/santehnika': () => import('./page-modules/santehnika'),
	// Страница бренда сантехники. Устроена как страница бренда бытовой техники:
	// товарной сетки нет и наполнять её нечем — каталога позиций у сантехники
	// не существует, поэтому страница это шапка бренда из справочника плюс
	// общие блоки рубрики.
	'/santehnika/{brand}': () => import('./page-modules/santehnika~{brand}'),
	'/osveshchenie': () => import('./page-modules/osveshchenie'),
	'/osveshchenie/{brand}': () => import('./page-modules/osveshchenie~{brand}'),
	'/dveri': () => import('./page-modules/dveri'),
	'/dveri/{brand}': () => import('./page-modules/dveri~{brand}'),
	'/okna': () => import('./page-modules/okna'),
	'/okna/{brand}': () => import('./page-modules/okna~{brand}'),
	'/furnitura': () => import('./page-modules/furnitura'),
	'/furnitura/{shop}': () => import('./page-modules/furnitura~{shop}'),
	'/plitka': () => import('./page-modules/plitka')
} satisfies PageOverrides;
