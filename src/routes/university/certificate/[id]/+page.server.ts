import { universityData } from '$lib/server/university';
import type { Certificate } from '$lib/university/types';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ cookies, params }) =>
	universityData<{ certificate: Certificate }>(
		cookies,
		`certificates/${encodeURIComponent(params.id)}`
	);
