<script lang="ts">
	import { untrack } from 'svelte';
	import { getGraphQLUrl } from '$lib/utils/config';
	import ImageCropper from '$lib/components/ImageCropper.svelte';

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
		category_id: '',
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
	
	// Cropper state
	let filesToProcess: File[] = $state([]);
	let processedFiles: File[] = $state([]);
	let currentFileToCrop: File | null = $state(null);

	$effect(() => {
		if (isOpen) {
			untrack(() => {
				resetForm();
				if (initialCategoryId) {
					form.category_id = initialCategoryId;
				}
			});
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

	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			filesToProcess = Array.from(input.files);
			currentFileToCrop = filesToProcess[0];
		}
	}

	function handleCropped(file: File) {
		processedFiles = [...processedFiles, file];
		filesToProcess = filesToProcess.slice(1);
		
		if (filesToProcess.length > 0) {
			currentFileToCrop = filesToProcess[0];
		} else {
			currentFileToCrop = null;
		}
	}

	function handleCropCancel() {
		filesToProcess = filesToProcess.slice(1);
		if (filesToProcess.length > 0) {
			currentFileToCrop = filesToProcess[0];
		} else {
			currentFileToCrop = null;
		}
	}

	function removeFile(index: number) {
		processedFiles = processedFiles.filter((_, i) => i !== index);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!form.category_id || !form.value) return;
		
		isSubmitting = true;
		try {
			const imageUrls: string[] = [];
			const totalFiles = processedFiles.length;
			
			for (let i = 0; i < totalFiles; i++) {
				const file = processedFiles[i];
				const uploadInfo = await getUploadUrl(file);
				await uploadFileToS3(file, uploadInfo.uploadUrl);
				imageUrls.push(uploadInfo.objectUrl);
				uploadProgress = Math.round(((i + 1) / totalFiles) * 100);
			}
			
			await upsertProject(imageUrls);
			
			onSaved();
			onClose();
			resetForm();
		} catch (e) {
			alert('Ошибка: ' + e);
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		form = {
			category_id: initialCategoryId || '',
			value: '',
			short_description: '',
			description: '',
			price: '',
			old_price: '',
			is_new: false,
			is_featured: false,
			is_active: true
		};
		files = null;
		uploadProgress = 0;
		processedFiles = [];
		filesToProcess = [];
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
					<label for="mebel-project-category" class="mb-1 block text-sm font-medium">Категория *</label>
					<select id="mebel-project-category" bind:value={form.category_id} required class="w-full rounded-lg border border-slate-200 p-2.5">
						{#each categories as cat}
							<option value={cat.id}>{cat.value}</option>
						{/each}
					</select>
				</div>
				
				<div>
					<label for="mebel-project-value" class="mb-1 block text-sm font-medium">Название проекта *</label>
					<input id="mebel-project-value" type="text" bind:value={form.value} required class="w-full rounded-lg border border-slate-200 p-2.5" />
				</div>
				
				<div>
					<label for="mebel-project-short-description" class="mb-1 block text-sm font-medium">Краткое описание</label>
					<input id="mebel-project-short-description" type="text" bind:value={form.short_description} class="w-full rounded-lg border border-slate-200 p-2.5" />
				</div>
				
				<div>
					<label for="mebel-project-description" class="mb-1 block text-sm font-medium">Полное описание</label>
					<textarea id="mebel-project-description" bind:value={form.description} rows="3" class="w-full rounded-lg border border-slate-200 p-2.5"></textarea>
				</div>
				
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="mebel-project-price" class="mb-1 block text-sm font-medium">Цена</label>
						<input id="mebel-project-price" type="number" bind:value={form.price} class="w-full rounded-lg border border-slate-200 p-2.5" />
					</div>
					<div>
						<label for="mebel-project-old-price" class="mb-1 block text-sm font-medium">Старая цена</label>
						<input id="mebel-project-old-price" type="number" bind:value={form.old_price} class="w-full rounded-lg border border-slate-200 p-2.5" />
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
				
				<div class="pt-2">
					<p class="mb-2 block text-sm font-medium">Изображения</p>
					
					<div class="grid grid-cols-4 gap-3 mb-3">
						{#each processedFiles as file, i}
							<div class="group relative aspect-square rounded-lg border overflow-hidden bg-slate-100">
								<img src={URL.createObjectURL(file)} alt="Preview" class="h-full w-full object-cover" />
								<button 
									type="button" 
									aria-label="Удалить изображение"
									onclick={() => removeFile(i)}
									class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
								</button>
							</div>
						{/each}
						
						{#if processedFiles.length < 8}
							<label class="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50 cursor-pointer transition-all">
								<svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
								<span class="text-[10px] text-slate-500 mt-1 text-center px-1">Добавить</span>
								<input type="file" multiple accept="image/*" class="hidden" onchange={handleFileSelect} />
							</label>
						{/if}
					</div>
				</div>
				
				{#if uploadProgress > 0 && uploadProgress < 100}
					<div class="w-full bg-slate-200 rounded-full h-2 mt-2">
						<div class="bg-sky-600 h-2 rounded-full transition-all duration-300" style="width: {uploadProgress}%"></div>
					</div>
					<p class="text-[10px] text-center text-slate-500 mt-1">Загрузка в облако: {uploadProgress}%</p>
				{/if}
				
				<div class="mt-6 flex justify-end gap-3 pt-4 border-t">
					<button type="button" onclick={onClose} class="rounded-lg px-4 py-2 font-medium text-slate-600 hover:bg-slate-100">Отмена</button>
					<button type="submit" disabled={isSubmitting || processedFiles.length === 0} class="rounded-lg bg-sky-500 px-4 py-2 font-medium text-white hover:bg-sky-600 disabled:opacity-50">
						{isSubmitting ? 'Сохранение...' : 'Сохранить'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if currentFileToCrop}
	<ImageCropper 
		imageFile={currentFileToCrop} 
		onCrop={handleCropped} 
		onCancel={handleCropCancel} 
	/>
{/if}

