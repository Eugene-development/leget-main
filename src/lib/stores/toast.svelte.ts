let current = $state<{ message: string } | null>(null);

export const toast = {
	get current() {
		return current;
	},
	success(message: string) {
		current = { message };
	},
	clear() {
		current = null;
	}
};
