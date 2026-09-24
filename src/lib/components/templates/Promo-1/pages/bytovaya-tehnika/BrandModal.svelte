<script lang="ts">
	import { onDestroy, tick, untrack } from 'svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import { richTextToPlainText } from '$lib/utils/rich-text';
	import MebelTagPicker from '../mebel/MebelTagPicker.svelte';
	import { projectRequest, ProjectRequestError } from '../mebel/project-request';

	export interface Brand {
		id: string;
		value: string;
		slug: string;
		logo?: string | null;
		description?: string | null;
		tags?: { id: string; name: string }[];
	}
	let {
		brand = null,
		rubric = 'APPLIANCES',
		licenseId,
		onClose,
		onSaved
	}: {
		brand?: Brand | null;
		rubric?: 'APPLIANCES' | 'PLUMBING' | 'LIGHTING';
		licenseId: string;
		onClose: () => void;
		onSaved: (deleted: boolean, slug?: string) => void | Promise<void>;
	} = $props();
	let name = $state(untrack(() => brand?.value ?? ''));
	let description = $state(untrack(() => brand?.description ?? ''));
	let logo = $state(untrack(() => brand?.logo ?? ''));
	let selected = $state<string[]>(untrack(() => brand?.tags?.map((tag) => tag.id) ?? []));
	let file = $state<File | null>(null);
	let preview = $state('');
	let uploaded = '';
	let busy = $state(false);
	let deleting = $state(false);
	let error = $state('');
	let fields = $state<Record<string, string>>({});
	let status = $state('');
	let errorElement = $state<HTMLParagraphElement>();
	const id = $props.id();
	const inputClass =
		'mt-1 min-h-11 w-full rounded-lg border border-ink-300 bg-surface-raised px-3 text-ink-800 focus-visible:outline-link-500';
	function mountDialog(node: HTMLDialogElement) {
		const focus = document.activeElement;
		node.showModal();
		return {
			destroy() {
				node.close();
				if (focus instanceof HTMLElement && focus.isConnected) focus.focus();
			}
		};
	}
	function selectLogo(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const next = input.files?.[0];
		input.value = '';
		if (!next || busy) return;
		if (
			!['image/jpeg', 'image/png', 'image/webp'].includes(next.type) ||
			next.size === 0 ||
			next.size > 10 * 1024 * 1024
		) {
			fields.logo = 'Выберите JPEG, PNG или WebP размером до 10 МБ.';
			return;
		}
		if (preview) URL.revokeObjectURL(preview);
		file = next;
		preview = URL.createObjectURL(next);
		uploaded = '';
		fields.logo = '';
	}
	onDestroy(() => {
		if (preview) URL.revokeObjectURL(preview);
	});
	async function uploadLogo() {
		if (!file) return logo;
		if (uploaded) return uploaded;
		const result = await projectRequest<{
			generateUploadUrl: { uploadUrl: string; objectUrl: string };
		}>(
			`mutation($filename: String!, $mimeType: String!, $licenseId: ID!) { generateUploadUrl(filename: $filename, mimeType: $mimeType, folder: "brand-logos", licenseId: $licenseId) { uploadUrl objectUrl } }`,
			{ filename: file.name, mimeType: file.type, licenseId },
			'Не удалось подготовить загрузку логотипа.'
		);
		const response = await fetch(result.generateUploadUrl.uploadUrl, {
			method: 'PUT',
			headers: { 'Content-Type': file.type },
			body: file
		});
		if (!response.ok) throw new Error('Не удалось загрузить логотип. Повторите попытку.');
		uploaded = result.generateUploadUrl.objectUrl;
		return uploaded;
	}
	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		fields = {};
		if (!name.trim()) fields.value = 'Введите название бренда.';
		if (!file && !logo) fields.logo = 'Загрузите логотип бренда.';
		if (!richTextToPlainText(description).trim()) fields.description = 'Добавьте описание бренда.';
		if (Object.keys(fields).length) {
			error = 'Заполните обязательные поля.';
			await tick();
			errorElement?.focus();
			return;
		}
		busy = true;
		error = '';
		status = file ? 'Загружаем логотип…' : 'Сохраняем бренд…';
		try {
			const logoUrl = await uploadLogo();
			status = 'Сохраняем бренд…';
			const result = await projectRequest<{ upsertApplianceBrand: { id: string; slug: string } }>(
				`mutation($licenseId: ID!, $input: ApplianceBrandInput!, $rubric: BrandRubric!) { upsertApplianceBrand(licenseId: $licenseId, rubric: $rubric, input: $input) { id slug } }`,
				{
					licenseId,
					rubric,
					input: {
						...(brand ? { id: brand.id } : {}),
						value: name.trim(),
						logo: logoUrl,
						description,
						tag_ids: selected
					}
				},
				'Не удалось сохранить бренд. Проверьте права доступа и повторите попытку.'
			);
			if (!result.upsertApplianceBrand?.id)
				throw new Error('Сервер не подтвердил сохранение бренда.');
			await onSaved(false, result.upsertApplianceBrand.slug);
		} catch (cause) {
			if (cause instanceof ProjectRequestError) fields = cause.fields;
			error = cause instanceof Error ? cause.message : 'Не удалось сохранить бренд.';
			await tick();
			errorElement?.focus();
		} finally {
			busy = false;
			status = '';
		}
	}
	async function remove() {
		if (!brand || busy) return;
		busy = true;
		error = '';
		status = 'Удаляем бренд…';
		try {
			await projectRequest(
				`mutation($licenseId: ID!, $id: ID!, $rubric: BrandRubric!) { deleteApplianceBrand(licenseId: $licenseId, rubric: $rubric, id: $id) { id } }`,
				{ licenseId, rubric, id: brand.id },
				'Не удалось удалить бренд. Повторите попытку.'
			);
			await onSaved(true, brand.slug);
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Не удалось удалить бренд.';
		} finally {
			busy = false;
			status = '';
		}
	}
