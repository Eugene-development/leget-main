import { loadCrmPromotions } from '$lib/server/crm-promotions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = loadCrmPromotions;
