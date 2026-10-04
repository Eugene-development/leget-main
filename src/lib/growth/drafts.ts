import { get, writable } from 'svelte/store';
import { getAuthToken } from '$lib/utils/auth-session';
import { getGraphQLUrl } from '$lib/utils/config';
import type { EditContext } from '$lib/utils/page-edit';

export interface PageDraft {
	id: string;
	slug: string;
	version: number;
	updatedAt: string;
	previewToken?: string;
	previewExpiresAt?: string;
}
export interface PageRevision {
	id: string;
	action: 'baseline' | 'publish' | 'restore';
	content_hash: string;
	created_at: string;
}
export interface PublicationState {
	draft: PageDraft | null;
	liveHash: string;
	revisions: PageRevision[];
}
export const draftSession = writable<{ licenseId: string; draft: PageDraft } | null>(null);
export const draftSaving = writable(false);
let pending: Promise<unknown> = Promise.resolve();

export function isDraftUrl(): boolean {
	return typeof window !== 'undefined' && new URL(window.location.href).searchParams.has('draft');
}
export function isSharedPreview(): boolean {
	return (
		typeof window !== 'undefined' &&
		new URL(window.location.href).searchParams.get('preview') === '1'
	);
}

/** Fail closed in draft URLs until the owner has loaded the current draft. */
export function usesDraft(context: EditContext): boolean {
	if (!isDraftUrl()) return false;
	const session = get(draftSession);
	if (!session || session.licenseId !== context.licenseId) {
		throw new Error('Черновик ещё загружается. Повторите сохранение через несколько секунд.');
	}
	if (
		context.slug != null &&
		context.slug !== '__global__' &&
		context.slug !== session.draft.slug
	) {
		throw new Error('Черновик относится к другой странице.');
	}
	return true;
}

export async function publicationRequest<T>(
	context: EditContext,
	path = '',
	data?: Record<string, unknown>
): Promise<T> {
	const token = getAuthToken();
	if (!token) throw new Error('Войдите в аккаунт владельца сайта.');
	const base = getGraphQLUrl().replace(/\/graphql\/?$/, '');
	const response = await fetch(
		`${base}/growth/sites/${encodeURIComponent(context.licenseId)}/publication${path}`,
		{
			method: data ? 'POST' : 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: data ? JSON.stringify(data) : undefined,
			cache: 'no-store'
		}
	);
	const result = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(
			response.status === 409
				? 'Страница или черновик изменились в другой вкладке. Обновите страницу перед продолжением.'
				: result.message || 'Не удалось выполнить действие. Повторите попытку.'
		);
	}
	return result as T;
}

export async function readPublication(context: EditContext): Promise<PublicationState> {
	return publicationRequest(context, `?slug=${encodeURIComponent(context.slug ?? '')}`);
}

/** Serialize saves from every inline control against one optimistic draft version. */
export function saveDraftOperation<T extends PageDraft>(
	context: EditContext,
	operation: Record<string, unknown>
): Promise<T> {
	const task = pending
		.catch(() => undefined)
		.then(async () => {
			usesDraft(context);
			const session = get(draftSession)!;
			draftSaving.set(true);
			try {
				const result = await publicationRequest<T>(context, `/drafts/${session.draft.id}`, {
					...operation,
					version: session.draft.version
				});
				if (get(draftSession)?.draft.id === session.draft.id) {
					draftSession.set({
						licenseId: session.licenseId,
						draft: { ...session.draft, ...result }
					});
				}
				return result;
			} finally {
				draftSaving.set(false);
			}
		});
	pending = task;
	return task;
}

export async function waitForDraftSaves(): Promise<void> {
	await pending;
}

export function publishedUrl(): URL {
	const url = new URL(window.location.href);
	url.searchParams.delete('draft');
	url.searchParams.delete('preview');
	return url;
}
