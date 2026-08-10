<script lang="ts">
	// Артикул: 2.8.2.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
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
		await saveComponentData(editContext, 'ActionsTimer', updated);
		data = updated;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;
	let timeLeft = $state({ days: 0, hours: 0, minutes: 0, seconds: 0 });
	let timerInterval: ReturnType<typeof setInterval>;

	function calcTimeLeft() {
		const targetStr = String(data?.deadline ?? '2026-12-31T00:00:00');
		const target = new Date(targetStr);
		const now = new Date();
		const diff = target.getTime() - now.getTime();
		if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
		return {
			days: Math.floor(diff / (1000 * 60 * 60 * 24)),
			hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
			minutes: Math.floor((diff / (1000 * 60)) % 60),
			seconds: Math.floor((diff / 1000) % 60)
		};
	}

	function pad(n: number) {
		return String(n).padStart(2, '0');
	}

	onMount(() => {
		timeLeft = calcTimeLeft();
		timerInterval = setInterval(() => {
			timeLeft = calcTimeLeft();
		}, 1000);

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.25 }
		);
		if (sectionEl) observer.observe(sectionEl);

		return () => {
			observer.disconnect();
			clearInterval(timerInterval);
		};
	});
</script>

<section class="relative bg-surface pt-16 pb-24 lg:pt-24 lg:pb-32" bind:this={sectionEl}>
	<div class="mx-auto max-w-screen-xl px-6 xl:px-1">
		<div
			class="relative flex flex-col items-center gap-16 opacity-0 transition-all duration-700 lg:flex-row lg:justify-between lg:gap-24"
			class:animate-fade-up={visible}
		>
			<!-- Text content -->
			<div class="flex-1 text-center lg:text-left">
				<div class="mb-6 flex justify-center lg:justify-start">
					<span
						class="inline-flex items-center gap-2 border border-secondary/30 bg-transparent px-4 py-2 text-[10px] tracking-[0.3em] text-secondary uppercase"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-secondary"></span>
						<EditableField
							fieldKey="ActionsTimer.badge"
							label="Бейдж"
							value={String(data?.badge ?? 'Главные акции сезона')}
							{isEditable}
							onSave={(v) => saveField('badge', v)}
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</span>
				</div>

				<EditableField
					fieldKey="ActionsTimer.heading"
					label="Заголовок"
					value={String(data?.heading ?? 'Сезонные акции')}
					{isEditable}
					onSave={(v) => saveField('heading', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="text-4xl text-primary md:text-5xl lg:text-6xl"
							style="font-family: var(--font-heading);"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="ActionsTimer.description"
					label="Описание"
					value={String(data?.description ?? 'Успейте оформить заказ до окончания акции')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="mx-auto mt-6 max-w-md text-base leading-relaxed text-secondary lg:mx-0">
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<div class="mt-10">
					<EditableField
						fieldKey="ActionsTimer.ctaText"
						label="Текст кнопки"
						value={String(data?.ctaText ?? 'Консультация по акциям')}
						{isEditable}
						onSave={(v) => saveField('ctaText', v)}
					>
						{#snippet children(displayValue)}
							<a
								href={String(data?.ctaLink ?? '/contact')}
								class="group inline-flex cursor-pointer items-center gap-3 rounded-sm bg-primary px-8 py-4 text-xs tracking-[0.15em] text-white uppercase transition-all duration-500 hover:bg-secondary"
							>
								{displayValue}
								<svg
									class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
									/>
								</svg>
							</a>
						{/snippet}
					</EditableField>
				</div>
			</div>

			<!-- Timer display -->
			<div class="flex flex-wrap items-center justify-center gap-2 sm:gap-6 lg:justify-end">
				{#each [{ v: timeLeft.days, l: 'Дней' }, { v: timeLeft.hours, l: 'Часов' }, { v: timeLeft.minutes, l: 'Минут' }, { v: timeLeft.seconds, l: 'Секунд' }] as unit, i}
					<div class="flex w-[64px] flex-col items-center gap-2 sm:w-[90px] sm:gap-4 lg:w-[110px]">
						<div
							class="group relative flex aspect-square w-full items-center justify-center border border-border-light bg-white shadow-soft"
						>
							<div
								class="absolute inset-2 border border-border-light/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
							></div>
							<span
								class="text-3xl font-light tracking-tighter text-primary tabular-nums sm:text-5xl lg:text-6xl"
								style="font-family: var(--font-heading);"
							>
								{pad(unit.v)}
							</span>
						</div>
						<span class="text-[10px] tracking-[0.25em] text-secondary uppercase">{unit.l}</span>
					</div>
					{#if i < 3}
						<div
							class="flex flex-col items-center px-1 pb-6 text-2xl font-light text-border-medium sm:px-0 sm:pb-8 sm:text-4xl lg:pb-10 lg:text-5xl"
						>
							:
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</section>
