/**
 * Formats a number as a currency string (RUB).
 */
export function formatPrice(price: number | null | undefined): string {
	if (!price && price !== 0) return 'По запросу';
	return new Intl.NumberFormat('ru-RU').format(price);
}
