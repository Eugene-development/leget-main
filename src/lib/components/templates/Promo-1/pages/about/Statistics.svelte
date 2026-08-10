<script lang="ts">
	// Артикул: 1.2.2.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { revealOnScroll } from './theme';
	import './theme.css';
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

	// Тема блока: нейтральная палитра — из классов p1-*, акценты не зависят от темы.
	const isLight = $derived(isLightBlock(data, 'light'));
	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Statistics', updated);
		data = updated;
	}

	async function updateStat(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedStats = [...stats];
		updatedStats[index] = { ...updatedStats[index], [field]: value };
		await saveField('stats', updatedStats);
	}

	const defaultStats = [
		{ value: '300+', label: 'Партнёрских салонов', color: 'sky' },
		{ value: '20+', label: 'Лет опыта', color: 'emerald' },
		{ value: '17', label: 'Городов России', color: 'violet' },
		{ value: '4000+', label: 'Реализованных проектов', color: 'amber' }
	];

	/**
	 * Палитра плиток. Ключи цветов прежние, добавлены только «одежды»:
	 * hairline — акцентная линия сверху, border — hover-кайма, glow — подсветка угла.
	 */
	const colorMap: Record<
		string,
		{ bg: string; line: string; hairline: string; border: string; glow: string }
	> = {
		sky: {
			bg: 'from-link-100 to-cat-5-100',
			line: 'from-link-500 to-cat-5-500',
			hairline: 'bg-linear-to-r from-transparent via-link-500 to-transparent',
			border: 'group-hover:border-link-500/40',
			glow: 'bg-link-500/10'
		},
		emerald: {
			bg: 'from-cat-2-100 to-cat-9-100',
			line: 'from-cat-2-500 to-cat-9-500',
			hairline: 'bg-linear-to-r from-transparent via-cat-2-500 to-transparent',
			border: 'group-hover:border-cat-2-500/40',
			glow: 'bg-cat-2-500/10'
		},
		violet: {
			bg: 'from-cat-3-100 to-cat-10-100',
			line: 'from-cat-3-500 to-cat-10-500',
			hairline: 'bg-linear-to-r from-transparent via-cat-3-500 to-transparent',
			border: 'group-hover:border-cat-3-500/40',
			glow: 'bg-cat-3-500/10'
		},
		amber: {
			bg: 'from-cat-1-100 to-cat-8-100',
			line: 'from-cat-1-500 to-cat-8-500',
			hairline: 'bg-linear-to-r from-transparent via-cat-1-500 to-transparent',
			border: 'group-hover:border-cat-1-500/40',
			glow: 'bg-cat-1-400/10'
		}
	};

	const stats = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultStats)
			: defaultStats
	);
</script>

<!--
	ВНИМАНИЕ — стык секций: фон обязан совпадать с заливкой волны Hero
	(`--ah-wave`, #f8fafc), потому что блок Text перед ним может быть пустым
	и не рендериться. Раньше секция была вообще без фона и показывала тёплый
	`--color-surface` (#faf9f7) — на границе с волной был виден шов.
-->
<section
	class="p1-surface-alt relative isolate overflow-hidden py-20 sm:py-24"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="ab-rules"></div>
	</div>

	<div use:revealOnScroll class="ab-reveal relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each stats as stat, i}
				{@const c = colorMap[stat.color] ?? colorMap.sky}
				<div
					class="ab-card group p1-border p1-card relative overflow-hidden rounded-3xl border p-8 shadow-[0_30px_80px_-50px] shadow-ink-900/35 transition duration-300 hover:shadow-[0_36px_90px_-44px] hover:shadow-ink-900/45 motion-safe:hover:-translate-y-1 {c.border}"
					style="--ab-delay: {i * 70}ms"
				>
					<!-- Цветное пятно в углу — прежний акцент плитки, теперь под каймой -->
					<div
						class="pointer-events-none absolute -top-6 -right-6 size-28 rounded-full bg-linear-to-br opacity-60 transition-transform duration-500 group-hover:scale-150 {c.bg}"
						aria-hidden="true"
					></div>
					<div
						class="pointer-events-none absolute inset-x-8 top-0 h-px opacity-70 transition-opacity duration-300 group-hover:opacity-100 {c.hairline}"
						aria-hidden="true"
					></div>
					<div
						class="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 {c.glow}"
						aria-hidden="true"
					></div>

					<div class="relative">
						<div class="p1-title text-5xl font-semibold tracking-[-0.04em] tabular-nums">
							<EditableField
								fieldKey="Statistics.{i}.value"
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
							class="p1-muted mt-3 text-[11px] font-semibold tracking-[0.16em] uppercase sm:text-xs"
						>
							<EditableField
								fieldKey="Statistics.{i}.label"
								label="Метка"
								value={stat.label}
								{isEditable}
								inline
								onSave={(v) => updateStat(i, 'label', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</div>
						<div
							class="mt-5 h-1 w-12 rounded-full bg-linear-to-r {c.line}"
							aria-hidden="true"
						></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
