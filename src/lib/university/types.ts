export interface Question {
	id: string;
	text: string;
	options: string[];
}
export interface Lesson {
	practice?: string | null;
	video_id?: string | null;
	id: string;
	title: string;
	sections?: { title: string; text: string }[];
	questions?: Question[];
}
export interface Course {
	status?: 'draft' | 'published' | 'archived';
	cover_id?: string | null;
	slug: string;
	discipline: string;
	title: string;
	description: string;
	lessons: Lesson[];
	exam: Question[];
}
export interface Attempt {
	grade: number;
	id: number;
	course_slug: string;
	assessment: string;
	score: number;
	passed: boolean;
	created_at: string;
}
export interface Certificate {
	id: string;
	student_name: string;
	course_slug: string;
	course_title: string;
	discipline: string;
	score: number;
	issued_at: string;
}
export interface Dashboard {
	student: { name: string; email: string };
	courses: Course[];
	attempts: Attempt[];
	certificates: Certificate[];
}
export interface AssessmentResult {
	id: number;
	score: number;
	grade: number;
	passed: boolean;
	certificate_id: string | null;
	feedback: { id: string; correct: boolean; explanation: string }[];
}

export interface Chapter {
	start: number;
	title: string;
}
export interface TranscriptLine {
	start: number;
	speaker: string;
	text: string;
}
export interface Interview {
	slug: string;
	title: string;
	speaker: string;
	description: string;
	intro?: string;
	cover_id?: string | null;
	video_id?: string | null;
	chapters?: Chapter[];
	transcript?: TranscriptLine[];
}
export interface Resource {
	slug: string;
	category: 'articles' | 'media' | 'books' | 'tools';
	title: string;
	description: string;
	author?: string;
	cover_id?: string | null;
	file_id?: string | null;
	url?: string | null;
	course_slug?: string | null;
	lesson_id?: string | null;
}
