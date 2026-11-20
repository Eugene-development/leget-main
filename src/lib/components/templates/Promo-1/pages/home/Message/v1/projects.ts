import { MESSAGE_DEFAULT_PROJECTS, resolveMessageProjects, type MessageProject } from '../data';

const PROJECT_COUNT = 10;

const additionalExamples = [
	['Угловая кухня', 'Пеналы со встроенной техникой и выдвижные секции под столешницей.'],
	['Шкаф в прихожей', 'Закрытое хранение, открытая ниша с крючками и скамья.'],
	['Мебель для спальни', 'Встроенный шкаф, прикроватные тумбы и туалетный столик.'],
	['Домашний кабинет', 'Письменный стол, книжные полки и закрытые секции для документов.'],
	['Тумба для ванной', 'Подвесная тумба под раковину с выдвижными ящиками.'],
	['Шкаф для постирочной', 'Колонна для стиральной и сушильной машин, полки для хранения.']
];

const emptyProject: MessageProject = {
	title: '',
	description: '',
	image: null,
	alt: '',
	link: '',
	specs: []
};

export function resolveProjectCards(value: unknown, editable: boolean): MessageProject[] {
	const projects = resolveMessageProjects(value);
	// API и каталог передают общие четыре примера. Расширяем их только в v1.
	const usesStarterCards =
		projects.length === MESSAGE_DEFAULT_PROJECTS.length &&
		MESSAGE_DEFAULT_PROJECTS.every(({ title, description }, index) => {
			const project = projects[index];
			return project.title === title && project.description === description && !project.link;
		});

	if (usesStarterCards) {
		return [
			...projects,
			...additionalExamples.map(([title, description]) => ({ ...emptyProject, title, description }))
		];
	}

	if (!editable || projects.length >= PROJECT_COUNT) return projects;

	return [
		...projects,
		...Array.from({ length: PROJECT_COUNT - projects.length }, () => ({ ...emptyProject }))
	];
}

export function hasProjectContent(project: MessageProject): boolean {
	return Boolean(
		project.title.trim() ||
		project.description.trim() ||
		project.image ||
		project.link ||
		project.specs.length
	);
}
