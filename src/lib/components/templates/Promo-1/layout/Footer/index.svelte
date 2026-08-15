<script lang="ts">
	import FooterV1 from './v1/Footer.svelte';
	import FooterV2 from './v2/Footer.svelte';
	import FooterV3 from './v3/Footer.svelte';
	import ComponentSettingsDrawer from '$lib/components/ComponentSettingsDrawer.svelte';
	import {
		saveComponentData,
		getLayoutComponentArticle,
		type EditContext
	} from '$lib/utils/page-edit';
	import { fly, fade } from 'svelte/transition';

	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false,
		sitePhone = null
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
		sitePhone?: string | null;
	} = $props();

	// Footer (Promo-1) — page-компонент на глобальной странице '__global__':
	// данные сохраняются через saveComponentData (апсёрт идёт на '__global__' через
	// footerEditContext из ComponentResolver). Версия и контент живут в data компонента.
	// Свой переключатель вариантов (вместо общего VersionSwitcher) нужен потому, что
	// сброс тут content-only: сохраняем выбранный вариант. Интерфейс редких операций
	// при этом общий с остальными блоками — через ComponentSettingsDrawer.
	// Версию читаем сразу при инициализации, а не только в $effect: на сервере
	// эффекты не выполняются, и SSR отдавал бы v1 независимо от данных —
	// на живых сайтах это давало подмену версии после гидратации, а каталог
	// /_ds (пререндер) вообще не смог бы показать ничего, кроме v1.
	let selectedVersion = $state<'v1' | 'v2' | 'v3' | 'disabled'>(
		(data?.footerVersion as 'v1' | 'v2' | 'v3' | 'disabled') ?? 'v1'
	);
	let isOpen = $state(false);
	let settingsOpen = $state(false);
	let hasManuallySelected = $state(false);
	let lastEnabledVersion = $state<'v1' | 'v2' | 'v3'>('v1');

	$effect(() => {
		const ver = (data?.footerVersion as 'v1' | 'v2' | 'v3' | 'disabled') ?? 'v1';
		if (!hasManuallySelected && ver !== selectedVersion) {
			selectedVersion = ver;
		}
	});

	$effect(() => {
		if (selectedVersion !== 'disabled') lastEnabledVersion = selectedVersion;
	});

	const versionNumber = (v: unknown): number | null => {
		const m = /^v([1-4])$/.exec(typeof v === 'string' ? v : '');
		return m ? Number(m[1]) : null;
	};

	// Артикул выбранной версии футера (формат {шаблон}.Ф.1.{версия}).
	const footerArticle = $derived(
		editContext?.templateId != null
			? getLayoutComponentArticle(editContext.templateId, 'Footer', versionNumber(selectedVersion))
			: null
	);

	async function selectVersion(version: 'v1' | 'v2' | 'v3' | 'disabled') {
		if (version === selectedVersion) return;
		if (!editContext) {
			selectedVersion = version;
			hasManuallySelected = true;
			return;
		}
		const prevVersion = selectedVersion;
		const prevData = data;
		selectedVersion = version;
		hasManuallySelected = true;
		// Оптимистично: футер переключается мгновенно, на ошибке откатываем
		// и свитчер, и данные.
		const updated = { ...data, footerVersion: version };
		data = updated;
		try {
			await saveComponentData(editContext, 'Footer', updated);
		} catch (err) {
			selectedVersion = prevVersion;
			data = prevData;
			console.error('Ошибка сохранения версии футера:', err);
		}
	}

	function toggleDisabled() {
		selectVersion(selectedVersion === 'disabled' ? lastEnabledVersion : 'disabled');
	}

	// ── Сброс контента футера ──
	// Сбрасываем ТОЛЬКО контент (контакты/соцсети/копирайт), сохраняя выбранный вариант.
	// Не удаляем запись (иначе откатилась бы версия) и не пишем bridge-поля хэдера
	// (logoUrl/disabledRubrics/disabledServices) → пункты меню не затрагиваются.
	const FOOTER_CONTENT_KEYS = [
		'email',
		'address',
		'hours',
		'telegram',
		'whatsapp',
		'siteName'
	] as const;

	let isResetting = $state(false);
	let showConfirmModal = $state(false);

	function handleReset() {
		if (!editContext) return;
		showConfirmModal = true;
	}

	async function confirmReset() {
		if (!editContext || isResetting) return;
		isResetting = true;
		try {
			// Сохраняем только версию — контентные поля исчезают (→ фолбэки ?? в компоненте).
			await saveComponentData(editContext, 'Footer', { footerVersion: selectedVersion });
			// Локально убираем контентные поля, чтобы UI сразу показал дефолты.
			// invalidateAll после сохранений убран — локальный data = cleared
			// теперь единственный источник состояния.
			const cleared: Record<string, unknown> = { ...data };
			for (const key of FOOTER_CONTENT_KEYS) {
				delete cleared[key];
			}
			cleared.footerVersion = selectedVersion;
			data = cleared;
			showConfirmModal = false;
			settingsOpen = false;
		} catch (err) {
			console.error('Ошибка при сбросе контента футера:', err);
			alert(err instanceof Error ? err.message : 'Не удалось сбросить контент');
		} finally {
			isResetting = false;
		}
	}
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div class="relative w-full {selectedVersion === 'disabled' ? 'opacity-40 grayscale' : ''}">
		{#if isEditable && editContext}
			<!-- Общая панель редактора: варианты + настройки, как у основных компонентов. -->
			<div class="absolute top-6 right-6 z-[100] flex items-center gap-2 select-none">
				<div class="relative">
					<button
						type="button"
						class="flex cursor-pointer items-center gap-2 rounded-2xl border border-on-dark/10 bg-ink-950/75 px-4 py-2.5 text-xs font-bold tracking-wider text-on-dark uppercase shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-on-dark/25 active:scale-95"
						onclick={() => (isOpen = !isOpen)}
					>
						<span>Варианты</span>
						<svg
							class="h-3 w-3 transition-transform duration-300 {isOpen ? 'rotate-180' : ''}"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2.5"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>

					{#if isOpen}
						<button
							type="button"
							tabindex="-1"
							class="fixed inset-0 z-40 h-full w-full cursor-default bg-transparent outline-none"
							onclick={() => (isOpen = false)}
							aria-label="Закрыть меню"
						></button>
					{/if}

					{#if isOpen}
						<div
							class="absolute top-12 left-0 z-50 flex w-48 flex-col gap-1 rounded-2xl border border-on-dark/10 bg-ink-950/90 p-1.5 shadow-2xl backdrop-blur-2xl"
							transition:fly={{ y: -10, duration: 200 }}
						>
							<button
								type="button"
								class="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-[10px] font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
								'v1'
									? 'scale-[1.02] border border-on-dark/20 bg-on-dark/15 text-on-dark shadow-md'
									: 'border border-transparent text-ink-400 hover:bg-on-dark/5 hover:text-ink-200'}"
								onclick={() => {
									selectVersion('v1');
									isOpen = false;
								}}
							>
								Вариант 1
							</button>
							<button
								type="button"
								class="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-[10px] font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
								'v2'
									? 'scale-[1.02] border border-link-500/30 bg-gradient-to-r from-link-500/20 to-cat-4-500/20 text-link-200 shadow-md'
									: 'border border-transparent text-ink-400 hover:bg-on-dark/5 hover:text-ink-200'}"
								onclick={() => {
									selectVersion('v2');
									isOpen = false;
								}}
							>
								Вариант 2
							</button>
							<button
								type="button"
								class="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-[10px] font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
								'v3'
									? 'scale-[1.02] border border-cat-8-400/30 bg-cat-8-400/15 text-cat-8-100 shadow-md'
									: 'border border-transparent text-ink-400 hover:bg-cat-8-400/5 hover:text-cat-8-100'}"
								onclick={() => {
									selectVersion('v3');
									isOpen = false;
								}}
							>
								Вариант 3
							</button>
						</div>
					{/if}
				</div>

				<ComponentSettingsDrawer
					bind:open={settingsOpen}
					title="Футер"
					article={footerArticle}
					articleSectionHint="__global__"
					articleComponentHint="Footer"
					canReset
					{isResetting}
					onReset={handleReset}
					isDisabled={selectedVersion === 'disabled'}
					enabledVersionLabel={lastEnabledVersion.replace('v', '')}
					onToggleDisabled={toggleDisabled}
				/>
			</div>
		{/if}

		{#if selectedVersion === 'disabled'}
			<!-- Информационная плашка «Компонент отключен» -->
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

		<!-- Динамический рендер выбранного варианта с эффектом слайдера -->
		{#if selectedVersion === 'v3'}
			<div class="w-full" in:fly={{ y: 120, duration: 600 }} out:fly={{ y: 120, duration: 600 }}>
				<FooterV3 bind:data {editContext} {isEditable} {sitePhone} />
			</div>
		{:else if selectedVersion === 'v2'}
			<div class="w-full" in:fly={{ x: 1200, duration: 600 }} out:fly={{ x: 1200, duration: 600 }}>
				<FooterV2 bind:data {editContext} {isEditable} {sitePhone} />
			</div>
		{:else}
			<div
				class="w-full"
				in:fly={{ x: -1200, duration: 600 }}
				out:fly={{ x: -1200, duration: 600 }}
			>
				<FooterV1 bind:data {editContext} {isEditable} {sitePhone} />
			</div>
		{/if}
	</div>
{/if}

{#if showConfirmModal}
	<div
		class="fixed inset-0 z-[1000] flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-md"
		transition:fade={{ duration: 200 }}
	>
		<button
			type="button"
			class="absolute inset-0 h-full w-full cursor-default border-none bg-transparent outline-none"
			onclick={() => (showConfirmModal = false)}
			aria-label="Закрыть"
		></button>

		<div
			class="font-sans-premium relative z-10 flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-on-dark/10 bg-ink-900/95 p-6 text-center shadow-2xl backdrop-blur-2xl"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<div
				class="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-brand-500/20 bg-brand-500/10 text-brand-400 shadow-[0_0_20px] shadow-brand-500/15"
			>
				<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			</div>

			<div class="flex flex-col gap-2">
				<h3 class="p1-title-sub text-lg text-on-dark uppercase">Сбросить контент футера?</h3>
				<p class="text-xs leading-relaxed font-medium text-ink-400">
					Все изменения контактов, соцсетей и копирайта будут удалены и вернутся к значениям по
					умолчанию. Выбранный вариант дизайна компонента сохранится.
				</p>
			</div>

			<div class="mt-2 flex w-full items-center gap-3">
				<button
					type="button"
					class="flex-1 cursor-pointer rounded-xl border border-on-dark/10 bg-on-dark/5 px-4 py-3 text-xs font-bold tracking-wider text-on-dark uppercase transition-all duration-300 hover:bg-on-dark/10 active:scale-98"
					onclick={() => (showConfirmModal = false)}
				>
					Отмена
				</button>
				<button
					type="button"
					class="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-brand-600 to-cat-6-600 px-4 py-3 text-xs font-bold tracking-wider text-on-accent uppercase transition-all duration-300 hover:shadow-lg hover:shadow-brand-600/20 hover:brightness-110 active:scale-98"
					onclick={confirmReset}
					disabled={isResetting}
				>
					{isResetting ? 'Сброс...' : 'Да, сбросить'}
				</button>
			</div>
		</div>
	</div>
{/if}
