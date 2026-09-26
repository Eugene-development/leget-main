export interface ProjectCaption {
	text: string;
	position: 'left' | 'center' | 'right';
	font_size: number;
	opacity: number;
	color: string;
	padding: number;
	bold: boolean;
}

export function emptyCaption(): ProjectCaption {
	return {
		text: '',
		position: 'right',
		font_size: 32,
		opacity: 80,
		color: '#ffffff',
		padding: 24,
		bold: false
	};
}

export function captionInput(enabled: boolean, caption: ProjectCaption) {
	return enabled
		? { image_caption: { ...caption, text: caption.text.trim().replace(/\s+/gu, ' ') } }
		: {};
}

export function validateCaption(enabled: boolean, caption: ProjectCaption): Record<string, string> {
	if (!enabled) return {};
	if (!caption.text.trim() || Array.from(caption.text.trim()).length > 120)
		return { image_caption: 'Введите подпись длиной от 1 до 120 символов.' };
	if (
		!['left', 'center', 'right'].includes(caption.position) ||
		!/^#[0-9a-f]{6}$/i.test(caption.color) ||
		!Number.isInteger(caption.font_size) ||
		caption.font_size < 12 ||
		caption.font_size > 160 ||
		!Number.isInteger(caption.opacity) ||
		caption.opacity < 0 ||
		caption.opacity > 100 ||
		!Number.isInteger(caption.padding) ||
		caption.padding < 0 ||
		caption.padding > 100
	)
		return { image_caption: 'Проверьте размер, цвет, непрозрачность и отступ подписи.' };
	return {};
}
