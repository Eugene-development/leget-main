import { loadGrowth } from '$lib/growth/insights-server';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = (event) => loadGrowth(event, 'automation');
