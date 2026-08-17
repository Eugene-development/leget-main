<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import {
		savePageSeo,
		type EditContext,
		type PageSeoData,
		type PageSeoVariable
	} from '$lib/utils/page-edit';

	let {
		seo = null,
		editContext = null,
		isEditable = false,
		triggerClass = ''
	}: {
		seo?: PageSeoData | null;
		editContext?: EditContext | null;
		isEditable?: boolean;
		triggerClass?: string;
	} = $props();

	let open = $state(false);
	let title = $state('');
	let description = $state('');
	let keywords = $state('');
	let isSaving = $state(false);
	let saveError = $state<string | null>(null);
	let copyMessage = $state<string | null>(null);

	$effect(() => {
		if (!open) {
			title = seo?.rawTitle ?? '';
			description = seo?.rawDescription ?? '';
			keywords = seo?.keywords ?? '';
			saveError = null;
		}
	});

	const variables = $derived(seo?.variables ?? []);
	const titlePreview = $derived(renderTemplate(title, variables));
	const descriptionPreview = $derived(renderTemplate(description, variables));
	const unknownPlaceholders = $derived.by(() => {
		if (!seo?.isDynamic) return [];

		const allowed = new Set(variables.map((variable) => variable.token));
		const found = [...title.matchAll(/\{[^{}]+\}/g), ...description.matchAll(/\{[^{}]+\}/g)].map(
			(match) => match[0]
		);

		return [...new Set(found.filter((token) => !allowed.has(token)))];
	});
	const isDirty = $derived(
		title !== (seo?.rawTitle ?? '') ||
			description !== (seo?.rawDescription ?? '') ||
			keywords !== (seo?.keywords ?? '')
	);

	function renderTemplate(template: string, available: PageSeoVariable[]): string {
		let rendered = template.trim();
		if (!seo?.isDynamic || rendered === '') return rendered;

		for (const variable of available) {
			rendered = rendered.split(variable.token).join(variable.value);
		}

		return rendered
			.replace(/\{[^{}]+\}/g, '')
			.replace(/\s+/g, ' ')
			.replace(/\s+([,.:;!?])/g, '$1')
			.trim();
	}

	function insertToken(field: 'title' | 'description', token: string) {
		const current = field === 'title' ? title : description;
		const spacer = current !== '' && !current.endsWith(' ') ? ' ' : '';
		const next = `${current}${spacer}${token}`;

		if (field === 'title') title = next;
		else description = next;
	}

	async function copyText(value: string, label: string) {
		if (!value) return;

		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(value);
			} else {
				const textarea = document.createElement('textarea');
				textarea.value = value;
				textarea.style.position = 'fixed';
				textarea.style.opacity = '0';
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand('copy');
				textarea.remove();
			}
			copyMessage = `${label} скопирован`;
			setTimeout(() => (copyMessage = null), 1800);
		} catch {
			copyMessage = 'Не удалось скопировать';
		}
	}

	function copyAll() {
		const rows = [
			title.trim() ? `Title: ${title.trim()}` : null,
			description.trim() ? `Description: ${description.trim()}` : null,
			keywords.trim() ? `Keywords: ${keywords.trim()}` : null
		].filter(Boolean);

		void copyText(rows.join('\n'), 'Метатеги');
	}

	async function save() {
		if (!editContext || unknownPlaceholders.length > 0) return;

		isSaving = true;
		saveError = null;

		try {
			await savePageSeo(editContext, { title, description, keywords });
			await invalidateAll();
			open = false;
		} catch (error) {
			saveError = error instanceof Error ? error.message : 'Не удалось сохранить настройки.';
		} finally {
			isSaving = false;
		}
	}
</script>

