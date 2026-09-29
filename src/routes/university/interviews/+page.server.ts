import { universityData } from '$lib/server/university';
import type { Interview } from '$lib/university/types';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ cookies }) =>
	universityData<{ interviews: Interview[] }>(cookies, 'interviews');
