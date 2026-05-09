<script lang="ts">
	import { getGraphQLUrl } from '$lib/utils/config';

	interface Category {
		id: string;
		value: string;
	}

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onSaved: () => void;
		categories: Category[];
		initialCategoryId?: string;
	}

	let { isOpen, onClose, onSaved, categories, initialCategoryId = '' }: Props = $props();

	let isSubmitting = $state(false);
	
	let form = $state({
		category_id: initialCategoryId,
		value: '',
		short_description: '',
		description: '',
		price: '',
		old_price: '',
		is_new: false,
		is_featured: false,
		is_active: true
	});

	let files: FileList | null = $state(null);
	let uploadProgress = $state(0);
	
	$effect(() => {
		if (isOpen && initialCategoryId && !form.category_id) {
			form.category_id = initialCategoryId;
		}
	});

	async function getUploadUrl(file: File) {
		const token = localStorage.getItem('auth_token');
		const res = await fetch(getGraphQLUrl(), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify({
				query: `mutation GenerateUploadUrl($filename: String!, $mimeType: String!, $folder: String) {
					generateUploadUrl(filename: $filename, mimeType: $mimeType, folder: $folder) {
						uploadUrl
						objectUrl
					}
				}`,
				variables: { filename: file.name, mimeType: file.type, folder: 'mebel' }
			})
		});
		const result = await res.json();
		if (result.errors) throw new Error(result.errors[0].message);
		return result.data.generateUploadUrl;
	}

	async function uploadFileToS3(file: File, uploadUrl: string) {
		const res = await fetch(uploadUrl, {
			method: 'PUT',
			headers: { 'Content-Type': file.type },
			body: file
		});
		if (!res.ok) throw new Error('Failed to upload file to S3');
	}

	async function upsertProject(imageUrls: string[]) {
		const token = localStorage.getItem('auth_token');
		
		const price = form.price ? parseFloat(form.price) : null;
		const old_price = form.old_price ? parseFloat(form.old_price) : null;
		
		const res = await fetch(getGraphQLUrl(), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify({
				query: `mutation UpsertMebelProject($input: UpsertMebelProjectInput!) {
					upsertMebelProject(input: $input) {
						id
					}
				}`,
				variables: {
					input: {
						category_id: form.category_id,
						value: form.value,
						short_description: form.short_description,
						description: form.description,
						price,
						old_price,
						is_new: form.is_new,
						is_featured: form.is_featured,
						is_active: form.is_active,
						image_urls: imageUrls.length > 0 ? imageUrls : null
					}
				}
			})
		});
		const result = await res.json();
		if (result.errors) throw new Error(result.errors[0].message);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!form.category_id || !form.value) return;
		
		isSubmitting = true;
		try {
			const imageUrls: string[] = [];
			if (files && files.length > 0) {
				const totalFiles = files.length;
				for (let i = 0; i < totalFiles; i++) {
					const file = files[i];
					const uploadInfo = await getUploadUrl(file);
					await uploadFileToS3(file, uploadInfo.uploadUrl);
					imageUrls.push(uploadInfo.objectUrl);
					uploadProgress = Math.round(((i + 1) / totalFiles) * 100);
				}
			}
			
			await upsertProject(imageUrls);
			
			onSaved();
			onClose();
			
			form = { ...form, value: '', short_description: '', description: '', price: '', old_price: '' };
			files = null;
			uploadProgress = 0;
		} catch (e) {
			alert('Ошибка: ' + e);
		} finally {
			isSubmitting = false;
		}
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-xl font-bold">Добавить проект</h2>
				<button type="button" onclick={onClose} class="text-slate-400 hover:text-slate-600">✕</button>
			</div>
			
			<form onsubmit={handleSubmit} class="space-y-4 text-slate-800">
				<div>
					<label class="mb-1 block text-sm font-medium">Категория *</label>
					<select bind:value={form.category_id} required class="w-full rounded-lg border border-slate-200 p-2.5">
						{#each categories as cat}
							<option value={cat.id}>{cat.value}</option>
						{/each}
					</select>
				</div>
				
				<div>
					<label class="mb-1 block text-sm font-medium">Название проекта *</label>
					<input type="text" bind:value={form.value} required class="w-full rounded-lg border border-slate-200 p-2.5" />
				</div>
				
				<div>
					<label class="mb-1 block text-sm font-medium">Краткое описание</label>
					<input type="text" bind:value={form.short_description} class="w-full rounded-lg border border-slate-200 p-2.5" />
				</div>
				
				<div>
					<label class="mb-1 block text-sm font-medium">Полное описание</label>
					<textarea bind:value={form.description} rows="3" class="w-full rounded-lg border border-slate-200 p-2.5"></textarea>
				</div>
				
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="mb-1 block text-sm font-medium">Цена</label>
						<input type="number" bind:value={form.price} class="w-full rounded-lg border border-slate-200 p-2.5" />
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium">Старая цена</label>
						<input type="number" bind:value={form.old_price} class="w-full rounded-lg border border-slate-200 p-2.5" />
					</div>
				</div>
				
				<div class="flex gap-4 pt-2">
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={form.is_active} />
						<span class="text-sm">Активен</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={form.is_featured} />
						<span class="text-sm">В избранном</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={form.is_new} />
						<span class="text-sm">Новинка</span>
					</label>
				</div>
				
				<div>
					<label class="mb-1 block text-sm font-medium">Изображения (выберите несколько)</label>
					<input type="file" multiple accept="image/*" bind:files class="w-full text-sm" />
				</div>
				
				{#if uploadProgress > 0 && uploadProgress < 100}
					<div class="w-full bg-slate-200 rounded-full h-2.5 mt-2">
						<div class="bg-sky-600 h-2.5 rounded-full" style="width: {uploadProgress}%"></div>
					</div>
				{/if}
				
				<div class="mt-6 flex justify-end gap-3 pt-4 border-t">
					<button type="button" onclick={onClose} class="rounded-lg px-4 py-2 font-medium text-slate-600 hover:bg-slate-100">Отмена</button>
					<button type="submit" disabled={isSubmitting} class="rounded-lg bg-sky-500 px-4 py-2 font-medium text-white hover:bg-sky-600 disabled:opacity-50">
						{isSubmitting ? 'Сохранение...' : 'Сохранить'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
