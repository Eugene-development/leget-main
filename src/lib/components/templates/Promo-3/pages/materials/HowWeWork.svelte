<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let { data = $bindable(), editContext = null, isEditable = false }: { data: Record<string, unknown>; editContext?: EditContext | null; isEditable?: boolean } = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'HowWeWork', updated);
		data = updated;
	}

	const defaultSteps = [
		{ step: '01', title: 'Консультация',        desc: 'Обсуждаем ваш проект, замеры и предпочтения по дизайну'                                    },
		{ step: '02', title: 'Подбор материала',    desc: 'Предлагаем оптимальные варианты с учётом бюджета и стиля'                                   },
		{ step: '03', title: 'Расчёт количества',   desc: 'Точно рассчитываем необходимое количество с учётом раскладки и обрезков'                    },
		{ step: '04', title: 'Доставка и укладка',  desc: 'Организуем доставку и при желании — укладку с нашими мастерами'                             },
	];
	const steps = $derived(Array.isArray(data?.steps) && (data.steps as unknown[]).length > 0 ? (data.steps as typeof defaultSteps) : defaultSteps);
</script>

<section class="relative bg-surface-800/30 py-24 lg:py-32">
	<div class="pointer-events-none absolute inset-0 opacity-[0.02]" style="background-image: linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px); background-size: 40px 40px;"></div>
	<div class="relative px-10 lg:px-24 xl:px-32">
		<div class="mb-14 text-center">
			<EditableField fieldKey="HowWeWork.heading" label="Заголовок" value={String(data?.heading ?? 'Как мы работаем')} {isEditable} onSave={(v) => saveField('heading', v)} class="block">
				{#snippet children(displayValue)}<h2 class="font-display text-3xl font-bold text-white lg:text-4xl">{displayValue}</h2>{/snippet}
			</EditableField>
			<EditableField fieldKey="HowWeWork.description" label="Описание" value={String(data?.description ?? 'Простой процесс от выбора до укладки')} {isEditable} onSave={(v) => saveField('description', v)} class="block">
				{#snippet children(displayValue)}<p class="mt-4 text-surface-400">{displayValue}</p>{/snippet}
			</EditableField>
		</div>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
			{#each steps as item}
				<div class="relative">
					<div class="mb-4 inline-flex size-12 items-center justify-center rounded-xl border border-accent-500/20 bg-accent-500/5 font-display text-lg font-bold text-accent-500">{item.step}</div>
					<h3 class="font-display text-lg font-bold text-white">{item.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-surface-400">{item.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
