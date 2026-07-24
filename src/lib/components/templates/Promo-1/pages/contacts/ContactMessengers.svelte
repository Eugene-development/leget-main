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
		await saveComponentData(editContext, 'ContactMessengers', updated);
		data = updated;
	}

	function revealOnScroll(node: HTMLElement) {
		if (!('IntersectionObserver' in window)) {
			node.classList.add('telegram-entry-visible');
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				node.classList.add('telegram-entry-visible');
				observer.unobserve(node);
			},
			{ threshold: 0.2 }
		);

		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

<section class="overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div
			class="relative isolate overflow-hidden rounded-4xl bg-gray-950 px-6 py-14 shadow-[0_32px_100px_-32px_rgba(15,23,42,0.45)] ring-1 ring-black/5 sm:px-10 sm:py-16 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-16 lg:py-20"
		>
			<!-- Тихая архитектурная сетка и световые акценты создают глубину без фонового изображения. -->
			<div
				class="pointer-events-none absolute inset-0 opacity-[0.045]"
				style="background-image: linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 56px 56px;"
			></div>
			<div
				class="pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-red-500/15 blur-3xl"
			></div>
			<div
				class="pointer-events-none absolute -right-20 -bottom-40 size-96 rounded-full bg-red-500/10 blur-3xl"
			></div>
			<div
				class="pointer-events-none absolute top-0 left-1/2 h-px w-2/5 -translate-x-1/2 bg-linear-to-r from-transparent via-red-400/80 to-transparent"
			></div>

			<div class="relative z-10">
				<EditableField
					fieldKey="ContactMessengers.eyebrow"
					label="Надпись над заголовком"
					value={String(data?.eyebrow ?? 'Социальные сети')}
					{isEditable}
					onSave={(v) => saveField('eyebrow', v)}
					class="inline-block"
				>
					{#snippet children(displayValue)}
						<p
							class="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-[#229ED9] uppercase"
						>
							<span class="h-px w-8 bg-[#229ED9]" aria-hidden="true"></span>
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="ContactMessengers.title"
					label="Заголовок"
					value={String(data?.title ?? 'Мы в Телеграм')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="mt-5 block"
				>
					{#snippet children(displayValue)}
						<h2
							class="max-w-xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-pretty text-white sm:text-5xl"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<div class="mt-9 flex items-center gap-3 text-sm text-gray-300">
					<span class="relative flex size-2.5" aria-hidden="true">
						<span
							class="absolute inline-flex size-full animate-ping rounded-full bg-[#229ED9] opacity-50 motion-reduce:animate-none"
						></span>
						<span class="relative inline-flex size-2.5 rounded-full bg-[#229ED9]"></span>
					</span>
					Обычно отвечаем в течение нескольких минут
				</div>
			</div>

			<div class="relative z-10 mt-16 flex justify-center lg:mt-0 lg:justify-end lg:pr-16">
				<EditableField
					fieldKey="ContactMessengers.telegramUrl"
					label="Ссылка на Telegram"
					value={String(data?.telegramUrl || 'https://t.me/')}
					{isEditable}
					onSave={(v) => saveField('telegramUrl', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<div use:revealOnScroll class="telegram-entry relative">
							<a
								href={displayValue || 'https://t.me/'}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Открыть Telegram в новой вкладке"
								class="telegram-button group relative flex size-40 items-center justify-center rounded-full text-white ring-1 ring-[#229ED9]/50 transition duration-500 hover:scale-105 hover:-rotate-3 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#229ED9] sm:size-48"
							>
								<span
									class="pointer-events-none absolute -inset-6 rounded-full border border-[#229ED9]/35"
									aria-hidden="true"
								></span>
								<span
									class="pointer-events-none absolute -inset-12 animate-ping rounded-full border border-[#229ED9]/20 motion-reduce:animate-none"
									aria-hidden="true"
								></span>
								<span
									class="pointer-events-none absolute inset-3 rounded-full border border-white/20"
									aria-hidden="true"
								></span>

								<svg
									class="size-20 drop-shadow-xl transition duration-500 group-hover:scale-110 sm:size-24"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
									/>
								</svg>
							</a>
						</div>
					{/snippet}
				</EditableField>
			</div>
		</div>
	</div>
</section>

<style>
	.telegram-button {
		background-color: #229ed9;
		box-shadow: 0 24px 70px -16px rgb(34 158 217 / 75%);
	}

	.telegram-button:hover {
		background-color: #1d91c9;
		box-shadow: 0 28px 90px -14px rgb(34 158 217 / 90%);
	}

	.telegram-entry {
		opacity: 0;
		transform: translateX(7rem) scale(0.72) rotate(12deg);
	}

	:global(.telegram-entry-visible) {
		animation: telegram-entry 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	@keyframes telegram-entry {
		to {
			opacity: 1;
			transform: translateX(0) scale(1) rotate(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.telegram-entry-visible) {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
