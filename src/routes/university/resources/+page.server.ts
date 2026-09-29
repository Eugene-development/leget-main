import { universityData } from '$lib/server/university';
import type { Resource } from '$lib/university/types';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ cookies }) =>
	universityData<{ resources: Resource[] }>(cookies, 'resources');
