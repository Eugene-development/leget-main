/**
 * Глобальный store для inline-редактирования полей страницы.
 *
 * Один экземпляр на всё приложение. EditableField регистрирует поле,
 * EditModal читает и обновляет draft, при сохранении вызывает onSave.
 */

export interface EditField {
	/** Уникальный ключ поля (например "Hero.title") */
	key: string;
	/** Тип содержимого для значка в окне редактирования. */
	kind?: 'text' | 'image';
	/** Человекочитаемое название поля */
	label: string;
	/** Текущее сохранённое значение */
	value: string;
	/** Черновик (live preview) */
	draft: string;
	/** Многострочное поле */
	multiline: boolean;
	richText?: boolean;
	legacyHtml?: boolean;
	/** Callback сохранения */
	onSave: (value: string) => Promise<void>;
}

function createEditStore() {
	let activeField = $state<EditField | null>(null);
	let isSaving = $state(false);
	let saveError = $state('');

	return {
		get activeField() {
			return activeField;
		},
		get isSaving() {
			return isSaving;
		},
		get saveError() {
			return saveError;
		},

		/** Открыть модалку для редактирования поля */
		open(field: Omit<EditField, 'draft'>) {
			if (isSaving) return;
			activeField = { ...field, draft: field.value };
			isSaving = false;
			saveError = '';
		},

		/** Обновить черновик (live preview) */
		setDraft(value: string) {
			if (activeField && !isSaving) {
				activeField.draft = value;
			}
		},

		/** Закрыть без сохранения */
		close() {
			if (isSaving) return;
			activeField = null;
			saveError = '';
		},

		/** Сохранить и закрыть */
		async save() {
			if (!activeField || isSaving) return;
			if (activeField.draft === activeField.value) {
				activeField = null;
				return;
			}
			isSaving = true;
			saveError = '';
			try {
				await activeField.onSave(activeField.draft);
				activeField = null;
			} catch (err) {
				saveError = err instanceof Error ? err.message : 'Ошибка сохранения';
			} finally {
				isSaving = false;
			}
		}
	};
}

export const editStore = createEditStore();
