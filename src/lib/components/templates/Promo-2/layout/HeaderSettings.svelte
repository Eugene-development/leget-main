<script lang="ts">
	import ArticleBadge from '$lib/components/ArticleBadge.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import ImagePickerDialog from '$lib/components/ImagePickerDialog.svelte';
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import {
		getLayoutComponentArticle,
		saveLayoutData,
		type EditContext
	} from '$lib/utils/page-edit';
	import { stickyComponentControls } from '$lib/utils/sticky-component-controls';
	import { validateImageUrl } from '$lib/utils/image-url';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const article = $derived(getLayoutComponentArticle(editContext?.templateId ?? 2, 'Header', 1));
	let open = $state(false);
	let picking = $state(false);
	let saving = $state(false);
	let error = $state('');
	let mode = $state<'image' | 'text'>('text');
	let logoUrl = $state('');
	let siteName = $state('');

	function openSettings() {
		logoUrl = typeof data.logoUrl === 'string' ? data.logoUrl : '';
		siteName = typeof data.siteName === 'string' ? data.siteName : 'Фабрика';
		mode = data.logoMode === 'text' || !logoUrl ? 'text' : 'image';
		error = '';
		picking = false;
		open = true;
	}

	async function save() {
		if (!editContext || saving) return;
		error = '';
		if (mode === 'text' && !siteName.trim()) {
			error = 'Введите текст вместо логотипа.';
			return;
		}
		if (mode === 'image') {
			const checked = validateImageUrl(logoUrl);
			if (checked.error) {
				error = logoUrl.trim() ? checked.error : 'Загрузите или выберите логотип.';
				return;
			}
		}
		const fields = { logoMode: mode, logoUrl: logoUrl.trim(), siteName: siteName.trim() };
		saving = true;
		try {
			await saveLayoutData(editContext, 'Header', { ...data, ...fields });
			data = { ...data, ...fields };
			open = false;
		} catch {
			error = 'Не удалось сохранить логотип. Повторите попытку.';
		} finally {
			saving = false;
		}
	}
</script>

{#if isEditable && editContext}
	<button
		use:stickyComponentControls
		data-field-toolbar-anchor
		type="button"
		class="flex cursor-pointer items-center justify-center rounded-2xl border border-on-dark/10 bg-ink-950/75 p-2.5 text-on-dark shadow-2xl backdrop-blur-xl transition-colors duration-300 hover:border-on-dark/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400 active:scale-95"
		onclick={openSettings}
		data-goal-ignore="Настройки меню владельцем сайта"
		title="Настройки компонента"
		aria-label="Настройки компонента Меню"
	>
		<svg
			class="h-4 w-4"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
			<circle cx="9" cy="6" r="2" fill="currentColor" />
			<circle cx="15" cy="12" r="2" fill="currentColor" />
			<circle cx="8" cy="18" r="2" fill="currentColor" />
		</svg>
	</button>

	<SideDrawer bind:open title="Меню">
		<div class="flex flex-col gap-6">
			{#if article}<ArticleBadge {article} sectionLabel="Раздел" align="left" />{/if}
			<fieldset disabled={saving} class="flex min-w-0 flex-col gap-5 disabled:opacity-60">
				<legend class="mb-4 text-sm text-on-dark">Логотип в меню</legend>
				<div class="flex flex-wrap gap-6 text-sm text-on-dark">
					<label class="flex min-h-11 cursor-pointer items-center gap-2">
						<input type="radio" bind:group={mode} value="image" onchange={() => (error = '')} /> Логотип
					</label>
					<label class="flex min-h-11 cursor-pointer items-center gap-2">
						<input type="radio" bind:group={mode} value="text" onchange={() => (error = '')} /> Текст
					</label>
				</div>
				{#if mode === 'image'}
					{#if logoUrl}
						<div
							class="flex h-28 items-center justify-center rounded-xl bg-on-dark/5 p-3 text-on-dark"
						>
							<ImageFallback
								imageRole="preview"
								src={logoUrl}
								alt="Выбранный логотип"
								class="h-full max-w-full object-contain"
							/>
						</div>
					{/if}
					<button
						type="button"
						onclick={() => (picking = true)}
						data-goal-ignore="Выбор логотипа в редакторе меню"
						class="min-h-11 cursor-pointer rounded-xl border border-on-dark/20 px-4 py-3 text-sm text-on-dark hover:bg-on-dark/5 focus-visible:outline-2 focus-visible:outline-link-400"
					>
						{logoUrl ? 'Заменить логотип' : 'Загрузить или выбрать логотип'}
					</button>
				{:else}
					<label class="flex flex-col gap-2 text-sm text-on-dark">
						Текст вместо логотипа
						<input
							type="text"
							bind:value={siteName}
							class="w-full min-w-0 rounded-xl border border-on-dark/20 bg-transparent p-3 text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400"
						/>
					</label>
				{/if}
			</fieldset>
			{#if error}<p role="alert" class="text-sm text-on-dark">{error}</p>{/if}
			<button
				type="button"
				onclick={save}
				disabled={saving}
				data-goal-ignore="Сохранение логотипа и текста меню владельцем"
				class="min-h-11 cursor-pointer rounded-xl bg-link-600 px-4 py-3 text-sm font-medium text-on-dark hover:bg-link-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400 disabled:cursor-wait disabled:opacity-60"
			>
				{saving ? 'Сохранение…' : 'Сохранить'}
			</button>
		</div>
	</SideDrawer>

	{#if open && picking}
		<ImagePickerDialog
			{editContext}
			currentImage={logoUrl}
			defaultImage={logoUrl}
			folder="components/header"
			title="Логотип"
			aspectRatio={NaN}
			previewFit="contain"
			cropMaxWidth={2560}
			cropMaxHeight={2560}
			cropOutputMimeType="image/webp"
			onApprove={(url) => {
				logoUrl = url;
				picking = false;
				error = '';
			}}
			onRemove={() => {
				logoUrl = '';
				picking = false;
			}}
			onClose={() => (picking = false)}
		/>
	{/if}
{/if}
