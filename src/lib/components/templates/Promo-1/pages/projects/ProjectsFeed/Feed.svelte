<script lang="ts">
	// Тело ленты, общее для обеих версий блока 1.26.2.
	//
	// Версии отличаются РОВНО одним: с какого режима просмотра страница
	// открывается. Всё остальное — шапка, пагинация, пустое состояние, обе
	// раскладки — у них общее, и это сказано здесь кодом, а не соглашением:
	// два почти одинаковых файла версий разошлись бы при первой же правке,
	// оставшись одинаковыми на вид.
	//
	// Режим просмотра — выбор ПОСЕТИТЕЛЯ (переключатель в шапке ленты), версия
	// — выбор ВЛАДЕЛЬЦА сайта. Разбор различия в ./data.ts.
	import { isLightBlock } from '$lib/utils/block-theme';
	import FeedEmpty from './FeedEmpty.svelte';
	import FeedPager from './FeedPager.svelte';
	import FeedRows from './FeedRows.svelte';
	import FeedTiles from './FeedTiles.svelte';
	import FeedViewToggle from './FeedViewToggle.svelte';
	import {
		FEED_PAGE_SIZE,
		clearStoredView,
		readStoredView,
		resolveFeedProjects,
		storeView,
		type FeedProject,
		type FeedView
	} from './data';
	import '../../../theme.css';

	let {
		data = $bindable(),
		defaultView
	}: {
		data: Record<string, unknown>;
		/** Режим, с которого лента открывается. Это и есть отличие версий. */
		defaultView: FeedView;
	} = $props();

	const isLight = $derived(isLightBlock(data, 'light'));
	const projects = $derived<FeedProject[]>(resolveFeedProjects(data?.projects));

	// Сколько работ в портфолио ВСЕГО, включая ту, что показана шапкой страницы
	// (`ProjectsHero`). Нужен ровно для одного различения: пустой список при
	// `total > 0` значит «всё уже показано шапкой», и рисовать «Проектов пока
	// нет» в этом случае — прямая ложь. Считает его сервер, здесь только читаем.
	const total = $derived(typeof data?.total === 'number' ? data.total : projects.length);
	const nothingAtAll = $derived(total === 0);

	// Хранится не сам режим, а ВЫБОР посетителя: `null` значит «не выбирал».
	// Копией пропса это состояние быть не должно — тогда смена версии владельцем
	// не доехала бы до уже смонтированного блока, и Svelte о таком захвате
	// справедливо предупреждает. Здесь версия остаётся источником умолчания,
	// а выбор лишь перекрывает его, когда он есть.
	let chosen = $state<FeedView | null>(null);
	const view = $derived(chosen ?? defaultView);

	// Сохранённый выбор применяется ПОСЛЕ гидратации: `localStorage` на сервере
	// нет, да и отдавать SSR по хранилищу конкретного браузера нельзя — ответ
	// страницы кэшируется одним куском на всех посетителей. Поэтому сервер
	// рисует режим версии, а личный выбор встаёт следом.
	//
	// ⚠️ Следствие: у посетителя, который однажды переключил режим, его выбор
	// перекрывает умолчание ЛЮБОЙ версии. Владельцу сайта, сравнивающему
	// варианты в редакторе, обе версии из-за этого покажутся одинаковыми —
	// он и есть такой посетитель. Чтобы увидеть чистое умолчание, достаточно
	// переключить режим обратно: совпав с умолчанием, выбор стирается.
	$effect(() => {
		const stored = readStoredView();
		if (stored) chosen = stored;
	});

	let page = $state(1);

	// Страница не сбрасывается на первую, а поджимается до последней
	// существующей: сброс срабатывал бы на любое обновление `data` — например
	// на переключение темы блока — и выкидывал бы посетителя с третьей
	// страницы посреди просмотра. Смена режима просмотра страницу тоже не
	// сбрасывает: работы те же и в том же порядке, меняется только раскладка.
	$effect(() => {
		const last = Math.max(1, Math.ceil(projects.length / FEED_PAGE_SIZE));
		if (page > last) page = last;
	});

	const from = $derived((page - 1) * FEED_PAGE_SIZE);
	const shown = $derived(projects.slice(from, from + FEED_PAGE_SIZE));

	function pickView(next: FeedView) {
		chosen = next;

		// Выбор, совпавший с умолчанием версии, — это не выбор, а возврат к
		// нему: храним только осознанное отклонение, иначе у посетителя
		// навсегда оседал бы режим, который он и так получил бы сам.
		if (next === defaultView) clearStoredView();
		else storeView(next);
	}
</script>

<!--
	Лента проектов (ProjectsFeed).

	Секции нет вовсе, когда показывать нечего, а сказать «пусто» нельзя: работа
	в портфолио одна и её уже показала шапка страницы. Пустая секция с одними
	отступами оставляла бы 160px мёртвого поля между разворотом и подвалом.
-->
{#if nothingAtAll || projects.length > 0}
	<section class="p1-surface-alt" data-p1-theme={isLight ? 'light' : 'dark'}>
		<div class="pt-10 pb-section-sm sm:pb-section">
			<div class="mx-auto max-w-7xl px-6 lg:px-8">
				<!-- Ни названия, ни счётчика: и то и другое стоит в метке над
				     последней работой (`ProjectsHero`), и повторять их здесь значило бы
				     сказать одно и то же дважды — ровно то, от чего страница уходила.
				     Остаётся переключатель режима: он управляет списком ниже, то есть
				     принадлежит ленте, а не шапке. -->
				{#if projects.length > 0}
					<div class="flex justify-end">
						<FeedViewToggle {view} onpick={pickView} />
					</div>
				{/if}

				{#if nothingAtAll}
					<FeedEmpty />
				{:else if view === 'tiles'}
					<FeedTiles projects={shown} />
				{:else}
					<FeedRows projects={shown} />
				{/if}

				{#if projects.length > 0}
					<FeedPager bind:page total={projects.length} />
				{/if}
			</div>
		</div>
	</section>
{/if}
