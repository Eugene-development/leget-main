import { partnershipMap } from '../Promo-1/pages/partnership/map';
import type { ComponentMapsByTemplate } from '../types';

/**
 * Карты блоков «/partnership» по шаблонам. Страница описана только в Promo-1,
 * поэтому заполнен единственный ключ `1`.
 *
 * Если сайт на другом шаблоне всё же имеет такую страницу в БД, карта окажется
 * пустой и отрендерится только layout — ровно как в catch-all маршруте, где
 * pageOverrides этого шаблона такой слаг не знает.
 *
 * Один файл на страницу — намеренно: Rollup считает модули side-effect'ными, и
 * общий модуль на несколько страниц затащил бы в чанк маршрута чужие блоки.
 */
export const partnershipMaps: ComponentMapsByTemplate = { 1: partnershipMap };
