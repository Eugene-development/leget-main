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
		await saveComponentData(editContext, 'Advantages', updated);
		data = updated;
	}

	const defaultStats = [
		{ value: '500+', label: 'Выполненных проектов' },
		{ value: '14',   label: 'Дней — средний срок'  },
		{ value: '5',    label: 'Лет гарантии'          },
		{ value: '0%',   label: 'Переплата по рассрочке'}
	];

	const defaultFeatures = [
		'Собственное производство полного цикла',
		'Европейская фурнитура: Hettich, Blum, Egger',
		'Бесплатный 3D дизайн-проект',
		'Доставка и профессиональный монтаж',
		'Работаем без предоплаты',
		'Фиксируем цену в договоре'
	];

	const stats = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultStats)
			: defaultStats
	);

	const features = $derived(
		Array.isArray(data?.features) && (data.features as unknown[]).length > 0
			? (data.features as string[])
			: defaultFeatures
	);
</script>

<section class="relative py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<div class="grid items-start gap-16 lg:grid-cols-2 lg:gap-24">

			<!-- Left: stats -->
			<div>
				<EditableField
					fieldKey="Advantages.label"
					label="Лейбл"
					value={String(data?.label ?? 'Наши преимущества')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase">{displayValue}</span>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Advantages.title"
					label="Заголовок"
					value={String(data?.title ?? 'Цифры говорят за нас')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="mt-3 font-display text-4xl font-bold tracking-wide text-white lg:text-5xl">
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<!-- Stats grid -->
				<div class="mt-12 grid grid-cols-2 gap-6">
					{#each stats as stat}
						<div class="rounded-2xl border border-surface-700/50 bg-surface-800/30 p-6">
							<div class="font-display text-4xl font-bold text-accent-500">{stat.value}</div>
							<div class="mt-2 text-sm text-surface-300">{stat.label}</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Right: features -->
			<div class="relative rounded-3xl border border-surface-700/50 bg-surface-800/30 p-8 lg:p-10">
				<!-- Accent line top -->
				<div class="absolute -top-px left-10 h-px w-20 bg-linear-to-r from-transparent via-accent-500 to-transparent"></div>

				<p class="mb-8 text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase">Что вы получаете</p>

				<div class="flex flex-col gap-0">
					{#each features as feature}
						<div class="flex items-center gap-4 border-b border-surface-700/40 py-4 first:border-t">
							<div class="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-500/10">
								<svg class="size-3 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
									<polyline points="20 6 9 17 4 12"/>
								</svg>
							</div>
							<span class="text-sm text-surface-200">{feature}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
