import { MESSAGE_DEFAULT_PROJECTS, resolveMessageProjects, type MessageProject } from '../data';

const PROJECT_COUNT = 10;
const EXAMPLE_IMAGE_DIR =
	'https://storage.yandexcloud.net/leget-main/templates/promo-1/message-1.1.2.1';

const additionalExamples = [
	{
		title: 'Угловая кухня',
		description: 'Пеналы со встроенной техникой и выдвижные секции под столешницей.',
		image: EXAMPLE_IMAGE_DIR + '/corner-kitchen.webp',
		alt: 'Угловая кухня с зелёными фасадами и встроенной духовкой'
	},
	{
		title: 'Шкаф в прихожей',
		description: 'Закрытое хранение, открытая ниша с крючками и скамья.',
		image: EXAMPLE_IMAGE_DIR + '/hallway-wardrobe.webp',
		alt: 'Светлый шкаф в прихожей с дубовой нишей и скамьёй'
	},
	{
		title: 'Мебель для спальни',
		description: 'Встроенный шкаф, прикроватные тумбы и туалетный столик.',
		image: EXAMPLE_IMAGE_DIR + '/built-in-bedroom-furniture.webp',
		alt: 'Спальня со встроенным шкафом и туалетным столиком'
	},
	{
		title: 'Домашний кабинет',
		description: 'Письменный стол, книжные полки и закрытые секции для документов.',
		image: EXAMPLE_IMAGE_DIR + '/home-office.webp',
		alt: 'Домашний кабинет с письменным столом и книжными полками из ореха'
	},
	{
		title: 'Тумба для ванной',
		description: 'Подвесная тумба под раковину с выдвижными ящиками.',
		image: EXAMPLE_IMAGE_DIR + '/floating-bathroom-vanity.webp',
		alt: 'Подвесная тумба с рифлёными дубовыми фасадами и белой раковиной'
	},
	{
		title: 'Шкаф для постирочной',
		description: 'Колонна для стиральной и сушильной машин, полки для хранения.',
		image: EXAMPLE_IMAGE_DIR + '/laundry-room-cabinetry.webp',
		alt: 'Шкаф для постирочной с колонной из двух машин и открытыми полками'
	}
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
			...additionalExamples.map((project) => ({ ...emptyProject, ...project }))
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
