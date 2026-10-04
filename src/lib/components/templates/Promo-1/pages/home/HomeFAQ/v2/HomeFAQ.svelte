<script lang="ts">
	// Артикул: 1.1.10.2 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';

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
	const items = $derived((Array.isArray(data?.items) ? data.items : []) as FAQItem[]);
	const isLight = $derived(isLightBlock(data, 'light'));
	let opened = $state<number | null>(1);

	function toggle(index: number) {
		opened = opened === index ? null : index;
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
	class="faq-section py-section-xs"
>
	<div class="faq-symbol" aria-hidden="true">?</div>
	<div class="faq-container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<header class="faq-header">
			<h2 id="{uid}-title" class="faq-title text-4xl text-balance sm:text-6xl">
				<EditableField
					fieldKey="HomeFAQ.title"
					label="Заголовок"
					value={String(data?.title ?? 'Ваши частые вопросы')}
					{isEditable}
					inline
					onSave={(v) => saveField('title', v)}
				>
					{#snippet children(value)}<RichText {value} />{/snippet}
				</EditableField>
			</h2>
		</header>

		<div class="faq-list">
			{#each items as item, i}
				{@const expanded = isEditable || opened === i}
				<div class="faq-item" class:expanded>
					<div class="faq-item-surface">
						<h3 class="faq-question-heading" id="{uid}-question-{i}">
							{#if isEditable}
								<div class="faq-question">
									<span class="faq-number ds-numeric" aria-hidden="true">{i + 1}</span>
									<div class="faq-question-text">
										<EditableField
											fieldKey="HomeFAQ.items.{i}.question"
											label="Вопрос {i + 1}"
											value={item.question}
											{isEditable}
											inline
											onSave={(v) => updateItem(i, 'question', v)}
										>
											{#snippet children(value)}<RichText {value} />{/snippet}
										</EditableField>
									</div>
								</div>
							{:else}
								<button
									class="faq-question"
									type="button"
									aria-expanded={expanded}
									aria-controls="{uid}-answer-{i}"
									data-goal-ignore="Раскрытие ответа FAQ, не открывает форму"
									onclick={() => toggle(i)}
								>
									<span class="faq-number ds-numeric" aria-hidden="true">{i + 1}</span>
									<span class="faq-question-text">{item.question}</span>
									<span class="faq-control" aria-hidden="true">
										<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
											<path d="M5 12h14M12 5v14" />
										</svg>
									</span>
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
								<div class="faq-answer-content">
									<div class="p1-body whitespace-pre-line">
										<EditableField
											fieldKey="HomeFAQ.items.{i}.answer"
											label="Ответ {i + 1}"
											value={item.answer}
											{isEditable}
											inline
											multiline
											onSave={(v) => updateItem(i, 'answer', v)}
										>
											{#snippet children(value)}<RichText {value} />{/snippet}
										</EditableField>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="faq-contact">
			<a href="/contacts" class="faq-contact-link">
				<span>Связаться с нами</span>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M5 12h14m-5-5 5 5-5 5" />
				</svg>
			</a>
		</div>
	</div>
</section>

<style>
	.faq-section {
		position: relative;
		isolation: isolate;
		overflow: clip;
		--faq-ink: var(--p1-title);
		--faq-edge: linear-gradient(
			105deg,
			var(--ds-cat-10-300),
			var(--ds-cat-1-100) 25%,
			var(--ds-cat-7-100) 50%,
			var(--ds-link-100) 72%,
			var(--ds-cat-4-400)
		);
		background: linear-gradient(
			180deg,
			var(--p1-surface),
			color-mix(in srgb, var(--p1-surface) 75%, var(--faq-ink))
		);
		color: var(--faq-ink);
	}
	.faq-container {
		position: relative;
		z-index: 1;
		max-width: 68rem;
	}
	.faq-symbol {
		position: absolute;
		left: clamp(1rem, 4vw, 4rem);
		top: 24%;
		font-family: var(--ds-font-heading);
		font-size: clamp(16rem, 36vw, 32rem);
		font-weight: var(--ds-font-heading-weight);
		line-height: 0.8;
		color: var(--ds-link-500);
		opacity: 0.16;
		transform: translateY(-50%) rotate(-10deg);
		pointer-events: none;
		user-select: none;
	}
	.faq-header {
		margin-bottom: clamp(2.5rem, 6vw, 5rem);
		text-align: center;
	}
	.faq-title {
		margin: 0;
		color: var(--faq-ink);
		font-family: var(--ds-font-catalog-display);
		font-weight: var(--ds-font-heading-weight);
		line-height: var(--ds-font-catalog-display-leading);
		letter-spacing: var(--ds-font-catalog-display-tracking);
	}
	.faq-list {
		display: grid;
		gap: 0.5rem;
	}
	.faq-item {
		padding: 1.5px;
		border-radius: var(--ds-radius-4xl);
		background: transparent;
	}
	.faq-item.expanded {
		background: var(--faq-edge);
	}
	.faq-item-surface {
		border-radius: inherit;
		background: color-mix(in srgb, var(--p1-overlay) 55%, transparent);
		transition: background var(--ds-motion-duration-ui) var(--ds-motion-ease);
	}
	.expanded .faq-item-surface {
		background: var(--p1-overlay);
	}
	.faq-question-heading {
		margin: 0;
		color: var(--faq-ink);
		font-family: var(--ds-font-catalog-display);
		font-weight: var(--ds-font-heading-weight);
		line-height: var(--ds-font-heading-sub-leading);
		letter-spacing: var(--ds-font-heading-sub-tracking);
	}
	.faq-question {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		min-height: 5.5rem;
		padding: 1.375rem 1.5rem;
		border: 0;
		border-radius: inherit;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: var(--text-lg);
		text-align: left;
	}
	button.faq-question {
		cursor: pointer;
	}
	.faq-question-text {
		flex: 1;
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.faq-number {
		display: grid;
		flex: none;
		place-items: center;
		min-width: 1.75rem;
		height: 1.75rem;
		padding: 0 0.25rem;
		border: 1px solid color-mix(in srgb, var(--p1-overlay) 60%, var(--p1-border));
		border-radius: var(--ds-radius-lg);
		background: color-mix(in srgb, var(--p1-overlay) 75%, transparent);
		font-size: var(--text-sm);
	}
	.faq-control {
		display: grid;
		flex: none;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border: 1.5px solid color-mix(in srgb, var(--faq-ink) 75%, var(--p1-overlay));
		border-radius: var(--ds-radius-full);
		background: radial-gradient(
			circle at 50% 65%,
			var(--faq-ink) 45%,
			color-mix(in srgb, var(--faq-ink) 75%, var(--p1-overlay))
		);
		color: var(--p1-surface);
		transition:
			transform var(--ds-motion-duration-ui) var(--ds-motion-ease),
			background var(--ds-motion-duration-ui) var(--ds-motion-ease);
	}
	.expanded .faq-control {
		border-color: transparent;
		background:
			linear-gradient(var(--p1-overlay), var(--p1-overlay)) padding-box,
			var(--faq-edge) border-box;
		color: var(--faq-ink);
	}
	.faq-control svg,
	.faq-contact-link svg {
		stroke: currentColor;
		stroke-width: var(--ds-icon-stroke);
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.faq-control svg {
		transition: transform var(--ds-motion-duration-ui) var(--ds-motion-ease);
	}
	.expanded .faq-control svg {
		transform: rotate(45deg);
	}
	button.faq-question:hover .faq-control {
		transform: scale(1.06);
	}
	button.faq-question:focus-visible,
	.faq-contact-link:focus-visible {
		outline: 2px solid var(--p1-field-focus);
		outline-offset: 5px;
		border-radius: var(--ds-radius-4xl);
	}
	.faq-answer {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		transition:
			grid-template-rows var(--ds-motion-duration-ui-slow) var(--ds-motion-ease),
			opacity var(--ds-motion-duration-ui) var(--ds-motion-ease);
	}
	.expanded .faq-answer {
		grid-template-rows: 1fr;
		opacity: 1;
	}
	.faq-answer-clip {
		min-height: 0;
		overflow: hidden;
	}
	.faq-answer-content {
		padding: 0 5.5rem 2rem 4.25rem;
		font-size: var(--text-base);
		line-height: 1.5;
		overflow-wrap: anywhere;
	}
	.faq-answer-content > div {
		max-width: 65ch;
	}
	.faq-contact {
		margin-top: 2.5rem;
		text-align: center;
		font-size: var(--text-base);
	}
	.faq-contact-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 2.75rem;
		color: var(--faq-ink);
	}
	.faq-contact-link span {
		text-decoration: underline;
		text-underline-offset: 0.2em;
		text-decoration-thickness: 1px;
	}
	.faq-contact-link:hover span {
		text-decoration-thickness: 2px;
	}
	.faq-section ::selection {
		background: var(--faq-ink);
		color: var(--p1-surface);
	}
	@media (max-width: 639px) {
		.faq-symbol {
			top: 20%;
			font-size: clamp(12rem, 58vw, 16rem);
			opacity: 0.08;
		}
		.faq-question {
			gap: 0.75rem;
			min-height: 5rem;
			padding: 1.125rem 1rem;
			font-size: var(--text-base);
		}
		.faq-answer-content {
			padding: 0 1.25rem 1.5rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.faq-item-surface,
		.faq-control,
		.faq-control svg,
		.faq-answer {
			transition: none;
		}
		button.faq-question:hover .faq-control {
			transform: none;
		}
	}
</style>
