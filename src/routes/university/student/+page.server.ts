import { universityData } from '$lib/server/university';
import type { Dashboard } from '$lib/university/types';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ cookies }) => ({
	dashboard: await universityData<Dashboard>(cookies, 'dashboard')
});
