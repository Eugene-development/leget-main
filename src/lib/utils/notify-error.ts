import { toast } from '$lib/stores/toast.svelte';
import { isCancelled, userErrorMessage } from './user-error.js';

export function notifyError(error: unknown, action?: string): string {
	if (isCancelled(error)) return '';
	const message = userErrorMessage(error, action);
	if (typeof window !== 'undefined') toast.error(message);
	return message;
}
