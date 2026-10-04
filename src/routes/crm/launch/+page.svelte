<script lang="ts">
	import { untrack } from 'svelte';
	import GrowthFrame from '$lib/growth/GrowthFrame.svelte';
	import { crmRequest, type Row } from '$lib/crm/api';
	let { data } = $props();
	let checklist = $state<Row>(untrack(() => data.checklist)),
		busy = $state(''),
		failure = $state('');
	$effect(() => {
		const next = data.checklist;
		untrack(() => {
			checklist = next;
			busy = '';
			failure = '';
		});
	});
	async function acknowledge(key: string, checked: boolean) {
		if (busy) return;
		busy = key;
		failure = '';
		const site = data.site;
		try {
			const next = await crmRequest(data.base, `portal/sites/${site}/launch`, {
				check_key: key,
				checked
			});
			if (site === data.site) checklist = next;
		} catch (e) {
			if (site === data.site)
				failure = e instanceof Error ? e.message : 'Не удалось сохранить проверку.';
		} finally {
			if (site === data.site) busy = '';
		}
	}
	function checkHref(path: string) {
		return path.startsWith('/crm')
			? path.replace(/^\/crm/, data.base)
			: new URL(path, `https://${data.domain}`).href;
	}
</script>

<svelte:head><title>Запуск сайта — CRM</title></svelte:head>
<GrowthFrame title="Запуск сайта" sites={data.sites} site={data.site} base={data.base}>
	<p>
		Готово {checklist.ready} из {checklist.total} проверок. Настройки проверяются автоматически. Проверку
		страниц и устройства подтвердите после просмотра.
	</p>
	{#if failure}<p role="alert" class="growth-error">{failure}</p>{/if}
	{#each checklist.checks as check (check.key)}<section class="growth-check">
			{#if check.manual}<label class="growth-checkbox-target"
					><input
						type="checkbox"
						checked={check.ready}
						disabled={!!busy}
						onchange={(e) => {
							const next = e.currentTarget.checked;
							e.currentTarget.checked = Boolean(check.ready);
							void acknowledge(check.key, next);
						}}
						aria-label={`Подтвердить: ${check.title}`}
						data-goal-ignore="Подтверждение ручной проверки готовности сайта"
					/></label
				>{:else}<span
					class="growth-status"
					aria-label={check.ready ? 'Готово' : 'Требует настройки'}
					>{#if check.ready}<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"><path d="m5 12 4 4 10-10" /></svg
						>{/if}</span
				>{/if}
			<div>
				<strong>{check.title}</strong>
				<p class="growth-note">{check.detail}</p>
			</div>
			<a href={checkHref(check.href)}>Проверить</a>
		</section>{/each}
</GrowthFrame>
