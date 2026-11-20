export type PromotionCard = {
	id: number | string;
	category: string;
	title: string;
	tag?: string;
	tagColor?: string;
	discount?: string;
	description?: string;
	oldPrice?: string | null;
	newPrice?: string;
	image?: string | null;
	until?: string;
	expiresAt?: string | null;
	enabled?: boolean;
};

export type PromotionCardFields = Pick<PromotionCard, 'title' | 'category' | 'expiresAt'>;

export {
	formatPromotionDeadline,
	parsePromotionTime,
	promotionDeadline,
	promotionTimeInput
} from '../../../../../promotions/time';

export function removePromotion(
	data: Record<string, unknown>,
	cards: PromotionCard[],
	index: number
): Record<string, unknown> {
	const updated = { ...data, cards: cards.filter((_, i) => i !== index) };
	if (!Array.isArray(data.hiddenFields)) return updated;

	// Inline field visibility uses positional keys, so it must follow the remaining cards.
	const hiddenFields = data.hiddenFields.flatMap((key: unknown) => {
		const path = typeof key === 'string' && /^cards\.(\d+)(\..+)$/.exec(key);
		if (!path || Number(path[1]) < index) return [key];
		if (Number(path[1]) === index) return [];
		return [`cards.${Number(path[1]) - 1}${path[2]}`];
	});
	return { ...updated, hiddenFields };
}