</script>

<dialog
	use:mountDialog
	aria-labelledby={`${id}-title`}
	onkeydown={(event) => {
		if (event.key === 'Escape') event.stopPropagation();
	}}
	oncancel={(event) => {
		event.preventDefault();
		if (!busy) onClose();
	}}
	class="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl border border-ink-200 bg-surface-raised p-5 text-ink-800 shadow-xl backdrop:bg-scrim/50 sm:p-6"
>
	<div class="mb-5 flex items-start justify-between gap-4">
		<h2 id={`${id}-title`} class="text-xl">{brand ? 'Редактировать бренд' : 'Добавить бренд'}</h2>
		<button
			data-goal-ignore="Редактор брендов"
			type="button"
			disabled={busy}
			onclick={onClose}
			class="min-h-11 px-3 text-sm text-link-700 underline">Закрыть</button
		>
	</div>
	{#if error}<p bind:this={errorElement} tabindex="-1" role="alert" class="mb-4 text-sm">
			{error}
		</p>{/if}
	<form onsubmit={save} class="space-y-5">
		<fieldset disabled={busy} class="min-w-0 space-y-5">
			<label class="block text-sm font-medium"
				>Название бренда *<input
					class={inputClass}
					bind:value={name}
					required
					maxlength="120"
					aria-invalid={!!fields.value}
				/>{#if fields.value}<span class="mt-1 block">{fields.value}</span>{/if}</label
			>
			<div>
				<label class="block text-sm font-medium"
					>Логотип *<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onchange={selectLogo}
						class="mt-2 block w-full min-w-0 text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border file:border-ink-300 file:px-3"
						aria-invalid={!!fields.logo}
					/></label
				>
				<p class="mt-2 text-xs text-ink-600">
					JPEG, PNG или WebP, до 10 МБ. Для прозрачного фона используйте PNG или WebP.
				</p>
				{#if preview || logo}<ImageFallback
						imageRole="preview"
						src={preview || logo}
						alt="Предпросмотр логотипа бренда"
						class="mt-3 h-24 max-w-full rounded-lg border border-ink-200 bg-surface-raised object-contain p-3"
					/>{/if}
				{#if preview || logo}
					<button
						type="button"
						data-goal-ignore="Удаление логотипа в форме бренда"
						disabled={busy}
						onclick={() => {
							if (preview) URL.revokeObjectURL(preview);
							preview = '';
							file = null;
							logo = '';
							uploaded = '';
						}}
						class="mt-2 min-h-11 text-sm text-link-700 underline">Убрать логотип</button
					>
				{/if}
				{#if fields.logo}<p class="mt-1 text-sm">{fields.logo}</p>{/if}
			</div>
			<div>
				<p class="mb-2 text-sm font-medium">Описание бренда *</p>
				<RichTextEditor
					value={description}
					label="Описание бренда"
					disabled={busy}
					onchange={(value) => (description = value)}
				/>
				{#if fields.description}<p class="mt-1 text-sm">{fields.description}</p>{/if}
			</div>
			<MebelTagPicker
				bind:selected
				disabled={busy}
				groupSlugs={[
					rubric === 'PLUMBING'
						? 'plumbing-type'
						: rubric === 'LIGHTING'
							? 'lighting-type'
							: 'appliance-type'
				]}
				helpText="Теги назначаются этому бренду. Справочником тегов можно управлять через шестерёнку сайдбара."
			/>
			{#if fields.tag_ids}<p class="text-sm">{fields.tag_ids}</p>{/if}
		</fieldset>
		{#if status}<p role="status" class="text-sm">{status}</p>{/if}
		<div class="flex flex-wrap justify-end gap-3">
			<button
				data-goal-ignore="Редактор брендов"
				type="button"
				onclick={onClose}
				disabled={busy}
				class="min-h-11 rounded-lg border border-ink-300 px-4 text-sm disabled:opacity-50"
				>Отмена</button
			>
			<button
				data-goal-ignore="Сохранение бренда каталога"
				type="submit"
				disabled={busy}
				class="min-h-11 rounded-lg bg-link-600 px-4 text-sm font-medium text-on-accent hover:bg-link-700 disabled:opacity-50"
				>{busy ? 'Подождите…' : 'Сохранить бренд'}</button
			>
		</div>
	</form>
	{#if brand}
		<div class="mt-6 border-t border-ink-200 pt-4">
			{#if deleting}
				<p class="text-sm">
					Удалить бренд «{brand.value}»? Он исчезнет из каталога, а его страница станет недоступна.
					Сами теги останутся в справочнике.
				</p>
				<div class="mt-3 flex flex-wrap gap-3">
					<button
						data-goal-ignore="Удаление бренда каталога"
						type="button"
						disabled={busy}
						onclick={remove}
						class="min-h-11 rounded-lg bg-ink-800 px-4 text-sm text-on-dark disabled:opacity-50"
						>Подтвердить удаление</button
					>
					<button
						data-goal-ignore="Отмена удаления бренда"
						type="button"
						disabled={busy}
						onclick={() => (deleting = false)}
						class="min-h-11 px-3 text-sm text-link-700 underline">Не удалять</button
					>
				</div>
			{:else}
				<button
					data-goal-ignore="Подтверждение удаления бренда"
					type="button"
					disabled={busy}
					onclick={() => (deleting = true)}
					class="min-h-11 text-sm text-ink-700 underline">Удалить бренд</button
				>
			{/if}
		</div>
	{/if}
</dialog>
