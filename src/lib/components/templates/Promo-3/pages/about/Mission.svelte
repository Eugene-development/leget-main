<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let { data = $bindable(), editContext = null, isEditable = false }: { data: Record<string, unknown>; editContext?: EditContext | null; isEditable?: boolean } = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Mission', updated);
		data = updated;
	}
</script>

<section class="relative py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
			<div>
				<EditableField fieldKey="Mission.label" label="Лейбл" value={String(data?.label ?? 'Наша миссия')} {isEditable} onSave={(v) => saveField('label', v)}>
					{#snippet children(displayValue)}<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase">{displayValue}</span>{/snippet}
				</EditableField>
				<EditableField fieldKey="Mission.heading" label="Заголовок" value={String(data?.heading ?? 'Красота в каждом квадратном метре')} {isEditable} onSave={(v) => saveField('heading', v)} class="block">
					{#snippet children(displayValue)}<h2 class="mt-4 font-display text-4xl leading-tight font-bold tracking-wide text-white lg:text-5xl">{displayValue}</h2>{/snippet}
				</EditableField>
				<EditableField fieldKey="Mission.text1" label="Абзац 1" value={String(data?.text1 ?? 'Мы появились из простой идеи: каждый человек заслуживает красивого дома, а красивый дом начинается с правильных материалов. Мы убрали лишних посредников, наладили прямые поставки и собрали команду настоящих экспертов.')} {isEditable} multiline onSave={(v) => saveField('text1', v)} class="block">
					{#snippet children(displayValue)}<p class="mt-6 text-lg leading-relaxed text-surface-300">{displayValue}</p>{/snippet}
				</EditableField>
				<EditableField fieldKey="Mission.text2" label="Абзац 2" value={String(data?.text2 ?? 'Сегодня мы работаем с частными клиентами, дизайнерами и застройщиками по всей России. Наш принцип неизменен: предлагать лучшее качество по честной цене и помогать на каждом этапе — от выбора до укладки.')} {isEditable} multiline onSave={(v) => saveField('text2', v)} class="block">
					{#snippet children(displayValue)}<p class="mt-4 leading-relaxed text-surface-300">{displayValue}</p>{/snippet}
				</EditableField>
			</div>

			<div class="relative">
				<div class="relative rounded-3xl border border-surface-700/50 bg-surface-800/50 p-10 backdrop-blur-sm">
					<div class="absolute -top-px left-10 h-px w-20 bg-gradient-to-r from-transparent via-accent-500 to-transparent"></div>
					<div class="mb-6 font-display text-6xl leading-none text-accent-500/20">"</div>
					<EditableField fieldKey="Mission.quote" label="Цитата" value={String(data?.quote ?? 'Плитка — это не просто материал. Это основа атмосферы, которую вы создаёте в своём доме.')} {isEditable} multiline onSave={(v) => saveField('quote', v)} class="block">
						{#snippet children(displayValue)}<blockquote class="font-display text-2xl leading-snug font-semibold text-white">{displayValue}</blockquote>{/snippet}
					</EditableField>
					<div class="mt-8 flex items-center gap-4">
						<div class="flex size-12 items-center justify-center rounded-full border border-accent-500/30 bg-accent-500/10 font-display text-lg font-bold text-accent-500">
							{String(data?.quoteInitials ?? 'АП')}
						</div>
						<div>
							<div class="text-sm font-semibold text-white">{String(data?.quoteName ?? 'Александр Петров')}</div>
							<div class="text-xs text-surface-300">{String(data?.quoteRole ?? 'Основатель компании')}</div>
						</div>
					</div>
				</div>
				<div class="absolute -right-4 -bottom-4 size-24 rounded-2xl border border-accent-500/10 bg-accent-500/5"></div>
			</div>
		</div>
	</div>
</section>
