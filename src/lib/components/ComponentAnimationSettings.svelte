<script lang="ts">
	import { animationsEnabled, motionDescriptions, motionProfile } from '$lib/motion/promo';
	let {
		data = $bindable(),
		componentType,
		onSaveData
	}: {
		data: Record<string, unknown>;
		componentType: string;
		onSaveData: (next: Record<string, unknown>) => void | Promise<void>;
	} = $props();
	let saving = $state(false);
	let error = $state('');
	const enabled = $derived(animationsEnabled(data));
	const hintId = $props.id();
	async function toggle() {
		if (saving) return;
		saving = true;
		error = '';
		// Confirm the server save before updating the shared content blob. Other
		// settings remain usable and cannot be rolled back by a failed motion save.
		const next: Record<string, unknown> = { ...data, animationsEnabled: !enabled };
		try {
			await onSaveData(next);
			data = {
				...data,
				animationsEnabled: next.animationsEnabled,
				_componentId: next._componentId ?? data._componentId
			};
		} catch {
			error = 'Не удалось сохранить настройку. Повторите действие.';
		} finally {
			saving = false;
		}
	}
</script>

<section class="border-t border-on-dark/10 pt-5" aria-busy={saving}>
	<h4 class="text-xs text-on-dark/40 uppercase">Анимации</h4>
	<p id={hintId} class="mt-2 text-xs leading-relaxed text-ink-400">
		{motionDescriptions[motionProfile(componentType)]}
		Настройка действует для всех посетителей. При отключении содержимое остаётся доступным.
	</p>
	<button
		type="button"
		role="switch"
		aria-checked={enabled}
		aria-label="Анимации блока"
		aria-describedby={hintId}
		disabled={saving}
		data-goal-ignore="Настройка анимаций блока в редакторе, не форма обращения"
		onclick={toggle}
		class="mt-3 flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-on-dark/10 bg-on-dark/5 px-3 py-2 text-sm text-ink-200 focus-visible:ring-2 focus-visible:ring-link-400 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
	>
		<span>{enabled ? 'Анимации включены' : 'Анимации выключены'}</span>
		<span
			aria-hidden="true"
			class="inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 {enabled
				? 'bg-link-500'
				: 'bg-ink-600'}"
		>
			<span
				class="size-5 rounded-full bg-surface-raised {enabled ? 'translate-x-5' : 'translate-x-0'}"
			></span>
		</span>
	</button>
	<p class="mt-2 text-xs text-ink-400" role="status">
		{saving ? 'Сохранение…' : 'Изменения сохраняются автоматически.'}
	</p>
	{#if error}<p class="mt-3 text-xs text-cat-6-300" role="alert">{error}</p>{/if}
</section>
