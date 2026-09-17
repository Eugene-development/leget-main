<script lang="ts">
	// Артикул: 1.32.3.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import UniversityMark from './UniversityMark.svelte';
	import { universityApproach as defaults } from './content';
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
	const principles = $derived(
		Array.isArray(data.principles)
			? (data.principles as typeof defaults.principles)
			: defaults.principles
	);
	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'UniversityApproach', updated);
		data = updated;
	}
	async function savePrinciple(index: number, field: string, value: string) {
		await saveField(
			'principles',
			principles.map((item, i) => (i === index ? { ...item, [field]: value } : item))
		);
	}
</script>

{#snippet field(key: 'title' | 'text' | 'linkText')}
	<EditableField
		fieldKey="UniversityApproach.{key}"
		label={{ title: 'Заголовок', text: 'Описание', linkText: 'Текст ссылки' }[key]}
		value={String(data[key] ?? defaults[key])}
		{isEditable}
		inline
		onSave={(v) => saveField(key, v)}
		>{#snippet children(value)}<RichText {value} />{/snippet}</EditableField
	>
{/snippet}

<section
	class="uni uni-approach p1-surface-paper"
	data-p1-theme={isLight ? 'light' : 'dark'}
	aria-label="Об Университете"
>
	<div class="uni-wrap uni-approach-grid">
		<div>
			<UniversityMark class="uni-mark uni-mark-large" />
			<h2 class="uni-section-title p1-title">{@render field('title')}</h2>
		</div>
		<div class="uni-approach-copy">
			<p class="uni-lead p1-body">{@render field('text')}</p>
			{#each principles as principle, i}
				<div class="uni-principle p1-line">
					{#each ['title', 'text'] as key}
						<div class={key === 'title' ? 'uni-principle-title p1-title' : 'p1-body'}>
							<EditableField
								fieldKey="UniversityApproach.principles.{i}.{key}"
								label={key === 'title' ? 'Принцип' : 'Описание принципа'}
								value={principle[key as keyof typeof principle]}
								{isEditable}
								inline
								onSave={(v) => savePrinciple(i, key, v)}
								>{#snippet children(value)}<RichText {value} />{/snippet}</EditableField
							>
						</div>
					{/each}
				</div>
			{/each}
			<a href="#university-disciplines" class="uni-text-link p1-title"
				>{@render field('linkText')}<span aria-hidden="true">↑</span></a
			>
		</div>
	</div>
</section>
