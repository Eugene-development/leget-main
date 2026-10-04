export type EstimateInputs = {
	run_cm: number;
	layout: 'straight' | 'l' | 'u' | 'island';
	material: string;
	equipment: number;
};
export type EstimateResult = {
	inputs: EstimateInputs;
	min: number;
	max: number;
	currency: 'RUB';
	material_label: string;
	version: string;
	note: string;
};
export type EstimateSettings = {
	available: boolean;
	version?: string;
	materials?: { key: string; label: string }[];
	note?: string;
};
export const layouts = [
	{ key: 'straight', label: 'Прямая' },
	{ key: 'l', label: 'Угловая' },
	{ key: 'u', label: 'П-образная' },
	{ key: 'island', label: 'С островом' }
] as const;
export const rubles = (amount: number) =>
	new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: 'RUB',
		maximumFractionDigits: 0
	}).format(amount);
