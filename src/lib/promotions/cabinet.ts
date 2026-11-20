export type Promotion = {
	id: string;
	slug: string;
	placement: string;
	title: string;
	endsAt: string | null;
	status: 'active' | 'expired' | 'hidden' | 'removed';
	enabled: boolean;
	requiresDeadline: boolean;
	parentHidden: boolean;
	version: string;
};

export type PromotionRevision = {
	id: string;
	date: string;
	author: string | null;
	present: boolean;
	endsAt: string | null;
	enabled: boolean;
};

export const promotionStatus = {
	active: 'Действует',
	expired: 'Завершена',
	hidden: 'Скрыта',
	removed: 'Удалена'
} satisfies Record<Promotion['status'], string>;
