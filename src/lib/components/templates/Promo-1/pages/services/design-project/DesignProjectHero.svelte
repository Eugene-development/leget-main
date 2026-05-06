<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
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
		await saveComponentData(editContext, 'DesignProjectHero', updated);
		data = updated;
	}
</script>

<section class="relative min-h-[85vh] flex items-center overflow-hidden bg-slate-950 py-24 lg:py-0">
	<div class="absolute inset-0 z-0">
		<div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
		<div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent blur-[120px]"></div>
	</div>

	<div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 w-full">
		<div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
			<div in:fly={{ y: 30, duration: 1000, easing: cubicOut }}>
				<EditableField
					fieldKey="DesignProjectHero.badge"
					label="Бейдж"
					value={String(data?.badge ?? 'Проектирование полного цикла')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="mb-8 inline-block"
				>
					{#snippet children(displayValue)}
						<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
							{displayValue}
						</div>
					{/snippet}
				</EditableField>

				<h1 class="text-5xl font-black tracking-tight text-white sm:text-7xl leading-[1.05]">
					<EditableField
						fieldKey="DesignProjectHero.title_part1"
						label="Заголовок часть 1"
						value={String(data?.title_part1 ?? 'Дизайн')}
						{isEditable}
						onSave={(v) => saveField('title_part1', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							{displayValue}
						{/snippet}
					</EditableField>
					<br/>
					<EditableField
						fieldKey="DesignProjectHero.title_part2"
						label="Заголовок часть 2"
						value={String(data?.title_part2 ?? 'проектирование')}
						{isEditable}
						onSave={(v) => saveField('title_part2', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							<span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{displayValue}</span>
						{/snippet}
					</EditableField>
				</h1>

				<EditableField
					fieldKey="DesignProjectHero.description"
					label="Описание"
					value={String(data?.description ?? 'Создаем не просто красивые картинки, а детально проработанные технические решения для безупречной реализации вашего интерьера.')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="mt-8 block"
				>
					{#snippet children(displayValue)}
						<p class="text-xl text-slate-400 leading-relaxed max-w-xl">
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<div class="mt-12 flex flex-wrap items-center gap-8">
					<EditableField
						fieldKey="DesignProjectHero.cta_text"
						label="Текст кнопки"
						value={String(data?.cta_text ?? 'Начать проект')}
						{isEditable}
						onSave={(v) => saveField('cta_text', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							<button
								type="button"
								class="group relative inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-10 py-5 text-base font-black text-white shadow-2xl shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-emerald-500/40 active:scale-95"
							>
								<span>{displayValue}</span>
							</button>
						{/snippet}
					</EditableField>
				</div>
			</div>

			<div class="relative" in:fly={{ x: 60, duration: 1200, delay: 200, easing: cubicOut }}>
				<div class="relative group">
					<div class="relative z-10 overflow-hidden rounded-[3rem] border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
						<img
							src={String(data?.hero_image ?? 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200')}
							alt="Interior Design Visualization"
							class="w-full aspect-[4/5] object-cover"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
