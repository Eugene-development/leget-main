export async function writeToClipboard(text: string, container = document.body): Promise<boolean> {
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch {
		// A browser can expose the API without granting clipboard access.
	}

	const previousFocus = document.activeElement;
	const field = document.createElement('textarea');
	field.value = text;
	field.readOnly = true;
	field.tabIndex = -1;
	field.style.position = 'fixed';
	field.style.opacity = '0';
	try {
		container.appendChild(field);
		field.select();
		return document.execCommand('copy');
	} catch {
		return false;
	} finally {
		field.remove();
		if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
	}
}
