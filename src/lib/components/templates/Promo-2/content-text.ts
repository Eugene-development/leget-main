export type TextPath = readonly (string | number)[];

function validate(path: TextPath) {
	if (
		!path.length ||
		path.some((key) =>
			typeof key === 'number'
				? !Number.isSafeInteger(key) || key < 0
				: !key || ['__proto__', 'constructor', 'prototype'].includes(key)
		)
	)
		throw new Error('Некорректный путь текстового поля');
}

export function readTextPath(data: Record<string, unknown>, path: TextPath): unknown {
	validate(path);
	return path.reduce<unknown>(
		(value, key) =>
			value !== null && typeof value === 'object' && Object.hasOwn(value, key)
				? (value as Record<string | number, unknown>)[key]
				: undefined,
		data
	);
}

/** Copy only the edited branch; resolved defaults retain neighbouring cards and media. */
export function updateTextPath(
	data: Record<string, unknown>,
	path: TextPath,
	value: string,
	defaults: Record<string, unknown> = {}
): Record<string, unknown> {
	validate(path);
	function update(current: unknown, depth: number): unknown {
		if (depth === path.length) return value;
		const key = path[depth];
		const copy: Record<string | number, unknown> | unknown[] = Array.isArray(current)
			? [...current]
			: current && typeof current === 'object'
				? { ...current }
				: typeof key === 'number'
					? []
					: {};
		const source =
			depth === 0 && Object.hasOwn(defaults, key)
				? defaults[key as string]
				: (copy as Record<string | number, unknown>)[key];
		(copy as Record<string | number, unknown>)[key] = update(source, depth + 1);
		return copy;
	}
	return update(data, 0) as Record<string, unknown>;
}
