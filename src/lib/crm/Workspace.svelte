<script lang="ts">
	import { untrack, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { createFormSender } from '$lib/utils/form-submission';
	import ContentLoading from '$lib/components/ContentLoading.svelte';
	import NavigationBody from '$lib/components/NavigationBody.svelte';
	import EditForm from './EditForm.svelte';
	import ManagerForm from './ManagerForm.svelte';
	import TemplateEditor from './TemplateEditor.svelte';
	import {
		crmRequest,
		money,
		date,
		dateTime,
		dateTimeInput,
		labels,
		options,
		type Row,
		type Field
	} from './api';
	import './crm.css';
	let { data }: { data: Row } = $props();
	const navigation = [
		['incoming', 'Входящие'],
		['deals', 'Сделки'],
		['clients', 'Клиенты'],
		['companies', 'Компании'],
		['tasks', 'Задачи'],
		['insights', 'Результаты сайта'],
		['automation', 'Правила CRM'],
		['orders', 'Кабинет заказчика'],
		['calculator', 'Калькулятор'],
		['launch', 'Запуск сайта'],
		['members', 'Сотрудники'],
		['settings', 'Настройки']
	];
	const titles: Record<string, string> = Object.fromEntries([
		...navigation,
		['members', 'Сотрудники'],
		['stages', 'Этапы воронки'],
		['templates', 'Шаблоны документов'],
		['unassigned', 'Без привязки к сайту']
	]);
	const base = $derived(String(data.base));
	const route = $derived(page.url.pathname.slice(base.length).split('/').filter(Boolean));
	const section = $derived(route[0] || 'incoming');
	const id = $derived(route[1] || '');
	const sites = $derived<Row[]>(data.context.sites || []);
	const site = $derived(
		String(
			page.url.searchParams.get('site') ||
				sites.find((s) => s.id === data.context.current_site?.id)?.id ||
				sites[0]?.id ||
				''
		)
	);
	const activeSite = $derived(sites.find((s) => s.id === site));
	let dashboard = $state<Row>({ stages: [], members: [], counts: {} });
	let result = $state<Row>({});
	let lookups = $state<Row>({ clients: [], companies: [], templates: [], deals: [], partners: [] });
	let loading = $state(true);
	let error = $state('');
	let notice = $state('');
	let creating = $state(false);
	let busy = $state(false);
	let search = $state('');
	let view = $state('board');
	let stageFilter = $state('');
	let managerFilter = $state('');
	let sourceFilter = $state('');
	let overdue = $state(false);
	let selectedTemplate = $state('');
	let templateEdit = $state(false);
	let duplicateMatches = $state<Row[]>([]);
	let generation = 0;
	let createdRecord: { base: string; site: string; section: string; item: Row } | undefined;
	let detailRefreshing = $state(false);
	let routeController: AbortController | undefined;
	let auxiliaryController: AbortController | undefined;
	let auxiliaryLoading = $state(false);
	let auxiliaryError = $state('');
	let loadedSite = '';
	let dashboardReady = $state(false);
	let duplicateTimer: ReturnType<typeof setTimeout> | undefined;
	let duplicateController: AbortController | undefined;
	let duplicateKey = '';
	type ViewRoute = { base: string; site: string; section: string; id: string; query: string };
	function currentRoute(): ViewRoute {
		return { base, site, section, id, query: page.url.search };
	}
	onDestroy(() => {
		routeController?.abort();
		auxiliaryController?.abort();
		duplicateController?.abort();
		clearTimeout(duplicateTimer);
	});
	let dragging = $state<Row | null>(null);
	let specification = $state<Row[]>([]);
	const canManage = $derived(Boolean(activeSite?.manage));
	const row = $derived<Row | null>(result.item || null);
	const records = $derived<Row[]>(result.items?.data || []);
	const members = $derived(
		(dashboard.members || []).map((v: Row) => ({ value: String(v.id), label: v.name }))
	);
	const stageOptions = $derived(
		(dashboard.stages || [])
			.filter((v: Row) => !v.archived)
			.map((v: Row) => ({ value: v.id, label: v.name }))
	);
	const clientOptions = $derived(
		(lookups.clients || []).map((v: Row) => ({ value: v.id, label: v.name }))
	);
	const companyOptions = $derived(
		(lookups.companies || []).map((v: Row) => ({ value: v.id, label: v.name }))
	);
	const dealOptions = $derived(
		(lookups.deals || []).map((v: Row) => ({ value: v.id, label: v.title }))
	);
	const offlineSender = createFormSender('crm-offline');
	function href(target: string, extra = '') {
		return `${base}/${target}?site=${site}${extra}`;
	}
	function pageHref(number: number) {
		const q = new URLSearchParams(page.url.searchParams);
		q.set('site', site);
		q.set('page', String(number));
		return `${base}/${section}?${q}`;
	}
	function stageName(key: string) {
		return dashboard.stages?.find((s: Row) => s.id === key)?.name || '—';
	}
	function memberName(key: unknown) {
		return dashboard.members?.find((s: Row) => String(s.id) === String(key))?.name || 'Не назначен';
	}
	function sitePath(path: string) {
		return `sites/${site}/${path}`;
	}
	function lookup(resource: string) {
		return async (search: string) => {
			const response = await crmRequest(
				base,
				sitePath(`${resource}?options=1&search=${encodeURIComponent(search)}&per_page=30`)
			);
			return (response.items.data || response.items).map((v: Row) => ({
				value: v.id,
				label: v.name || v.title || v.company || 'Партнёр'
			}));
		};
	}
	function msg(e: unknown) {
		return e instanceof Error ? e.message : 'Не удалось выполнить действие.';
	}

	// Read the complete route synchronously. Never read a new route after an await
	// belonging to its predecessor (including a create -> detail navigation).
	async function refresh(view: ViewRoute = currentRoute()) {
		const turn = ++generation;
		routeController?.abort();
		auxiliaryController?.abort();
		const controller = new AbortController();
		routeController = controller;
		const seed =
			createdRecord?.base === view.base &&
			createdRecord.site === view.site &&
			createdRecord.section === view.section &&
			createdRecord.item.id === view.id
				? createdRecord
				: undefined;
		if (!seed) createdRecord = undefined;
		result = seed ? { item: seed.item } : {};
		detailRefreshing = Boolean(seed);
		specification = seed?.item.specification || [];
		error = '';
		auxiliaryError = '';
		auxiliaryLoading = false;
		if (loadedSite !== view.site) {
			dashboardReady = false;
			dashboard = { stages: [], members: [], counts: {} };
			lookups = { clients: [], companies: [], templates: [], deals: [], partners: [] };
		}
		loadedSite = view.site;
		if (view.section === 'access' || (!view.site && view.section !== 'unassigned')) {
			loading = false;
			return;
		}
		loading = !seed;
		const path = (suffix: string) => `sites/${view.site}/${suffix}`;
		const read = (target: string) =>
			crmRequest(view.base, target, undefined, { signal: controller.signal });
		const isCurrent = () => turn === generation && !controller.signal.aborted;

		try {
			const params = new URLSearchParams({ per_page: '100' });
			const query = new URLSearchParams(view.query);
			for (const key of [
				'page',
				'search',
				'stage_id',
				'assigned_to',
				'source',
				'overdue',
				'history_page',
				'client_id'
			]) {
				const value = query.get(key);
				if (value) params.set(key, value);
			}
			const target =
				view.section === 'unassigned'
					? 'unassigned'
					: view.section === 'settings'
						? path('dashboard')
						: path(`${view.section}${view.id ? '/' + view.id : ''}?${params}`);
			const body = await read(target);
			if (!isCurrent()) return;
			const keepCreated = seed && body.item?.version === seed.item.version;
			// Enrich the new record without replacing the form's initial object mid-typing.
			result = keepCreated ? { ...body, item: result.item } : body;
			if (!keepCreated) specification = body.item?.specification || [];
			if (view.section === 'settings') {
				dashboard = body;
				dashboardReady = true;
			}
			// Related entities already returned by the detail endpoint need no second request.
			if (body.client) lookups.clients = [body.client];
			if (body.item && view.section === 'clients') lookups.clients = [body.item];
			if (body.deals) lookups.deals = body.deals;
			if (body.item && view.section === 'deals') lookups.deals = [body.item];
			loading = false;
			detailRefreshing = false;
			createdRecord = undefined;
			// Metadata is independent: a slow sidebar must not hide an already loaded card.
			if (view.site && view.section !== 'settings') {
				void read(path('dashboard'))
					.then((value) => {
						if (isCurrent()) {
							dashboard = value;
							dashboardReady = true;
						}
					})
					.catch((e) => {
						if (isCurrent()) auxiliaryError = msg(e);
					});
			}
			void loadLookups(view, creating);
		} catch (e) {
			if (!isCurrent()) return;
			controller.abort(); // Do not let metadata repopulate a denied/failed view.
			result = {};
			dashboardReady = false;
			dashboard = { stages: [], members: [], counts: {} };
			lookups = { clients: [], companies: [], templates: [], deals: [], partners: [] };
			createdRecord = undefined;
			error = msg(e);
		} finally {
			if (turn === generation) {
				loading = false;
				detailRefreshing = false;
			}
		}
	}
	async function loadLookups(view: ViewRoute = currentRoute(), forCreate = false) {
		auxiliaryController?.abort();
		const controller = new AbortController();
		auxiliaryController = controller;
		const turn = generation;
		const types =
			view.section === 'companies' && forCreate
				? ['partners']
				: view.section === 'deals'
					? forCreate
						? ['clients']
						: view.id
							? ['companies', 'templates']
							: []
					: view.section === 'tasks' && (view.id || forCreate)
						? ['clients', 'deals']
						: view.section === 'incoming' && view.id
							? ['clients', 'deals']
							: [];
		auxiliaryLoading = types.length > 0;
		auxiliaryError = '';
		await Promise.all(
			types.map(async (key) => {
				try {
					const value = await crmRequest(
						view.base,
						`sites/${view.site}/${key}?options=1&per_page=30`,
						undefined,
						{ signal: controller.signal }
					);
					if (turn === generation && !controller.signal.aborted)
						lookups[key] = value.items?.data || value.items || [];
				} catch (e) {
					if (turn === generation && !controller.signal.aborted) auxiliaryError = msg(e);
				}
			})
		);
		if (turn === generation && !controller.signal.aborted) auxiliaryLoading = false;
	}
	$effect(() => {
		// Explicit dependencies are important: this component is reused by the rest route.
		const view = { base, site, section, id, query: page.url.search };
		if (!browser) return;
		creating = false;
		templateEdit = false;
		notice = '';
		const query = new URLSearchParams(view.query);
		search = query.get('search') || '';
		stageFilter = query.get('stage_id') || '';
		managerFilter = query.get('assigned_to') || '';
		sourceFilter = query.get('source') || '';
		overdue = query.get('overdue') === '1';
		untrack(() => {
			void refresh(view);
		});
		return () => {
			routeController?.abort();
			auxiliaryController?.abort();
			duplicateController?.abort();
			clearTimeout(duplicateTimer);
			duplicateKey = '';
		};
	});

	async function save(path: string, body: Row, goTo?: string) {
		const origin = currentRoute(),
			turn = generation;
		const value = await crmRequest(origin.base, `sites/${origin.site}/${path}`, body);
		// A completed save must not drag a user back from another site/page.
		if (turn !== generation) return value;
		notice = 'Изменения сохранены';
		creating = false;
		if (goTo && value.item?.id) {
			createdRecord = { base: origin.base, site: origin.site, section: goTo, item: value.item };
			await goto(`${origin.base}/${goTo}/${value.item.id}?site=${origin.site}`);
		} else await refresh(origin);
		return value;
	}

	async function action(name: string, body: Row = {}) {
		if (!row) return;
		await save(`${section}/${row.id}/${name}`, { version: row.version, ...body });
	}
	async function run(fn: () => Promise<unknown>) {
		if (busy) return;
		busy = true;
		error = '';
		try {
			await fn();
		} catch (e) {
			error = msg(e);
		} finally {
			busy = false;
		}
	}
	async function begin() {
		creating = !creating;
		if (creating) void loadLookups(currentRoute(), true);
		else auxiliaryController?.abort();
	}
	async function filter(event: SubmitEvent) {
		event.preventDefault();
		const q = new URLSearchParams(page.url.searchParams);
		q.set('site', site);
		for (const key of ['page', 'search', 'stage_id', 'assigned_to', 'source', 'overdue'])
			q.delete(key);
		if (search) q.set('search', search);
		if (stageFilter) q.set('stage_id', stageFilter);
		if (managerFilter) q.set('assigned_to', managerFilter);
		if (sourceFilter) q.set('source', sourceFilter);
		if (overdue) q.set('overdue', '1');
		await goto(`${base}/${section}?${q}`);
	}
	function duplicates(values: Row) {
		const view = currentRoute();
		const phone = String(values.phone || '').trim();
		const email = String(values.email || '').trim();
		const key = `${view.site}:${phone}:${email}`;
		if (key === duplicateKey) return;
		duplicateKey = key;
		clearTimeout(duplicateTimer);
		duplicateController?.abort();
		duplicateMatches = [];
		if (!phone && !email) return;
		duplicateTimer = setTimeout(async () => {
			const controller = new AbortController();
			duplicateController = controller;
			const params = new URLSearchParams();
			if (phone) params.set('phone', phone);
			if (email) params.set('email', email);
			try {
				const response = await crmRequest(
					view.base,
					`sites/${view.site}/duplicates?${params}`,
					undefined,
					{ signal: controller.signal }
				);
				if (!controller.signal.aborted && key === duplicateKey) duplicateMatches = response.items;
			} catch {
				if (!controller.signal.aborted && key === duplicateKey) duplicateMatches = [];
			}
		}, 300);
	}

	async function sendOffline(values: Row) {
		await offlineSender({ ...values, license_id: site }, 'crm-offline');
		notice = 'Заявка принята';
		creating = false;
		await refresh();
	}

	async function drop(stage: Row, event: DragEvent) {
		event.preventDefault();
		const deal = dragging;
		dragging = null;
		if (!deal || deal.stage_id === stage.id) return;
		if (deal.closed_at || stage.kind === 'lost') {
			await goto(href(`deals/${deal.id}`));
			notice = 'Укажите основание перехода в карточке сделки.';
			return;
		}
		await run(() => save(`deals/${deal.id}/stage`, { version: deal.version, stage_id: stage.id }));
	}
	const clientFields: Field[] = [
		{
			key: 'kind',
			label: 'Тип клиента',
			required: true,
			options: options({ person: 'Физическое лицо', organization: 'Организация' })
		},
		{ key: 'name', label: 'Имя / название организации', required: true },
		{ key: 'contact_name', label: 'Контактное лицо' },
		{ key: 'phone', label: 'Телефон', type: 'tel' },
		{ key: 'email', label: 'Email', type: 'email' },
		{ key: 'city', label: 'Город' },
		{ key: 'address', label: 'Адрес' },
		{ key: 'requisites.inn', label: 'ИНН' },
		{ key: 'requisites.bank', label: 'Банк' },
		{ key: 'requisites.account', label: 'Счёт' }
	];
	const companyFields: Field[] = [
		{ key: 'name', label: 'Название компании', required: true },
		{ key: 'inn', label: 'ИНН' },
		{ key: 'contact_name', label: 'Контактное лицо' },
		{ key: 'phone', label: 'Телефон', type: 'tel' },
		{ key: 'email', label: 'Email', type: 'email' },
		{ key: 'address', label: 'Адрес' },
		{ key: 'notes', label: 'Заметки', type: 'textarea' }
	];
	const dealFields = $derived<Field[]>([
		{ key: 'title', label: 'Предмет сделки', required: true },
		{
			key: 'client_id',
			label: 'Клиент',
			required: true,
			options: clientOptions,
			search: lookup('clients')
		},
		{ key: 'assigned_to', label: 'Ответственный', options: members },
		{ key: 'amount', label: 'Сумма, ₽', type: 'number', required: true, min: '0', step: '0.01' },
		{ key: 'due_at', label: 'Срок исполнения', type: 'date' },
		{ key: 'next_action_at', label: 'Следующее действие', type: 'date' },
		{ key: 'contract_number', label: 'Номер договора' },
		{ key: 'contract_date', label: 'Дата договора', type: 'date' },
		{ key: 'signed_at', label: 'Подписан', type: 'date' },
		{ key: 'accepted_at', label: 'Приёмка подтверждена', type: 'date' },
		{ key: 'description', label: 'Описание', type: 'textarea' }
	]);
	const taskFields = $derived<Field[]>([
		{ key: 'title', label: 'Что нужно сделать', required: true },
		{
			key: 'kind',
			label: 'Тип',
			required: true,
			options: options({ task: 'Задача', call: 'Звонок', meeting: 'Встреча', email: 'Письмо' })
		},
		{ key: 'assigned_to', label: 'Ответственный', required: true, options: members },
		{ key: 'due_at', label: 'Срок', type: 'datetime-local', required: true },
		{ key: 'client_id', label: 'Клиент', options: clientOptions, search: lookup('clients') },
		{ key: 'deal_id', label: 'Сделка', options: dealOptions, search: lookup('deals') }
	]);
	const offlineFields: Field[] = [
		{ key: 'name', label: 'Имя', required: true },
		{ key: 'phone', label: 'Телефон', type: 'tel' },
		{ key: 'email', label: 'Email', type: 'email' },
		{ key: 'city', label: 'Город' },
		{
			key: 'channel',
			label: 'Источник',
			required: true,
			options: options({
				call: 'Звонок',
				visit: 'Личное обращение',
				email: 'Email',
				referral: 'Рекомендация',
				other: 'Другой'
			})
		},
		{
			key: 'service_type',
			label: 'Тип обращения',
			required: true,
			options: options({
				consultation: 'Консультация',
				contact: 'Обратная связь',
				'furniture-project': 'Мебель',
				'design-project': 'Дизайн-проект',
				measurement: 'Замер',
				assembly: 'Сборка',
				warranty: 'Гарантия',
				partnership: 'Сотрудничество',
				vacancy: 'Вакансия',
				subscription: 'Подписка'
			})
		},
		{ key: 'message', label: 'Содержание обращения', type: 'textarea' }
	];
	const settingsFields: Field[] = Object.entries({
		name: 'Название организации',
		inn: 'ИНН',
		kpp: 'КПП',
		ogrn: 'ОГРН',
		address: 'Юридический адрес',
		bank: 'Банк',
		bik: 'БИК',
		account: 'Расчётный счёт',
		correspondent: 'Корреспондентский счёт',
		representative: 'Представитель'
	}).map(([key, label]) => ({ key: `requisites.${key}`, label }));
	const historyLabels: Record<string, string> = {
		created: 'Создана запись',
		updated: 'Данные изменены',
		rate: 'Оценка клиента',
		note: 'Заметка',
		stage: 'Изменён этап',
		payment: 'Платёж / возврат',
		company: 'Участник сделки',
		complete: 'Выполнение задачи',
		convert: 'Создана / связана сделка',
		pause: 'Приостановка',
		generated: 'Документ сформирован',
		uploaded: 'Файл добавлен',
		stage_transferred: 'Перенос этапа'
	};
</script>

<svelte:head
	><title>{titles[section] || 'CRM'} — LEGET</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<div class="crm-shell">
	<aside class="crm-sidebar">
		<a class="crm-brand" href={base}>LEGET <span>CRM</span></a>
		{#if sites.length}<label class="crm-site"
				>Рабочий сайт<select
					aria-label="Рабочий сайт"
					value={site}
					onchange={(e) => goto(`${base}/${section}?site=${e.currentTarget.value}`)}
					>{#each sites as s (s.id)}<option value={s.id}>{s.name}</option>{/each}</select
				></label
			>{/if}
		<nav aria-label="Разделы CRM">
			{#each navigation.filter(([key]) => !['members', 'automation', 'calculator', 'launch'].includes(key) || canManage) as [key, label]}<a
					class:active={section === key ||
						(key === 'settings' && ['members', 'stages', 'templates'].includes(section))}
					href={href(key)}
					aria-current={section === key ? 'page' : undefined}
					><span>{label}</span>{#if key === 'incoming' && dashboard.counts?.incoming}<b
							>{dashboard.counts.incoming}</b
						>{/if}{#if key === 'tasks' && dashboard.counts?.overdue}<b>{dashboard.counts.overdue}</b
						>{/if}</a
				>{/each}
			{#if data.context.current_site && !sites.some((s) => s.id === data.context.current_site.id)}<a
					href={`${base}/access`}>Доступ к этому сайту</a
				>{/if}
			{#if data.context.role === 'superadmin'}<a
					class:active={section === 'unassigned'}
					href={href('unassigned')}>Без привязки</a
				>{/if}
		</nav>
		<div class="crm-profile">
			<strong>{data.profile.name}</strong><span
				>{data.context.role === 'superadmin'
					? 'Суперадмин'
					: canManage
						? 'Админ сайта'
						: 'Менеджер'}</span
			><a href={data.context.role === 'superadmin' ? '/admin/study' : '/university/auth'}
				>Обучение</a
			><a href="/">Вернуться на сайт</a>
		</div>
	</aside>
	<main class="crm-main">
		<NavigationBody workspace>
		<header class="crm-header">
			<div>
				{#if id}<a class="back" href={href(section)}>← {titles[section]}</a>{/if}
				<h1>{row?.title || row?.name || row?.user?.name || titles[section] || 'CRM'}</h1>
				<p>
					{id
						? section === 'deals'
							? `${stageName(row?.stage_id)} · ${money(row?.amount)}`
							: 'Карточка и история работы'
						: section === 'incoming'
							? 'Все обращения. Каждое — под контролем.'
							: section === 'deals'
								? 'От первого контакта до исполненного договора'
								: activeSite?.domain || 'Рабочее пространство'}
				</p>
			</div>
			{#if !id && ['incoming', 'clients', 'companies', 'deals', 'tasks', 'stages', 'templates', 'members'].includes(section) && site && (canManage || !['stages', 'templates', 'members'].includes(section))}<button
					class="primary"
					onclick={begin}
					data-metrika-goal="crm_record_form_open"
					data-goal-action="open"
					>{creating
						? 'Закрыть форму'
						: section === 'members'
							? 'Назначить менеджера'
							: section === 'incoming'
								? 'Добавить офлайн-заявку'
								: section === 'templates'
									? 'Создать шаблон'
									: 'Добавить'}</button
				>{/if}
		</header>
		{#if detailRefreshing}<ContentLoading
				><p class="muted" role="status">
					Запись сохранена. Подгружаем историю и связанные данные…
				</p></ContentLoading
			>{/if}
		{#if auxiliaryLoading}<ContentLoading
				><p class="muted" role="status">Подгружаем варианты выбора…</p></ContentLoading
			>{/if}
		{#if auxiliaryError}<div class="crm-notice" role="status">
				{auxiliaryError}
				<button onclick={() => refresh()} data-goal-ignore="Повтор загрузки CRM"
					>Повторить загрузку</button
				>
			</div>{/if}
		{#if notice}<p class="crm-notice" role="status">{notice}</p>{/if}
		{#if error}<div class="crm-error" role="alert">
				<p>{error}</p>
				<button onclick={() => refresh()} data-goal-ignore="Повтор загрузки CRM">Обновить</button>
			</div>{/if}
		{#if section === 'access' || (!site && section !== 'unassigned')}
			<section class="crm-empty">
				<h2>Доступ к CRM</h2>
				<p>Доступ к выбранному сайту назначает его администратор или суперадминистратор LEGET.</p>
				<p>
					Самостоятельных заявок на роль менеджера нет. Обратитесь к администратору за рабочим
					аккаунтом.
				</p>
			</section>
		{:else}
			{#if site && dashboardReady && !dashboard.stages?.length && canManage && !loading}<section
					class="crm-empty"
				>
					<h2>Подготовьте рабочее пространство</h2>
					<p>Создадим начальную воронку. Её названия и промежуточные этапы можно изменить.</p>
					<button
						class="primary"
						onclick={() => run(() => save('initialize', {}))}
						data-goal-ignore="Настройка CRM">Создать воронку</button
					>
				</section>{/if}
			{#if creating}
				<section class="crm-panel">
					<h2>
						{section === 'incoming'
							? 'Новое офлайн-обращение'
							: section === 'members'
								? 'Назначить менеджера'
								: `Новая запись: ${titles[section]?.toLowerCase()}`}
					</h2>
					{#if section === 'members'}
						<ManagerForm onSave={(v) => save('members/assign', v, 'members')} />
					{:else if section === 'templates'}<TemplateEditor
							{base}
							{site}
							onSaved={async () => {
								creating = false;
								await refresh();
							}}
						/>
					{:else if section === 'clients'}
						<EditForm
							fields={clientFields}
							initial={{ kind: 'person' }}
							onChange={duplicates}
							onSave={(v) => save('clients', v, 'clients')}
							submit="Создать карточку"
						/>
						{#if duplicateMatches.length}<div class="crm-notice">
								<strong>Есть похожие клиенты — проверьте перед созданием</strong
								>{#each duplicateMatches as m}<p>
										<a href={href(`clients/${m.id}`)}>{m.name} · {m.phone || m.email}</a>
									</p>{/each}
							</div>{/if}
					{:else if section === 'companies'}
						<EditForm
							fields={[
								...companyFields,
								{
									key: 'partner_profile_id',
									label: 'Связь с партнёром LEGET (необязательно)',
									options: (lookups.partners || []).map((v: Row) => ({
										value: v.id,
										label: v.company || v.inn || 'Партнёр'
									}))
								}
							]}
							onSave={(v) => save('companies', v, 'companies')}
						/>
					{:else if section === 'deals'}<EditForm
							fields={dealFields}
							initial={{ amount: '0', client_id: page.url.searchParams.get('client') }}
							onSave={(v) => save('deals', v, 'deals')}
						/>
					{:else if section === 'tasks'}<EditForm
							fields={taskFields}
							initial={{ kind: 'task', assigned_to: String(data.profile.id) }}
							onSave={(v) => save('tasks', v, 'tasks')}
						/>
					{:else if section === 'incoming'}<EditForm
							fields={offlineFields}
							initial={{ channel: 'call', service_type: 'consultation' }}
							onSave={sendOffline}
							submit="Сохранить заявку"
						/>
					{:else if section === 'stages'}<EditForm
							fields={[
								{ key: 'name', label: 'Название', required: true },
								{ key: 'sort_order', label: 'Порядок', type: 'number', required: true }
							]}
							initial={{ sort_order: 25 }}
							onSave={(v) => save('stages', v)}
						/>{/if}
				</section>
			{/if}
			{#if loading}<ContentLoading label="Загружаем рабочие данные…" />
			{:else if section === 'settings'}
				{#if canManage}<div class="crm-settings-nav">
						<a href={href('members')}>Сотрудники <span>Назначение и отзыв доступа</span></a><a
							href={href('stages')}>Этапы воронки <span>Порядок и правила</span></a
						><a href={href('templates')}>Шаблоны документов <span>Договоры и акты</span></a>
					</div>
					<section class="crm-panel">
						<h2>Реквизиты исполнителя</h2>
						<p class="muted">
							Подставляются в новые документы. Ранее сформированные файлы не изменяются.
						</p>
						{#key dashboard.settings?.version}<EditForm
								fields={settingsFields}
								initial={{
									requisites:
										typeof dashboard.settings?.requisites === 'string'
											? JSON.parse(dashboard.settings.requisites || '{}')
											: dashboard.settings?.requisites || {}
								}}
								onSave={(v) => save('settings', { ...v, version: dashboard.settings?.version })}
							/>{/key}
					</section>
				{:else}<section class="crm-empty">
						<h2>Настройки доступны владельцу</h2>
						<p>Обратитесь к владельцу сайта для изменения команды, этапов и шаблонов.</p>
					</section>{/if}
			{:else if id && row}
				{#key `${row.id}-${row.version}`}
					{#if section === 'clients'}
						<div class="crm-detail-grid">
							<section class="crm-panel">
								<h2>Контакты и реквизиты</h2>
								<EditForm
									fields={clientFields}
									initial={row}
									onSave={(v) => save(`clients/${row.id}`, { ...v, version: row.version })}
								/>
							</section>
							<section class="crm-panel">
								<h2>
									Внутренний рейтинг <span class="crm-rating"
										>{row.rating ? `${row.rating}/10` : '—'}</span
									>
								</h2>
								<p class="muted">Оценка видна только сотрудникам этого сайта.</p>
								<EditForm
									fields={[
										{
											key: 'rating',
											label: 'Оценка от 1 до 10',
											type: 'number',
											min: '1',
											max: '10',
											required: true
										},
										{
											key: 'rating_comment',
											label: 'Основание оценки',
											type: 'textarea',
											required: true
										}
									]}
									initial={{ rating: row.rating }}
									onSave={(v) => action('rate', v)}
									submit="Обновить рейтинг"
								/>
							</section>
						</div>
						<section class="crm-panel">
							<div class="crm-section-heading">
								<h2>Сделки клиента</h2>
								<a href={href('deals', `&client_id=${row.id}`)}>Все сделки</a>
							</div>
							{#each result.deals || [] as d}<a class="crm-record-line" href={href(`deals/${d.id}`)}
									><strong>{d.title}</strong><span>{stageName(d.stage_id)}</span><span
										>{money(d.amount)}</span
									></a
								>{:else}<p class="muted">
									Сделок пока нет. Создайте первую в разделе «Сделки».
								</p>{/each}
						</section>
					{:else if section === 'companies'}<section class="crm-panel">
							<h2>Компания и контактное лицо</h2>
							<EditForm
								fields={companyFields}
								initial={row}
								onSave={(v) =>
									save(`companies/${row.id}`, {
										...v,
										version: row.version,
										partner_profile_id: row.partner_profile_id
									})}
							/>
						</section>
					{:else if section === 'tasks'}<section class="crm-panel">
							<h2>{row.completed_at ? 'Задача выполнена' : 'Задача в работе'}</h2>
							<EditForm
								fields={taskFields}
								initial={{ ...row, due_at: dateTimeInput(row.due_at) }}
								onSave={(v) => save(`tasks/${row.id}`, { ...v, version: row.version })}
							/><button
								disabled={busy}
								onclick={() => run(() => action('complete', { completed: !row.completed_at }))}
								data-goal-ignore="Состояние задачи CRM"
								>{row.completed_at ? 'Вернуть в работу' : 'Отметить выполненной'}</button
							>
						</section>
					{:else if section === 'incoming'}
						<section class="crm-panel">
							<h2>{labels[row.service_type] || row.service_type}</h2>
							<dl class="crm-facts">
								<dt>Контакты</dt>
								<dd>{row.phone || '—'} · {row.email || '—'}</dd>
								<dt>Источник</dt>
								<dd>{labels[row.channel] || row.channel} · {row.site_domain || '—'}</dd>
								<dt>Получена</dt>
								<dd>{date(row.created_at)}</dd>
								<dt>Почта</dt>
								<dd>
									{row.mail_status === 'sent'
										? 'Принята почтовым транспортом'
										: row.mail_status === 'failed'
											? 'Ошибка доставки'
											: row.mail_status === 'legacy'
												? 'Историческая запись'
												: 'Ожидает доставки'}
								</dd>
							</dl>
							<p class="crm-message">{row.message || 'Без сообщения'}</p>
							{#if row.details}<dl class="crm-facts">
									{#each Object.entries(row.details) as [key, value]}<dt>
											{(
												{
													form_title: 'Форма',
													company: 'Компания',
													contract_number: 'Договор',
													object_address: 'Адрес объекта',
													visit_time: 'Время встречи',
													dimensions: 'Размеры',
													position: 'Вакансия'
												} as Row
											)[key] || key}
										</dt>
										<dd>{Array.isArray(value) ? value.join(', ') : String(value)}</dd>{/each}
								</dl>{/if}
							{#each result.attachments || [] as a}<a
									class="crm-record-line"
									href={`${base}/api/sites/${site}/attachments/${a.id}`}
									>{a.name} <span>{Math.ceil(a.size / 1024)} КБ</span></a
								>{/each}
							<EditForm
								fields={[
									{
										key: 'status',
										label: 'Состояние обработки',
										required: true,
										options: options({
											new: 'Новая',
											processed: 'В работе',
											completed: 'Обработана',
											cancelled: 'Нецелевая'
										})
									},
									{ key: 'assigned_to', label: 'Ответственный', options: members }
								]}
								initial={row}
								onSave={(v) => action('process', v)}
							/>
						</section>
						{#if row.crm_deal_id}<p class="crm-notice">
								Заявка связана со <a href={href(`deals/${row.crm_deal_id}`)}>сделкой</a>.
							</p>
						{:else if row.service_type !== 'manager-access'}<section class="crm-panel">
								<h2>Перейти к сделке</h2>
								<p class="muted">
									Выберите существующую сделку либо клиента для новой. <a href={href('clients')}
										>Создать карточку клиента</a
									>
								</p>
								<EditForm
									fields={[
										{
											key: 'deal_id',
											label: 'Существующая сделка',
											options: dealOptions,
											search: lookup('deals')
										},
										{
											key: 'client_id',
											label: 'Клиент для новой сделки',
											options: clientOptions,
											search: lookup('clients')
										},
										{ key: 'title', label: 'Предмет новой сделки' },
										{ key: 'assigned_to', label: 'Ответственный', options: members }
									]}
									initial={{ title: row.message?.slice(0, 100) || 'Обращение ' + row.name }}
									onSave={async (v) => {
										const out = await action('convert', v);
										return out;
									}}
									submit="Связать со сделкой"
								/>
							</section>{/if}
					{:else if section === 'deals'}
						<div class="crm-detail-grid">
							<section class="crm-panel">
								<h2>Движение сделки</h2>
								<p>
									<a href={href(`clients/${row.client_id}`)}>{result.client?.name}</a> · {memberName(
										row.assigned_to
									)}
								</p>
								<EditForm
									fields={[
										{ key: 'stage_id', label: 'Этап', options: stageOptions, required: true },
										{
											key: 'reason',
											label: 'Основание отказа / повторного открытия',
											type: 'textarea'
										}
									]}
									initial={{ stage_id: row.stage_id }}
									onSave={(v) => action('stage', v)}
									submit="Изменить этап"
								/>
								<p class="muted">Для закрытия нужны подпись, полная оплата и приёмка.</p>
							</section>
							<section class="crm-panel">
								<h2>Расчёты</h2>
								<div class="crm-amount">
									<span>Получено</span><strong>{money(result.paid_total)}</strong><span
										>из {money(row.amount)}</span
									>
								</div>
								{#if !row.closed_at}<EditForm
										fields={[
											{
												key: 'kind',
												label: 'Операция',
												options: options({ payment: 'Платёж', refund: 'Возврат / исправление' }),
												required: true
											},
											{
												key: 'amount',
												label: 'Сумма, ₽',
												type: 'number',
												min: '0.01',
												step: '0.01',
												required: true
											},
											{ key: 'paid_at', label: 'Дата', type: 'date', required: true },
											{ key: 'comment', label: 'Основание', required: true }
										]}
										initial={{ kind: 'payment' }}
										onSave={(v) => action('payment', v)}
										submit="Записать операцию"
									/>{/if}
							</section>
						</div>
						<section class="crm-panel">
							<h2>Данные сделки и договора</h2>
							{#if row.closed_at}<p>
									Сделка закрыта {date(row.closed_at)}. Чтобы изменить данные, повторно откройте её
									с основанием.
								</p>{:else}<EditForm
									fields={dealFields}
									initial={row}
									onSave={(v) =>
										save(`deals/${row.id}`, {
											...v,
											version: row.version,
											specification: specification.map((v) => ({ ...v, price: String(v.price) }))
										})}
								/>{/if}
							<h3>Спецификация</h3>
							<div class="crm-spec">
								{#each specification as line, i}<div>
										<input
											aria-label={`Позиция ${i + 1}`}
											placeholder="Наименование"
											bind:value={line.name}
											disabled={!!row.closed_at}
										/><input
											aria-label={`Количество ${i + 1}`}
											type="number"
											min="1"
											bind:value={line.quantity}
											disabled={!!row.closed_at}
										/><input
											aria-label={`Цена ${i + 1}`}
											type="number"
											min="0"
											step="0.01"
											bind:value={line.price}
											disabled={!!row.closed_at}
										/>{#if !row.closed_at}<button
												aria-label={`Удалить позицию ${i + 1}`}
												onclick={() => (specification = specification.filter((_, n) => n !== i))}
												data-goal-ignore="Спецификация CRM">Удалить</button
											>{/if}
									</div>{/each}
							</div>
							{#if !row.closed_at}<button
									onclick={() =>
										(specification = [...specification, { name: '', quantity: 1, price: '0' }])}
									data-goal-ignore="Спецификация CRM">Добавить позицию</button
								><small>Спецификация сохраняется кнопкой «Сохранить» вместе с данными сделки.</small
								>{/if}
						</section>
						<section class="crm-panel">
							<h2>Компании-участники</h2>
							{#each result.companies || [] as c}<div class="crm-record-line">
									<a href={href(`companies/${c.company_id}`)}>{c.company.name}</a><span
										>{c.role} · {labels[c.status] || c.status}</span
									><span>{c.responsibility} {date(c.due_at)}</span>
								</div>{:else}<p class="muted">
									Добавьте участников, чтобы видеть ответственность и сроки.
								</p>{/each}
							<details>
								<summary>Добавить / обновить участника</summary><EditForm
									fields={[
										{
											key: 'company_id',
											label: 'Компания',
											options: companyOptions,
											required: true,
											search: lookup('companies')
										},
										{ key: 'role', label: 'Роль в сделке', required: true },
										{ key: 'contact_name', label: 'Контактное лицо' },
										{ key: 'responsibility', label: 'Зона ответственности' },
										{ key: 'due_at', label: 'Срок', type: 'date' },
										{
											key: 'status',
											label: 'Состояние',
											required: true,
											options: options({
												planned: 'Запланировано',
												working: 'В работе',
												completed: 'Выполнено',
												cancelled: 'Отменено'
											})
										}
									]}
									initial={{ status: 'planned' }}
									onSave={(v) => action('company', v)}
								/>
							</details>
						</section>
						<section class="crm-panel">
							<h2>Документы</h2>
							{#each result.documents || [] as d}<a
									class="crm-record-line"
									href={`${base}/api/sites/${site}/documents/${d.id}/download`}
									><strong>{d.name}</strong><span
										>{date(d.created_at)} · {Math.ceil(d.size / 1024)} КБ</span
									></a
								>{:else}<p class="muted">Документов пока нет.</p>{/each}
							<div class="crm-toolbar">
								<select bind:value={selectedTemplate} aria-label="Опубликованный шаблон"
									><option value="">Выберите шаблон</option
									>{#each lookups.templates.filter((t: Row) => t.published_version) as t}<option
											value={t.id}>{t.name} · версия {t.published_version}</option
										>{/each}</select
								><button
									disabled={!selectedTemplate || busy}
									onclick={() =>
										run(() =>
											save(`deals/${row.id}/documents`, {
												template_id: selectedTemplate,
												version: row.version
											})
										)}
									data-goal-ignore="Генерация документа CRM">Сформировать PDF</button
								>{#if selectedTemplate}<a
										target="_blank"
										rel="noreferrer"
										href={`${base}/api/sites/${site}/deals/${row.id}/preview?template_id=${selectedTemplate}`}
										>Предпросмотр</a
									>{/if}
							</div>
							<label class="crm-upload"
								>Прикрепить договор, акт или другой файл (до 10 МБ)<input
									type="file"
									accept=".pdf,.jpg,.jpeg,.png,.docx"
									disabled={busy}
									onchange={(e) => {
										const file = e.currentTarget.files?.[0];
										if (file)
											void run(async () => {
												const form = new FormData();
												form.set('file', file);
												await crmRequest(base, sitePath(`deals/${row.id}/upload`), form);
												await refresh();
											});
									}}
								/></label
							>
						</section>
						{#if result.payments?.length}<section class="crm-panel">
								<h2>История расчётов</h2>
								{#each result.payments as p}<div class="crm-record-line">
										<span>{date(p.paid_at)}</span><strong
											>{labels[p.kind]} · {money(p.amount)}</strong
										><span>{p.comment}</span>
									</div>{/each}
							</section>{/if}
						{#if !row.closed_at}<section class="crm-panel">
								<h2>{row.paused ? 'Сделка приостановлена' : 'Приостановить работу'}</h2>
								{#if row.paused}<p>{row.pause_reason}</p>
									<button
										onclick={() => run(() => action('pause', { paused: false }))}
										data-goal-ignore="Возобновление сделки CRM">Возобновить</button
									>{:else}<EditForm
										fields={[
											{ key: 'reason', label: 'Причина', required: true },
											{
												key: 'next_action_at',
												label: 'Вернуться к сделке',
												type: 'date',
												required: true
											}
										]}
										onSave={(v) => action('pause', { ...v, paused: true })}
										submit="Приостановить"
									/>{/if}
							</section>{/if}
					{:else if section === 'stages' && canManage}<section class="crm-panel">
							<h2>Настройки этапа</h2>
							<EditForm
								fields={[
									{ key: 'name', label: 'Название', required: true },
									{ key: 'sort_order', label: 'Порядок', type: 'number', required: true }
								]}
								initial={row}
								onSave={(v) => save(`stages/${row.id}`, { ...v, version: row.version })}
							/>{#if !row.system_key && !row.archived}<EditForm
									fields={[
										{
											key: 'replacement_id',
											label: 'Перенести открытые сделки на этап',
											options: stageOptions.filter((s: Row) => s.value !== row.id)
										}
									]}
									onSave={(v) => action('archive', v)}
									submit="Архивировать этап"
								/>{:else}<p class="muted">
									Системные условия этапа сохраняются при изменении названия.
								</p>{/if}
						</section>
					{:else if section === 'templates'}<section class="crm-panel">
							<h2>
								{row.published_version
									? `Опубликована версия ${row.published_version}`
									: 'Черновик'}
							</h2>
							{#if canManage}<TemplateEditor {base} {site} item={row} onSaved={refresh} />{:else}<p
									class="muted"
								>
									Шаблон доступен для генерации в карточке сделки после публикации владельцем.
								</p>{/if}
						</section>
					{:else if section === 'members' && canManage}<section class="crm-panel">
							<h2>Решение по доступу</h2>
							<p>{row.user?.name} · {row.user?.email}</p>
							<p>Статус: {labels[row.status]}</p>
							<EditForm
								fields={[
									{
										key: 'decision',
										label: 'Решение',
										required: true,
										options: options({
											approve: 'Восстановить доступ',
											reject: 'Отклонить',
											revoke: 'Отозвать доступ'
										})
									},
									{
										key: 'reason',
										label: 'Основание (обязательно для отказа и отзыва)',
										type: 'textarea'
									}
								]}
								onSave={(v) => action(v.decision, { reason: v.reason })}
							/>
						</section>{/if}
					{#if ['clients', 'deals'].includes(section)}
						<section class="crm-panel">
							<div class="crm-section-heading">
								<h2>Задачи</h2>
								<a href={href('tasks')}>Открыть задачи</a>
							</div>
							{#each result.tasks || [] as t}<a class="crm-record-line" href={href(`tasks/${t.id}`)}
									><strong>{t.title}</strong><span
										>{dateTime(t.due_at)} · {t.completed_at
											? 'Выполнено'
											: memberName(t.assigned_to)}</span
									></a
								>{:else}<p class="muted">Связанных задач пока нет.</p>{/each}
							<details>
								<summary>Добавить задачу</summary><EditForm
									fields={taskFields}
									initial={{
										kind: 'task',
										assigned_to: String(data.profile.id),
										client_id: section === 'clients' ? row.id : row.client_id,
										deal_id: section === 'deals' ? row.id : null
									}}
									onSave={(v) => save('tasks', v)}
								/>
							</details>
						</section>
						<section class="crm-panel">
							<h2>Обращения</h2>
							{#each result.incoming || [] as incoming}<a
									class="crm-record-line"
									href={href(`incoming/${incoming.id}`)}
									><strong>{labels[incoming.service_type] || incoming.service_type}</strong><span
										>{incoming.message?.slice(0, 120) || incoming.name}</span
									><span>{date(incoming.created_at)}</span></a
								>{:else}<p class="muted">Связанных обращений пока нет.</p>{/each}
						</section>
						{#if section === 'clients' && result.documents?.length}<section class="crm-panel">
								<h2>Документы клиента</h2>
								{#each result.documents as d}<a
										class="crm-record-line"
										href={`${base}/api/sites/${site}/documents/${d.id}/download`}
										><strong>{d.name}</strong><span>{date(d.created_at)}</span></a
									>{/each}
							</section>{/if}
						<section class="crm-panel">
							<h2>История</h2>
							<EditForm
								fields={[
									{ key: 'note', label: 'Добавить заметку', type: 'textarea', required: true }
								]}
								submit="Добавить заметку"
								onSave={(v) => action('note', v)}
							/>
							<ol class="crm-history">
								{#each result.history?.data || [] as event}<li>
										<div>
											<strong>{historyLabels[event.action] || event.action}</strong><time
												>{date(event.created_at)}</time
											><span>{event.data?.actor_name || memberName(event.actor_id)}</span>
										</div>
										{#if event.data?.note}<p>{event.data.note}</p>{/if}{#if event.data?.rating}<p>
												Оценка {event.data.previous_rating || '—'} → {event.data.rating}/10. {event
													.data.rating_comment}
											</p>{/if}{#if event.data?.reason}<p>
												{event.data.reason}
											</p>{/if}{#if event.data?.name}<p>{event.data.name}</p>{/if}
									</li>{/each}
							</ol>
							{#if result.history?.next_page_url}<a
									href={href(
										`${section}/${id}`,
										`&history_page=${result.history.current_page + 1}`
									)}>Более ранние события</a
								>{/if}
						</section>
					{/if}
				{/key}
			{:else}
				{#if section !== 'unassigned'}<form class="crm-filters" onsubmit={filter}>
						<input
							aria-label="Поиск"
							placeholder="Поиск по записям"
							bind:value={search}
						/>{#if section === 'deals'}<select aria-label="Этап" bind:value={stageFilter}
								><option value="">Все этапы</option>{#each stageOptions as s}<option value={s.value}
										>{s.label}</option
									>{/each}</select
							><select aria-label="Источник" bind:value={sourceFilter}
								><option value="">Все источники</option
								>{#each options( { online: 'Сайт', call: 'Звонок', visit: 'Лично', email: 'Email', referral: 'Рекомендация', other: 'Другой', manual: 'Вручную' } ) as o}<option
										value={o.value}>{o.label}</option
									>{/each}</select
							>{/if}{#if ['incoming', 'deals', 'tasks'].includes(section)}<select
								aria-label="Ответственный"
								bind:value={managerFilter}
								><option value="">Все сотрудники</option>{#each members as m}<option value={m.value}
										>{m.label}</option
									>{/each}</select
							>{/if}{#if ['deals', 'tasks'].includes(section)}<label class="crm-check"
								><input type="checkbox" bind:checked={overdue} />Просрочено</label
							>{/if}<button type="submit" data-goal-ignore="Фильтр CRM">Найти</button
						>{#if section === 'deals'}<button
								type="button"
								onclick={() => (view = view === 'board' ? 'table' : 'board')}
								data-goal-ignore="Вид воронки CRM">{view === 'board' ? 'Таблица' : 'Канбан'}</button
							>{/if}
					</form>{/if}
				{#if section === 'deals' && view === 'board' && dashboard.stages?.length}
					<p class="muted">
						{result.items?.total || 0} сделок · карточку можно перенести или открыть и выбрать этап
					</p>
					<div class="crm-board">
						{#each dashboard.stages.filter((s: Row) => !s.archived) as stage}<section
								class="crm-lane"
								aria-label={stage.name}
								ondragover={(e) => e.preventDefault()}
								ondrop={(e) => drop(stage, e)}
							>
								<header>
									<h2>{stage.name}</h2>
									<span>{records.filter((d) => d.stage_id === stage.id).length}</span>
								</header>
								{#each records.filter((d) => d.stage_id === stage.id) as d}<a
										class="crm-deal-card"
										href={href(`deals/${d.id}`)}
										draggable="true"
										ondragstart={() => (dragging = d)}
										ondragend={() => (dragging = null)}
										><strong>{d.title}</strong><span class="crm-card-amount">{money(d.amount)}</span
										><span
											>{lookups.clients.find((c: Row) => c.id === d.client_id)?.name ||
												'Клиент'}</span
										>
										<footer>
											{memberName(d.assigned_to)}<small
												>{d.paused ? 'Приостановлена' : date(d.due_at)}</small
											>
										</footer></a
									>{:else}<p class="crm-lane-empty">Пока нет сделок</p>{/each}
							</section>{/each}
					</div>
				{:else if records.length}<div class="crm-mobile-records">
						{#each records as entry (entry.id)}
							<article>
								{#if section === 'unassigned'}<strong
										>{entry.name || entry.email || 'Обращение'}</strong
									>{:else}<a href={href(`${section}/${entry.id}`)}
										>{entry.title ||
											entry.name ||
											entry.user?.name ||
											entry.email ||
											'Обращение'}</a
									>{/if}
								<p>
									{section === 'clients'
										? entry.phone || entry.email || 'Контакты не указаны'
										: section === 'deals'
											? `${stageName(entry.stage_id)} · ${money(entry.amount)}`
											: section === 'members'
												? `${labels[entry.status]} · ${entry.user?.email}`
												: section === 'templates'
													? entry.published_version
														? `Версия ${entry.published_version}`
														: 'Черновик'
													: section === 'tasks'
														? entry.completed_at
															? 'Выполнена'
															: memberName(entry.assigned_to)
														: labels[entry.status || entry.channel] || entry.contact_name || '—'}
								</p>
								{#if entry.message}<p>{entry.message.slice(0, 140)}</p>{/if}
								<small
									>{section === 'tasks'
										? dateTime(entry.due_at)
										: date(entry.due_at || entry.created_at)}{#if section === 'clients'}
										· Рейтинг {entry.rating ? `${entry.rating}/10` : '—'}{/if}</small
								>
								{#if section === 'unassigned' && site}<button
										onclick={() =>
											run(async () => {
												const reason = window.prompt(
													'Основание привязки заявки к выбранному сайту'
												);
												if (reason)
													await save(`assign-request/${entry.id}`, {
														version: entry.version,
														reason
													});
											})}
										data-goal-ignore="Распределение заявки суперадмином">Привязать к сайту</button
									>{/if}
							</article>
						{/each}
					</div>
					<div class="crm-table-wrap">
						<table class="crm-table">
							<thead
								><tr
									><th
										>{section === 'deals'
											? 'Сделка'
											: section === 'tasks'
												? 'Задача'
												: section === 'members'
													? 'Сотрудник'
													: 'Название / имя'}</th
									><th
										>{section === 'clients'
											? 'Контакты'
											: section === 'deals'
												? 'Этап'
												: 'Состояние / тип'}</th
									><th
										>{section === 'clients'
											? 'Рейтинг'
											: section === 'deals'
												? 'Сумма'
												: 'Ответственный / детали'}</th
									><th>{section === 'stages' ? 'Порядок' : 'Дата'}</th></tr
								></thead
							><tbody
								>{#each records as entry (entry.id)}<tr
										><td
											>{#if section === 'unassigned'}<strong
													>{entry.name || entry.email || 'Обращение'}</strong
												>{:else}<a href={href(`${section}/${entry.id}`)}
													>{entry.title ||
														entry.name ||
														entry.user?.name ||
														entry.email ||
														'Обращение'}</a
												>{/if}{#if section === 'incoming'}<small
													>{entry.message?.slice(0, 100)}</small
												>{/if}</td
										><td
											>{section === 'clients'
												? entry.phone || entry.email || '—'
												: section === 'deals'
													? stageName(entry.stage_id)
													: section === 'stages'
														? entry.archived
															? 'Архив'
															: 'Активен'
														: section === 'tasks'
															? entry.completed_at
																? 'Выполнена'
																: 'В работе'
															: section === 'templates'
																? entry.published_version
																	? `Версия ${entry.published_version}`
																	: 'Черновик'
																: labels[entry.status || entry.kind || entry.channel] ||
																	entry.inn ||
																	'—'}</td
										><td
											>{section === 'clients'
												? entry.rating
													? `${entry.rating}/10`
													: '—'
												: section === 'deals'
													? money(entry.amount)
													: section === 'members'
														? entry.user?.email
														: section === 'companies'
															? entry.contact_name || entry.phone || '—'
															: section === 'incoming'
																? memberName(entry.assigned_to)
																: section === 'tasks'
																	? memberName(entry.assigned_to)
																	: labels[entry.kind] || entry.site_domain || '—'}</td
										><td
											>{section === 'stages'
												? entry.sort_order
												: date(
														entry.due_at || entry.created_at
													)}{#if section === 'unassigned' && site}<button
													onclick={() =>
														run(async () => {
															const reason = window.prompt(
																'Основание привязки заявки к выбранному сайту'
															);
															if (reason)
																await save(`assign-request/${entry.id}`, {
																	version: entry.version,
																	reason
																});
														})}
													data-goal-ignore="Распределение заявки суперадмином"
													>Привязать к сайту</button
												>{/if}</td
										></tr
									>{/each}</tbody
							>
						</table>
					</div>
				{:else}<section class="crm-empty">
						<h2>Здесь пока нет записей</h2>
						<p>
							{section === 'incoming'
								? 'Заявки с форм сайта появятся автоматически. Обращения по телефону или при встрече добавьте вручную.'
								: section === 'templates'
									? 'Создайте шаблон, заполните текст и опубликуйте его для менеджеров.'
									: 'Добавьте первую запись или измените фильтры.'}
						</p>
					</section>{/if}
				{#if result.items?.last_page > 1}<nav class="crm-pagination" aria-label="Страницы">
						<button
							disabled={result.items.current_page <= 1}
							onclick={() => goto(pageHref(result.items.current_page - 1))}
							data-goal-ignore="Страницы CRM">Назад</button
						><span>{result.items.current_page} / {result.items.last_page}</span><button
							disabled={result.items.current_page >= result.items.last_page}
							onclick={() => goto(pageHref(result.items.current_page + 1))}
							data-goal-ignore="Страницы CRM">Далее</button
						>
					</nav>{/if}
			{/if}
		{/if}
		</NavigationBody>
	</main>
</div>
