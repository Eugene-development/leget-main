<script lang="ts">
	// Артикул: 1.П.1.1 — см. docs/architecture/component-articles.md
	import { isLightBlock } from '$lib/utils/block-theme';
	import type { ActiveAction } from '../../../pages/actions/actionCards';
	import '../../../theme.css';

	// Вариант 1 полосы акций — тихая строка над баннером.
	//
	// Одна акция за раз, смена раз в шесть секунд, наведение останавливает
	// ротацию. Полоса стоит на `p1-surface`, а баннер под ней — на
	// `p1-surface-alt`: ступень между ними читается как подложка над баннером,
	// а не как второй баннер. Роли те же, что у баннера, поэтому смена
	// дизайн-системы или темы полосы не требует правок здесь.
	//
	// Содержимое не своё: это активные акции со страницы `/actions`. Полоса их
	// не редактирует и не хранит — только показывает и уводит на страницу.
	let {
		data = {},
		actions = [],
		onClose
	}: {
		data: Record<string, unknown>;
		actions: ActiveAction[];
		onClose: () => void;
	} = $props();

	// Тема читается прямо из пропса, без $state-зеркала: зеркало, заполняемое
	// в $effect, на сервере осталось бы пустым, и SSR всегда отдавал бы дефолт.
	// Ключ свой (`promoTheme`): blob `headerData` полоса делит с баннером и хэдером.
	const isLight = $derived(isLightBlock(data, 'dark', 'promoTheme'));

	let active = $state(0);
	// Наведение (или фокус) на полосе — ротация ждёт: читать бегущую строку,
	// которая уезжает из-под курсора, нельзя.
	let held = $state(false);

	// Индекс живёт дольше списка: акцию могли выключить в редакторе, и список
	// приезжает короче. Остаток по длине держит указатель в границах.

	$effect(() => {
		if (actions.length < 2 || held) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const id = setInterval(() => {
			active = (active + 1) % actions.length;
		}, 6000);

		return () => clearInterval(id);
	});
</script>

<div class="promo-strip" data-p1-theme={isLight ? 'light' : 'dark'}>
	<div
		class="p1-surface p1-line flex h-12 items-center gap-3.5 border-b px-4 sm:px-8 lg:h-10"
		onmouseenter={() => (held = true)}
		onmouseleave={() => (held = false)}
		onfocusin={() => (held = true)}
		onfocusout={() => (held = false)}
		role="complementary"
		aria-label="Акции"
	>
		<span class="p1-label p1-muted hidden whitespace-nowrap lg:inline">Акции</span>
		<span class="p1-line hidden h-3.5 border-l lg:block" aria-hidden="true"></span>

		<!-- Кадр фиксированной высоты: акции лежат друг на друге, видна одна.
		     Все они остаются в разметке, а не подменяются по одной через {#key}:
		     смена по таймеру, а таймер идёт и в фоновой вкладке, где браузер
		     останавливает rAF — уходящий элемент тогда не доигрывает исчезновение
		     и не удаляется, и за несколько тиков в кадре скапливается стопка
		     полупрозрачных строк. Постоянная разметка эту нештатность исключает
		     по построению: DOM не меняется, меняется только прозрачность.
		     Длительность не указана намеренно — голый `transition-opacity` берёт
		     системную (`--default-transition-duration`). -->
		<div class="relative h-5 min-w-0 flex-1">
			{#each actions as action, i (action.id)}
				{@const shown = i === active % actions.length}
				<a
					href="/actions"
					class="absolute inset-0 flex min-w-0 items-center gap-2.5 transition-opacity {shown
						? ''
						: 'pointer-events-none opacity-0'}"
					aria-hidden={shown ? undefined : 'true'}
					tabindex={shown ? undefined : -1}
				>
					<span class="p1-title text-xs font-semibold tracking-[0.02em] whitespace-nowrap">
						{action.badge}
					</span>
					<svg
						viewBox="0 0 2 2"
						class="p1-muted inline h-0.5 w-0.5 shrink-0 fill-current opacity-60"
						aria-hidden="true"
					>
						<circle cx={1} cy={1} r={1} />
					</svg>
					<span class="p1-body truncate text-xs">{action.title}</span>
				</a>
			{/each}
		</div>

		{#if actions.length > 1}
			<div class="hidden items-center gap-1.5 sm:flex">
				{#each actions as action, i (action.id)}
					<!-- Выбранный набран заливкой акцента, невыбранный — границей-линией:
					     тот же приём, что у бегунка выбора в `Incentives/v2`, и по той
					     же причине — это две разные роли, а не два цвета одной. -->
					<button
						type="button"
						onclick={() => (active = i)}
						class="w-3.5 cursor-pointer rounded-full transition-colors {i ===
						active % actions.length
							? 'p1-accent-bg h-px'
							: 'p1-line border-t'}"
						aria-label="Показать акцию «{action.title}»"
					></button>
				{/each}
			</div>
		{/if}

		<a
			href="/actions"
			class="p1-body p1-accent-hover hidden items-center gap-1.5 text-xs whitespace-nowrap transition-colors lg:flex"
		>
			Все акции
			<svg
				class="h-3 w-3 [stroke-width:var(--ds-icon-stroke)]"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M5 12h14M13 6l6 6-6 6" />
			</svg>
		</a>

		<span class="p1-line hidden h-3.5 border-l lg:block" aria-hidden="true"></span>

		<!-- Крестик: на мобильном цель 44×44 (значок остаётся мелким, растёт
		     область нажатия), на десктопе — компактная кнопка в строке. -->
		<button
			type="button"
			onclick={onClose}
			class="p1-muted p1-card-hover p1-accent-hover -mr-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors lg:-mr-1 lg:size-6"
			aria-label="Скрыть акции до конца сессии"
			title="Скрыть до конца сессии"
		>
			<svg
				class="h-3.5 w-3.5 [stroke-width:var(--ds-icon-stroke)]"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M6 6l12 12M18 6L6 18" />
			</svg>
		</button>
	</div>
</div>
