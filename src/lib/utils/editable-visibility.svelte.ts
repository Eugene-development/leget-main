/**
 * Видимость редактируемых частей компонента.
 *
 * Храним именно скрытые ключи: новая часть, добавленная в компонент позже,
 * автоматически будет видна существующим сайтам. Состояние живёт в том же
 * JSON `data`, что и контент, поэтому отдельная миграция не нужна.
 */
import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

export const HIDDEN_EDITABLE_FIELDS_KEY = 'hiddenFields';
export const EDITABLE_VISIBILITY_CONTEXT = Symbol('editable-visibility');

function readHidden(data: Record<string, unknown> | undefined): string[] {
	const raw = data?.[HIDDEN_EDITABLE_FIELDS_KEY];
	return Array.isArray(raw)
		? raw.filter((value): value is string => typeof value === 'string')
		: [];
}

export interface EditableVisibility {
	readonly hidden: string[];
	isVisible(key: string): boolean;
	isPending(key: string): boolean;
	toggle(key: string, event?: Event): Promise<void>;
}

/**
 * Вызывать при инициализации компонента: внутри используются Svelte runes.
 */
export function createEditableVisibility(options: {
	getComponentType: () => string;
	getData: () => Record<string, unknown>;
	setData: (next: Record<string, unknown>) => void;
	getEditContext: () => EditContext | null;
	save?: (
		context: EditContext,
		componentType: string,
		next: Record<string, unknown>
	) => Promise<unknown>;
}): EditableVisibility {
	let hidden = $state<string[]>(readHidden(options.getData()));
	let pending = $state<string[]>([]);

	$effect(() => {
		const next = readHidden(options.getData());
		if ([...next].sort().join('\u0001') !== [...hidden].sort().join('\u0001')) {
			hidden = next;
		}
	});

	return {
		get hidden() {
			return hidden;
		},
		isVisible: (key) => !hidden.includes(key),
		// Сохраняется весь data-blob, поэтому изменения видимости сериализуем:
		// более ранний медленный запрос не должен затереть более новый список.
		isPending: () => pending.length > 0,
		async toggle(key, event) {
			event?.preventDefault();
			event?.stopPropagation();
			if (pending.length > 0) return;

			const wasVisible = !hidden.includes(key);
			hidden = wasVisible ? [...hidden, key] : hidden.filter((item) => item !== key);
			pending = [...pending, key];

			const updated = { ...options.getData(), [HIDDEN_EDITABLE_FIELDS_KEY]: hidden };
			options.setData(updated);

			const editContext = options.getEditContext();
			if (!editContext) {
				pending = pending.filter((item) => item !== key);
				return;
			}

			try {
				const componentType = options.getComponentType();
				await (options.save ?? saveComponentData)(editContext, componentType, updated);
			} catch (error) {
				// Откатываем только этот ключ: параллельное успешное изменение другого
				// поля не должно потеряться из-за одного неудачного запроса.
				hidden = wasVisible
					? hidden.filter((item) => item !== key)
					: hidden.includes(key)
						? hidden
						: [...hidden, key];
				options.setData({ ...options.getData(), [HIDDEN_EDITABLE_FIELDS_KEY]: hidden });
				console.error(
					`Не удалось сохранить видимость поля ${options.getComponentType()}.${key}:`,
					error
				);
				alert(error instanceof Error ? error.message : 'Не удалось сохранить видимость блока');
			} finally {
				pending = pending.filter((item) => item !== key);
			}
		}
	};
}
