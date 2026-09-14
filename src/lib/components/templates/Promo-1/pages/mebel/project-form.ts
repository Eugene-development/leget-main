export const MAX_PROJECT_IMAGES = 8;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ProjectForm {
	category_id: string;
	value: string;
	short_description: string;
	description: string;
	price: number | null | undefined;
	old_price: number | null | undefined;
	is_new: boolean;
	is_featured: boolean;
	is_active: boolean;
}

export function projectInput(form: ProjectForm, tagIds: string[], imageUrls: string[]) {
	return {
		...form,
		value: form.value.trim(),
		short_description: form.short_description.trim() || null,
		description: form.description.trim() || null,
		price: form.price ?? null,
		old_price: form.old_price ?? null,
		tag_ids: [...tagIds],
		image_urls: imageUrls
	};
}

export function validateProject(form: ProjectForm, imageCount?: number): Record<string, string> {
	const errors: Record<string, string> = {};
	if (!form.value.trim()) errors.value = 'Введите название проекта.';
	else if (form.value.trim().length > 255) errors.value = 'Не больше 255 символов.';
	if (!form.category_id) errors.category_id = 'Выберите категорию мебели.';
	if (form.short_description.length > 1000) errors.short_description = 'Не больше 1000 символов.';
	if (form.description.length > 20000) errors.description = 'Не больше 20 000 символов.';
	for (const key of ['price', 'old_price'] as const) {
		const value = form[key];
		if (
			value != null &&
			(!Number.isFinite(value) ||
				value < 0 ||
				value > 9999999999.99 ||
				Math.abs(value * 100 - Math.round(value * 100)) > 0.0001)
		) {
			errors[key] = 'Укажите цену от 0 до 9 999 999 999,99 ₽, до двух знаков после запятой.';
		}
	}
	if (imageCount !== undefined && imageCount < 1)
		errors.image_urls = 'Добавьте хотя бы одну фотографию.';
	if (imageCount !== undefined && imageCount > MAX_PROJECT_IMAGES)
		errors.image_urls = 'Не больше восьми фотографий.';
	return errors;
}

export interface ProjectEditData {
	id?: string;
	category_id?: string;
	slug?: string;
	value?: string;
	short_description?: string | null;
	description?: string | null;
	price?: number | string | null;
	old_price?: number | string | null;
	is_active?: boolean;
	is_new?: boolean;
	is_featured?: boolean;
	completed_at?: string | null;
	object_address?: string | null;
	meta?: Record<string, unknown> | null;
	tags?: { id: string }[];
}

export interface ProjectEditForm extends ProjectForm {
	id: string;
	completed_at: string;
	object_address: string;
	maker: string;
	hardware_brands: string;
	appliance_brands: string;
}

export interface SavedProject {
	id: string;
	value: string;
	slug: string;
}

export function loadProjectEditForm(project: ProjectEditData, categoryId = ''): ProjectEditForm {
	const meta = project.meta ?? {};
	const brands = (key: string) =>
		Array.isArray(meta[key])
			? meta[key].filter((value): value is string => typeof value === 'string').join(', ')
			: '';
	return {
		id: project.id ?? '',
		category_id: project.category_id || categoryId,
		value: project.value ?? '',
		short_description: project.short_description ?? '',
		description: project.description ?? '',
		price: project.price == null || project.price === '' ? undefined : Number(project.price),
		old_price:
			project.old_price == null || project.old_price === '' ? undefined : Number(project.old_price),
		is_active: project.is_active !== false,
		is_new: project.is_new ?? false,
		is_featured: project.is_featured ?? false,
		completed_at: project.completed_at ?? '',
		object_address: project.object_address ?? '',
		maker: typeof meta.maker === 'string' ? meta.maker : '',
		hardware_brands: brands('hardware_brands'),
		appliance_brands: brands('appliance_brands')
	};
}

export function parseProjectBrands(value: string): string[] {
	return [
		...new Set(
			value
				.split(',')
				.map((brand) => brand.trim())
				.filter(Boolean)
		)
	];
}

export function projectUpdateInput(form: ProjectEditForm, tagIds: string[], tagsKnown = true) {
	return {
		...form,
		value: form.value.trim(),
		short_description: form.short_description.trim() || null,
		description: form.description.trim() || null,
		price: form.price ?? null,
		old_price: form.old_price ?? null,
		completed_at: form.completed_at || null,
		object_address: form.object_address.trim() || null,
		maker: form.maker.trim() || null,
		hardware_brands: parseProjectBrands(form.hardware_brands),
		appliance_brands: parseProjectBrands(form.appliance_brands),
		// Old cached pages may omit tags. Do not clear an unknown selection.
		...(tagsKnown || tagIds.length ? { tag_ids: [...tagIds] } : {})
	};
}

export type ProjectUpdateInput = ReturnType<typeof projectUpdateInput>;

export function validateProjectUpdate(form: ProjectEditForm): Record<string, string> {
	const errors = validateProject(form);
	if (!form.id) errors.id = 'Не удалось определить проект. Обновите страницу.';
	if (form.completed_at) {
		const date = new Date(`${form.completed_at}T00:00:00Z`);
		if (
			!/^\d{4}-\d{2}-\d{2}$/.test(form.completed_at) ||
			Number.isNaN(date.getTime()) ||
			date.toISOString().slice(0, 10) !== form.completed_at ||
			form.completed_at < '1000-01-01'
		) {
			errors.completed_at = 'Укажите существующую дату в формате ДД.ММ.ГГГГ.';
		}
	}
	for (const key of ['object_address', 'maker'] as const) {
		if (form[key].trim().length > 255) errors[key] = 'Не больше 255 символов.';
	}
	for (const key of ['hardware_brands', 'appliance_brands'] as const) {
		const brands = parseProjectBrands(form[key]);
		if (brands.length > 100 || brands.some((brand) => brand.length > 120))
			errors[key] = 'Не больше 100 брендов, до 120 символов в каждом названии.';
	}
	return errors;
}
