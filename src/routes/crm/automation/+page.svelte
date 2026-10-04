<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { untrack } from 'svelte';
	import InsightsShell from '$lib/growth/InsightsShell.svelte';
	import { crmRequest, dateTime } from '$lib/crm/api';
	let { data } = $props();
	type Draft = {
		id?: string;
		version?: number;
		name: string;
		trigger: string;
		stage_id: string;
		delay_minutes: number;
		due_minutes: number;
		task_title: string;
		assigned_to: string;
		enabled: boolean;
	};
	const blank = (): Draft => ({
		name: '',
		trigger: 'unassigned',
		stage_id: '',
		delay_minutes: 60,
		due_minutes: 1440,
		task_title: '',
		assigned_to: '',
		enabled: true
	});
	let draft = $state<Draft>(blank());
	let busy = $state(false),
		failure = $state(''),
		message = $state('');
	const activeSite = $derived(data.siteId);
	$effect(() => {
		const site = activeSite;
		untrack(() => {
			draft = blank();
			failure = '';
			message = '';
		});
	});
	const names: Record<string, string> = {
		unassigned: 'Заявка без ответственного',
		stage_entered: 'Сделка вошла в этап',
		stale_stage: 'Сделка задержалась на этапе',
		signed: 'Договор подписан',
		paid: 'Заказ полностью оплачен'
	};
	function edit(rule: any) {
		draft = {
			...rule,
			stage_id: rule.stage_id || '',
			task_title: rule.task_title || '',
			assigned_to: rule.assigned_to ? String(rule.assigned_to) : '',
			enabled: !!rule.enabled
		};
		failure = '';
		message = '';
		document.getElementById('rule-name')?.focus();
	}
	function preset(trigger: string) {
		draft = {
			...blank(),
			trigger,
			name: names[trigger],
			delay_minutes: trigger === 'stale_stage' ? 4320 : trigger === 'unassigned' ? 60 : 0,
			task_title: trigger === 'stage_entered' ? 'Подготовить следующий шаг по сделке' : ''
		};
		failure = '';
		message = '';
	}
	async function save(event: SubmitEvent) {
		event.preventDefault();
		busy = true;
		failure = '';
		message = '';
		try {
			await crmRequest(
				data.base,
				`growth/sites/${data.siteId}/automation${draft.id ? `/${draft.id}` : ''}`,
				{
					name: draft.name,
					trigger: draft.trigger,
					stage_id: draft.stage_id || null,
					delay_minutes: Number(draft.delay_minutes),
					due_minutes: Number(draft.due_minutes),
					task_title: draft.task_title || null,
					assigned_to: draft.assigned_to ? Number(draft.assigned_to) : null,
					enabled: draft.enabled,
					version: draft.version
				}
			);
			draft = blank();
			await invalidateAll();
			message = 'Правило сохранено. Проверка выполняется автоматически.';
		} catch (error) {
			failure = (error as Error).message;
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Правила CRM — LEGET</title></svelte:head>
<InsightsShell {data}>
	<h1>Правила CRM</h1>
	<p class="muted">
		Система помогает вовремя разобрать заявку и сделать следующий шаг. При выполнении условия
		появляется уведомление в кабинете; при необходимости — задача в CRM.
	</p>
	{#if data.automation}
		{#if data.automation.rules.length}
			<div class="table-wrap">
				<table>
					<thead
						><tr><th>Правило</th><th>Условие</th><th>Действие</th><th>Состояние</th><th></th></tr
						></thead
					><tbody
						>{#each data.automation.rules as rule (rule.id)}<tr
								><td data-label="Правило"><span class="cell">{rule.name}</span></td><td
									data-label="Условие"
									><span class="cell"
										>{names[rule.trigger]}{#if rule.stage_id}<small
												>{data.automation.stages.find((stage: any) => stage.id === rule.stage_id)
													?.name || 'Этап архивирован'}</small
											>{/if}<small>Через {rule.delay_minutes} мин.</small></span
									></td
								><td data-label="Действие"
									><span class="cell"
										>{rule.task_title || 'Уведомить ответственного'}{#if rule.task_title}<small
												>Срок задачи: {rule.due_minutes} мин.</small
											>{/if}</span
									></td
								><td data-label="Состояние"
									><span class="cell">{rule.enabled ? 'Включено' : 'Выключено'}</span></td
								><td data-label="Настройка"
									><span class="cell"
										>{#if data.automation.manage}<button
												onclick={() => edit(rule)}
												disabled={busy}
												data-goal-ignore="crm-edit-automation-rule">Изменить</button
											>{/if}</span
									></td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>
		{:else}<div class="empty">
				<p>
					Правил пока нет. Начните с заявок без ответственного, затем добавьте действия для этапов
					своей воронки.
				</p>
			</div>{/if}
		{#if data.automation.manage}
			<section class="rule-editor">
				<h2>{draft.id ? 'Изменить правило' : 'Добавить правило'}</h2>
				<div class="presets" aria-label="Готовые условия">
					<button
						onclick={() => preset('unassigned')}
						disabled={busy}
						data-goal-ignore="crm-automation-preset">Заявка без ответственного</button
					>
					<button
						onclick={() => preset('stage_entered')}
						disabled={busy}
						data-goal-ignore="crm-automation-preset">Следующий шаг после этапа</button
					>
					<button
						onclick={() => preset('stale_stage')}
						disabled={busy}
						data-goal-ignore="crm-automation-preset">Напомнить о задержке</button
					>
				</div>
				<form onsubmit={save}>
					<label class="wide"
						>Название <input
							id="rule-name"
							bind:value={draft.name}
							maxlength="120"
							required
						/></label
					>
					<label
						>Когда срабатывает <select bind:value={draft.trigger}
							>{#each Object.entries(names) as [value, label]}<option {value}>{label}</option
								>{/each}</select
						></label
					>
					{#if ['stage_entered', 'stale_stage'].includes(draft.trigger)}<label
							>Этап сделки <select bind:value={draft.stage_id} required
								><option value="">Выберите этап</option
								>{#each data.automation.stages as stage (stage.id)}<option value={stage.id}
										>{stage.name}</option
									>{/each}</select
							></label
						>{/if}
					<label
						>Задержка в минутах <input
							type="number"
							min="0"
							max="525600"
							bind:value={draft.delay_minutes}
							required
						/><small>0 — при ближайшей проверке; 60 — через час; 1440 — через сутки.</small></label
					>
					<label
						>Кому назначить <select bind:value={draft.assigned_to}
							><option value="">Ответственный сделки; иначе владелец</option
							>{#each data.automation.members as member (member.id)}<option
									value={String(member.id)}>{member.name}</option
								>{/each}</select
						></label
					>
					<label class="wide"
						>Задача <input
							bind:value={draft.task_title}
							maxlength="255"
							placeholder="Оставьте пустым, чтобы создать только уведомление"
						/></label
					>
					{#if draft.task_title}<label
							>Срок задачи в минутах <input
								type="number"
								min="1"
								max="525600"
								bind:value={draft.due_minutes}
								required
							/><small>Считается с момента создания задачи.</small></label
						>{/if}
					<label class="check"
						><input type="checkbox" bind:checked={draft.enabled} /> Правило включено</label
					>
					<div class="actions wide">
						<button class="primary" disabled={busy} data-goal-ignore="crm-save-automation-rule"
							>{busy ? 'Сохранение…' : 'Сохранить правило'}</button
						>{#if draft.id}<button
								type="button"
								onclick={() => {
									draft = blank();
									failure = '';
								}}
								disabled={busy}
								data-goal-ignore="crm-cancel-automation-edit">Отменить правку</button
							>{/if}
					</div>
				</form>
				{#if failure}<p role="alert">{failure}</p>{/if}{#if message}<p role="status">
						{message}
					</p>{/if}
			</section>
		{:else}<p>Настройка правил доступна владельцу сайта.</p>{/if}
		<h2>Последние срабатывания</h2>
		{#if data.automation.runs.length}<ol class="runs">
				{#each data.automation.runs as run (run.id)}<li>
						<span
							>{dateTime(run.created_at)} · {data.automation.rules.find(
								(rule: any) => rule.id === run.rule_id
							)?.name || 'Правило'}</span
						>{#if run.task_id}<a href={`${data.base}/tasks/${run.task_id}?site=${data.siteId}`}
								>Открыть задачу</a
							>{:else}<span class="muted">Уведомление создано</span>{/if}
					</li>{/each}
			</ol>{:else}<p>
				Срабатываний пока нет. При повторной проверке одной заявки или одного входа в этап задача и
				уведомление не дублируются.
			</p>{/if}
	{/if}
</InsightsShell>

<style>
	.table-wrap {
		overflow-x: auto;
		margin: 28px 0;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}
	th,
	td {
		padding: 14px 12px;
		border-bottom: 1px solid var(--crm-line);
		vertical-align: top;
	}
	th {
		font-weight: 500;
		color: var(--crm-muted);
	}
	td small {
		display: block;
		margin-top: 5px;
	}
	.rule-editor {
		border-top: 1px solid var(--crm-line);
		margin: 40px 0;
		padding-top: 32px;
	}
	.presets,
	.actions {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin: 16px 0;
	}
	form {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 20px;
		max-width: 900px;
	}
	label {
		display: grid;
		gap: 6px;
	}
	.wide {
		grid-column: 1 / -1;
	}
	.check {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.check input {
		min-height: 20px;
		accent-color: var(--crm-accent);
	}
	.empty {
		padding: 24px 0;
		border-top: 1px solid var(--crm-line);
		border-bottom: 1px solid var(--crm-line);
	}
	.runs {
		list-style: none;
		padding: 0;
	}
	.runs li {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		padding: 14px 0;
		border-bottom: 1px solid var(--crm-line);
	}
	@media (max-width: 720px) {
		form {
			grid-template-columns: 1fr;
		}
		.runs li {
			flex-direction: column;
			gap: 6px;
		}
		.table-wrap {
			overflow: visible;
		}
		table,
		tbody,
		tr,
		td {
			display: block;
		}
		thead {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			overflow: hidden;
			clip-path: inset(50%);
		}
		tbody {
			display: grid;
			gap: 24px;
		}
		tr {
			border-top: 1px solid var(--crm-line);
		}
		td {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			gap: 16px;
			padding: 12px 0;
		}
		td::before {
			content: attr(data-label);
			color: var(--crm-muted);
		}
		td .cell {
			min-width: 0;
			overflow-wrap: anywhere;
		}
	}
</style>
