<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Field, Row } from './api';
	let {
		fields,
		initial = {},
		submit = 'Сохранить',
		onSave,
		onChange
	}: {
		fields: Field[];
		initial?: Row;
		submit?: string;
		onSave: (v: Row) => Promise<unknown>;
		onChange?: (v: Row) => void;
	} = $props();
	let busy = $state(false);
	let message = $state('');
	let choices = $state<Record<string, { value: string; label: string }[]>>({});
	const searches: Record<string, number> = {};
	const searchTimers = new Map<string, ReturnType<typeof setTimeout>>();
	onDestroy(() => {
		for (const timer of searchTimers.values()) clearTimeout(timer);
	});
	function scheduleSearch(field: Field, value: string) {
		clearTimeout(searchTimers.get(field.key));
		searches[field.key] = (searches[field.key] || 0) + 1;
		searchTimers.set(
			field.key,
			setTimeout(() => {
				void search(field, value);
			}, 300)
		);
	}
	async function search(field: Field, value: string) {
		const sequence = (searches[field.key] || 0) + 1;
		searches[field.key] = sequence;
		try {
			const items = await field.search?.(value);
			if (searches[field.key] === sequence && items) choices[field.key] = items;
		} catch {
			message = 'Не удалось найти записи. Повторите поиск.';
		}
	}
	function values(form: HTMLFormElement): Row {
		const data: Row = {};
		for (const field of fields) {
			const value = new FormData(form).get(field.key);
			const normalized = value === '' ? null : value;
			if (field.key.includes('.')) {
				const [parent, child] = field.key.split('.');
				data[parent] ||= {};
				data[parent][child] = normalized;
			} else data[field.key] = normalized;
		}
		return data;
	}
	function getValue(key: string): string {
		let value: any = initial;
		for (const part of key.split('.')) value = value?.[part];
		return String(value ?? '');
	}
	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		busy = true;
		message = '';
		try {
			await onSave(values(event.currentTarget as HTMLFormElement));
			message = 'Сохранено';
		} catch (e) {
			message = e instanceof Error ? e.message : 'Не удалось сохранить.';
		} finally {
			busy = false;
		}
	}
</script>

<form class="crm-form" onsubmit={save} oninput={(e) => onChange?.(values(e.currentTarget))}>
	<div class="crm-fields">
		{#each fields as field (field.key)}
			<label class:wide={field.type === 'textarea'}>
				<span>{field.label}{field.required ? ' *' : ''}</span>
				{#if field.options}
					{#if field.search}<input
							type="search"
							aria-label={`Поиск: ${field.label}`}
							placeholder="Найти запись"
							oninput={(e) => scheduleSearch(field, e.currentTarget.value)}
						/>{/if}
					<select name={field.key} required={field.required} value={String(getValue(field.key))}>
						<option value="">Выберите</option>
						{#if getValue(field.key) && !(choices[field.key] || field.options).some((o) => o.value === String(getValue(field.key)))}<option
								value={getValue(field.key)}>Текущая связанная запись</option
							>{/if}
						{#each choices[field.key] || field.options as option (option.value)}<option
								value={option.value}>{option.label}</option
							>{/each}
					</select>
				{:else if field.type === 'textarea'}
					<textarea
						name={field.key}
						rows="3"
						required={field.required}
						maxlength={Number(field.max || 10000)}
						value={getValue(field.key)}
					></textarea>
				{:else}
					<input
						name={field.key}
						type={field.type || 'text'}
						required={field.required}
						value={getValue(field.key)}
						min={field.min}
						max={field.max}
						step={field.step}
					/>
				{/if}
				{#if field.help}<small>{field.help}</small>{/if}
			</label>
		{/each}
	</div>
	<div class="crm-form-footer">
		<button class="primary" type="submit" disabled={busy} data-goal-ignore="Внутренняя операция CRM"
			>{busy ? 'Сохраняем…' : submit}</button
		>
		<p role="status">{message}</p>
	</div>
</form>
