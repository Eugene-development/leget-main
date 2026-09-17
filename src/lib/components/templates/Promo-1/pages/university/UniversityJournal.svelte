<script lang="ts">
	// Артикул: 1.32.2.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { universityJournal as defaults } from './content';
	import '../../theme.css';
	import './university.css';
	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();
	const isLight = $derived(isLightBlock(data, 'light'));
	const notes = $derived(
		Array.isArray(data.notes) ? (data.notes as typeof defaults.notes) : defaults.notes
	);
	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'UniversityJournal', updated);
		data = updated;
	}
	async function saveNote(index: number, field: string, value: string) {
		await saveField(
			'notes',
			notes.map((item, i) => (i === index ? { ...item, [field]: value } : item))
		);
	}
</script>

{#snippet field(key: 'title' | 'description')}
	<EditableField
		fieldKey="UniversityJournal.{key}"
		label={key === 'title' ? 'Заголовок' : 'Описание'}
		value={String(data[key] ?? defaults[key])}
		{isEditable}
		inline
		onSave={(v) => saveField(key, v)}
		>{#snippet children(value)}<RichText {value} />{/snippet}</EditableField
	>
{/snippet}
{#snippet noteField(index: number, key: keyof (typeof defaults.notes)[number])}
	<EditableField
		fieldKey="UniversityJournal.notes.{index}.{key}"
		label={{
			category: 'Дисциплина',
			title: 'Название заметки',
			intro: 'Вступление',
			text: 'Текст заметки'
		}[key]}
		value={notes[index][key]}
		{isEditable}
		inline
		onSave={(v) => saveNote(index, key, v)}
		>{#snippet children(value)}<RichText {value} />{/snippet}</EditableField
	>
{/snippet}

<section
	id="university-reading"
	class="uni uni-journal p1-surface"
	data-p1-theme={isLight ? 'light' : 'dark'}
	aria-label="Учебные заметки"
>
	<div class="uni-wrap">
		<div class="uni-section-heading">
			<h2 class="uni-section-title p1-title">{@render field('title')}</h2>
			<p class="p1-body">{@render field('description')}</p>
		</div>
		<div class="uni-notes">
			{#each notes as note, i}
				<article class="uni-note p1-line">
					<div class="uni-note-category p1-accent">{@render noteField(i, 'category')}</div>
					<div class="uni-note-body">
						<h3 class="uni-note-title p1-title p1-title-sub">{@render noteField(i, 'title')}</h3>
						<p class="p1-body">{@render noteField(i, 'intro')}</p>
						<details class="uni-reading" open={isEditable}>
							<summary class="p1-title"
								>Читать заметку <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"
									><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" /></svg
								></summary
							>
							<div class="uni-reading-text p1-body">{@render noteField(i, 'text')}</div>
						</details>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>
