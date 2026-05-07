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

	const reasons = $derived(
		Array.isArray(data?.reasons) && data.reasons.length > 0
			? (data.reasons as { num: string; title: string; desc: string }[])
			: [
					{ num: '01', title: 'Экономия бюджета', desc: 'Избежите дорогих ошибок при выборе мебели и материалов' },
					{ num: '02', title: 'Чёткое видение', desc: 'Получите понятный план действий ещё до начала ремонта' },
					{ num: '03', title: 'Индивидуальный подход', desc: 'Решения, учитывающие ваш образ жизни и предпочтения' }
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ConsultationWhy', updated);
		data = updated;
	}

	async function saveReason(index: number, field: string, value: string) {
		if (!editContext) return;
		const newReasons = [...reasons];
		newReasons[index] = { ...newReasons[index], [field]: value };
		const updated = { ...data, reasons: newReasons };
		await saveComponentData(editContext, 'ConsultationWhy', updated);
		data = updated;
	}
</script>

<section class="bg-slate-50 py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid items-center gap-16 lg:grid-cols-2">
			<!-- Изображение с геометрией -->
			<div class="relative">
				<div class="absolute -bottom-6 -right-6 size-48 rounded-[2.5rem] bg-amber-500 lg:size-64"></div>
				<div class="absolute -left-4 -top-4 size-32 rounded-full bg-sky-500/30 blur-2xl"></div>
				<div class="relative overflow-hidden rounded-[2.5rem] shadow-2xl transition duration-500 hover:scale-105 border border-white/20">
					<img
						src={String(data?.imageUrl ?? "/consultation_process.png")}
						alt="Дизайн интерьера"
						class="aspect-square w-full object-cover"
					/>
				</div>
			</div>

			<!-- Преимущества -->
			<div>
				<EditableField
					fieldKey="ConsultationWhy.title"
					label="Заголовок"
					value={String(data?.title ?? 'Почему начать с консультации?')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="text-pretty text-4xl font-black tracking-tight text-slate-900 sm:text-5xl leading-tight">
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<dl class="mt-12 space-y-10">
					{#each reasons as item, i}
						<div class="flex gap-8 group">
							<dt class="text-5xl font-black text-amber-500/20 group-hover:text-amber-500 transition-colors duration-300">{item.num}</dt>
							<dd class="pt-1">
								<EditableField
									fieldKey={`ConsultationWhy.reason_${i}_title`}
									label="Заголовок преимущества"
									value={item.title}
									{isEditable}
									onSave={(v) => saveReason(i, 'title', v)}
									class="block"
								>
									{#snippet children(displayValue)}
										<p class="text-xl font-bold text-slate-900">{displayValue}</p>
									{/snippet}
								</EditableField>

								<EditableField
									fieldKey={`ConsultationWhy.reason_${i}_desc`}
									label="Описание преимущества"
									value={item.desc}
									{isEditable}
									multiline
									onSave={(v) => saveReason(i, 'desc', v)}
									class="mt-2 block"
								>
									{#snippet children(displayValue)}
										<p class="text-base/7 text-slate-600 font-medium">
											{displayValue}
										</p>
									{/snippet}
								</EditableField>
							</dd>
						</div>
					{/each}
				</dl>
			</div>
		</div>
	</div>
</section>
