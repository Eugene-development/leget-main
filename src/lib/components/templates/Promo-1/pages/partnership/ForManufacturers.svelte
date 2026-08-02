<script lang="ts">
	// Артикул: 1.6.3.1 — см. docs/architecture/component-articles-map.md
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

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ForManufacturers', updated);
		data = updated;
	}

	const defaultStats = [
		{ value: '500+', label: 'агентов' },
		{ value: '20+',  label: 'лет опыта' },
		{ value: '140+', label: 'партнёров' },
		{ value: '90%',  label: 'конверсия' },
		{ value: '24/7', label: 'поддержка' },
		{ value: '100%', label: 'успех' },
	];

	const defaultBenefits = [
		'Продвижение вашей продукции',
		'Широкая клиентская база',
		'Профессиональные кураторы',
		'Маркетинговая поддержка',
	];

	async function updateStat(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedStats = [...stats];
		updatedStats[index] = { ...updatedStats[index], [field]: value };
		await saveField('stats', updatedStats);
	}

	async function updateBenefit(index: number, value: string) {
		if (!editContext) return;
		const updatedBenefits = [...benefits];
		updatedBenefits[index] = value;
		await saveField('benefits', updatedBenefits);
	}

	const stats = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultStats)
			: defaultStats
	);

	const benefits = $derived(
		Array.isArray(data?.benefits) && (data.benefits as unknown[]).length > 0
			? (data.benefits as string[])
			: defaultBenefits
	);

	/** Появление блока при попадании во вьюпорт (сценарий страницы «Партнёрство»). */
	function revealOnScroll(node: HTMLElement) {
		if (typeof IntersectionObserver === 'undefined') {
			node.classList.add('fm-visible');
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				node.classList.add('fm-visible');
				observer.unobserve(node);
			},
			{ threshold: 0.15 }
		);

		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

<section
	class="relative isolate overflow-hidden bg-linear-to-br from-slate-800 to-slate-900 py-24 sm:py-28"
