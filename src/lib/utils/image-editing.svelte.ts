import { getContext, setContext } from 'svelte';
import { editStore } from '$lib/stores/edit.svelte';
import {
	imagePathKey,
	setComponentImage,
	valueAtPath,
	type ImagePathPart
} from './component-images';
import { validateImageUrl } from './image-url';
import { saveComponentData, type EditContext } from './page-edit';

const IMAGE_EDITING = Symbol('image-editing');
export interface ImageRegistration {
	path: ImagePathPart[];
	value: string;
	label: string;
	defaults: Record<string, unknown>;
}
export interface ImageEditing {
	readonly editable: boolean;
	readonly componentType: string;
	readonly fields: ImageRegistration[];
	key(path: ImagePathPart[]): string;
	read(path: ImagePathPart[], fallback: string): string;
	register(id: symbol, field: ImageRegistration): () => void;
	prepare(defaults?: Record<string, unknown>): Record<string, unknown>;
	open(field: ImageRegistration): void;
}

export function provideImageEditing(options: {
	getData: () => Record<string, unknown>;
	setData: (data: Record<string, unknown>) => void;
	getContext: () => EditContext | null;
	isEditable: () => boolean;
	getType: () => string;
	save?: (context: EditContext, type: string, data: Record<string, unknown>) => Promise<unknown>;
}): ImageEditing {
	let registrations = $state.raw(new Map<symbol, ImageRegistration>());
	const editor: ImageEditing = {
		get componentType() {
			return options.getType();
		},
		get editable() {
			return options.isEditable() && !!options.getContext();
		},
		get fields() {
			return [...registrations.values()];
		},
		key: (path) =>
			`image:${options.getContext()?.pageId}:${options.getType()}:${imagePathKey(path)}`,
		read(path, fallback) {
			const value = valueAtPath(options.getData(), path);
			return typeof value === 'string' ? value : fallback;
		},
		register(id, field) {
			registrations = new Map(registrations).set(id, field);
			return () => {
				const next = new Map(registrations);
				next.delete(id);
				registrations = next;
			};
		},
		prepare(defaults = {}) {
			const data = { ...options.getData() };
			for (const [key, value] of Object.entries(defaults)) {
				if (data[key] == null || (Array.isArray(data[key]) && data[key].length === 0))
					data[key] = value;
			}
			return data;
		},
		open(field) {
			if (!editor.editable) return;
			// Фиксируем путь выбранного кадра: автослайдер не должен сменить цель сохранения.
			const path = [...field.path];
			editStore.open({
				key: editor.key(path),
				kind: 'image',
				label: field.label,
				value: field.value,
				multiline: false,
				async onSave(value) {
					const context = options.getContext();
					if (!context || !editor.editable) throw new Error('Редактирование недоступно');
					const checked = value.trim() ? validateImageUrl(value) : { url: '', error: '' };
					if (checked.error) throw new Error(checked.error);
					const next = setComponentImage(editor.prepare(field.defaults), path, checked.url);
					await (options.save ?? saveComponentData)(context, options.getType(), next);
					options.setData(next);
				}
			});
		}
	};
	setContext(IMAGE_EDITING, editor);
	return editor;
}
export function useImageEditing(): ImageEditing | undefined {
	return getContext(IMAGE_EDITING);
}
