/** Проверяем адрес, сохраняя подписанные URL без перезаписи query-параметров. */
export function validateImageUrl(value: string): { url: string; error: string } {
	const url = value.trim();
	if (!url) return { url: '', error: 'Вставьте ссылку на изображение.' };
	try {
		const parsed = new URL(url);
		if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) {
			throw new Error('Unsupported image URL');
		}
		return { url, error: '' };
	} catch {
		return {
			url: '',
			error: 'Укажите полную ссылку на изображение, начиная с https:// или http://.'
		};
	}
}
