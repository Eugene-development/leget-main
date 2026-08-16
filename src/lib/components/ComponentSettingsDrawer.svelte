<script lang="ts">
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import ArticleBadge from '$lib/components/ArticleBadge.svelte';
	import ComponentImageManager from '$lib/components/ComponentImageManager.svelte';
	import type { EditContext } from '$lib/utils/page-edit';
	import {
		fetchComponentRoles,
		fetchBlockIdentity,
		saveBlockIdentity,
		resolveBlockName,
		blockNameFromMorph,
		describeMorph,
		type ComponentRole
	} from '$lib/utils/block-identity';

	/**
	 * Панель настроек блока: артикул, анимации, сброс контента, отключение.
	 *
	 * Рендерит и компактную кнопку-триггер (встраивается в панель инструментов блока),
	 * и саму выезжающую панель. Эталон интерфейса — баннер Promo-1: узкому блоку не
	 * подходит ряд кнопок поверх контента, поэтому редкие операции ушли в SideDrawer,
	 * а снаружи остались только выбор варианта и тумблер темы.
	 *
	 * Компонент не знает, как сохраняются данные: сброс и отключение приходят
	 * колбэками от владельца (VersionSwitcher).
	 */
	let {
		open = $bindable(false),
		fallbackTitle,
		morph = null,
		article = null,
		articleSectionHint = null,
		articleComponentHint = null,
		canReset = false,
		isResetting = false,
		onReset,
		isDisabled = false,
		enabledVersionLabel = null,
		onToggleDisabled,
		data = $bindable({}),
		editContext = null,
		componentType = '',
		onSaveData = null
	}: {
		/** Открыта ли панель. Владелец может закрыть её извне (напр. после сброса). */
		open?: boolean;
		/**
		 * Имя блока из шаблона («Главный экран») — предпоследняя ступень каскада
		 * подписи. Уступает имени от тенанта и выбранной роли: оно назначено тогда,
		 * когда назначение блока ещё не было известно.
		 */
		fallbackTitle: string;
		/** Конструкция активной версии; последняя ступень каскада и строка «Конструкция». */
		morph?: string | null;
		/** Артикул активной версии; null — строка артикула не показывается. */
		article?: string | null;
		/** Подпись к сегменту страницы в тултипе артикула (slug). */
		articleSectionHint?: string | null;
		/** Подпись к сегменту компонента в тултипе артикула (тип блока). */
		articleComponentHint?: string | null;
		/** Есть ли что сбрасывать (блок редактировался). */
		canReset?: boolean;
		isResetting?: boolean;
		onReset: () => void;
		/** Текущее состояние блока: отключён для обычных посетителей. */
		isDisabled?: boolean;
		/** Вариант, который вернётся при включении («2» → «вариант 2»). */
		enabledVersionLabel?: string | null;
		onToggleDisabled: () => void;
		/** JSON-данные блока для универсального управления изображениями. */
		data?: Record<string, unknown>;
		editContext?: EditContext | null;
		componentType?: string;
		onSaveData?: ((next: Record<string, unknown>) => void | Promise<void>) | null;
	} = $props();

	// ── Имя и назначение блока ────────────────────────────────────────────────
	// Тип компонента (`Incentives`) человеку не показывается: он присвоен тогда,
	// когда назначение блока ещё не было известно, и потому врёт. Подпись даёт
	// каскад label → роль → имя из шаблона → конструкция.
	let roles = $state<ComponentRole[]>([]);
	let label = $state('');
	let roleSlug = $state('');
	// Сознательно не $state — тот же случай, что с `articleLoaded` в VersionSwitcher:
	// флаг читается внутри эффекта-загрузчика, и реактивная запись перезапускала бы
	// его же. При сбросе флага после неудачи это дало бы бесконечный повтор запроса,
	// пока панель открыта.
	let identityLoaded = false;
	let identityState = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let identityError = $state<string | null>(null);
	// Что уже лежит на сервере. Нужно, чтобы `onblur` не слал мутацию, когда тенант
	// просто открыл и закрыл панель: каждое сохранение сбрасывает кэш renderPage
	// всей лицензии, и холостой сброс стоил бы сайту пересборки всех страниц.
	let persisted = { label: '', roleSlug: '' };

	// Загружаем при открытии, а не при монтировании: панель есть у каждого блока
	// страницы, и предзагрузка стоила бы запроса на блок ради данных, которые
	// в закрытой панели никто не увидит. Запрос идёт под @guard — гостю не уйдёт.
	$effect(() => {
		// Проверять isEditable не нужно: вся разметка свитчера, включая эту панель,
		// живёт под `{#if isEditable && editContext}` — гость её не монтирует.
		if (!open || identityLoaded || !editContext || !componentType) return;
		identityLoaded = true;

		fetchComponentRoles()
			.then((list) => (roles = list))
			.catch(() => (roles = []));

		fetchBlockIdentity(editContext.licenseId, editContext.pageId, componentType)
			.then((identity) => {
				label = identity.label ?? '';
				roleSlug = identity.roleSlug ?? '';
				persisted = { label, roleSlug };
			})
			.catch(() => {
				// Не получилось — снимаем флаг, чтобы повторить при следующем открытии.
				identityLoaded = false;
			});
	});

	/** Что встанет в подпись, если тенант оставит поле пустым. */
	const nameWithoutLabel = $derived(
		resolveBlockName({ roleSlug, roles, morph, fallback: fallbackTitle })
	);
	const blockName = $derived(
		resolveBlockName({ label, roleSlug, roles, morph, fallback: fallbackTitle })
	);
	const morphDescription = $derived(describeMorph(morph));
	const morphName = $derived(blockNameFromMorph(morph));

	/** Роли, сгруппированные для списка выбора: 50+ ролей плоским списком не выбираются. */
	const roleGroups = $derived.by(() => {
		const grouped = new Map<string, { name: string; items: ComponentRole[] }>();
		for (const role of roles) {
			const bucket = grouped.get(role.group) ?? { name: role.groupName, items: [] };
			bucket.items.push(role);
			grouped.set(role.group, bucket);
		}
		return [...grouped.values()];
	});

	async function saveIdentity() {
		if (!editContext || !componentType) return;
		if (label === persisted.label && roleSlug === persisted.roleSlug) return;

		identityState = 'saving';
		identityError = null;

		try {
			const saved = await saveBlockIdentity(
				editContext.licenseId,
				editContext.pageId,
				componentType,
				{ label, roleSlug: roleSlug || null }
			);
			// Забираем нормализованные сервером значения: он режет пробелы и длину,
			// и поле должно показывать то, что действительно сохранилось.
			label = saved.label ?? '';
			roleSlug = saved.roleSlug ?? '';
			persisted = { label, roleSlug };
			identityState = 'saved';
		} catch (error) {
			identityState = 'error';
			identityError = error instanceof Error ? error.message : 'Не удалось сохранить';
		}
	}
