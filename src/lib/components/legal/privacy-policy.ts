/** Shared field contract. Only company values are stored in page_components.data. */
export const privacyFields = {
	operatorName: {
		label: 'Оператор персональных данных',
		placeholder: 'Полное наименование организации или ФИО ИП'
	},
	inn: { label: 'ИНН', placeholder: 'ИНН оператора' },
	registrationNumber: { label: 'ОГРН / ОГРНИП', placeholder: 'Регистрационный номер' },
	address: { label: 'Адрес оператора', placeholder: 'Юридический или почтовый адрес' },
	email: {
		label: 'Email для обращений о персональных данных',
		placeholder: 'Email для запросов и отзыва согласия'
	},
	domains: {
		label: 'Сайты, на которые распространяется политика',
		placeholder: 'Домены и поддомены вашей компании'
	},
	effectiveDate: { label: 'Дата вступления в силу', placeholder: 'Дата утверждения политики' },
	processingDetails: {
		label: 'Цели, данные и основания обработки',
		placeholder:
			'Для каждой используемой формы или функции укажите цель, категории пользователей, состав данных и правовое основание. Например: ответ на заявку, заключение договора, личный кабинет, отклик на вакансию, подписка.'
	},
	retentionDetails: {
		label: 'Сроки хранения по целям',
		placeholder:
			'Укажите срок или условие окончания хранения для каждой цели, а также обязательные сроки хранения документов и их правовое основание.'
	},
	recipients: {
		label: 'Получатели и обработчики',
		placeholder:
			'Укажите полные наименования, адреса, роль и задачи получателей: платформа LEGET, хостинг, хранилище файлов, почтовый сервис и другие фактически используемые поставщики. Для каждого — категории передаваемых данных.'
	},
	storageDetails: {
		label: 'Место хранения и резервные копии',
		placeholder:
			'Укажите страны размещения баз, файлов, почты и резервных копий, а также порядок и сроки удаления данных из резервных копий.'
	},
	analyticsDetails: {
		label: 'Cookie и аналитика вашего сайта',
		placeholder:
			'Укажите используемые cookie и хранилища браузера, их назначение и сроки, подключённые счётчики и настройки, состав передаваемых данных, способ выбора и отзыва согласия. Если аналитика не используется, укажите это.'
	},
	crossBorderDetails: {
		label: 'Трансграничная передача',
		placeholder:
			'Укажите, осуществляется ли передача данных за пределы РФ. При наличии — страны, получателей, цели и категории данных. Учитывайте всех подключённых поставщиков.'
	},
	additionalTerms: {
		label: 'Дополнительные условия компании',
		placeholder:
			'При необходимости укажите условия отдельных услуг, обучения, работы с несовершеннолетними или других особенностей обработки.'
	}
} as const;

export type PrivacyField = keyof typeof privacyFields;

export function privacyValue(data: Record<string, unknown>, key: PrivacyField): string {
	return typeof data[key] === 'string' ? data[key].trim() : '';
}

export const operatorFields: PrivacyField[] = [
	'operatorName',
	'inn',
	'registrationNumber',
	'address',
	'email',
	'domains'
];

export const privacySections = [
	{ id: 'operator', title: 'Оператор и область действия' },
	{ id: 'processing', title: 'Какие данные и для чего нужны' },
	{ id: 'sharing', title: 'Кому доступны данные' },
	{ id: 'cookies', title: 'Cookie и аналитика' },
	{ id: 'retention', title: 'Хранение и удаление' },
	{ id: 'security', title: 'Защита данных' },
	{ id: 'rights', title: 'Ваши права и обращения' },
	{ id: 'changes', title: 'Согласия и изменения политики' }
] as const;
