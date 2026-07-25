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

	/** Плавное появление секции при попадании во вьюпорт (как в ContactMessengers). */
	function revealOnScroll(node: HTMLElement) {
		if (!('IntersectionObserver' in window)) {
			node.classList.add('cta-reveal-visible');
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				node.classList.add('cta-reveal-visible');
				observer.unobserve(node);
			},
			{ threshold: 0.25 }
		);

		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

<section class="relative isolate overflow-hidden bg-[#09090b] py-20 sm:py-24">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div
			class="absolute inset-0 opacity-[0.04]"
			style="background-image: linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 56px 56px; mask-image: radial-gradient(circle at 50% 40%, black, transparent 72%);"
		></div>
		<div
			class="absolute -top-24 left-1/2 size-112 -translate-x-1/2 rounded-full bg-red-500/12 blur-3xl"
		></div>
		<div
			class="absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent via-red-400/70 to-transparent"
		></div>
		<div
			class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"
		></div>
	</div>

	<div use:revealOnScroll class="cta-reveal relative mx-auto max-w-3xl px-6 text-center lg:px-8">
		<p
			class="cta-item inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.32em] text-red-400 uppercase sm:text-xs"
		>
			<span class="h-px w-8 bg-red-400/70" aria-hidden="true"></span>
			Мы на связи
			<span class="h-px w-8 bg-red-400/70" aria-hidden="true"></span>
		</p>

		<EditableField
			fieldKey="ContactCTA.title"
			label="Заголовок"
			value={String(data?.title ?? 'Остались вопросы?')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="cta-item mt-6 block"
		>
			{#snippet children(displayValue)}
				<h2
					class="text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-pretty text-white sm:text-5xl"
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
			class="cta-item mt-5 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto max-w-xl text-base/7 text-gray-400">{displayValue}</p>
			{/snippet}
		</EditableField>

		<div class="cta-item mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
			<EditableField
				fieldKey="ContactCTA.phone"
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
							class="group inline-flex items-center gap-2.5 rounded-full bg-red-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(220,38,38,0.9)] transition duration-300 hover:bg-red-500 hover:shadow-[0_22px_55px_-16px_rgba(220,38,38,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 motion-safe:hover:-translate-y-0.5"
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
									d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
								/>
							</svg>
							{displayValue}
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
				class="inline-block"
			>
				{#snippet children(displayValue)}
					{#if displayValue}
						<a
							href={displayValue}
							target="_blank"
							rel="noopener noreferrer"
							class="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 motion-safe:hover:-translate-y-0.5"
						>
							<svg class="size-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
								/>
							</svg>
							Написать в Telegram
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
</section>

<style>
	/*
		Дочерние элементы ждут появления секции во вьюпорте, затем выезжают по очереди.
		Селекторы глобальные: часть .cta-item — это обёртки EditableField,
		которые Svelte не считает разметкой этого компонента.
	*/
	:global(.cta-reveal .cta-item) {
		opacity: 0;
		transform: translateY(16px);
	}

	:global(.cta-reveal-visible .cta-item) {
		animation: cta-rise 750ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	:global(.cta-reveal-visible .cta-item:nth-child(2)) {
		animation-delay: 90ms;
	}

	:global(.cta-reveal-visible .cta-item:nth-child(3)) {
		animation-delay: 180ms;
	}

	:global(.cta-reveal-visible .cta-item:nth-child(4)) {
		animation-delay: 270ms;
	}

	@keyframes cta-rise {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.cta-reveal .cta-item),
		:global(.cta-reveal-visible .cta-item) {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