</script>

<!-- Компактный триггер: становится в один ряд с «Вариантами» и тумблером темы -->
<button
	type="button"
	class="flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-slate-950/75 p-2.5 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/25 active:scale-95"
	onclick={() => (open = true)}
	title="Настройки блока"
	aria-label="Настройки блока"
>
	<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
		<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
		<circle cx="9" cy="6" r="2" fill="currentColor" />
		<circle cx="15" cy="12" r="2" fill="currentColor" />
		<circle cx="8" cy="18" r="2" fill="currentColor" />
	</svg>
</button>

<SideDrawer bind:open title={blockName}>
	<div class="flex flex-col gap-6">
		<!-- Имя и назначение блока на этом сайте -->
		{#if editContext && componentType}
			<section>
				<h4 class="text-[10px] text-white/40 uppercase">Имя блока</h4>
				<p class="mt-2 text-xs leading-relaxed text-slate-400">
					Как блок называется у вас в панели. На сайте это имя не показывается.
				</p>
				<input
					type="text"
					bind:value={label}
					onblur={saveIdentity}
					maxlength="120"
					placeholder={nameWithoutLabel}
					class="mt-3 w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-white/30 focus:outline-none"
					aria-label="Имя блока"
				/>

				<h4 class="mt-5 text-[10px] text-white/40 uppercase">Назначение</h4>
				<p class="mt-2 text-xs leading-relaxed text-slate-400">
					Чем этот блок работает. Влияет на подпись и подбор замены; тексты и картинки не меняются.
				</p>
				<select
					bind:value={roleSlug}
					onchange={saveIdentity}
					class="mt-3 w-full cursor-pointer rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none"
					aria-label="Назначение блока"
				>
					<option value="" class="bg-slate-900">Не выбрано</option>
					{#each roleGroups as group (group.name)}
						<optgroup label={group.name}>
							{#each group.items as role (role.slug)}
								<option value={role.slug} class="bg-slate-900">{role.name}</option>
							{/each}
						</optgroup>
					{/each}
				</select>

				{#if identityState === 'saving'}
					<p class="mt-2 text-xs text-slate-400">Сохранение…</p>
				{:else if identityState === 'saved'}
					<p class="mt-2 text-xs text-emerald-300">Сохранено</p>
				{:else if identityState === 'error'}
					<p class="mt-2 text-xs text-red-300">{identityError}</p>
				{/if}

				{#if morphName}
					<!-- Последняя ступень каскада, показанная явно: тенант должен видеть,
					     что подпись не берётся из воздуха, а описывает саму конструкцию. -->
					<p class="mt-3 text-xs leading-relaxed text-slate-500">
						Конструкция: {morphName}{morphDescription ? ` — ${morphDescription}` : ''}
					</p>
				{/if}
			</section>
		{/if}

		<!-- Артикул выбранной версии -->
		{#if article}
			<div class="flex items-center gap-2">
				<span class="text-[10px] font-semibold tracking-[0.2em] text-white/40 uppercase">
					Артикул
				</span>
				<ArticleBadge
					{article}
					sectionLabel="Страница"
					sectionHint={articleSectionHint}
					componentHint={articleComponentHint}
					align="left"
				/>
			</div>
		{/if}

		<!-- Анимации (заглушка: функциональность в разработке) -->
		<section class="border-white/10 pt-5 {article ? 'border-t' : ''}">
			<h4 class="text-[10px] text-white/40 uppercase">Анимации</h4>
			<p class="mt-2 text-xs leading-relaxed text-slate-400">
				Включение и отключение анимаций блока. Функция появится в одном из ближайших обновлений.
			</p>
			<button
				type="button"
				class="mt-4 flex w-full cursor-not-allowed items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-xs font-bold tracking-wider text-slate-500 uppercase"
				disabled
				aria-disabled="true"
			>
				<span>Отключить анимации</span>
				<span
					class="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-[9px] font-bold tracking-wider text-amber-300/80 uppercase"
				>
					В разработке
				</span>
			</button>
		</section>

		<!-- Сброс контента -->
		{#if editContext && componentType && onSaveData}
			<ComponentImageManager bind:data {editContext} {componentType} {onSaveData} />
		{/if}

		<!-- Сброс контента -->
		<section class="border-t border-white/10 pt-5">
			<h4 class="text-[10px] text-white/40 uppercase">Контент</h4>
			<p class="mt-2 text-xs leading-relaxed text-slate-400">
				{#if canReset}
					Сброс вернёт тексты и изображения блока к значениям по умолчанию. Выбранный вариант и тема
					не изменятся.
				{:else}
					Контент блока не изменялся — сбрасывать нечего.
				{/if}
			</p>
			<button
				type="button"
				class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-bold tracking-wider text-red-300 uppercase transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/3 disabled:text-slate-500 disabled:hover:bg-white/3 {canReset
					? 'cursor-pointer'
					: ''}"
				onclick={onReset}
				disabled={isResetting || !canReset}
			>
				<svg
					class="h-3.5 w-3.5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M4 4v6h6M20 20v-6h-6M5 14a7.5 7.5 0 0 0 12.32 2.5M19 10A7.5 7.5 0 0 0 6.68 7.5"
					/>
				</svg>
				{isResetting ? 'Сброс...' : 'Сбросить контент'}
			</button>
		</section>

		<!-- Отключение блока -->
		<section class="border-t border-white/10 pt-5">
			<h4 class="text-[10px] text-white/40 uppercase">Блок</h4>
			<p class="mt-2 text-xs leading-relaxed text-slate-400">
				{#if isDisabled}
					Блок отключён и не отображается обычным посетителям.
					{#if enabledVersionLabel}Включение вернёт вариант {enabledVersionLabel}.{/if}
				{:else}
					Отключённый блок остаётся виден вам в режиме редактирования, но не показывается обычным
					посетителям.
				{/if}
			</p>
			<button
				type="button"
				class="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold tracking-wider uppercase transition-all duration-300 active:scale-[0.98] {isDisabled
					? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:border-emerald-500/45 hover:bg-emerald-500/20'
					: 'border-red-500/20 bg-red-500/5 text-red-300 hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-200'}"
				onclick={onToggleDisabled}
			>
				<span class="h-2 w-2 rounded-full {isDisabled ? 'bg-emerald-400' : 'bg-red-500'}"></span>
				{isDisabled ? 'Включить блок' : 'Отключить блок'}
			</button>
		</section>
	</div>
</SideDrawer>
