<script lang="ts">
	// Артикул: 1.1.10.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import BlockThemeToggle from '$lib/components/BlockThemeToggle.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { createThemeToggle, isLightBlock } from '$lib/utils/block-theme';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	type FAQItem = { question: string; answer: string };
	const uid = $props.id();
	let opened = $state<number[]>([]);
	const items = $derived((Array.isArray(data?.items) ? data.items : []) as FAQItem[]);
	const isLight = $derived(isLightBlock(data, 'light'));
	const toggleTheme = createThemeToggle({
		type: 'HomeFAQ',
		fallback: 'light',
		getData: () => data,
		setData: (next) => (data = next),
		getContext: () => editContext
	});

	function toggle(index: number) {
		opened = opened.includes(index)
			? opened.filter((value) => value !== index)
			: [...opened, index];
	}

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'HomeFAQ', updated);
		data = updated;
	}

	async function updateItem(index: number, field: keyof FAQItem, value: string) {
		await saveField(
			'items',
			items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
		);
	}
</script>

<section
	id="faq"
	aria-labelledby="{uid}-title"
	data-p1-theme={isLight ? 'light' : 'dark'}
	class="faq-section p1-surface relative isolate overflow-hidden py-section"
>
	<div class="faq-dots pointer-events-none absolute inset-0" aria-hidden="true"></div>
	<div class="faq-symbol pointer-events-none absolute" aria-hidden="true">?</div>
	<div class="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<header class="mb-12 text-center sm:mb-16">
			<h2 id="{uid}-title" class="p1-title text-4xl text-balance sm:text-6xl">
				<EditableField
					fieldKey="HomeFAQ.title"
					label="Заголовок"
					value={String(data?.title ?? 'Вопрос')}
					{isEditable}
					inline
					onSave={(v) => saveField('title', v)}
				>
					{#snippet children(value)}{value}{/snippet}
				</EditableField><span class="faq-heading-accent">
					{' — '}<EditableField
						fieldKey="HomeFAQ.titleAccent"
						label="Акцент заголовка"
						value={String(data?.titleAccent ?? 'Ответ')}
						{isEditable}
						inline
						onSave={(v) => saveField('titleAccent', v)}
					>
						{#snippet children(value)}{value}{/snippet}
					</EditableField></span
				>
			</h2>
			<p class="p1-body mt-5 text-base sm:text-lg">
				<EditableField
					fieldKey="HomeFAQ.description"
					label="Описание"
					value={String(data?.description ?? '')}
					{isEditable}
					inline
					onSave={(v) => saveField('description', v)}
				>
					{#snippet children(value)}{value}{/snippet}
				</EditableField>
			</p>
		</header>

		<div class="faq-list">
			{#each items as item, i}
				{@const expanded = isEditable || opened.includes(i)}
				<div class="faq-item" class:expanded>
					<h3 class="p1-title-sub faq-question-heading" id="{uid}-question-{i}">
						{#if isEditable}
							<div class="faq-question">
								<span class="faq-number" aria-hidden="true">{i + 1}.</span>
								<EditableField
									fieldKey="HomeFAQ.items.{i}.question"
									label="Вопрос {i + 1}"
									value={item.question}
									{isEditable}
									inline
									onSave={(v) => updateItem(i, 'question', v)}
								>
									{#snippet children(value)}{value}{/snippet}
								</EditableField>
							</div>
						{:else}
							<button
								class="faq-question"
								type="button"
								aria-expanded={expanded}
								aria-controls="{uid}-answer-{i}"
								onclick={() => toggle(i)}
							>
								<span class="faq-number" aria-hidden="true">{i + 1}.</span>
								<span class="min-w-0 flex-1">{item.question}</span>
								<svg
									class="faq-icon"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.75"
									stroke-linecap="round"
									aria-hidden="true"
								>
									<path d="M5 12h14" /><path class="faq-icon-vertical" d="M12 5v14" />
								</svg>
							</button>
						{/if}
					</h3>
					<div
						class="faq-answer"
						id="{uid}-answer-{i}"
						role="region"
						aria-labelledby="{uid}-question-{i}"
						aria-hidden={!expanded}
						inert={!expanded}
					>
						<div class="faq-answer-clip">
							<div class="faq-answer-card">
								<p class="p1-body text-base whitespace-pre-line sm:text-lg">
									<EditableField
										fieldKey="HomeFAQ.items.{i}.answer"
										label="Ответ {i + 1}"
										value={item.answer}
										{isEditable}
										inline
										multiline
										onSave={(v) => updateItem(i, 'answer', v)}
									>
										{#snippet children(value)}{value}{/snippet}
									</EditableField>
								</p>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<BlockThemeToggle {isLight} onToggle={toggleTheme} {isEditable} {editContext} />
</section>

<style>
	.faq-section {
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--ds-link-500) 8%, var(--p1-surface)),
			var(--p1-surface) 60%,
			color-mix(in srgb, var(--ds-link-500) 12%, var(--p1-surface))
		);
	}
	.faq-dots {
		background-image: radial-gradient(circle, var(--ds-link-500) 1px, transparent 1.5px);
		background-size: 18px 18px;
		opacity: 0.09;
		mask-image: linear-gradient(to right, black, transparent 38%, transparent 72%, black);
	}
	.faq-symbol {
		left: -0.08em;
		bottom: -0.34em;
		font-family: var(--ds-font-heading);
		font-size: clamp(28rem, 65vw, 62rem);
		font-weight: var(--ds-font-heading-weight);
		line-height: 1;
		color: var(--ds-link-500);
		opacity: 0.16;
		transform: rotate(-18deg);
	}
	.faq-heading-accent {
		color: var(--ds-link-700);
	}
	[data-p1-theme='dark'] .faq-heading-accent {
		color: var(--ds-link-300);
	}
	.faq-list {
		display: grid;
		gap: 2.5rem;
	}
	.faq-question-heading {
		position: relative;
		z-index: 1;
		width: 78%;
		margin: 0;
	}
	.faq-question {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		min-height: 5rem;
		padding: 1.25rem 1.75rem;
		border: 1px solid var(--ds-on-accent);
		border-radius: var(--radius-2xl);
		background: linear-gradient(110deg, var(--ds-link-800), var(--ds-link-700));
		color: var(--ds-on-accent);
		box-shadow: 0 12px 28px -14px color-mix(in srgb, var(--ds-link-900) 45%, transparent);
		font: inherit;
		font-size: var(--text-lg);
		text-align: left;
		overflow-wrap: anywhere;
		transition:
			transform 220ms ease,
			box-shadow 220ms ease;
	}
	button.faq-question {
		cursor: pointer;
	}
	button.faq-question:hover {
		transform: translateY(-2px);
		box-shadow: 0 16px 32px -14px color-mix(in srgb, var(--ds-link-900) 55%, transparent);
	}
	button.faq-question:focus-visible {
		outline: 3px solid var(--ds-link-500);
		outline-offset: 5px;
	}
	.faq-number,
	.faq-icon {
		flex: none;
	}
	.faq-icon-vertical {
		transform-origin: center;
		transition:
			transform 300ms ease,
			opacity 300ms ease;
	}
	.expanded .faq-icon-vertical {
		transform: rotate(90deg);
		opacity: 0;
	}
	.faq-answer {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		transition:
			grid-template-rows 420ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 300ms ease;
	}
	.expanded .faq-answer {
		grid-template-rows: 1fr;
		opacity: 1;
	}
	.faq-answer-clip {
		min-height: 0;
		overflow: hidden;
	}
	.faq-answer-card {
		margin: 0 0 0 22%;
		padding: 2rem 2.5rem;
		border: 1px solid color-mix(in srgb, var(--ds-link-600) 35%, var(--p1-border));
		border-radius: 0 0 var(--radius-3xl) var(--radius-3xl);
		background: linear-gradient(
			120deg,
			var(--p1-overlay),
			color-mix(in srgb, var(--ds-link-500) 12%, var(--p1-overlay))
		);
	}
	.faq-answer-card p {
		line-height: 1.75;
		overflow-wrap: anywhere;
	}
	@media (min-width: 640px) {
		.faq-question {
			font-size: var(--text-2xl);
		}
		.faq-answer {
			margin-top: -1.5rem;
		}
		.faq-answer-card {
			padding-top: 3.5rem;
			border-radius: var(--radius-3xl);
		}
	}
	@media (max-width: 639px) {
		.faq-question-heading {
			width: 100%;
		}
		.faq-question {
			gap: 0.5rem;
			padding: 1.125rem;
			min-height: 4.5rem;
		}
		.faq-answer-card {
			margin-left: 1rem;
			margin-right: 0.5rem;
			padding: 1.5rem;
		}
		.faq-symbol {
			opacity: 0.08;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.faq-question,
		.faq-answer,
		.faq-icon-vertical {
			transition: none;
		}
		button.faq-question:hover {
			transform: none;
		}
	}
</style>
