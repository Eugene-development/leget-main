import { loadRenderPage } from '$lib/server/render-page';
import type { PageServerLoad } from './$types';

/** `/projects` отдаёт полный актуальный список работ; выбор ID остаётся в браузере. */
export const load: PageServerLoad = async (event) => loadRenderPage(event, '/projects');
