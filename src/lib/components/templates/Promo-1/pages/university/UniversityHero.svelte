<script lang="ts">
	// Артикул: 1.32.1.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import UniversityMark from './UniversityMark.svelte';
	import { universityHero as defaults } from './content';
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
	const disciplines = $derived(
		Array.isArray(data.disciplines)
			? (data.disciplines as typeof defaults.disciplines)
			: defaults.disciplines
	);
	let selected = $state(0);
	const active = $derived(Math.min(selected, Math.max(0, disciplines.length - 1)));
	const uid = $props.id();
	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'UniversityHero', updated);
		data = updated;
	}
	async function saveDiscipline(index: number, field: string, value: string) {
		await saveField(
			'disciplines',
			disciplines.map((item, i) => (i === index ? { ...item, [field]: value } : item))
		);
	}
</script>

{#snippet field(key: keyof typeof defaults, label: string)}
	<EditableField
		fieldKey="UniversityHero.{key}"
		{label}
		value={String(data[key] ?? defaults[key])}
		{isEditable}
		inline
		onSave={(v) => saveField(key, v)}
	>
		{#snippet children(value)}<RichText {value} />{/snippet}
	</EditableField>
{/snippet}

<section
	id="university-disciplines"
	class="uni uni-hero p1-surface-paper"
	data-p1-theme={isLight ? 'light' : 'dark'}
	aria-label="Университет"
>
	<div class="uni-wrap">
		<div class="uni-masthead p1-line">
			<div class="uni-brand p1-title">
				<UniversityMark class="uni-mark" />
				<div class="uni-wordmark">{@render field('brandName', 'Название Универа')}</div>
			</div>
			<p class="uni-brand-caption p1-body">{@render field('brandCaption', 'Подпись логотипа')}</p>
		</div>
		<div class="uni-intro">
			<h1 class="uni-headline p1-title">{@render field('title', 'Заголовок')}</h1>
			<div class="uni-intro-copy">
				<p class="p1-body">{@render field('description', 'Описание')}</p>
				<a class="uni-text-link p1-title" href="#university-reading"
					>{@render field('buttonText', 'Текст ссылки')}<span aria-hidden="true">↗</span></a
				>
			</div>
		</div>
		<div class="uni-studio">
			<div class="uni-curriculum">
				<h2 class="uni-menu-title p1-title p1-title-sub">
					{@render field('menuTitle', 'Заголовок списка')}
				</h2>
				<div class="uni-discipline-list" aria-label="Дисциплины Универа">
					{#each disciplines as discipline, i}
						<div class="uni-discipline p1-line" class:is-selected={active === i}>
							<button
								class="uni-discipline-button"
								type="button"
								aria-expanded={active === i}
								aria-controls="{uid}-discipline-{i}"
								onclick={() => (selected = i)}
								data-goal-ignore="Просмотр дисциплины внутри Hero"
							>
								<span>{discipline.title}</span>
								<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"
									><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" /></svg
								>
							</button>
							<div
								id="{uid}-discipline-{i}"
								class="uni-discipline-detail"
								inert={active !== i}
								aria-hidden={active !== i}
							>
								<div>
									<div class="uni-discipline-inner">
										{#if isEditable}
											<EditableField
												fieldKey="UniversityHero.disciplines.{i}.title"
												label="Название дисциплины"
												value={discipline.title}
												{isEditable}
												richText={false}
												onSave={(v) => saveDiscipline(i, 'title', v)}
												>{#snippet children(value)}{value}{/snippet}</EditableField
											>
										{/if}
										{#each ['question', 'text', 'topics'] as key}
											<div
												class:uni-question={key === 'question'}
												class:uni-topics={key === 'topics'}
												class="p1-body"
											>
												<EditableField
													fieldKey="UniversityHero.disciplines.{i}.{key}"
													label={key === 'question'
														? 'Вопрос дисциплины'
														: key === 'topics'
															? 'Темы дисциплины'
															: 'Описание дисциплины'}
													value={discipline[key as keyof typeof discipline]}
													{isEditable}
													inline
													onSave={(v) => saveDiscipline(i, key, v)}
												>
													{#snippet children(value)}<RichText {value} />{/snippet}
												</EditableField>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
				<p class="uni-menu-hint p1-body">{@render field('disciplineHint', 'Подсказка меню')}</p>
			</div>
			<figure class="uni-portrait p1-body">
				<div class="uni-portrait-image">
					<ImageFallback
						src={String(data.image ?? defaults.image)}
						imagePath={['image']}
						alt={String(data.imageAlt ?? defaults.imageAlt)}
						class="h-full w-full object-cover"
						loading="eager"
						fetchpriority="high"
						width="1024"
						height="1024"
					/>
				</div>
				<figcaption class="p1-title">{@render field('caption', 'Подпись фотографии')}</figcaption>
			</figure>
		</div>
	</div>
</section>
