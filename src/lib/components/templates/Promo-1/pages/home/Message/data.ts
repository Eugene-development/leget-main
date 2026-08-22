/**
 * Один контракт данных для всех версий блока 1.1.2 (Message).
 *
 * Блок сменил роль 19.08.2026: раньше он показывал логотип и цитату о компании,
 * то есть утверждал качество от первого лица. Теперь он его предъявляет —
 * заголовок «Выполненные проекты», пояснение под ним и опись работ, каждая со
 * ссылкой на сам проект. Социальное доказательство: посетитель видит не
 * обещание, а сделанное.
 *
 * Ключ данных остался `cards`, а не стал `projects`: переименование обнулило бы
 * карточки у тенантов, которые их правили (та же причина, по которой в
 * `Incentives` живёт ключ `badge` от удалённой пилюли). Ключ `logoUrl` в данных
 * тоже остаётся, но ни одной версией больше не читается.
 */
export type MessageProject = {
	title: string;
	description: string;
	image: string | null;
	alt: string;
	/** Ссылка на страницу проекта. Пустая — карточка не кликабельна. */
	link: string;
	/**
	 * Паспорт работы: пары «мера → величина» (срок, площадь, состав). Пустой
	 * список — версия рисует работу без паспорта, поэтому ключ безопасен для
	 * тенантов, сохранивших карточки до 19.08.2026.
	 *
	 * Величины намеренно числовые, а материал остаётся в описании: колонка
	 * значений набирается ролью `p1-numeric`, а та несёт не только разряды,
	 * но и гарнитуру цифры — у «Графита» это IBM Plex Mono, и прозаическое
	 * «массив дуба, кварцевый агломерат» в ней выглядело бы набранным по
	 * ошибке. Смешанную колонку роль не обслуживает — см. разбор прогона.
	 *
	 * Список, а не фиксированные поля `material`/`term`/`area`: у кухни, шкафа
	 * и детской характеристики разные, и три жёстких ключа заставили бы тенанта
	 * либо врать, либо оставлять пустые строки. Порядок пар задаёт тенант.
	 */
	specs: MessageProjectSpec[];
};

/** Одна строка паспорта: подпись характеристики и её значение. */
export type MessageProjectSpec = {
	label: string;
	value: string;
};

export const MESSAGE_DEFAULT_TITLE = 'Выполненные проекты';

export const MESSAGE_DEFAULT_TEXT =
	'Ниже — наши последние выполненные проекты. У каждого свой замер, свои материалы и своя дата сдачи: откройте проект и посмотрите, из чего он собран и сколько занял.';

/**
 * Подпись перехода не редактируется и одинакова во всех версиях: это не текст
 * блока, а имя действия. Разные слова на соседних карточках одной описи читались
 * бы как разные действия.
 */
export const MESSAGE_PROJECT_LINK_LABEL = 'Смотреть проект';

/**
 * Стартовые работы. Без чисел вида «более 1200 проектов»: стартовые данные
 * достаются каждому новому тенанту, и проверить такое утверждение он не может —
 * ложное социальное доказательство хуже отсутствующего. Изображения не заданы:
 * медиа тенанта живёт в бакете и заливается через редактор, до этого
 * `ImageFallback` показывает заглушку по теме блока.
 */
export const MESSAGE_DEFAULT_PROJECTS: readonly MessageProject[] = [
	{
		title: 'Кухня из массива дуба',
		description: 'Гарнитур 4,2 м со встроенной техникой и столешницей из кварцевого агломерата.',
		image: null,
		alt: 'Кухня из массива дуба со встроенной техникой',
		link: '',
		specs: [
			{ label: 'Длина', value: '4,2 м' },
			{ label: 'Срок', value: '41 день' },
			{ label: 'Фасадов', value: '18' }
		]
	},
	{
		title: 'Гардеробная 9 м²',
		description: 'Система хранения от пола до потолка: обувной модуль, подсветка полок.',
		image: null,
		alt: 'Гардеробная комната с подсветкой полок',
		link: '',
		specs: [
			{ label: 'Площадь', value: '9 м²' },
			{ label: 'Срок', value: '34 дня' },
			{ label: 'Полок', value: '24' }
		]
	},
	{
		title: 'Гостиная со стенкой под ТВ',
		description: 'Прямая стенка 3,6 м: закрытые секции, ниша под технику, скрытая подсветка.',
		image: null,
		alt: 'Гостиная со встроенной стенкой под телевизор',
		link: '',
		specs: [
			{ label: 'Длина', value: '3,6 м' },
			{ label: 'Срок', value: '29 дней' },
			{ label: 'Секций', value: '7' }
		]
	},
	{
		title: 'Детская с рабочим местом',
		description: 'Кровать, стол и стеллаж одним объёмом. Плиты с сертификатом класса E0.',
		image: null,
		alt: 'Детская мебель с рабочим местом у окна',
		link: '',
		specs: [
			{ label: 'Площадь', value: '14 м²' },
			{ label: 'Срок', value: '23 дня' },
			{ label: 'Ящиков', value: '11' }
		]
	}
];

function asText(value: unknown, fallback: string): string {
	return typeof value === 'string' ? value : fallback;
}

/**
 * Сохранённые работы тенанта имеют приоритет, недостающие поля добираются из
 * стартовых. Длину задаёт тенант, а не список по умолчанию: работ может быть и
 * три, и восемь, и обрезать сохранённое до четырёх — терять данные.
 */
export function resolveMessageProjects(value: unknown): MessageProject[] {
	const saved = Array.isArray(value) ? value : [];
	if (saved.length === 0) return MESSAGE_DEFAULT_PROJECTS.map((project) => ({ ...project }));

	return saved.map((item, index) => {
		const fallback = MESSAGE_DEFAULT_PROJECTS[index];
		const card = (typeof item === 'object' && item !== null ? item : {}) as Partial<MessageProject>;
		const title = asText(card.title, fallback?.title ?? '');

		return {
			title,
			description: asText(card.description, fallback?.description ?? ''),
			image: typeof card.image === 'string' && card.image.trim() ? card.image : null,
			alt: asText(card.alt, fallback?.alt ?? title),
			link: asText(card.link, '').trim(),
			specs: resolveSpecs(card.specs)
		};
	});
}

/**
 * Паспорт сохранённой работы. Стартовыми значениями НЕ дополняется, в отличие
 * от остальных полей: «массив дуба, 41 день» — утверждение о чужой работе,
 * и подставлять его тенанту, который паспорт не заполнял, значит выдумывать
 * за него факты. Пустой список версия рисует молча.
 */
function resolveSpecs(value: unknown): MessageProjectSpec[] {
	if (!Array.isArray(value)) return [];

	return value
		.map((item) => {
			const spec = (
				typeof item === 'object' && item !== null ? item : {}
			) as Partial<MessageProjectSpec>;
			return { label: asText(spec.label, ''), value: asText(spec.value, '') };
		})
		.filter((spec) => spec.label.trim() !== '' || spec.value.trim() !== '');
}

/** Внешняя ссылка уходит в новую вкладку, внутренняя остаётся в текущей. */
export function isExternalProjectLink(link: string): boolean {
	return /^(https?:)?\/\//i.test(link.trim());
}
