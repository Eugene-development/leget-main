<script lang="ts">
	// Артикул: 1.1.10.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
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
	let sectionElement: HTMLElement;
	let symbolVisible = $state(false);
	let opened = $state<number[]>([0]);
	const items = $derived((Array.isArray(data?.items) ? data.items : []) as FAQItem[]);
	const isLight = $derived(isLightBlock(data, 'light'));
	const toggleTheme = createThemeToggle({
		type: 'HomeFAQ',
		fallback: 'light',
		getData: () => data,
		setData: (next) => (data = next),
		getContext: () => editContext
	});

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			symbolVisible = true;
			return;
		}

		let previousScrollY = window.scrollY;
		let frame = 0;

		const revealWhenReached = () => {
			const bounds = sectionElement.getBoundingClientRect();
			const visibleTop = Math.max(bounds.top, 0);
			const visibleBottom = Math.min(bounds.bottom, window.innerHeight);
			const visibleHeight = Math.max(0, visibleBottom - visibleTop);
			if (visibleHeight < bounds.height * 0.5) return;

			symbolVisible = true;
			window.removeEventListener('scroll', handleScroll);
		};

		const handleScroll = () => {
			if (window.scrollY === previousScrollY) return;
			previousScrollY = window.scrollY;
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(revealWhenReached);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', handleScroll);
		};
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
	bind:this={sectionElement}
	id="faq"
	aria-labelledby="{uid}-title"
	data-p1-theme={isLight ? 'light' : 'dark'}
	class="faq-section p1-surface relative isolate overflow-hidden py-section"
>
	<div class="faq-dots pointer-events-none absolute inset-0" aria-hidden="true"></div>
	<div
		class="faq-symbol pointer-events-none absolute"
		class:is-visible={symbolVisible}
		aria-hidden="true"
	>
		?
	</div>
	<div class="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<header class="mb-12 text-center sm:mb-16">
			<h2 id="{uid}-title" class="p1-title text-4xl text-balance sm:text-6xl">
				<EditableField
					fieldKey="HomeFAQ.title"
					label="Заголовок"
					value={String(data?.title ?? 'Ваши частые вопросы')}
					{isEditable}
					inline
					onSave={(v) => saveField('title', v)}
				>
					{#snippet children(value)}{value}{/snippet}
				</EditableField>
			</h2>
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
	.faq-dots {
		background-image: radial-gradient(circle, var(--ds-link-500) 1px, transparent 1.5px);
		background-size: 18px 18px;
		opacity: 0.09;
		mask-image: linear-gradient(to right, black, transparent 38%, transparent 72%, black);
	}
	.faq-symbol {
		--faq-symbol-opacity: 0.16;
		left: clamp(1rem, 4vw, 4rem);
		top: 50%;
		font-family: var(--ds-font-heading);
		font-size: clamp(16rem, 36vw, 32rem);
		font-weight: var(--ds-font-heading-weight);
		line-height: 0.8;
		color: var(--ds-link-500);
		opacity: 0;
		transform: translateY(-46%) rotate(-6deg) scale(0.96);
		transform-origin: center;
		transition:
			opacity 900ms ease,
			transform 1100ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.faq-symbol.is-visible {
		opacity: var(--faq-symbol-opacity);
		transform: translateY(-50%) rotate(-10deg) scale(1);
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
		outline: 3px solid var(--ds-link-600);
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
			--faq-symbol-opacity: 0.08;
			left: 1rem;
			font-size: clamp(12rem, 58vw, 16rem);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.faq-question,
		.faq-answer,
		.faq-icon-vertical,
		.faq-symbol {
			transition: none;
		}
		button.faq-question:hover {
			transform: none;
		}
	}
</style>
