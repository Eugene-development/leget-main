import { loadRenderPage } from '$lib/server/render-page';
import type { PageServerLoad } from './$types';

/** Контент страницы приходит из каталога; выбор ID остаётся в браузере. */
export const load: PageServerLoad = async (event) => loadRenderPage(event, '/favorites');
