export type CompanyListing = {
	path: string;
	name: string;
	typeLabel: string;
	description: string;
	city?: string | null;
	logoUrl?: string | null;
};

export type CompanyContacts = {
	address?: string | null;
	phone?: string | null;
	email?: string | null;
	website?: string | null;
};

export type CompanyDetail = CompanyListing & CompanyContacts;

export type CompanyCard = CompanyContacts & {
	id: string;
	type: 'manufacturer' | 'supplier';
	typeLabel: string;
	published: boolean;
	logoUrl?: string | null;
	name?: string | null;
	description?: string | null;
	city?: string | null;
};

export type CompanyDirectory = { items: CompanyListing[]; page: number; lastPage: number };
export type PartnerApplication = Record<string, string | null>;
