<script lang="ts">
	import { enhance } from '$app/forms';
	import ImageCropper from '$lib/components/ImageCropper.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { notifyError } from '$lib/utils/notify-error';
	import { requestError, UserError } from '$lib/utils/user-error.js';
	import CompanyLogo from '$lib/partners/CompanyLogo.svelte';
	import type { CompanyCard } from '$lib/partners/types';

	let {
		card,
		result
	}: {
		card: CompanyCard;
		result?: {
			saved?: 'save' | 'publish' | 'unpublish';
			cardMessage?: string;
			errors?: Record<string, string[]>;
			values?: Record<string, string>;
		} | null;
	} = $props();
	let saving = $state(false);
	let savingLogo = $state(false);
	let cropFile = $state<File | null>(null);
	let logoUrl = $derived(card.logoUrl ?? null);
	let logoError = $state('');
	let logoStatus = $state('');
	let fileInput: HTMLInputElement;
	const id = $props.id();
	const inputClass =
		'mt-1.5 w-full rounded-xl border border-border-medium px-3 py-2.5 text-sm text-ink-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-600';
	const secondary =
		'inline-flex min-h-11 items-center rounded-xl border border-border-medium px-4 py-2 text-sm font-semibold text-ink-700';
	const primary =
		'inline-flex min-h-11 items-center rounded-xl bg-ink-950 px-4 py-2 text-sm font-semibold text-on-dark hover:bg-ink-800';
	const fields = [
		{ name: 'city', label: 'Город', type: 'text', max: 120 },
		{ name: 'address', label: 'Адрес', type: 'text', max: 255 },
		{ name: 'phone', label: 'Рабочий телефон', type: 'tel', max: 32 },
		{ name: 'email', label: 'Рабочий email', type: 'email', max: 255 },
		{ name: 'website', label: 'Сайт', type: 'url', max: 255 }
	] as const;

	function chooseLogo(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		logoError = '';
		logoStatus = '';
		if (
			!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
			!file.size ||
			file.size > 20 * 1024 * 1024
		) {
			logoError = 'Выберите JPEG, PNG или WebP размером до 20 МБ.';
			toast.error(logoError);
			return;
		}
		cropFile = file;
	}

	async function saveLogo(file?: File) {
		cropFile = null;
		if (savingLogo) return;
		savingLogo = true;
		logoError = '';
		logoStatus = '';
		const body = file ? new FormData() : undefined;
		if (file) body?.set('logo', file);

		try {
			const response = await fetch('/partner/company-card/logo', {
				method: file ? 'POST' : 'DELETE',
				body,
				signal: AbortSignal.timeout(25000)
			});
			const result = await response.json().catch(() => null);
			if (!response.ok || (typeof result?.logoUrl !== 'string' && result?.logoUrl !== null)) {
				if (response.status === 422) {
					throw new UserError('Выберите JPEG, PNG или WebP до 2 МБ после кадрирования.');
				}
				throw requestError(response.ok ? 502 : response.status);
			}
			logoUrl = result.logoUrl;
			logoStatus = file ? 'Логотип сохранён.' : 'Логотип удалён.';
		} catch (error) {
			logoError = notifyError(error, file ? 'Не удалось сохранить логотип.' : 'Не удалось удалить логотип.');
		} finally {
			savingLogo = false;
		}
	}
</script>

<section
	class="mt-6 scroll-mt-6 rounded-3xl border border-border-light bg-surface-raised p-5 sm:p-7"
	id="company-card"
