<script lang="ts">
	import { withPromoMotion } from '$lib/motion/transition';
	import { fly } from 'svelte/transition';
	import { saveComponentData } from '$lib/utils/page-edit';
	import { stageBackgrounds, defaultStageBackground } from './backgrounds';
	import StageV1 from './v1/Stage.svelte';
	import StageV2 from './v2/Stage.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: any;
		isEditable?: boolean;
	} = $props();

	// Версию читаем сразу при инициализации, а не только в $effect: на сервере
	// эффекты не выполняются, и SSR отдавал бы v1 независимо от данных —
	// на живых сайтах это давало подмену версии после гидратации, а каталог
	// /_ds (пререндер) вообще не смог бы показать ничего, кроме v1.
	let selectedVersion = $state<'v1' | 'v2' | 'disabled'>(
		(data?.stageVersion as 'v1' | 'v2' | 'disabled') ?? 'v1'
	);
	const p1_fly = withPromoMotion(fly);
	let savingBackground = $state(false);
	let backgroundError = $state('');
	const activeBackground = $derived(data?.bgImage || defaultStageBackground);

	async function selectBackground(url: string) {
		if (!editContext || savingBackground || activeBackground === url) return;
		savingBackground = true;
		backgroundError = '';
		const previous = data;
		const updated = { ...data, bgImage: url };
		data = updated;
		try {
			await saveComponentData(editContext, 'Stage', updated);
		} catch {
			data = previous;
			backgroundError = 'Не удалось сохранить фон. Попробуйте ещё раз.';
		} finally {
			savingBackground = false;
		}
	}
</script>

{#snippet backgroundSettings()}
	{#if selectedVersion === 'v1'}
		<fieldset disabled={savingBackground} aria-busy={savingBackground}>
			<legend class="mb-3 text-sm font-semibold text-ink-100">Фон блока</legend>
			<div class="grid grid-cols-2 gap-3">
				{#each stageBackgrounds as background (background.url)}
					<button
						type="button"
						onclick={() => selectBackground(background.url)}
						aria-pressed={activeBackground === background.url}
						data-goal-ignore="Выбор фонового изображения в настройках компонента"
						class="overflow-hidden rounded-xl border text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400 disabled:cursor-wait {activeBackground ===
						background.url
							? 'border-link-400 bg-link-500/15 text-link-200'
							: 'border-ink-700 bg-ink-900 text-ink-200 hover:border-ink-500'}"
					>
						<ImageFallback
							src={background.url}
							alt=""
							imageRole="preview"
							class="aspect-video w-full object-cover"
						/>
						<span class="block px-3 py-2 text-xs font-medium">{background.label}</span>
					</button>
				{/each}
			</div>
			<p class="mt-3 text-xs leading-relaxed text-ink-400">
				Выберите готовый фон или загрузите своё изображение ниже.
			</p>
			{#if savingBackground}<p role="status" class="mt-2 text-xs text-ink-300">Сохранение…</p>{/if}
			{#if backgroundError}<p role="alert" class="mt-2 text-sm text-ink-100">
					{backgroundError}
				</p>{/if}
		</fieldset>
	{/if}
{/snippet}

{#if selectedVersion !== 'disabled' || isEditable}
	<div
		class="relative w-full overflow-hidden {selectedVersion === 'disabled'
			? 'opacity-40 grayscale'
			: ''}"
	>
		<!-- Встраиваемый переключатель версий -->
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="Stage"
			versionKey="stageVersion"
			themeVersions={['v2']}
			themeDefault="dark"
			title="Этапы работы"
			settings={backgroundSettings}
			bind:selectedVersion
		/>

		{#if selectedVersion === 'disabled'}
			<!-- Информационная плашка "Компонент отключен" -->
			<div
				class="absolute inset-0 z-40 flex items-center justify-center bg-ink-950/20 backdrop-blur-[2px]"
			>
				<div
					class="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-brand-500/30 bg-ink-900/90 px-6 py-4 text-center shadow-2xl select-none"
				>
					<div
						class="flex items-center gap-2 text-xs font-bold tracking-wider text-brand-400 uppercase"
					>
						<span class="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-500"></span>
						Блок отключен
					</div>
					<p class="text-[11px] font-medium text-ink-400">
						Этот блок не будет отображаться для обычных (не авторизованных) пользователей.
					</p>
				</div>
			</div>
		{/if}

		<!-- Динамический рендеринг выбранного компонента с эффектом слайдера -->
		{#if selectedVersion === 'v2'}
			<div
				class="w-full"
				in:p1_fly={{ x: 1200, duration: 600 }}
				out:p1_fly={{ x: 1200, duration: 600 }}
			>
				<StageV2 bind:data {editContext} {isEditable} />
			</div>
		{:else}
			<div
				class="w-full"
				in:p1_fly={{ x: -1200, duration: 600 }}
				out:p1_fly={{ x: -1200, duration: 600 }}
			>
				<StageV1 bind:data {editContext} {isEditable} />
			</div>
		{/if}
	</div>
{/if}
