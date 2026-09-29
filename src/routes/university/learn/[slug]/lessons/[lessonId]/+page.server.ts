import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ parent, params }) => {
	const { course } = await parent();
	const lesson = course.lessons.find((l) => l.id === params.lessonId);
	if (!lesson) error(404, 'Урок не найден.');
	return { lesson };
};
