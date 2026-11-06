export const defaultFacades = [
	{
		id: 'enamel',
		title: 'Эмаль (Крашеный МДФ)',
		description:
			'Гладкие матовые или глянцевые поверхности любого оттенка. Эмаль наносится в несколько слоев, что создает идеальное покрытие без швов по кромке. Идеально для современных, минималистичных и неоклассических интерьеров.',
		image: 'https://storage.yandexcloud.net/zovtop/foto/facade-enamel-dark-green-20261106.webp',
		details: {
			base: 'Плита МДФ',
			coating: 'Многослойная эмаль (матовая / глянцевая)',
			thickness: '19 мм',
			minSize: '100 × 100 мм',
			maxSize: '2750 × 1100 мм'
		}
	},
	{
		id: 'wood',
		title: 'Массив дерева',
		description:
			'Классика, которая никогда не выходит из моды. Натуральная текстура дуба или ясеня привносит в дом тепло и уют. Фасады из массива поддаются реставрации и с годами становятся только благороднее.',
		image: 'https://storage.yandexcloud.net/zovtop/foto/facade-wood-20261106.webp',
		details: {
			base: 'Массив ясеня / дуба',
			coating: 'Эмаль, масловоск, воскобейц, патина',
			thickness: '21 мм',
			minSize: '140 × 140 мм',
			maxSize: '2400 × 900 мм'
		}
	},
	{
		id: 'hpl',
		title: 'Пластики',
		description:
			'Максимально устойчивые к царапинам, ударам и температурам материал. Пластики идеально имитируют текстуры бетона, камня или дерева, сохраняя при этом индустриальную строгость и премиальный вид.',
		image: 'https://storage.yandexcloud.net/zovtop/foto/facade-hpl-20261106.webp',
		details: {
			base: 'Плита МДФ',
			coating: 'Декоративный пластик',
			thickness: '18 мм / 21 мм',
			minSize: '100 × 100 мм',
			maxSize: '2800 × 1300 мм'
		}
	},
	{
		id: 'shpon',
		title: 'Шпон натуральный',
		description:
			'Фасады из натурального шпона дуба или ясеня — это классика, которая никогда не выходит из моды. Натуральная текстура дерева привносит в дом тепло и уют.',
		image: 'https://storage.yandexcloud.net/zovtop/stiles/shponjdfnvkjsvnkjsf.jpg',
		details: {
			base: 'Плита МДФ',
			coating: 'Шпон дуба или ясеня',
			thickness: '18 мм / 21 мм',
			minSize: '100 × 100 мм',
			maxSize: '2800 × 1300 мм'
		}
	},
	{
		id: 'acrylic',
		title: 'Акрил',
		description:
			'Идеально ровная, зеркальная глянцевая или бархатистая матовая поверхность. Фасады из акрила обладают высокой ударопрочностью, не выцветают на солнце и придают интерьеру премиальный блеск.',
		image: 'https://storage.yandexcloud.net/zovtop/foto/facade-acrylic-20261106.webp',
		details: {
			base: 'Плита МДФ',
			coating: 'Акриловый пластик',
			thickness: '19 мм',
			minSize: '100 × 100 мм',
			maxSize: '2800 × 1300 мм'
		}
	},
	{
		id: 'ldsp',
		title: 'ЛДСП',
		description:
			'Ламинированная древесно-стружечная плита для фасадов и каркасов. Однотонные и древесные декоры позволяют выдержать мебель в единой гамме. Кромка ПВХ подобрана в цвет; допустимые размеры зависят от направления текстуры.',
		image: 'https://storage.yandexcloud.net/zovtop/foto/facade-ldsp-20261106.webp',
		details: {
			base: 'Плита ДСП',
			coating: 'Ламинированная поверхность, кромка ПВХ в цвет',
			thickness: '18 мм',
			minSize: 'Уточняется по проекту',
			maxSize: '2790 × 2060 мм; направление текстуры учитывается'
		}
	},
	{
		id: 'lmdf',
		title: 'ЛМДФ',
		description:
			'Ламинированные фасады на основе МДФ. В серии PRIME декоративная PET-плёнка дополнена кромкой ABS в цвет, а обратная сторона соответствует лицевой. Представленный образец — «Кофейный крем»; характеристики указаны для PRIME.',
		image: 'https://storage.yandexcloud.net/zovtop/foto/facade-lmdf-20261106.webp',
		details: {
			base: 'Плита МДФ, серия PRIME',
			coating: 'Декоративная PET-плёнка, кромка ABS в цвет',
			thickness: '18 мм',
			minSize: 'Уточняется по проекту',
			maxSize: '2780 × 1200 мм (PRIME)'
		}
	},
	{
		id: 'glass-aluminium',
		title: 'Стекло в алюминии',
		description:
			'Стеклянный фасад в алюминиевой рамке LINE. У профиля T001 видимая ширина рамки составляет 8 мм — тонкий контур подчёркивает стекло. Представлен чёрный матовый профиль; размеры и толщина указаны для T001.',
		image: 'https://storage.yandexcloud.net/zovtop/foto/facade-glass-aluminium-20261106.webp',
		details: {
			base: 'Алюминиевый профиль LINE T001 со стеклом',
			coating: 'Чёрный матовый профиль; стеклянное заполнение',
			thickness: '20 мм (профиль T001)',
			minSize: 'Уточняется по проекту',
			maxSize: '2500 × 600 мм (T001)'
		}
	}
];

export type Facade = (typeof defaultFacades)[number];
export const detailLabels = {
	base: 'Материал основы',
	coating: 'Покрытие',
	thickness: 'Толщина',
	minSize: 'Минимальный размер',
	maxSize: 'Максимальный размер'
} as const;
export function resolveFacades(data: Record<string, unknown>): Facade[] {
	const items =
		Array.isArray(data?.facades) && data.facades.length
			? (data.facades as Facade[])
			: defaultFacades;
	// Старый полный стартовый набор расширяется без потери пользовательских правок.
	const originalIds = ['enamel', 'wood', 'hpl', 'shpon', 'acrylic'];
	const isOriginalCatalog =
		items.length === originalIds.length &&
		originalIds.every((id) => items.some((item) => item.id === id));
	const expanded = isOriginalCatalog
		? [...items, ...defaultFacades.filter((item) => !originalIds.includes(item.id))]
		: items;
	return expanded.map((item) => ({
		...item,
		image:
			item.id === 'enamel' &&
			item.image === 'https://storage.yandexcloud.net/zovtop/foto/kv-1_fonjfgnbisfn.webp'
				? defaultFacades[0].image
				: (item.image ?? defaultFacades.find((d) => d.id === item.id)?.image ?? ''),
		details: { ...defaultFacades.find((d) => d.id === item.id)?.details, ...item.details }
	}));
}
