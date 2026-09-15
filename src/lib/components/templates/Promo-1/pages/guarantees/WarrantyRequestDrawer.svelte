<script lang="ts">
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import { createFormSender } from '$lib/utils/form-submission';
	const sendForm = createFormSender('promo1-warranty');

	let { open = $bindable(false) }: { open?: boolean } = $props();
	const id = $props.id();
	const maxPhotos = 3;
	const maxPhotoBytes = 5 * 1024 * 1024;
	const acceptedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

	let name = $state('');
	let contractNumber = $state('');
	let comment = $state('');
	let photos = $state<File[]>([]);
	let fileInput: HTMLInputElement | null = $state(null);
	let successCloseButton: HTMLButtonElement | null = $state(null);
	let sending = $state(false);
	let sent = $state(false);
	let error = $state('');

	const inputClass =
		'mt-2 block min-h-12 w-full rounded-xl border border-on-dark/25 bg-ink-900 px-4 py-3 text-base text-on-dark placeholder:text-on-dark/55 focus:border-link-400 focus:outline-2 focus:outline-offset-2 focus:outline-link-400';

	function selectPhotos(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const selected = Array.from(input.files ?? []);
		input.value = '';
		error = '';

		if (selected.some((file) => !acceptedPhotoTypes.has(file.type))) {
			error = 'Можно загрузить только изображения JPEG, PNG или WebP.';
			return;
		}
		if (selected.some((file) => file.size > maxPhotoBytes)) {
			error = 'Размер каждого изображения не должен превышать 5 МБ.';
			return;
		}
		if (photos.length + selected.length > maxPhotos) {
			error = 'Можно прикрепить не больше трёх фотографий.';
			return;
		}

		photos = [...photos, ...selected];
	}

	function removePhoto(index: number) {
		photos = photos.filter((_, photoIndex) => photoIndex !== index);
		error = '';
	}

	function resetForm() {
		sent = false;
		name = '';
		contractNumber = '';
		comment = '';
		photos = [];
		error = '';
	}

	function resetAndClose() {
		open = false;
		resetForm();
	}

	$effect(() => {
		if (open || !sent) return;
		resetForm();
	});

	$effect(() => {
		if (!sent) return;
		const focusTimer = setTimeout(() => successCloseButton?.focus(), 0);
		return () => clearTimeout(focusTimer);
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (sending) return;
		error = '';

		if (!name.trim() || !contractNumber.trim()) {
			error = 'Укажите ваше имя и номер договора.';
			return;
		}

		const formData = new FormData();
		formData.append('service_type', 'warranty');
		formData.append('name', name.trim());
		formData.append('contract_number', contractNumber.trim());
		formData.append('message', comment.trim());
		formData.append('source_url', window.location.href.slice(0, 500));
		for (const photo of photos) formData.append('photos[]', photo);

		sending = true;
		try {
			await sendForm(formData, 'service-request', event);

			sent = true;
		} catch {
			error = 'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.';
		} finally {
			sending = false;
		}
	}
</script>

<SideDrawer goalPrefix="guarantees_warranty_drawer" bind:open title="Гарантийное обращение">
	{#if sent}
		<div class="space-y-6 text-on-dark" role="status">
			<div
				class="flex size-12 items-center justify-center rounded-full bg-cat-2-500/15 text-cat-2-300"
				aria-hidden="true"
			>
				<svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6" />
				</svg>
			</div>
			<div>
				<p class="p1-title-sub text-xl">Заявка принята</p>
				<p class="mt-2 text-sm/6 text-on-dark/80">
					Мы получили обращение по договору и свяжемся с вами после проверки информации.
				</p>
			</div>
			<button
				bind:this={successCloseButton}
				type="button"
				data-metrika-goal="pages_guarantees_warrantyrequestdrawer_close_1"
				data-goal-action="close"
				onclick={resetAndClose}
				class="min-h-11 rounded-xl border border-on-dark/30 px-5 py-3 font-semibold transition-colors hover:bg-on-dark/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link-400"
			>
				Закрыть
			</button>
		</div>
	{:else}
		<form onsubmit={submit} class="space-y-6 text-sm text-on-dark" aria-busy={sending}>
			<p class="text-sm/6 text-on-dark/75">
				Опишите гарантийный случай и при необходимости приложите фотографии — так мы быстрее
				разберёмся в ситуации.
			</p>

			<fieldset disabled={sending} class="space-y-5">
				<legend class="sr-only">Данные гарантийного обращения</legend>
				<label class="block" for={`${id}-name`}>
					<span class="p1-label">Ваше имя *</span>
					<input
						id={`${id}-name`}
						name="name"
						autocomplete="name"
						bind:value={name}
						required
						maxlength="255"
						placeholder="Как к вам обращаться"
						class={inputClass}
					/>
				</label>

				<label class="block" for={`${id}-contract-number`}>
					<span class="p1-label">Номер договора *</span>
					<input
						id={`${id}-contract-number`}
						name="contract_number"
						bind:value={contractNumber}
						required
						maxlength="100"
						placeholder="Например, М-2026-001"
						class={inputClass}
					/>
				</label>

				<label class="block" for={`${id}-comment`}>
					<span class="p1-label">Комментарий</span>
					<textarea
						id={`${id}-comment`}
						name="comment"
						bind:value={comment}
						maxlength="2000"
						rows="4"
						placeholder="Кратко опишите проблему"
						class={`${inputClass} resize-y`}
					></textarea>
				</label>
			</fieldset>

			<fieldset disabled={sending}>
				<div class="flex items-end justify-between gap-4">
					<div>
						<legend class="p1-title-sub text-base">Фотографии</legend>
						<p class="mt-1 text-xs/5 text-on-dark/65">JPEG, PNG или WebP, до 5 МБ</p>
					</div>
					<span class="text-xs text-on-dark/65 tabular-nums">{photos.length} / {maxPhotos}</span>
				</div>

				<input
					bind:this={fileInput}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					multiple
					onchange={selectPhotos}
					class="sr-only"
					tabindex="-1"
					aria-label="Фотографии гарантийного случая"
				/>
				<button
					type="button"
					disabled={photos.length >= maxPhotos}
					data-goal-ignore="Выбор локальных файлов, не конверсионное действие"
					onclick={() => fileInput?.click()}
					class="mt-3 flex min-h-20 w-full items-center justify-center gap-3 rounded-xl border border-dashed border-on-dark/30 px-4 py-4 text-sm font-semibold text-on-dark transition-colors hover:border-cat-2-300 hover:bg-on-dark/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link-400 disabled:cursor-not-allowed disabled:opacity-45"
				>
					<svg
						class="size-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						aria-hidden="true"
					>
						<path stroke-linecap="round" d="M12 5v14M5 12h14" />
					</svg>
					{photos.length >= maxPhotos ? 'Добавлено 3 фото' : 'Добавить фото'}
				</button>

				{#if photos.length}
					<ul class="mt-3 space-y-2" aria-label="Выбранные фотографии">
						{#each photos as photo, index (`${photo.name}-${photo.lastModified}`)}
							<li class="flex min-h-12 items-center gap-3 rounded-xl bg-on-dark/5 px-3 py-2">
								<svg
									class="size-5 shrink-0 text-cat-2-300"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.8"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M4 7a2 2 0 0 1 2-2h2l1-2h6l1 2h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
									/>
									<circle cx="12" cy="12" r="3" />
								</svg>
								<span class="min-w-0 flex-1 truncate text-xs text-on-dark/80">{photo.name}</span>
								<button
									type="button"
									data-goal-ignore="Удаление выбранного локального файла, не конверсионное действие"
									onclick={() => removePhoto(index)}
									aria-label={`Удалить ${photo.name}`}
									class="flex size-11 shrink-0 items-center justify-center rounded-full text-on-dark/65 transition-colors hover:bg-on-dark/10 hover:text-on-dark focus-visible:outline-2 focus-visible:outline-link-400"
								>
									<svg
										class="size-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										aria-hidden="true"
									>
										<path stroke-linecap="round" d="m6 6 12 12M18 6 6 18" />
									</svg>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</fieldset>

			{#if error}
				<p
					role="alert"
					class="rounded-xl border border-cat-6-400/35 bg-cat-6-500/10 px-4 py-3 text-sm/6 text-on-dark"
				>
					{error}
				</p>
			{/if}

			<button
				type="submit"
				data-metrika-goal="pages_guarantees_warrantyrequestdrawer_submit_click_1"
				data-goal-action="submit_click"
				disabled={sending}
				class="min-h-12 w-full rounded-xl bg-linear-to-r from-cat-2-500 to-cat-5-500 px-5 py-3 text-base font-semibold text-on-accent transition duration-300 hover:from-cat-2-400 hover:to-cat-5-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cat-2-300 disabled:cursor-wait disabled:opacity-60"
			>
				{sending ? 'Отправляем…' : 'Отправить заявку'}
			</button>
		</form>
	{/if}
</SideDrawer>
