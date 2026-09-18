<script lang="ts">
	import { untrack, tick } from 'svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import MebelTagPicker from './MebelTagPicker.svelte';
	import { ProjectRequestError, projectRequest } from './project-request';
	import {
		loadProjectEditForm,
		projectUpdateInput,
		validateProjectUpdate,
		type ProjectEditData,
		type ProjectUpdateInput,
		type SavedProject
	} from './project-form';

	let {
		project,
		categoryId = '',
		categories,
		onClose,
		onSaved
	}: {
		project: ProjectEditData;
		categoryId?: string;
		categories: { id: string; value: string; slug?: string }[];
		onClose: () => void;
		onSaved: (saved: SavedProject, input: ProjectUpdateInput) => void;
	} = $props();
	const uid = $props.id();
	let form = $state(untrack(() => loadProjectEditForm(project, categoryId)));
	let selectedTags = $state<string[]>(untrack(() => (project.tags ?? []).map((tag) => tag.id)));
	const tagsKnown = untrack(() => Array.isArray(project.tags));
	let saving = $state(false);
	let errors = $state<Record<string, string>>({});
	let saveError = $state('');
	let formElement = $state<HTMLFormElement>();
	let errorSummary = $state<HTMLParagraphElement>();

	function close() {
		if (!saving) onClose();
	}
	function mountDialog(node: HTMLDialogElement) {
		const previousFocus = document.activeElement;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		node.showModal();
		node.querySelector<HTMLInputElement>('input[name="value"]')?.focus();
		return {
			destroy() {
				node.close();
				document.body.style.overflow = previousOverflow;
				if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
					previousFocus.focus();
			}
		};
	}
	async function focusError() {
		await tick();
		(formElement?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? errorSummary)?.focus();
	}
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (saving) return;
		errors = validateProjectUpdate(form);
		if (!categories.some((category) => category.id === form.category_id))
			errors.category_id = 'Выберите доступную категорию мебели.';
		for (const input of formElement?.querySelectorAll<HTMLInputElement>(
			'input[type="number"],input[type="date"]'
		) ?? []) {
			if (input.validity.badInput)
				errors[input.name] =
					input.type === 'date' ? 'Введите корректную дату.' : 'Введите корректную цену.';
		}
		saveError = errors.id ?? '';
		if (Object.values(errors).some(Boolean)) {
			await focusError();
			return;
		}
		saving = true;
		const input = projectUpdateInput(form, selectedTags, tagsKnown);
		let saved: SavedProject;
		try {
			const result = await projectRequest<{ upsertMebelProject: SavedProject }>(
				`mutation UpdateMebelProject($input: UpsertMebelProjectInput!) { upsertMebelProject(input: $input) { id value slug } }`,
				{ input }
			);
			saved = result.upsertMebelProject;
			if (!saved?.id || saved.id !== form.id || !saved.slug)
				throw new Error('Сервер не подтвердил обновление проекта.');
		} catch (cause) {
			saveError =
				cause instanceof Error
					? cause.message
					: 'Не удалось сохранить изменения. Повторите попытку.';
			if (cause instanceof ProjectRequestError) errors = cause.fields;
			saving = false;
			await focusError();
			return;
		}
		saving = false;
		onClose();
		onSaved(saved, input);
	}
</script>

