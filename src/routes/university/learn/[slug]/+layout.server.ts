import { universityData } from '$lib/server/university';
import type { Dashboard, Course } from '$lib/university/types';
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ cookies, params }) => {
	const [lesson, dashboard] = await Promise.all([
		universityData<{ course: Course }>(cookies, `courses/${encodeURIComponent(params.slug)}`),
		universityData<Dashboard>(cookies, 'dashboard')
	]);
	return {
		course: lesson.course,
		attempts: dashboard.attempts.filter((a) => a.course_slug === params.slug)
	};
};