{#if isEditable && editContext && seo}
	<button
		type="button"
		class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center transition-colors duration-[var(--ds-motion-duration-ui)] focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 {triggerClass}"
		onclick={() => (open = true)}
		title="Настройки страницы"
		aria-label="Открыть настройки метатегов страницы"
	>
		<svg
			class="h-[18px] w-[18px]"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.09a2 2 0 0 1 1 1.74v.5a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"
				style="stroke-width: var(--ds-icon-stroke)"
			/>
			<circle cx="12" cy="12" r="3" style="stroke-width: var(--ds-icon-stroke)" />
		</svg>
	</button>

	<SideDrawer bind:open title="Настройки страницы">
		<div class="flex flex-col gap-6 text-ink-100">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<p class="text-sm text-on-dark">Метатеги страницы</p>
					<p class="mt-1 truncate text-xs text-ink-400">
						{seo.isDynamic ? `Шаблон ${seo.pattern}` : seo.pattern}
					</p>
				</div>
				<button
					type="button"
					class="shrink-0 rounded-xl border border-on-dark/10 bg-on-dark/4 px-3 py-2 text-xs text-ink-200 transition hover:border-on-dark/25 hover:bg-on-dark/8 focus-visible:ring-2 focus-visible:ring-link-600 disabled:cursor-not-allowed disabled:opacity-40"
					onclick={copyAll}
					disabled={!title.trim() && !description.trim() && !keywords.trim()}
				>
					Скопировать всё
				</button>
			</div>

			{#if seo.isDynamic}
				<div class="rounded-2xl border border-link-400/15 bg-link-400/8 px-4 py-3">
					<p class="text-xs text-link-100">Значения подставляются отдельно для каждого URL.</p>
					<p class="mt-1 text-xs leading-relaxed text-link-100/65">
						Нажмите переменную под полем, чтобы добавить её в шаблон.
					</p>
				</div>
			{/if}

			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between gap-3">
					<label for="page-seo-title" class="text-xs text-ink-200">
						{seo.isDynamic ? 'Шаблон Title' : 'Title'}
					</label>
					<button
						type="button"
						class="rounded-lg p-1.5 text-ink-400 transition hover:bg-on-dark/8 hover:text-on-dark focus-visible:ring-2 focus-visible:ring-link-600 disabled:opacity-30"
						onclick={() => copyText(title, 'Title')}
						disabled={!title}
						title="Скопировать Title"
						aria-label="Скопировать Title"
					>
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							aria-hidden="true"
						>
							<rect
								x="8"
								y="8"
								width="11"
								height="11"
								rx="2"
								style="stroke-width: var(--ds-icon-stroke)"
							/>
							<path
								d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
								style="stroke-width: var(--ds-icon-stroke)"
							/>
						</svg>
					</button>
				</div>
				<input
					id="page-seo-title"
					type="text"
					bind:value={title}
					maxlength="255"
					class="w-full rounded-xl border border-on-dark/12 bg-on-dark/5 px-3.5 py-3 text-sm text-on-dark shadow-sm outline-none focus:border-link-600 focus:ring-2 focus:ring-link-600"
				/>
				<div class="flex items-center justify-between gap-3 text-xs">
					<span class="text-ink-400">Оптимально 50–60 символов</span>
					<span class={titlePreview.length > 60 ? 'text-cat-1-300' : 'text-ink-400'}>
						{titlePreview.length}/60
					</span>
				</div>
				{#if seo.isDynamic}
					<div class="flex flex-wrap gap-1.5">
						{#each variables as variable (variable.token)}
							<button
								type="button"
								class="rounded-lg border border-on-dark/10 bg-on-dark/4 px-2 py-1 text-xs text-ink-300 transition hover:border-on-dark/25 hover:bg-on-dark/8 hover:text-on-dark focus-visible:ring-2 focus-visible:ring-link-600"
								onclick={() => insertToken('title', variable.token)}
								title={`${variable.label}: ${variable.value || 'нет значения'}`}
							>
								{variable.token}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between gap-3">
					<label for="page-seo-description" class="text-xs text-ink-200">
						{seo.isDynamic ? 'Шаблон Description' : 'Description'}
					</label>
					<button
						type="button"
						class="rounded-lg p-1.5 text-ink-400 transition hover:bg-on-dark/8 hover:text-on-dark focus-visible:ring-2 focus-visible:ring-link-600 disabled:opacity-30"
						onclick={() => copyText(description, 'Description')}
						disabled={!description}
						title="Скопировать Description"
						aria-label="Скопировать Description"
					>
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							aria-hidden="true"
						>
							<rect
								x="8"
								y="8"
								width="11"
								height="11"
								rx="2"
								style="stroke-width: var(--ds-icon-stroke)"
							/>
							<path
								d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
								style="stroke-width: var(--ds-icon-stroke)"
							/>
						</svg>
					</button>
				</div>
				<textarea
					id="page-seo-description"
					bind:value={description}
					maxlength="500"
					rows="5"
					class="w-full resize-y rounded-xl border border-on-dark/12 bg-on-dark/5 px-3.5 py-3 text-sm text-on-dark shadow-sm outline-none focus:border-link-600 focus:ring-2 focus:ring-link-600"
				></textarea>
				<div class="flex items-center justify-between gap-3 text-xs">
					<span class="text-ink-400">Оптимально 150–160 символов</span>
					<span class={descriptionPreview.length > 160 ? 'text-cat-1-300' : 'text-ink-400'}>
						{descriptionPreview.length}/160
					</span>
				</div>
				{#if seo.isDynamic}
					<div class="flex flex-wrap gap-1.5">
						{#each variables as variable (variable.token)}
							<button
								type="button"
								class="rounded-lg border border-on-dark/10 bg-on-dark/4 px-2 py-1 text-xs text-ink-300 transition hover:border-on-dark/25 hover:bg-on-dark/8 hover:text-on-dark focus-visible:ring-2 focus-visible:ring-link-600"
								onclick={() => insertToken('description', variable.token)}
								title={`${variable.label}: ${variable.value || 'нет значения'}`}
							>
								{variable.token}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between gap-3">
					<label for="page-seo-keywords" class="text-xs text-ink-200">Keywords</label>
					<button
						type="button"
						class="rounded-lg p-1.5 text-ink-400 transition hover:bg-on-dark/8 hover:text-on-dark focus-visible:ring-2 focus-visible:ring-link-600 disabled:opacity-30"
						onclick={() => copyText(keywords, 'Keywords')}
						disabled={!keywords}
						title="Скопировать Keywords"
						aria-label="Скопировать Keywords"
					>
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							aria-hidden="true"
						>
							<rect
								x="8"
								y="8"
								width="11"
								height="11"
								rx="2"
								style="stroke-width: var(--ds-icon-stroke)"
							/>
							<path
								d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
								style="stroke-width: var(--ds-icon-stroke)"
							/>
						</svg>
					</button>
				</div>
				<textarea
					id="page-seo-keywords"
					bind:value={keywords}
					maxlength="500"
					rows="3"
					class="w-full resize-y rounded-xl border border-on-dark/12 bg-on-dark/5 px-3.5 py-3 text-sm text-on-dark shadow-sm outline-none focus:border-link-600 focus:ring-2 focus:ring-link-600"
				></textarea>
				<p class="text-xs leading-relaxed text-ink-400">
					Укажите ключевые фразы через запятую. Поле не влияет на генерацию Title и Description.
				</p>
			</div>

			<section class="border-t border-on-dark/10 pt-5">
				<p class="text-xs text-ink-200">Предпросмотр</p>
				<div class="mt-3 space-y-1 rounded-2xl bg-on-dark/4 px-4 py-3">
					<p class="text-sm break-words text-link-300">
						{titlePreview || 'Будет использовано название сайта'}
					</p>
					<p class="text-xs leading-relaxed break-words text-ink-400">
						{descriptionPreview || 'Будет использовано описание сайта'}
					</p>
				</div>
			</section>

			{#if unknownPlaceholders.length > 0}
				<p
					class="rounded-xl border border-cat-6-400/20 bg-cat-6-400/8 px-3 py-2.5 text-xs text-cat-6-300"
				>
					Неизвестные переменные: {unknownPlaceholders.join(', ')}. Выберите переменные из списка.
				</p>
			{/if}

			{#if saveError}
				<p
					class="rounded-xl border border-cat-6-400/20 bg-cat-6-400/8 px-3 py-2.5 text-xs text-cat-6-300"
				>
					{saveError}
				</p>
			{/if}

			<div
				class="sticky bottom-0 -mx-5 mt-1 flex gap-2 border-t border-on-dark/10 bg-ink-950/95 px-5 pt-4 pb-1 backdrop-blur-xl"
			>
				<button
					type="button"
					class="flex-1 rounded-xl bg-on-dark px-4 py-2.5 text-sm text-ink-950 transition hover:bg-ink-100 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
					onclick={save}
					disabled={isSaving || !isDirty || unknownPlaceholders.length > 0}
				>
					{isSaving ? 'Сохраняем…' : 'Сохранить'}
				</button>
				<button
					type="button"
					class="rounded-xl border border-on-dark/10 px-4 py-2.5 text-sm text-ink-300 transition hover:border-on-dark/25 hover:bg-on-dark/6 hover:text-on-dark focus-visible:ring-2 focus-visible:ring-link-600"
					onclick={() => (open = false)}
				>
					Отмена
				</button>
			</div>

			<p class="sr-only" aria-live="polite">{copyMessage}</p>
		</div>
	</SideDrawer>
{/if}