{#snippet fieldError(field: string)}
	{#if errors[field]}<p
			id={`${uid}-${field}-error`}
			role="alert"
			class="text-cat-6-700 mt-1.5 text-xs"
		>
			{errors[field]}
		</p>{/if}
{/snippet}

<dialog
	use:mountDialog
	aria-labelledby={`${uid}-title`}
	onkeydown={(event) => {
		if (event.key === 'Escape') event.stopPropagation();
	}}
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
	class="m-auto max-h-[94dvh] w-[calc(100%-1.5rem)] max-w-6xl overflow-hidden rounded-2xl border border-ink-200 bg-surface-raised p-0 text-ink-800 shadow-2xl backdrop:bg-scrim/60 sm:w-[calc(100%-3rem)]"
>
	<form
		bind:this={formElement}
		onsubmit={submit}
		novalidate
		aria-busy={saving}
		class="flex max-h-[94dvh] flex-col"
		oninput={(event) => {
			const target = event.target;
			if (
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				target instanceof HTMLSelectElement
			) {
				if (target.name) errors[target.name] = '';
			}
		}}
	>
		<header
			class="flex shrink-0 items-center justify-between gap-4 border-b border-ink-200 px-5 py-4 sm:px-7"
		>
			<div>
				<h2 id={`${uid}-title`} class="text-2xl">Редактировать проект</h2>
				<p class="mt-1 text-sm text-ink-600">
					Описание, характеристики и паспорт выполненной работы
				</p>
			</div>
			<button
				type="button"
				onclick={close}
				disabled={saving}
				aria-label="Закрыть форму редактирования"
				class="icon-button"
				><svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg
				></button
			>
		</header>
		<div class="min-h-0 overflow-y-auto overscroll-contain">
			<fieldset
				disabled={saving}
				class="grid min-w-0 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8"
			>
				<div class="min-w-0 space-y-5">
					<div class="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
						<div>
							<label for={`${uid}-name`} class="field-label">Название проекта *</label><input
								id={`${uid}-name`}
								name="value"
								type="text"
								required
								maxlength="255"
								bind:value={form.value}
								aria-invalid={!!errors.value}
								aria-describedby={errors.value ? `${uid}-value-error` : undefined}
								class="field"
							/>{@render fieldError('value')}
						</div>
						<div>
							<label for={`${uid}-category`} class="field-label">Категория *</label><select
								id={`${uid}-category`}
								name="category_id"
								required
								bind:value={form.category_id}
								aria-invalid={!!errors.category_id}
								aria-describedby={errors.category_id ? `${uid}-category_id-error` : undefined}
								class="field"
								><option value="" disabled>Выберите категорию</option
								>{#each categories as category (category.id)}<option value={category.id}
										>{category.value}</option
									>{/each}</select
							>{@render fieldError('category_id')}
						</div>
					</div>
					<div class="grid grid-cols-1 gap-4">
						<div>
							<label for={`${uid}-short`} class="field-label">Краткое описание</label><textarea
								id={`${uid}-short`}
								name="short_description"
								rows="2"
								maxlength="1000"
								bind:value={form.short_description}
								aria-invalid={!!errors.short_description}
								aria-describedby={errors.short_description
									? `${uid}-short_description-error`
									: undefined}
								class="field resize-y"
							></textarea>{@render fieldError('short_description')}
						</div>
						<div>
							<p class="field-label">Полное описание</p>
							<RichTextEditor
								--rich-text-min-height="120px"
								value={form.description}
								label="Полное описание"
								invalid={!!errors.description}
								describedBy={errors.description ? `${uid}-description-error` : undefined}
								legacyHtml
								autofocus={false}
								disabled={saving}
								onchange={(value) => (form.description = value)}
							/>

							{@render fieldError('description')}
						</div>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for={`${uid}-price`} class="field-label">Цена, ₽</label><input
								id={`${uid}-price`}
								name="price"
								type="number"
								min="0"
								max="9999999999.99"
								step="0.01"
								bind:value={form.price}
								placeholder="Не указана"
								aria-invalid={!!errors.price}
								aria-describedby={errors.price ? `${uid}-price-error` : undefined}
								class="field"
							/>{@render fieldError('price')}
						</div>
						<div>
							<label for={`${uid}-old-price`} class="field-label">Старая цена, ₽</label><input
								id={`${uid}-old-price`}
								name="old_price"
								type="number"
								min="0"
								max="9999999999.99"
								step="0.01"
								bind:value={form.old_price}
								placeholder="Не указана"
								aria-invalid={!!errors.old_price}
								aria-describedby={errors.old_price ? `${uid}-old_price-error` : undefined}
								class="field"
							/>{@render fieldError('old_price')}
						</div>
					</div>
					<div class="border-y border-ink-200 py-3">
						<label class="flex min-h-11 cursor-pointer items-center justify-between gap-4">
							<span class="text-sm font-medium">Показывать проект на сайте</span>
							<span class="flex shrink-0 items-center gap-3">
								<span aria-hidden="true" class="text-xs text-ink-600"
									>{form.is_active ? 'Включён' : 'Отключён'}</span
								>
								<span class="relative inline-flex h-7 w-12">
									<input
										type="checkbox"
										role="switch"
										name="is_active"
										bind:checked={form.is_active}
										aria-describedby={`${uid}-visibility-help`}
										class="peer sr-only"
									/>
									<span
										aria-hidden="true"
										class="absolute inset-0 rounded-full bg-ink-300 transition-colors peer-checked:bg-link-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-link-500 peer-disabled:opacity-50 motion-reduce:transition-none"
									></span>
									<span
										aria-hidden="true"
										class="pointer-events-none absolute top-1 left-1 size-5 rounded-full bg-surface-raised shadow-sm transition-transform peer-checked:translate-x-5 peer-disabled:opacity-50 motion-reduce:transition-none"
									></span>
								</span>
							</span>
						</label>
						<p id={`${uid}-visibility-help`} class="mt-1 text-xs text-ink-600">
							{form.is_active
								? 'После сохранения проект будет виден посетителям.'
								: 'После сохранения проект будет скрыт. Данные и фотографии сохранятся.'}
						</p>
					</div>
					<div class="flex flex-wrap gap-x-5 gap-y-1">
						<label class="check-label"
							><input type="checkbox" bind:checked={form.is_featured} />Хит (избранный)</label
						>
						<label class="check-label"
							><input type="checkbox" bind:checked={form.is_new} />Новинка</label
						>
					</div>
					<MebelTagPicker bind:selected={selectedTags} disabled={saving} />
					{@render fieldError('tag_ids')}
				</div>
				<div
					class="min-w-0 space-y-4 border-t border-ink-200 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
				>
					<div>
						<h3 class="p1-title-sub text-base">Паспорт работы</h3>
						<p class="mt-1 text-xs text-ink-600">
							Показывается на странице «Проекты». Без даты сдачи работа остаётся только в каталоге.
						</p>
					</div>
					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for={`${uid}-completed`} class="field-label">Дата сдачи</label><input
								id={`${uid}-completed`}
								name="completed_at"
								type="date"
								min="1000-01-01"
								max="9999-12-31"
								bind:value={form.completed_at}
								aria-invalid={!!errors.completed_at}
								aria-describedby={errors.completed_at ? `${uid}-completed_at-error` : undefined}
								class="field"
							/>{@render fieldError('completed_at')}
						</div>
						<div>
							<label for={`${uid}-maker`} class="field-label">Кто делал мебель</label><input
								id={`${uid}-maker`}
								name="maker"
								type="text"
								maxlength="255"
								bind:value={form.maker}
								placeholder="Собственное производство"
								aria-invalid={!!errors.maker}
								aria-describedby={errors.maker ? `${uid}-maker-error` : undefined}
								class="field"
							/>{@render fieldError('maker')}
						</div>
					</div>
					<div>
						<label for={`${uid}-address`} class="field-label">Адрес объекта</label><input
							id={`${uid}-address`}
							name="object_address"
							type="text"
							maxlength="255"
							bind:value={form.object_address}
							placeholder="Город, район, улица и дом"
							aria-invalid={!!errors.object_address}
							aria-describedby={`${uid}-address-help ${errors.object_address ? `${uid}-object_address-error` : ''}`}
							class="field"
						/>{@render fieldError('object_address')}
						<p id={`${uid}-address-help`} class="mt-1.5 text-xs text-ink-600">
							Храним адрес целиком. В ленте проектов показываем город и район.
						</p>
					</div>
					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for={`${uid}-hardware`} class="field-label">Бренды фурнитуры</label><input
								id={`${uid}-hardware`}
								name="hardware_brands"
								type="text"
								bind:value={form.hardware_brands}
								placeholder="Blum, Hettich"
								aria-invalid={!!errors.hardware_brands}
								aria-describedby={errors.hardware_brands
									? `${uid}-hardware_brands-error`
									: undefined}
								class="field"
							/>{@render fieldError('hardware_brands')}
						</div>
						<div>
							<label for={`${uid}-appliances`} class="field-label">Бренды техники</label><input
								id={`${uid}-appliances`}
								name="appliance_brands"
								type="text"
								bind:value={form.appliance_brands}
								placeholder="Bosch, Franke"
								aria-invalid={!!errors.appliance_brands}
								aria-describedby={errors.appliance_brands
									? `${uid}-appliance_brands-error`
									: undefined}
								class="field"
							/>{@render fieldError('appliance_brands')}
						</div>
					</div>
					<p class="text-xs text-ink-600">Несколько брендов — через запятую.</p>
				</div>
			</fieldset>
		</div>
		<footer class="shrink-0 border-t border-ink-200 bg-ink-50 px-5 py-4 sm:px-7">
			{#if saveError}<p
					bind:this={errorSummary}
					tabindex="-1"
					role="alert"
					class="text-cat-6-700 mb-3 text-sm"
				>
					{saveError} Изменения остаются в форме.
				</p>{/if}
			<div class="flex flex-wrap items-center justify-between gap-3">
				<p role="status" class="text-xs text-ink-600">
					{saving ? 'Сохраняем изменения…' : 'Поля со звёздочкой обязательны'}
				</p>
				<div class="ml-auto flex gap-3">
					<button type="button" onclick={close} disabled={saving} class="secondary-button"
						>Отмена</button
					><button type="submit" disabled={saving} class="primary-button"
						>{saving ? 'Сохранение…' : 'Сохранить изменения'}</button
					>
				</div>
			</div>
		</footer>
	</form>
</dialog>

<style>
	.field-label {
		display: block;
		margin-bottom: 0.375rem;
		font-size: var(--text-sm);
		font-weight: 500;
	}
	.field {
		width: 100%;
		min-height: 44px;
		border: 1px solid var(--color-ink-300);
		border-radius: var(--radius-lg);
		background: var(--color-surface-raised);
		padding: 0.625rem 0.75rem;
		color: var(--color-ink-800);
		font-size: var(--text-sm);
	}
	.field::placeholder {
		color: var(--color-ink-500);
	}
	.field:focus-visible {
		outline: 2px solid var(--color-link-500);
		outline-offset: 2px;
	}
	.field[aria-invalid='true'] {
		border-color: var(--color-cat-6-600);
	}
	.check-label {
		display: flex;
		min-height: 44px;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--text-sm);
		cursor: pointer;
	}
	.check-label input {
		accent-color: var(--color-link-600);
	}
	.primary-button,
	.secondary-button,
	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		border-radius: var(--radius-lg);
		padding: 0.625rem 1rem;
		font-size: var(--text-sm);
		font-weight: 500;
		cursor: pointer;
	}
	.primary-button {
		background: var(--color-link-600);
		color: var(--color-on-accent);
	}
	.primary-button:hover {
		background: var(--color-link-700);
	}
	.secondary-button {
		border: 1px solid var(--color-ink-300);
		background: var(--color-surface-raised);
	}
	.secondary-button:hover,
	.icon-button:hover {
		background: var(--color-ink-100);
	}
	.icon-button {
		width: 44px;
		flex-shrink: 0;
		padding: 0;
	}
	button:focus-visible {
		outline: 2px solid var(--color-link-500);
		outline-offset: 2px;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
