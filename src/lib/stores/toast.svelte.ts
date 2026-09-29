let current = $state<{ message: string; kind: 'success' | 'info' } | null>(null);

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
	clear() {
		current = null;
	}
};
