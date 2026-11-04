/** Laravel converts empty JSON text fields to null on save. Render them as empty text. */
export function actionText(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

export function normalizeActionCard<
	T extends {
		title?: unknown;
		description?: unknown;
		badge?: unknown;
		icon?: unknown;
	}
>(card: T): T & { title: string; description: string; badge: string; icon: string } {
	return {
		...card,
		title: actionText(card.title),
		description: actionText(card.description),
		badge: actionText(card.badge),
		icon: actionText(card.icon)
	};
}
