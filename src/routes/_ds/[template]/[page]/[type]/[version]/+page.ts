import { error } from '@sveltejs/kit';
import {
	catalogEntries,
	decodePage,
	demoData,
	resolveComponent,
	versionCount
} from '$lib/ds/registry';
import type { EntryGenerator, PageLoad } from './$types';

/**
 * Перечисление адресов для пререндера.
 *
 * Без него SvelteKit подставлять значения в [template]/[page]/[type]/[version] не умеет.
 * Полагаться на обход ссылок с индекса можно, но хрупко: стоит кому-то отфильтровать
 * список на индексе — и часть карточек тихо перестанет собираться.
 */
export const entries: EntryGenerator = () =>
	catalogEntries().map((e) => ({
		template: String(e.templateId),
		page: e.page,
		type: e.type,
		version: `v${e.version}`
	}));

export const load: PageLoad = ({ params }) => {
	const templateId = Number(params.template);
	const pageSlug = decodePage(params.page);
	const match = /^v(\d+)$/.exec(params.version);
	const version = match ? Number(match[1]) : NaN;

	if (
		!Number.isInteger(templateId) ||
		resolveComponent(templateId, pageSlug, params.type) === null
	) {
		error(404, `Блок ${params.template}${pageSlug}:${params.type} в каталоге не найден`);
	}

	if (
		!Number.isInteger(version) ||
		version < 1 ||
		version > versionCount(templateId, params.type)
	) {
		error(404, `У блока ${params.type} нет версии ${params.version}`);
	}

	return {
		templateId,
		pageSlug,
		type: params.type,
		version,
		data: demoData(templateId, pageSlug, params.type, version)
	};
};
