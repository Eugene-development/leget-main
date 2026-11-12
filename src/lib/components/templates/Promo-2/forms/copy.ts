import { editableText } from '$lib/utils/editable-text';
import { formDefinitions } from './request';

export const requestCopyFields = [
	...Object.entries(formDefinitions).flatMap(([kind, definition]) => [
		{ key: `title.${kind}`, label: `${definition.title}: заголовок`, fallback: definition.title },
		{
			key: `description.${kind}`,
			label: `${definition.title}: описание`,
			fallback: definition.description
		}
	]),
	...Object.entries({
		thanks: 'Спасибо за обращение',
		successTitle: 'Заявка принята',
		successDescription: 'Мы свяжемся с вами по указанным контактам.',
		successNotice: 'Ваше обращение сохранено.',
		closeText: 'Вернуться на сайт',
		nameLabel: 'Ваше имя',
		phoneLabel: 'Телефон',
		emailLabel: 'Электронная почта',
		cityLabel: 'Город',
		showroomLabel: 'Предпочтительный салон',
		addressLabel: 'Адрес выезда',
		timeLabel: 'Удобное время',
		partnerLabel: 'Формат работы',
		studioLabel: 'Студия',
		freelancerLabel: 'Частный дизайнер',
		resumeLabel: 'Опыт и ссылка на резюме',
		estimateLabel: 'Размеры и пожелания к мебели',
		messageLabel: 'Ваши пожелания',
		consentText: 'Согласен на обработку персональных данных.',
		privacyText: 'Политика конфиденциальности',
		sendingText: 'Отправляем…',
		submitText: 'Отправить заявку',
		phonePlaceholder: '+7 (999) 123-45-67',
		showroomPlaceholder: 'Адрес или название, если знаете',
		timePlaceholder: 'Например, в субботу после 12:00'
	}).map(([key, fallback]) => ({ key, label: fallback, fallback }))
];

/** Modal copy belongs to the site's header data, alongside its shared form triggers. */
export function requestText(data: Record<string, unknown>, key: string, fallback: string): string {
	const copy = data.requestCopy;
	return editableText(
		copy && typeof copy === 'object' ? (copy as Record<string, unknown>)[key] : undefined,
		fallback
	);
}
