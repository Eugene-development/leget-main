import { projectRequest } from '$lib/components/templates/Promo-1/pages/mebel/project-request';

export type ProductKind = 'kitchen' | 'wardrobe';

export interface CatalogProduct {
	id: string;
	title: string;
	description: string;
	image: string;
	isActive: boolean;
	sortOrder: number;
}

export type CatalogProductInput = Omit<CatalogProduct, 'id'> & { id?: string };
const fields = 'id title description image isActive sortOrder';

export async function loadCatalogProducts(
	licenseId: string,
	kind: ProductKind
): Promise<CatalogProduct[]> {
	const result = await projectRequest<{ promo2Products: CatalogProduct[] }>(
		`query CatalogProducts($licenseId: ID!, $kind: Promo2ProductKind!) { promo2Products(licenseId: $licenseId, kind: $kind) { ${fields} } }`,
		{ licenseId, kind: kind.toUpperCase() },
		'Не удалось загрузить товары. Проверьте права доступа и повторите попытку.'
	);
	if (!Array.isArray(result.promo2Products)) throw new Error('Сервер не вернул список товаров.');
	return result.promo2Products;
}

export async function saveCatalogProduct(
	licenseId: string,
	kind: ProductKind,
	input: CatalogProductInput
) {
	const result = await projectRequest<{ savePromo2Product: CatalogProduct }>(
		`mutation SaveCatalogProduct($licenseId: ID!, $kind: Promo2ProductKind!, $input: Promo2ProductInput!) { savePromo2Product(licenseId: $licenseId, kind: $kind, input: $input) { ${fields} } }`,
		{ licenseId, kind: kind.toUpperCase(), input },
		'Не удалось сохранить товар. Проверьте права доступа и повторите попытку.'
	);
	if (!result.savePromo2Product?.id || (input.id && result.savePromo2Product.id !== input.id))
		throw new Error('Сервер не подтвердил сохранение товара.');
	return result.savePromo2Product;
}

export async function deleteCatalogProduct(licenseId: string, kind: ProductKind, id: string) {
	const result = await projectRequest<{ deletePromo2Product: string }>(
		`mutation DeleteCatalogProduct($licenseId: ID!, $kind: Promo2ProductKind!, $id: ID!) { deletePromo2Product(licenseId: $licenseId, kind: $kind, id: $id) }`,
		{ licenseId, kind: kind.toUpperCase(), id },
		'Не удалось удалить товар. Повторите попытку.'
	);
	if (result.deletePromo2Product !== id) throw new Error('Сервер не подтвердил удаление товара.');
}

export async function uploadCatalogPhoto(licenseId: string, file: File) {
	const result = await projectRequest<{
		generateUploadUrl: { uploadUrl: string; objectUrl: string };
	}>(
		`mutation CatalogPhoto($licenseId: ID!, $filename: String!, $mimeType: String!) { generateUploadUrl(licenseId: $licenseId, filename: $filename, mimeType: $mimeType, folder: "mebel") { uploadUrl objectUrl } }`,
		{ licenseId, filename: file.name, mimeType: file.type },
		'Не удалось получить адрес загрузки фотографии.'
	);
	const info = result.generateUploadUrl;
	if (!info?.uploadUrl || !info.objectUrl) throw new Error('Сервер не вернул адрес фотографии.');
	const response = await fetch(info.uploadUrl, {
		method: 'PUT',
		headers: { 'Content-Type': file.type },
		body: file
	});
	if (!response.ok) throw new Error('Не удалось загрузить фотографию. Повторите сохранение.');
	return info.objectUrl;
}