>
	<header class="flex flex-wrap items-start justify-between gap-2">
		<div>
			<h2 class="text-xl text-ink-950">Карточка компании B2B</h2>
			<p class="mt-1 text-sm text-ink-600">
				{card.typeLabel} · {card.published ? 'Опубликована' : 'Черновик'}
			</p>
		</div>
		{#if card.published}
			<a
				href="/b2b/{card.id.toLowerCase()}"
				class="text-sm text-link-600 underline underline-offset-4">Открыть карточку</a
			>
		{/if}
	</header>
	<p class="mt-4 max-w-prose text-sm leading-relaxed text-ink-600">
		Название, описание и указанные здесь контакты увидят посетители каталога. Для публикации укажите
		рабочий телефон или email.
	</p>

	<div class="mt-5 flex flex-wrap items-center gap-4" aria-busy={savingLogo}>
		<CompanyLogo
			src={logoUrl}
			name={card.name ?? ''}
			class="size-16 border-border-light bg-surface-muted text-ink-700"
		/>
		<div class="min-w-0">
			<input
				type="file"
				accept="image/jpeg,image/png,image/webp"
				bind:this={fileInput}
				onchange={chooseLogo}
				hidden
			/>
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					class={secondary}
					disabled={savingLogo}
					onclick={() => fileInput.click()}
				>
					{savingLogo ? 'Сохраняем логотип…' : logoUrl ? 'Заменить логотип' : 'Добавить логотип'}
				</button>
				{#if logoUrl}
					<button
						type="button"
						class={secondary}
						disabled={savingLogo}
						onclick={() => void saveLogo()}
					>
						Удалить логотип
					</button>
				{/if}
			</div>
			{#if logoError}<p role="alert" class="mt-2 text-sm text-ink-800">{logoError}</p>{/if}
			{#if logoStatus}<p role="status" class="mt-2 text-sm text-ink-700">{logoStatus}</p>{/if}
		</div>
	</div>

	<form
		method="POST"
		action="?/companyCard"
		class="ym-hide-content mt-5"
		aria-busy={saving}
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				try {
					await update({ reset: false });
				} finally {
					saving = false;
				}
			};
		}}
	>
		<fieldset disabled={saving} class="space-y-4">
			<legend class="sr-only">Публичные сведения о компании</legend>
			<label class="block text-sm font-medium text-ink-800">
				Название
				<input
					name="name"
					maxlength="255"
					class={inputClass}
					value={result?.values?.name ?? card.name ?? ''}
					aria-invalid={!!result?.errors?.name}
					aria-describedby={result?.errors?.name ? `${id}-name` : undefined}
				/>
				{@render fieldError('name')}
			</label>
			<label class="block text-sm font-medium text-ink-800">
				Описание компании
				<textarea
					name="description"
					maxlength="6000"
					rows="5"
					class={inputClass}
					value={result?.values?.description ?? card.description ?? ''}
					aria-invalid={!!result?.errors?.description}
					aria-describedby={result?.errors?.description ? `${id}-description` : undefined}
				></textarea>
				{@render fieldError('description')}
			</label>
			<div class="grid gap-4 sm:grid-cols-2">
				{#each fields as field (field.name)}
					<label class="block text-sm font-medium text-ink-800">
						{field.label}
						<input
							name={field.name}
							type={field.type}
							maxlength={field.max}
							class={inputClass}
							value={result?.values?.[field.name] ?? card[field.name] ?? ''}
							aria-invalid={!!result?.errors?.[field.name]}
							aria-describedby={result?.errors?.[field.name] ? `${id}-${field.name}` : undefined}
						/>
						{@render fieldError(field.name)}
					</label>
				{/each}
			</div>
			{#if result?.cardMessage}<p role="alert" class="text-sm text-ink-800">
					{result.cardMessage}
				</p>{/if}
			{#if result?.saved}
				<p role="status" class="text-sm text-ink-800">
					{result.saved === 'unpublish'
						? 'Карточка снята с публикации.'
						: result.saved === 'save'
							? 'Черновик сохранён.'
							: 'Карточка опубликована.'}
				</p>
			{/if}
			<div class="flex flex-wrap gap-2">
				{#if card.published}
					<button type="submit" name="action" value="publish" class={primary}
						>Сохранить изменения</button
					>
					<button type="submit" name="action" value="unpublish" formnovalidate class={secondary}
						>Снять с публикации</button
					>
				{:else}
					<button type="submit" name="action" value="publish" class={primary}>Опубликовать</button>
					<button type="submit" name="action" value="save" class={secondary}
						>Сохранить черновик</button
					>
				{/if}
			</div>
		</fieldset>
	</form>
</section>

{#if cropFile}
	<ImageCropper
		imageFile={cropFile}
		aspectRatio={1}
		maxOutputWidth={1024}
		maxOutputHeight={1024}
		outputMimeType="image/webp"
		outputQuality={0.9}
		maxOutputBytes={2 * 1024 * 1024}
		onCrop={saveLogo}
		onCancel={() => (cropFile = null)}
	/>
{/if}

{#snippet fieldError(name: string)}
	{#if result?.errors?.[name]?.[0]}
		<span id="{id}-{name}" class="mt-1 block text-xs text-ink-700">{result.errors[name][0]}</span>
	{/if}
{/snippet}
