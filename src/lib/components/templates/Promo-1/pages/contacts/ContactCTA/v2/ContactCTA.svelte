<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ContactCTA', updated);
		data = updated;
	}

	/** Появление секции при попадании во вьюпорт. */
	function revealOnScroll(node: HTMLElement) {
		if (!('IntersectionObserver' in window)) {
			node.classList.add('cta2-reveal-visible');
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				node.classList.add('cta2-reveal-visible');
				observer.unobserve(node);
			},
			{ threshold: 0.25 }
		);

		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

<!--
	Вариант 2 — светлая «editorial»-подача, перекликающаяся с Hero v2:
	тёплый бумажный фон, скруглённая карточка-паспарту, красный акцентный штрих
	сверху и ромбовидный разделитель. Композиция другая: заголовок и действия
	разведены по двум колонкам, а не выстроены по центру.
-->
<section class="relative isolate overflow-hidden bg-[#f7f5f2] py-20 sm:py-24">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_82%_15%,rgba(239,68,68,0.08),transparent_42%)]"
		></div>
		<div
			class="absolute inset-0 opacity-50"
			style="background-image: linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px); background-size: 20% 100%;"
		></div>
		<div class="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-[#efece7] to-transparent"></div>
	</div>

	<div class="relative mx-auto max-w-5xl px-6 lg:px-8">
		<div
			use:revealOnScroll
			class="cta2-card relative rounded-3xl border border-slate-900/10 bg-white/70 px-6 py-10 shadow-[0_40px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:rounded-4xl sm:px-12 sm:py-12 lg:px-14"
		>
			<span
				class="pointer-events-none absolute -top-px left-1/2 h-px w-24 -translate-x-1/2 bg-red-500/70"
				aria-hidden="true"
			></span>

			<div class="grid items-center gap-10 lg:grid-cols-[1.05fr_auto_0.95fr] lg:gap-12">
				<div class="text-center lg:text-left">
					<p
						class="cta2-item text-[11px] font-semibold tracking-[0.42em] text-red-600/90 uppercase sm:text-xs"
					>
						Мы на связи
					</p>

					<EditableField
						fieldKey="ContactCTA.title"
						label="Заголовок"
						value={String(data?.title ?? 'Остались вопросы?')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="cta2-item mt-5 block"
					>
						{#snippet children(displayValue)}
							<h2
								class="text-3xl leading-[1.06] font-light tracking-[-0.02em] text-pretty text-slate-900 sm:text-4xl"
							>
								{displayValue}
							</h2>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="ContactCTA.subtitle"
						label="Подзаголовок"
						value={String(
							data?.subtitle ?? 'Свяжитесь с нами любым удобным способом — мы всегда рады помочь'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('subtitle', v)}
						class="cta2-item mt-5 block"
					>
						{#snippet children(displayValue)}
							<p class="mx-auto max-w-md text-sm/6 text-slate-600 sm:text-base/7 lg:mx-0">
								{displayValue}
							</p>
						{/snippet}
					</EditableField>
				</div>

				<!-- Вертикальный разделитель с ромбом — перекличка с линией-разделителем Hero v2. -->
				<div
					class="cta2-rule flex items-center justify-center gap-3 lg:h-40 lg:flex-col"
					aria-hidden="true"
				>
					<span
						class="h-px flex-1 bg-linear-to-r from-transparent to-slate-900/15 lg:h-auto lg:w-px lg:bg-linear-to-b"
					></span>
					<span class="size-1.5 rotate-45 border border-red-500/60"></span>
					<span
						class="h-px flex-1 bg-linear-to-l from-transparent to-slate-900/15 lg:h-auto lg:w-px lg:bg-linear-to-t"
					></span>
				</div>

				<div class="flex flex-col gap-3">
					<EditableField
						fieldKey="ContactCTA.phone"
						label="Телефон"
						value={String(data?.phone ?? '')}
						{isEditable}
						onSave={(v) => saveField('phone', v)}
						class="cta2-item block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<a
									href="tel:{displayValue}"
									class="group flex items-center justify-between gap-4 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900 motion-safe:hover:-translate-y-0.5"
								>
									<span class="flex items-center gap-3">
										<svg
											class="size-4.5 text-red-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="2"
											aria-hidden="true"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
											/>
										</svg>
										{displayValue}
									</span>
									<span
										class="transition-transform duration-300 group-hover:translate-x-1"
										aria-hidden="true">&rarr;</span
									>
								</a>
							{/if}
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="ContactCTA.telegramUrl"
						label="Ссылка на Telegram"
						value={String(data?.telegramUrl ?? '')}
						{isEditable}
						onSave={(v) => saveField('telegramUrl', v)}
						class="cta2-item block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<a
									href={displayValue}
									target="_blank"
									rel="noopener noreferrer"
									class="group flex items-center justify-between gap-4 rounded-2xl border border-slate-900/12 bg-white/80 px-6 py-4 text-sm font-semibold text-slate-900 transition duration-300 hover:border-slate-900/25 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-400 motion-safe:hover:-translate-y-0.5"
								>
									<span class="flex items-center gap-3">
										<svg
											class="size-4.5 text-[#229ED9]"
											fill="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path
												d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
											/>
										</svg>
										Написать в Telegram
									</span>
									<span
										class="transition-transform duration-300 group-hover:translate-x-1"
										aria-hidden="true">&rarr;</span
									>
								</a>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/*
		Селекторы глобальные: часть .cta2-item — обёртки EditableField,
		которые Svelte не относит к разметке этого компонента.
	*/
	.cta2-card {
		opacity: 0;
		transform: scale(0.99);
	}

	:global(.cta2-reveal-visible) {
		animation: cta2-card 850ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	:global(.cta2-card .cta2-item),
	:global(.cta2-card .cta2-rule) {
		opacity: 0;
		transform: translateY(14px);
	}

	:global(.cta2-reveal-visible .cta2-item) {
		animation: cta2-rise 700ms 140ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	:global(.cta2-reveal-visible .cta2-item:nth-child(2)) {
		animation-delay: 220ms;
	}

	:global(.cta2-reveal-visible .cta2-item:nth-child(3)) {
		animation-delay: 300ms;
	}

	:global(.cta2-reveal-visible .cta2-rule) {
		animation: cta2-rise 700ms 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	@keyframes cta2-card {
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes cta2-rise {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cta2-card,
		:global(.cta2-reveal-visible),
		:global(.cta2-card .cta2-item),
		:global(.cta2-card .cta2-rule),
		:global(.cta2-reveal-visible .cta2-item),
		:global(.cta2-reveal-visible .cta2-rule) {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
