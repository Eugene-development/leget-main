import type { Attempt, Course, Resource } from './types';
export function passes(course: Course, attempts: Attempt[]) {
	return new Set(
		attempts.filter((a) => a.course_slug === course.slug && a.passed).map((a) => a.assessment)
	);
}
export function lessonUrl(course: Course | string, id: string) {
	const slug = typeof course === 'string' ? course : course.slug;
	return `/university/learn/${encodeURIComponent(slug)}/${id === 'exam' ? 'exam' : `lessons/${encodeURIComponent(id)}`}`;
}
export function continueUrl(course: Course, attempts: Attempt[]) {
	const done = passes(course, attempts);
	const next = course.lessons.find((l) => !done.has(l.id));
	return lessonUrl(
		course,
		next?.id ?? (done.has('exam') ? (course.lessons[0]?.id ?? 'exam') : 'exam')
	);
}
export const resourceCategories = {
	articles: 'Статьи',
	media: 'Видео и подкасты',
	books: 'Книги',
	tools: 'Инструменты'
};
export function resourceUrl(resource: Resource, admin = false) {
	if (resource.file_id) return `${admin ? '/admin' : ''}/university/media/${resource.file_id}`;
	if (resource.course_slug)
		return resource.lesson_id
			? lessonUrl(resource.course_slug, resource.lesson_id)
			: `/university/learn/${resource.course_slug}`;
	return resource.url?.startsWith('https://') ? resource.url : '';
}
export function timeLabel(seconds: number) {
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
