<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import './growth.css';
	let {
		title,
		sites,
		site,
		children,
		base = '/crm'
	} = $props<{
		title: string;
		sites: { id: string; name?: string; domain: string; manage?: boolean }[];
		site: string;
		children: Snippet;
		base?: string;
	}>();
	const links = [
		['incoming', 'Входящие'],
		['deals', 'Сделки'],
		['insights', 'Результаты сайта'],
		['automation', 'Правила CRM'],
		['orders', 'Кабинет заказчика'],
		['calculator', 'Калькулятор'],
		['launch', 'Запуск сайта']
	];
	const activeSite = $derived(
		sites.find((s: { id: string; domain: string; manage?: boolean }) => s.id === site)
	);
	const visibleLinks = $derived(
		links.filter(
			([key]) => !['automation', 'calculator', 'launch'].includes(key) || activeSite?.manage
		)
	);
	function changeSite(event: Event) {
		const url = new URL(page.url);
		url.searchParams.set('site', (event.target as HTMLSelectElement).value);
		void goto(`${url.pathname}${url.search}`);
	}
</script>

<div class="growth-shell">
	<aside class="growth-nav">
		<a class="growth-brand" href={`${base}?site=${site}`}>LEGET · CRM</a>
		<label
			>Сайт<select
				value={site}
				onchange={changeSite}
				data-goal-ignore="Выбор сайта в рабочем разделе"
				>{#each sites as s (s.id)}<option value={s.id}>{s.name || s.domain}</option>{/each}</select
			></label
		>
		<nav aria-label="Разделы CRM">
			{#each visibleLinks as link (link[0])}<a
					href={`${base}/${link[0]}?site=${site}`}
					aria-current={page.url.pathname === `${base}/${link[0]}` ? 'page' : undefined}
					>{link[1]}</a
				>{/each}
		</nav>
		<a href={`https://${activeSite?.domain || ''}`}>Открыть сайт</a>
	</aside>
	<main class="growth-main">
		<h1>{title}</h1>
		{@render children()}
	</main>
</div>
