<script lang="ts">
	import { openPromo2Form } from '$lib/components/templates/Promo-2/forms/request';
	// Артикул: 2.13.1.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import RichText from '$lib/components/RichText.svelte';
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
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}

	const defaultStats = [
		{ value: '5%', label: 'дополнительная скидка' },
		{ value: '500+', label: 'дизайнеров-партнёров' },
		{ value: '2 ч', label: 'время ответа менеджера' },
		{ value: '30 дн', label: 'срок производства' }
	];

	const stats = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultStats)
			: defaultStats
	);

	let visible = $state(false);
	let sectionEl: HTMLElement;
	let chromeHeight = $state(0);

	onMount(() => {
		const chrome = document.querySelector<HTMLElement>('[data-scroll-chrome], .promo2-header');
		const resizeObserver = new ResizeObserver(() => {
			chromeHeight = chrome?.getBoundingClientRect().height ?? 0;
		});
		if (chrome) {
			chromeHeight = chrome.getBoundingClientRect().height;
			resizeObserver.observe(chrome);
		}
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => {
			observer.disconnect();
			resizeObserver.disconnect();
		};
	});
</script>

<section
	bind:this={sectionEl}
	class="relative flex items-center overflow-hidden bg-primary py-12 lg:py-16"
	style:min-height="calc(100svh - {chromeHeight}px)"
>
	<div class="absolute inset-0">
		<ImageFallback
			imagePath={['image']}
			src={String(
				data?.image ??
					'https://storage.yandexcloud.net/leget-main/templates/promo-2/designers-hero-realistic-20261105.webp'
			)}
			alt="Рабочее пространство дизайнера интерьера"
			class="h-full w-full object-cover"
		/>
		<div
			class="pointer-events-none absolute inset-0 bg-linear-to-r from-primary/95 via-primary/75 to-primary/45"
		></div>
	</div>
	<!-- Geometric decorations -->
	<div
		class="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 border border-white/5"
	></div>
	<div
		class="absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 translate-y-1/3 border border-white/5"
	></div>
	<div class="absolute top-20 right-24 h-32 w-32 border border-white/5"></div>
	<div
		class="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-transparent via-secondary to-transparent opacity-40"
	></div>

	<div class="relative p2-container mx-auto w-full">
		<div class="max-w-2xl">
			<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.4s">
				<EditableField
					fieldKey="Hero.title"
					label="Заголовок"
					value={String(data?.title ?? 'Для дизайнеров и студий')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h1
							class="text-5xl text-white md:text-6xl lg:text-7xl"
							style="font-family: var(--font-heading);"
						>
							<RichText value={displayValue} />
						</h1>
					{/snippet}
				</EditableField>
			</div>

			<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.6s">
				<EditableField
					fieldKey="Hero.description"
					label="Описание"
					value={String(
						data?.description ??
							'Станьте партнёром фабрики — и предлагайте клиентам премиальную мебель с эксклюзивными условиями.'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="mt-7 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
							<RichText value={displayValue} />
						</p>
					{/snippet}
				</EditableField>
			</div>

			<div
				class="mt-10 flex flex-wrap items-center gap-4 opacity-0"
				class:animate-fade-up={visible}
				style="animation-delay: 0.8s"
			>
				<button
					class="group inline-flex items-center gap-3 rounded-sm border border-accent bg-accent px-8 py-4 text-xs tracking-[0.15em] text-primary uppercase transition-all duration-500 hover:border-accent hover:bg-transparent hover:text-accent"
					type="button"
					data-metrika-goal="pages_designers_hero_open"
					data-goal-action="open"
					onclick={() => {
						if (!isEditable) openPromo2Form('partnership', '');
					}}
				>
					Стать партнёром
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
				</button>
				<a
					href="#how-it-works"
					class="inline-flex items-center gap-2 rounded-sm border border-white/20 px-8 py-4 text-xs tracking-[0.15em] text-white/80 uppercase transition-all duration-500 hover:border-white/50 hover:text-white"
				>
					Как это работает
				</a>
			</div>
		</div>

		<!-- Stats row -->
		<div
			class="stats-glass mt-20 grid grid-cols-2 opacity-0 md:grid-cols-4"
			class:animate-fade-up={visible}
			style="animation-delay: 1s"
		>
			{#each stats as stat}
				<div class="stats-glass-item flex flex-col gap-1.5 px-6 py-6 xl:px-8">
					<span
						class="text-3xl font-light text-accent-light"
						style="font-family: var(--font-heading);">{stat.value}</span
					>
					<span class="text-xs tracking-wide text-white/80">{stat.label}</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.stats-glass {
		overflow: hidden;
		border: 1px solid rgb(255 255 255 / 22%);
		border-radius: 1.5rem;
		background: linear-gradient(
			135deg,
			rgb(255 255 255 / 16%),
			rgb(255 255 255 / 4%) 55%,
			rgb(255 255 255 / 9%)
		);
		box-shadow:
			0 16px 40px rgb(0 0 0 / 18%),
			inset 0 1px 0 rgb(255 255 255 / 24%),
			inset 0 -1px 0 rgb(255 255 255 / 6%);
		-webkit-backdrop-filter: blur(24px) saturate(145%);
		backdrop-filter: blur(24px) saturate(145%);
	}

	.stats-glass-item:nth-child(even) {
		border-left: 1px solid rgb(255 255 255 / 14%);
	}

	.stats-glass-item:nth-child(n + 3) {
		border-top: 1px solid rgb(255 255 255 / 14%);
	}

	@media (min-width: 768px) {
		.stats-glass-item + .stats-glass-item {
			border-left: 1px solid rgb(255 255 255 / 14%);
		}

		.stats-glass-item:nth-child(n + 3) {
			border-top: 0;
		}
	}
</style>
