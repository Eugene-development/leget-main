/**
 * Вспомогательные функции для форматирования номера телефона (+7 (XXX) XXX-XX-XX)
 */

export function formatPhone(value: string): string {
	const numbers = value.replace(/\D/g, '');
	if (!numbers) return '';

	let formatted = '';
	
	// Если первая цифра 7 или 8, отсекаем ее для форматирования части с кодом города
	let startIdx = 0;
	if (numbers[0] === '7' || numbers[0] === '8') {
		startIdx = 1;
	}

	const digits = numbers.substring(startIdx);

	formatted = '+7 ';
	if (digits.length > 0) {
		formatted += '(' + digits.substring(0, 3);
	}
	if (digits.length > 3) {
		formatted += ') ' + digits.substring(3, 6);
	}
	if (digits.length > 6) {
		formatted += '-' + digits.substring(6, 8);
	}
	if (digits.length > 8) {
		formatted += '-' + digits.substring(8, 10);
	}

	return formatted;
}

export function cleanPhone(value: string): string {
	return '+' + value.replace(/\D/g, '');
}

export function isValidPhone(value: string): boolean {
	const cleaned = value.replace(/\D/g, '');
	// Russian number is 11 digits (7 + 10 digits)
	return cleaned.length === 11;
}
