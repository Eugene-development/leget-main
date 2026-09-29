<script lang="ts">
	import type { Row } from './api';
	let { onSave }: { onSave: (value: Row) => Promise<unknown> } = $props();
	let mode = $state('new');
	let busy = $state(false);
	let error = $state('');
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		const value = Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement));
		busy = true;
		error = '';
		try {
			await onSave(value);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Не удалось назначить менеджера.';
		} finally {
			busy = false;
		}
	}
</script>

<form onsubmit={submit} class="crm-form ym-hide-content" aria-busy={busy}>
	<p class="muted">
		Доступ будет выдан только к выбранному сайту. Клиентские аккаунты не преобразуются в рабочие.
	</p>
	<fieldset disabled={busy} class="crm-fields">
		<legend class="sr-only">Назначение менеджера</legend>
		<label
			><span>Аккаунт менеджера</span><select name="mode" bind:value={mode}
				><option value="new">Создать рабочий аккаунт</option><option value="existing"
					>Назначить существующего менеджера</option
				></select
			></label
		>
		<label
			><span>Рабочий email</span><input
				type="email"
				name="email"
				autocomplete="off"
				required
				maxlength="255"
			/></label
		>
		{#if mode === 'new'}
			<label
				><span>Имя сотрудника</span><input
					name="name"
					autocomplete="off"
					required
					maxlength="255"
				/></label
			>
			<label
				><span>Пароль — от 12 символов</span><input
					type="password"
					name="password"
					autocomplete="new-password"
					required
					minlength="12"
					maxlength="128"
				/></label
			>
			<label
				><span>Повторите пароль</span><input
					type="password"
					name="password_confirmation"
					autocomplete="new-password"
					required
					minlength="12"
					maxlength="128"
				/></label
			>
		{/if}
	</fieldset>
	{#if mode === 'new'}<p class="muted">
			Передайте сотруднику email и пароль лично. Для входа он использует кнопку «Войти» на сайте,
			затем открывает CRM.
		</p>{/if}
	{#if error}<p role="alert" class="crm-error">{error}</p>{/if}
	<button
		type="submit"
		class="primary"
		disabled={busy}
		data-metrika-goal="crm_manager_assign"
		data-goal-action="submit_click">{busy ? 'Назначаем…' : 'Назначить менеджера'}</button
	>
</form>
