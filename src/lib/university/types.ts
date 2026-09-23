export interface Question {
	id: string;
	text: string;
	options: string[];
}
export interface Lesson {
	id: string;
	title: string;
	sections?: { title: string; text: string }[];
	questions?: Question[];
}
export interface Course {
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
