export type MebelBenefitItem = {
	title: string;
	desc: string;
	icon: string;
};

export const MEBEL_BENEFITS_DEFAULT_TITLE = 'Почему выбирают нас';

/**
 * Значения — ровно те, что стояли в v1 до вынесения версий 12.08.2026:
 * файл разделяет контракт между версиями, а не меняет демо-контент.
 */
export const MEBEL_BENEFITS_DEFAULT_ITEMS: readonly MebelBenefitItem[] = [
	{
		title: 'Гарантия качества',
		desc: 'Используются только сертифицированные материалы от надёжных производителей',
		icon: 'shield'
	},
	{
		title: 'Точные сроки',
		desc: 'Соблюдаем оговорённые сроки изготовления, доставки и сборки мебели',
		icon: 'clock'
	},
	{
		title: 'Индивидуальный дизайн',
		desc: 'Разрабатываем проект под ваши размеры и пожелания и с учётом нашего опыта',
		icon: 'design'
	}
];

function isBenefitItem(value: unknown): value is Partial<MebelBenefitItem> {
	return typeof value === 'object' && value !== null;
}

/**
 * Один контракт пунктов для всех версий MebelBenefits. Сохранённые значения
 * тенанта важнее дефолтов, поэтому пустой/битый элемент добирается из дефолта
 * по индексу, а не выбрасывается: переименование или потеря ключа молча
 * обнуляет поле у всех, кто уже сохранил данные.
 */
export function resolveMebelBenefits(raw: unknown): MebelBenefitItem[] {
	if (!Array.isArray(raw) || raw.length === 0) {
		return MEBEL_BENEFITS_DEFAULT_ITEMS.map((item) => ({ ...item }));
	}

	return raw.map((entry, index) => {
		const fallback = MEBEL_BENEFITS_DEFAULT_ITEMS[index] ?? MEBEL_BENEFITS_DEFAULT_ITEMS[0];
		if (!isBenefitItem(entry)) return { ...fallback };
		return {
			title: typeof entry.title === 'string' && entry.title ? entry.title : fallback.title,
			desc: typeof entry.desc === 'string' ? entry.desc : fallback.desc,
			icon: typeof entry.icon === 'string' && entry.icon ? entry.icon : fallback.icon
		};
	});
}
