<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import '$lib/crm/crm.css';
	let { data, children }: { data: any; children: Snippet } = $props();
	function selectSite(event: Event) {
		const url = new URL(window.location.href);
		url.searchParams.set('site', (event.target as HTMLSelectElement).value);
		goto(url.pathname + url.search);
	}
</script>

<div class="crm-shell">
	<aside class="crm-sidebar">
		<a class="crm-brand" href={data.base}>LEGET <span>CRM</span></a>
		<label class="crm-site"
			>Рабочий сайт
			<select value={data.siteId} onchange={selectSite} data-goal-ignore="crm-site-context">
				{#each data.context.sites as site (site.id)}<option value={site.id}>{site.name}</option
					>{/each}
			</select>
		</label>
		<nav aria-label="CRM">
			<a href={`${data.base}?site=${data.siteId}`}>Обзор</a>
			<a href={`${data.base}/incoming?site=${data.siteId}`}>Входящие</a>
			<a href={`${data.base}/deals?site=${data.siteId}`}>Сделки</a>
			<a href={`${data.base}/tasks?site=${data.siteId}`}>Задачи</a>
			<a
				class:active={data.section === 'insights'}
				href={`${data.base}/insights?site=${data.siteId}`}>Результаты сайта</a
			>
			<a
				class:active={data.section === 'automation'}
				href={`${data.base}/automation?site=${data.siteId}`}>Правила CRM</a
			>
			<a href={`${data.base}/orders?site=${data.siteId}`}>Кабинет заказчика</a>
			<a href={`${data.base}/calculator?site=${data.siteId}`}>Калькулятор</a>
			<a href={`${data.base}/launch?site=${data.siteId}`}>Запуск сайта</a>
		</nav>
		<div class="crm-profile">
			<strong>{data.profile?.name || 'Рабочий аккаунт'}</strong><a href="/">Открыть сайт</a>
		</div>
	</aside>
	<main class="growth-main">
		{#if !data.siteId}<h1>Выберите рабочий сайт</h1>
			<p>Владелец сайта назначает доступ к его CRM.</p>{:else}{@render children()}{/if}
	</main>
</div>

<style>
	.growth-main {
		min-width: 0;
		padding: 40px;
	}
	@media (max-width: 720px) {
		.growth-main {
			padding: 24px 16px;
		}
	}
</style>
