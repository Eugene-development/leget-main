<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack, type Snippet } from 'svelte';
	import CrmIcon from './CrmIcon.svelte';
	import { crmRequest } from './api';
	import {
		crmSections,
		crmSiteId,
		setCrmCountsUpdater,
		type CrmCounts,
		type CrmSite
	} from './navigation';
	import './crm.css';

	let {
		data,
		children
	}: {
		data: {
			base: string;
			profile: { name: string };
			context: { sites: CrmSite[]; current_site?: { id: string } | null; role: string };
		};
		children: Snippet;
	} = $props();

	const base = $derived(data.base);
	const sites = $derived(data.context.sites);
	const site = $derived(
		crmSiteId(sites, data.context.current_site?.id, page.url.searchParams.get('site'))
	);
	const activeSite = $derived(sites.find((entry) => entry.id === site));
	const section = $derived(page.url.pathname.slice(base.length).split('/')[1] || 'incoming');
	const feature = $derived(
		['insights', 'promotions', 'automation', 'orders', 'calculator', 'launch'].includes(section)
	);
	const canManage = $derived(Boolean(activeSite?.manage));
	const isSuperadmin = $derived(data.context.role === 'superadmin');
	const visibleSections = $derived(
		crmSections.filter(([key]) => canManage || !['calculator', 'launch', 'members'].includes(key))
	);
	const initials = $derived(
		data.profile.name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0])
			.join('')
			.toUpperCase()
	);
	const roleLabel = $derived(isSuperadmin ? 'Суперадмин' : canManage ? 'Админ сайта' : 'Менеджер');
	const groupTitles: Record<string, string> = {
		incoming: 'Работа',
		insights: 'Сайт',
		members: 'Управление',
		settings: 'Управление'
	};
	let nav = $state<HTMLElement>();

	$effect(() => {
		const current = section;
		const menu = nav;
		if (!current || !menu || !window.matchMedia('(max-width: 720px)').matches) return;
		const active = menu.querySelector('[aria-current="page"]');
		if (active) {
			const bounds = menu.getBoundingClientRect();
			const item = active.getBoundingClientRect();
			if (item.left < bounds.left || item.right > bounds.right)
				menu.scrollLeft += item.left - bounds.left - (bounds.width - item.width) / 2;
		}
	});

	let dashboard = $state<{ site: string; counts: CrmCounts }>();
	const counts = $derived(dashboard?.site === site ? dashboard?.counts : undefined);

	function updateCounts(siteId: string, counts: CrmCounts) {
		if (siteId === activeSite?.id) dashboard = { site: siteId, counts };
	}
	setCrmCountsUpdater(updateCounts);

	$effect(() => {
		const siteId = activeSite?.id;
		const prefix = base;
		// Workspace already loads the dashboard. Fill its badges when opening a feature directly.
		if (!feature || !siteId || untrack(() => dashboard?.site === siteId)) return;
		const controller = new AbortController();
		void crmRequest(prefix, `sites/${siteId}/dashboard`, undefined, { signal: controller.signal })
			.then((result) => {
				if (!controller.signal.aborted) updateCounts(siteId, result.counts || {});
			})
			.catch(() => {});
		return () => controller.abort();
	});

	function href(target = '', selected = site) {
		const path = target ? `${base}/${target}` : base;
		return selected ? `${path}?${new URLSearchParams({ site: selected })}` : path;
	}

	function changeSite(event: Event & { currentTarget: HTMLSelectElement }) {
		const selected = event.currentTarget.value;
		if (feature) {
			const query = new URLSearchParams(page.url.searchParams);
			query.set('site', selected);
			void goto(`${page.url.pathname}?${query}`);
		} else {
			void goto(href(section, selected));
		}
	}
</script>

{#snippet profileLinks()}
	<a href={isSuperadmin ? '/admin/study' : '/university/auth'}>Обучение</a>
	<a href="/">Вернуться на сайт</a>
{/snippet}

<div class="crm-shell">
	<aside class="crm-sidebar">
		<div class="crm-sidebar-top">
			<a class="crm-brand" href={href()}>LEGET <span>CRM</span></a>
			<details class="crm-mobile-profile">
				<summary class="crm-avatar" aria-label="Рабочий аккаунт">{initials}</summary>
				<div class="crm-account-menu">
					<strong>{data.profile.name}</strong>
					<span>{roleLabel}</span>
					{@render profileLinks()}
				</div>
			</details>
		</div>
		{#if sites.length}
			<label class="crm-site">
				Рабочий сайт
				<span class="crm-site-control"
					><select value={site} onchange={changeSite} data-goal-ignore="Выбор рабочего сайта CRM">
						{#each sites as entry (entry.id)}
							<option value={entry.id}>{entry.name}</option>
						{/each}
					</select><CrmIcon name="chevron" /></span
				>
			</label>
		{/if}
		<nav aria-label="Разделы CRM" bind:this={nav}>
			{#each visibleSections as [key, label] (key)}
				{@const active =
					section === key || (key === 'settings' && ['stages', 'templates'].includes(section))}
				{#if groupTitles[key] && (key !== 'settings' || !canManage)}
					<div class="crm-nav-group" aria-hidden="true">{groupTitles[key]}</div>
				{/if}
				<a class:active href={href(key)} aria-current={active ? 'page' : undefined}>
					<CrmIcon name={key} />
					<span>{label}</span>
					{#if key === 'incoming' && counts?.incoming}<b>{counts.incoming}</b>{/if}
					{#if key === 'tasks' && counts?.overdue}<b>{counts.overdue}</b>{/if}
				</a>
			{/each}
			{#if data.context.current_site && !sites.some((entry) => entry.id === data.context.current_site?.id)}
				<a
					class:active={section === 'access'}
					href={`${base}/access`}
					aria-current={section === 'access' ? 'page' : undefined}
					><CrmIcon name="settings" /><span>Доступ к этому сайту</span></a
				>
			{/if}
			{#if isSuperadmin}
				<a
					class:active={section === 'unassigned'}
					href={href('unassigned')}
					aria-current={section === 'unassigned' ? 'page' : undefined}
					><CrmIcon name="unassigned" /><span>Без привязки</span></a
				>
			{/if}
		</nav>
		<div class="crm-profile">
			<div class="crm-profile-user">
				<span class="crm-avatar" aria-hidden="true">{initials}</span>
				<div>
					<strong>{data.profile.name}</strong>
					<span>{roleLabel}</span>
				</div>
			</div>
			<div class="crm-profile-links">{@render profileLinks()}</div>
		</div>
	</aside>
	{@render children()}
</div>
