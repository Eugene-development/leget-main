<script lang="ts">
	// Артикул: 1.6.6.1 — см. docs/architecture/component-articles-map.md
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

	// Ink-блок: дефолт тёмный. Нейтральная палитра — из классов p1-*,
	// акцентные плитки и кнопки остаются белым по цвету бренда.
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
		return { destroy: () => observer.disconnect() };
	}
</script>

<!--
	Финальный CTA страницы «Партнёрство».
	Палитра та же, что у Hero (sky → cyan → teal), но на глубокой подложке:
	секция закрывает страницу и визуально рифмуется с тёмным блоком
	ForManufacturers. Появление элементов — ступенями, см. <style> ниже.
-->
<section
	class="p1-surface relative isolate overflow-hidden py-24 sm:py-28 lg:py-32"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<!-- Декор: сетка, свечения, волосяные линии по краям секции -->
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="pca-grid"></div>
		<div class="pca-glow absolute -top-32 left-1/2 size-144 -translate-x-1/2 bg-cat-5-500/20"></div>
		<div class="pca-glow absolute -right-24 -bottom-40 size-112 bg-cat-9-400/15"></div>
		<div
			class="absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-linear-to-r from-transparent via-cat-5-400/60 to-transparent"
		></div>
		<div
			class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-on-dark/10 to-transparent"
		></div>
	</div>

	<div class="relative mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
		<!-- Паспарту с градиентной каймой в 1px -->
		<div
			use:revealOnScroll
			class="pca-reveal pca-frame rounded-4xl bg-linear-to-br from-link-400/40 via-cat-5-300/25 to-cat-9-400/40 p-px shadow-[0_50px_120px_-60px] shadow-cat-5-500/55"
		>
			<div
				class="relative overflow-hidden rounded-[calc(var(--radius-4xl)-1px)] {isLight
					? 'bg-surface-raised/85'
					: 'bg-ink-950/85'} px-6 py-14 text-center backdrop-blur-sm sm:px-12 sm:py-16 lg:px-16"
			>
				<div
					class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-on-dark/6 to-transparent"
					aria-hidden="true"
				></div>

				<div class="relative">
					<div
						class="pca-item mx-auto flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-link-500 to-cat-5-500 text-on-accent shadow-[0_20px_50px_-20px] ring-1 shadow-link-500/90 ring-on-accent/20"
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
						value={String(data?.eyebrow ?? 'Партнёрская программа')}
						{isEditable}
						onSave={(v) => saveField('eyebrow', v)}
						class="pca-item pca-d1 mt-8 block"
					>
						{#snippet children(displayValue)}
							<p
								class="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] {isLight
									? 'text-cat-5-700'
									: 'text-cat-5-300'} uppercase sm:text-xs"
							>
								<span class="h-px w-8 bg-cat-5-400/80" aria-hidden="true"></span>
								{displayValue}
								<span class="h-px w-8 bg-cat-5-400/80" aria-hidden="true"></span>
							</p>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="PartnershipCTA.title"
						label="Заголовок"
						value={String(data?.title ?? 'Присоединяйтесь к нам')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="pca-item pca-d2 mt-5 block"
					>
						{#snippet children(displayValue)}
							<h2 class="p1-title text-3xl text-pretty sm:text-4xl lg:text-5xl">
								{displayValue}
							</h2>
						{/snippet}
					</EditableField>

					<div
						class="pca-rule pca-d3 mx-auto mt-6 flex max-w-xs items-center gap-3"
						aria-hidden="true"
					>
						<span class="p1-line h-px flex-1"></span>
						<span class="size-1.5 rotate-45 border border-cat-5-400/80"></span>
						<span class="p1-line h-px flex-1"></span>
					</div>

					<EditableField
						fieldKey="PartnershipCTA.subtitle"
						label="Подзаголовок"
						value={String(data?.subtitle ?? 'Начните работать вместе с нами уже сегодня')}
						{isEditable}
						multiline
						onSave={(v) => saveField('subtitle', v)}
						class="pca-item pca-d3 mt-6 block"
					>
						{#snippet children(displayValue)}
							<p class="p1-body mx-auto max-w-xl text-sm/6 sm:text-base/7">{displayValue}</p>
						{/snippet}
					</EditableField>

					<div
						class="pca-item pca-d4 mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
					>
						<a
							href="/contact"
							class="group inline-flex items-center justify-center gap-2.5 rounded-full bg-linear-to-r from-link-500 to-cat-5-500 px-7 py-3.5 text-sm font-semibold text-on-accent shadow-[0_18px_45px_-18px] shadow-link-500/95 transition duration-300 hover:from-link-400 hover:to-cat-5-400 hover:shadow-[0_22px_55px_-16px] hover:shadow-cat-5-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cat-5-300 motion-safe:hover:-translate-y-0.5"
						>
							<EditableField
								fieldKey="PartnershipCTA.buttonText"
								label="Текст кнопки"
								value={String(data?.buttonText ?? 'Обсудить сотрудничество')}
								{isEditable}
								onSave={(v) => saveField('buttonText', v)}
								class="inline"
							>
								{#snippet children(displayValue)}
									{displayValue}
								{/snippet}
							</EditableField>
							<span
								class="transition-transform duration-300 group-hover:translate-x-1"
								aria-hidden="true">&rarr;</span
							>
						</a>

						<EditableField
							fieldKey="PartnershipCTA.phone"
							label="Телефон"
							value={String(data?.phone ?? '')}
							{isEditable}
							onSave={(v) => saveField('phone', v)}
							class="inline-block"
						>
							{#snippet children(displayValue)}
								{#if displayValue}
									<a
										href="tel:{displayValue}"
										class="group p1-border p1-card p1-title inline-flex items-center justify-center gap-2.5 rounded-full border px-7 py-3.5 text-sm font-semibold backdrop-blur-sm transition duration-300 hover:border-on-dark/30 hover:bg-on-dark/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark/60 motion-safe:hover:-translate-y-0.5"
									>
										<svg
											class="size-4.5 transition-transform duration-300 group-hover:-rotate-12"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="2"
											aria-hidden="true"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
											/>
										</svg>
										{displayValue}
									</a>
								{/if}
							{/snippet}
						</EditableField>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/*
		Классы глобальные: часть анимируемых узлов — обёртки <EditableField>,
		до них scoped-стили Svelte не доходят.
	*/

	/* Текстуры фона */
	:global(.pca-grid) {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.8) 1px, transparent 1px);
		background-size: 56px 56px;
		opacity: 0.04;
		mask-image: radial-gradient(circle at 50% 40%, black, transparent 72%);
	}

	:global(.pca-glow) {
		filter: blur(80px);
		border-radius: 9999px;
	}

	/* Появление: паспарту, элементы, линейка-разделитель */
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

	@keyframes pca-rule {
		from {
			opacity: 0;
			transform: scaleX(0.4);
		}
		to {
			opacity: 1;
			transform: scaleX(1);
		}
	}

	:global(.pca-reveal .pca-item),
	:global(.pca-reveal .pca-rule),
	:global(.pca-frame) {
		opacity: 0;
	}

	:global(.pca-frame.pca-visible) {
		animation: pca-frame 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	:global(.pca-visible .pca-item) {
		animation: pca-rise 780ms cubic-bezier(0.22, 1, 0.36, 1) var(--pca-delay, 0ms) both;
	}

	:global(.pca-visible .pca-rule) {
		animation: pca-rule 780ms cubic-bezier(0.22, 1, 0.36, 1) var(--pca-delay, 0ms) both;
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
		:global(.pca-reveal .pca-rule),
		:global(.pca-frame),
		:global(.pca-frame.pca-visible),
		:global(.pca-visible .pca-item),
		:global(.pca-visible .pca-rule) {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