>
	<!-- Декор: сетка, красное свечение-акцент, волосяные линии по краям -->
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="fm-grid"></div>
		<div class="fm-glow absolute -top-40 -left-24 size-112 bg-red-500/15"></div>
		<div class="fm-glow absolute -right-32 bottom-0 size-96 bg-slate-400/10"></div>
		<div
			class="absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-linear-to-r from-transparent via-red-500/60 to-transparent"
		></div>
		<div
			class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"
		></div>
	</div>

	<div use:revealOnScroll class="fm-reveal relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
			<div>
				<EditableField
					fieldKey="ForManufacturers.badge"
					label="Бейдж"
					value={String(data?.badge ?? 'Вы организация?')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="fm-item inline-block"
				>
					{#snippet children(displayValue)}
						<div
							class="inline-flex items-center gap-2.5 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-red-400 uppercase sm:text-xs"
						>
							<span class="size-1.5 rounded-full bg-red-400 shadow-[0_0_12px_2px_rgba(248,113,113,0.7)]" aria-hidden="true"></span>
							{displayValue}
						</div>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="ForManufacturers.title"
					label="Заголовок"
					value={String(data?.title ?? 'Для производителей и поставщиков')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="fm-item fm-d1 mt-6 block"
				>
					{#snippet children(displayValue)}
						<h2
							class="text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-pretty text-white sm:text-4xl lg:text-5xl"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<!-- <EditableField
					fieldKey="ForManufacturers.text"
					label="Описание"
					value={String(data?.text ?? 'Мы готовы предложить уникальные возможности для совместного развития. Наш опыт и современные технологии маркетинга помогут привлечь новых лояльных клиентов.')}
					{isEditable}
					multiline
					onSave={(v) => saveField('text', v)}
					class="fm-item fm-d2 mt-6 block"
				>
					{#snippet children(displayValue)}
						<p class="max-w-xl text-sm/6 text-slate-300 sm:text-base/7">{displayValue}</p>
					{/snippet}
				</EditableField> -->

				<div class="fm-item fm-d3 mt-8 space-y-3">
					{#each benefits as benefit, i}
						<div
							class="group flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-slate-200 backdrop-blur-sm transition duration-300 hover:border-red-500/40 hover:bg-white/6"
						>
							<span
								class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400 ring-1 ring-red-500/25 transition duration-300 group-hover:bg-red-500 group-hover:text-white"
								aria-hidden="true"
							>
								<svg class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
								</svg>
							</span>
							<span class="text-sm/6 sm:text-base/7">
								<EditableField
									fieldKey="ForManufacturers.benefits.{i}"
									label="Преимущество"
									value={benefit}
									{isEditable}
									inline
									onSave={(v) => updateBenefit(i, v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</span>
						</div>
					{/each}
				</div>

				<div class="fm-item fm-d4 mt-9 flex flex-wrap gap-4">
					<a
						href="/contact"
						class="group inline-flex items-center justify-center gap-2.5 rounded-full bg-red-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(239,68,68,0.95)] transition duration-300 hover:bg-red-400 hover:shadow-[0_22px_55px_-16px_rgba(239,68,68,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 motion-safe:hover:-translate-y-0.5"
					>
						<EditableField
							fieldKey="ForManufacturers.buttonText"
							label="Текст кнопки"
							value={String(data?.buttonText ?? 'Оставить заявку')}
							{isEditable}
							onSave={(v) => saveField('buttonText', v)}
							class="inline"
						>
							{#snippet children(displayValue)}
								{displayValue}
							{/snippet}
						</EditableField>
						<span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
					</a>
				</div>
			</div>

			<!-- Статистика: плитки с градиентной каймой и акцентной линией -->
			<div class="mt-12 lg:mt-0">
				<div class="grid grid-cols-2 gap-4">
					{#each stats as stat, i}
						<div
							class="fm-tile group relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-sm transition duration-300 hover:border-red-500/40 hover:bg-white/8 motion-safe:hover:-translate-y-1"
							style="--fm-delay: {200 + i * 70}ms"
						>
							<div
								class="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-red-500/70 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100"
								aria-hidden="true"
							></div>
							<div
								class="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-red-500/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
								aria-hidden="true"
							></div>

							<div
								class="relative text-4xl font-semibold tracking-[-0.03em] tabular-nums text-white sm:text-5xl"
							>
								<EditableField
									fieldKey="ForManufacturers.stats.{i}.value"
									label="Значение"
									value={stat.value}
									{isEditable}
									inline
									onSave={(v) => updateStat(i, 'value', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</div>
							<div
								class="relative mt-2 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase sm:text-xs"
							>
								<EditableField
									fieldKey="ForManufacturers.stats.{i}.label"
									label="Метка"
									value={stat.label}
									{isEditable}
									inline
									onSave={(v) => updateStat(i, 'label', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* Классы глобальные: часть анимируемых узлов — обёртки <EditableField>. */

	:global(.fm-grid) {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.8) 1px, transparent 1px);
		background-size: 56px 56px;
		opacity: 0.05;
		mask-image: radial-gradient(circle at 30% 20%, black, transparent 70%);
	}

	:global(.fm-glow) {
		filter: blur(80px);
		border-radius: 9999px;
	}

	@keyframes fm-rise {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(.fm-reveal .fm-item),
	:global(.fm-reveal .fm-tile) {
		opacity: 0;
	}

	/*
		fill-mode = backwards: при `both` финальный transform анимации остаётся
		на элементе и перебивает hover-подъём плиток.
	*/
	:global(.fm-visible .fm-item),
	:global(.fm-visible .fm-tile) {
		opacity: 1;
		animation: fm-rise 720ms cubic-bezier(0.22, 1, 0.36, 1) var(--fm-delay, 0ms) backwards;
	}

	:global(.fm-d1) {
		--fm-delay: 80ms;
	}
	:global(.fm-d2) {
		--fm-delay: 160ms;
	}
	:global(.fm-d3) {
		--fm-delay: 240ms;
	}
	:global(.fm-d4) {
		--fm-delay: 320ms;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.fm-reveal .fm-item),
		:global(.fm-reveal .fm-tile),
		:global(.fm-visible .fm-item),
		:global(.fm-visible .fm-tile) {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
