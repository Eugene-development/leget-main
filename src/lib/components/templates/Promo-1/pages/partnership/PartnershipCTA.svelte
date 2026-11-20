<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 1.6.6.1 — см. docs/architecture/component-articles-map.md
	import { resolve } from '$app/paths';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();
	const buttonText = $derived(
		data?.buttonText === undefined ||
			['Обсудить сотрудничество', 'Узнать условия'].includes(editableText(data.buttonText))
			? 'Стать партнёром'
			: editableText(data.buttonText)
	);
	const isLight = $derived(isLightBlock(data, 'dark'));
	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'PartnershipCTA', updated);
		data = updated;
	}

	/**
	 * Появление блока при попадании во вьюпорт: узел получает `.pca-visible`,
	 * дальше ступени задержек `.pca-d*` разводят элементы по времени.
	 */
	function revealOnScroll(node: HTMLElement) {
		if (typeof IntersectionObserver === 'undefined') {
			node.classList.add('pca-visible');
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				node.classList.add('pca-visible');
				observer.unobserve(node);
			},
			{ threshold: 0.2 }
		);

		observer.observe(node);
		return () => observer.disconnect();
	}
</script>

<section class="p1-surface py-section-sm sm:py-section" data-p1-theme={isLight ? 'light' : 'dark'}>
	<div class="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
		<div
			{@attach revealOnScroll}
			class="pca-reveal pca-frame p1-card rounded-3xl border px-6 py-14 text-center shadow-none sm:px-12 sm:py-16 lg:px-16"
		>
			<div
				class="pca-item p1-surface-alt p1-border p1-title mx-auto flex size-16 items-center justify-center rounded-2xl border"
			>
				<svg
					class="size-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
			</div>

			<EditableField
				fieldKey="PartnershipCTA.eyebrow"
				label="Надзаголовок"
				value={editableText(data?.eyebrow, 'Партнёрская программа')}
				{isEditable}
				onSave={(v) => saveField('eyebrow', v)}
				class="pca-item pca-d1 mt-8 block"
			>
				{#snippet children(displayValue)}
					<p
						class="p1-body inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] uppercase sm:text-xs"
					>
						<span class="p1-border w-8 shrink-0 border-t" aria-hidden="true"></span>
						<RichText value={displayValue} />
						<span class="p1-border w-8 shrink-0 border-t" aria-hidden="true"></span>
					</p>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="PartnershipCTA.title"
				label="Заголовок"
				value={editableText(data?.title, 'Присоединяйтесь к нам')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="pca-item pca-d2 mt-5 block"
			>
				{#snippet children(displayValue)}
					<h2 class="p1-title text-3xl text-pretty sm:text-4xl lg:text-5xl">
						<RichText value={displayValue} />
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="PartnershipCTA.subtitle"
				label="Подзаголовок"
				value={editableText(data?.subtitle, 'Начните работать вместе с нами уже сегодня')}
				{isEditable}
				multiline
				onSave={(v) => saveField('subtitle', v)}
				class="pca-item pca-d3 mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="p1-body mx-auto max-w-xl text-sm/6 sm:text-base/7">
						<RichText value={displayValue} />
					</p>
				{/snippet}
			</EditableField>

			<div class="pca-item pca-d4 mt-10 flex justify-center">
				<a
					data-metrika-goal="pages_partnership_partnershipcta_open_1"
					data-goal-label="Стать партнёром (текст кнопки настраивается)"
					data-goal-action="open"
					aria-label={buttonText}
					href={isEditable ? undefined : resolve('/partner/register')}
					class="ds-action group inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold transition duration-300 motion-safe:hover:-translate-y-0.5"
				>
					<EditableField
						fieldKey="PartnershipCTA.buttonText"
						label="Текст кнопки"
						value={buttonText}
						{isEditable}
						onSave={(v) => saveField('buttonText', v)}
						class="inline"
					>
						{#snippet children(displayValue)}
							<RichText value={displayValue} />
						{/snippet}
					</EditableField>
					<span
						class="transition-transform duration-300 group-hover:translate-x-1"
						aria-hidden="true">&rarr;</span
					>
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	/*
		Классы глобальные: часть анимируемых узлов — обёртки <EditableField>,
		до них scoped-стили Svelte не доходят.
	*/

	@keyframes pca-frame {
		from {
			opacity: 0;
			transform: scale(0.985);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes pca-rise {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(.pca-reveal .pca-item),
	:global(.pca-frame) {
		opacity: 0;
	}

	:global(.pca-frame.pca-visible) {
		animation: pca-frame 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	:global(.pca-visible .pca-item) {
		animation: pca-rise 780ms cubic-bezier(0.22, 1, 0.36, 1) var(--pca-delay, 0ms) both;
	}

	/* Ступени задержки через кастомное свойство: shorthand-анимация выше не сбрасывает его */
	:global(.pca-d1) {
		--pca-delay: 80ms;
	}
	:global(.pca-d2) {
		--pca-delay: 160ms;
	}
	:global(.pca-d3) {
		--pca-delay: 240ms;
	}
	:global(.pca-d4) {
		--pca-delay: 340ms;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.pca-reveal .pca-item),
		:global(.pca-frame),
		:global(.pca-frame.pca-visible),
		:global(.pca-visible .pca-item) {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
