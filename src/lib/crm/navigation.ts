import { createContext } from 'svelte';

export const crmSections = [
	['incoming', 'Входящие'],
	['deals', 'Сделки'],
	['clients', 'Клиенты'],
	['companies', 'Компании'],
	['tasks', 'Задачи'],
	['insights', 'Результаты сайта'],
	['promotions', 'Акции'],
	['automation', 'Правила CRM'],
	['orders', 'Кабинет заказчика'],
	['calculator', 'Калькулятор'],
	['launch', 'Запуск сайта'],
	['members', 'Сотрудники'],
	['settings', 'Настройки']
] as const;

export type CrmSite = { id: string; name: string; domain: string; manage: boolean };
export type CrmCounts = { incoming?: number; overdue?: number };

export function crmSiteId(
	sites: CrmSite[],
	currentSite: string | undefined,
	requestedSite: string | null
): string {
	return requestedSite || sites.find((site) => site.id === currentSite)?.id || sites[0]?.id || '';
}

export const [getCrmCountsUpdater, setCrmCountsUpdater] =
	createContext<(site: string, counts: CrmCounts) => void>();
