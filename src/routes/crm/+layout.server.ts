import { loadCrm } from '$lib/server/crm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (event) => loadCrm(event, false);
