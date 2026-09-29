import type { Chapter, TranscriptLine } from '../types';
export type Kind = 'courses' | 'interviews' | 'resources';
export interface EditorQuestion {
	id: string;
	text: string;
	options: string[];
	correct: number;
	explanation: string;
}
export interface EditorLesson {
	id: string;
	title: string;
	sections: { title: string; text: string }[];
	questions: EditorQuestion[];
	practice?: string | null;
	video_id?: string | null;
}
export interface EditorItem {
	slug: string;
	title: string;
	description: string;
	position: number;
	status: 'draft' | 'published' | 'archived';
	updated_at?: string;
	curriculum_locked?: boolean;
	cover_id?: string | null;
	previous_slug?: string | null;
	discipline?: string;
	curriculum?: { lessons: EditorLesson[]; exam: EditorQuestion[] };
	speaker?: string;
	intro?: string | null;
	video_id?: string | null;
	chapters?: Chapter[];
	transcript?: TranscriptLine[];
	category?: 'articles' | 'media' | 'books' | 'tools';
	author?: string | null;
	file_id?: string | null;
	url?: string | null;
	course_slug?: string | null;
	lesson_id?: string | null;
}
export const labels: Record<Kind, string> = {
	courses: 'Курсы',
	interviews: 'Интервью',
	resources: 'Ресурсы'
};
export function blank(kind: Kind): EditorItem {
	const common: EditorItem = {
		slug: '',
		title: '',
		description: '',
		position: 0,
		status: 'draft',
		cover_id: null
	};
	if (kind === 'courses')
		return { ...common, discipline: '', curriculum: { lessons: [], exam: [] } };
	if (kind === 'interviews')
		return { ...common, speaker: '', intro: '', video_id: null, chapters: [], transcript: [] };
	return {
		...common,
		category: 'articles',
		author: '',
		file_id: null,
		url: null,
		course_slug: null,
		lesson_id: null
	};
}
export async function api<T>(path: string, body?: unknown): Promise<T> {
	const r = await fetch(
		`/admin/university/api/${path}`,
		body === undefined
			? {}
			: {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
	);
	const data = await r.json();
	if (!r.ok) {
		const errors = data.errors ? Object.values(data.errors).flat().join(' ') : '';
		throw new Error(errors || data.message || 'Не удалось выполнить действие. Попробуйте ещё раз.');
	}
	return data as T;
}
