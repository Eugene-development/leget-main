import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.pageData) {
		error(404, 'Not found');
	}

	return {
		pageData: locals.pageData
	};
};
