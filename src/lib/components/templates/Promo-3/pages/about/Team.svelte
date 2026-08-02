<script lang="ts">
	// Артикул: 3.2.5.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let { data = $bindable(), editContext = null, isEditable = false }: { data: Record<string, unknown>; editContext?: EditContext | null; isEditable?: boolean } = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Team', updated);
		data = updated;
	}

	const defaultTeam = [
		{ name: 'Александр Петров', role: 'Основатель и CEO',       bio: '20 лет в строительной отрасли. Влюблён в итальянский дизайн и архитектуру.' },
		{ name: 'Мария Козлова',    role: 'Главный дизайнер',        bio: 'Архитектор с опытом работы в Милане. Ведёт более 200 дизайн-проектов в год.' },
		{ name: 'Дмитрий Соколов',  role: 'Директор по закупкам',   bio: 'Переговорщик с 15-летним опытом работы с европейскими производителями.' },
	];

	const team = $derived(Array.isArray(data?.team) && (data.team as unknown[]).length > 0 ? (data.team as typeof defaultTeam) : defaultTeam);
</script>

<section class="relative overflow-hidden bg-surface-800/30 py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<div class="mb-16 text-center">
			<EditableField fieldKey="Team.label" label="Лейбл" value={String(data?.label ?? 'Люди')} {isEditable} onSave={(v) => saveField('label', v)}>
				{#snippet children(displayValue)}<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase">{displayValue}</span>{/snippet}
			</EditableField>
			<EditableField fieldKey="Team.heading" label="Заголовок" value={String(data?.heading ?? 'Команда')} {isEditable} onSave={(v) => saveField('heading', v)} class="block">
				{#snippet children(displayValue)}<h2 class="mt-3 font-display text-4xl font-bold tracking-wide text-white lg:text-5xl">{displayValue}</h2>{/snippet}
			</EditableField>
			<EditableField fieldKey="Team.description" label="Описание" value={String(data?.description ?? 'За каждым заказом стоит команда профессионалов, которые искренне любят своё дело.')} {isEditable} multiline onSave={(v) => saveField('description', v)} class="block">
				{#snippet children(displayValue)}<p class="mx-auto mt-4 max-w-xl text-surface-300">{displayValue}</p>{/snippet}
			</EditableField>
		</div>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
			{#each team as member}
				<div class="group rounded-2xl border border-surface-700/50 bg-surface-800/40 p-8 text-center transition-all duration-500 hover:border-accent-500/20 hover:bg-surface-800/70 hover:shadow-2xl hover:shadow-accent-500/5">
					<div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border border-accent-500/20 bg-gradient-to-br from-accent-500/20 to-accent-600/5 font-display text-2xl font-bold text-accent-500 transition-all duration-300 group-hover:border-accent-500/40">
						{member.name.split(' ').map((n: string) => n[0]).join('')}
					</div>
					<h3 class="text-lg font-bold text-white">{member.name}</h3>
					<div class="mt-1 text-xs font-semibold tracking-wider text-accent-500 uppercase">{member.role}</div>
					<p class="mt-4 text-sm leading-relaxed text-surface-300">{member.bio}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
