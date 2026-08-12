export type IncentiveGalleryItem = {
	src: string;
	alt: string;
	label: string;
};

export const INCENTIVES_DEFAULT_TITLE = 'С нами выгодно';

export const INCENTIVES_DEFAULT_TEXT =
	'<p>Помогаем выбрать фурнитуру, материалы, цветовые сочетания и производителя мебели — чтобы вы получили честную цену, соблюдение сроков, высокое качество и внимательный сервис без лишних затрат времени и бюджета.</p>';

export const INCENTIVES_DEFAULT_GALLERY: readonly IncentiveGalleryItem[] = [
	{
		src: 'https://storage.yandexcloud.net/leget-main/templates/promo-1/incentives/price.webp',
		alt: 'Образцы материалов и расчёт стоимости мебели',
		label: 'Цена'
	},
	{
		src: 'https://storage.yandexcloud.net/leget-main/templates/promo-1/incentives/timelines.webp',
		alt: 'Монтаж мебели точно в срок',
		label: 'Сроки'
	},
	{
		src: 'https://storage.yandexcloud.net/leget-main/templates/promo-1/incentives/quality-v2.webp',
		alt: 'Ровные фасады и точная подгонка деталей мебели',
		label: 'Качество'
	},
	{
		src: 'https://storage.yandexcloud.net/leget-main/templates/promo-1/incentives/service.webp',
		alt: 'Консультация дизайнера с клиентом',
		label: 'Сервис'
	}
];

function isGalleryItem(value: unknown): value is Partial<IncentiveGalleryItem> {
	return typeof value === 'object' && value !== null;
}

/**
 * Один контракт галереи для всех версий Incentives. Сохранённые значения тенанта
 * имеют приоритет, а отсутствующие поля и пустые URL дополняются стартовыми данными.
 */
export function resolveIncentivesGallery(value: unknown): IncentiveGalleryItem[] {
	const saved = Array.isArray(value) ? value : [];

	return INCENTIVES_DEFAULT_GALLERY.map((fallback, index) => {
		const item = saved[index];
		if (!isGalleryItem(item)) return { ...fallback };

		return {
			src: typeof item.src === 'string' && item.src.trim() ? item.src : fallback.src,
			alt: typeof item.alt === 'string' && item.alt.trim() ? item.alt : fallback.alt,
			label: typeof item.label === 'string' ? item.label : fallback.label
		};
	});
}
