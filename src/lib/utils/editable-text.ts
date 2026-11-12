/**
 * Defaults apply only to fields that have never been set. Laravel's request
 * middleware can store a cleared string as null, so both null and '' mean
 * intentionally empty content.
 */
export function editableText(value: unknown, fallback = ''): string {
	return value === undefined ? fallback : String(value ?? '');
}
