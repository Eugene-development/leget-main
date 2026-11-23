import { untrack } from 'svelte';

let current = $state<{ message: string; kind: 'success' | 'info' | 'error' } | null>(null);

export const toast = {
	get current() {
		return current;
	},
	success(message: string) {
		current = { message, kind: 'success' };
	},
	info(message: string) {
		current = { message, kind: 'info' };
	},
	error(message: string) {
		const previous = untrack(() => current);
		if (previous?.kind === 'error' && previous.message === message) return;
		current = { message, kind: 'error' };
	},
	clear() {
		current = null;
	}
};
