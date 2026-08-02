<script lang="ts">
	// Артикул: 3.5.2.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let { data = $bindable(), editContext = null, isEditable = false }: { data: Record<string, unknown>; editContext?: EditContext | null; isEditable?: boolean } = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Salons', updated);
		data = updated;
	}

	const defaultSalons = [
		{ name: 'Салон на Арбате',       address: 'г. Москва, ул. Новый Арбат, 24',          hours: 'Пн–Вс: 10:00 – 20:00', metro: 'м. Арбатская',   phone: '+7 (495) 123-45-67' },
		{ name: 'Салон на Маяковской',   address: 'г. Москва, ул. 1-я Тверская-Ямская, 10',  hours: 'Пн–Вс: 10:00 – 20:00', metro: 'м. Маяковская',  phone: '+7 (495) 234-56-78' },
		{ name: 'Салон в Мытищах',       address: 'г. Мытищи, ш. Ярославское, 116',          hours: 'Пн–Сб: 09:00 – 19:00', metro: 'ж/д Мытищи',     phone: '+7 (498) 345-67-89' },
		{ name: 'Салон в Красногорске',  address: 'г. Красногорск, ул. Ленина, 52',           hours: 'Пн–Сб: 09:00 – 19:00', metro: 'м. Митино (авт.)', phone: '+7 (495) 456-78-90' },
	];

	const salons = $derived(Array.isArray(data?.salons) && (data.salons as unknown[]).length > 0 ? (data.salons as typeof defaultSalons) : defaultSalons);
</script>

<section class="relative py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<div class="mb-16">
			<EditableField fieldKey="Salons.label" label="Лейбл" value={String(data?.label ?? 'Партнёрские салоны')} {isEditable} onSave={(v) => saveField('label', v)}>
				{#snippet children(displayValue)}<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase">{displayValue}</span>{/snippet}
			</EditableField>
			<EditableField fieldKey="Salons.heading" label="Заголовок" value={String(data?.heading ?? 'Посмотрите образцы вживую')} {isEditable} onSave={(v) => saveField('heading', v)} class="block">
				{#snippet children(displayValue)}<h2 class="mt-3 font-display text-4xl font-bold tracking-wide text-white lg:text-5xl">{displayValue}</h2>{/snippet}
			</EditableField>
			<EditableField fieldKey="Salons.description" label="Описание" value={String(data?.description ?? 'В наших партнёрских салонах представлены сотни коллекций — вы можете оценить фактуру, цвет и качество плитки перед покупкой.')} {isEditable} multiline onSave={(v) => saveField('description', v)} class="block">
				{#snippet children(displayValue)}<p class="mt-4 max-w-2xl text-surface-300">{displayValue}</p>{/snippet}
			</EditableField>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each salons as salon}
				<div class="group rounded-2xl border border-surface-700/50 bg-surface-800/40 p-7 transition-all duration-500 hover:border-accent-500/30 hover:bg-surface-800/70 hover:shadow-2xl hover:shadow-accent-500/5">
					<div class="mb-5 flex size-12 items-center justify-center rounded-xl border border-accent-500/20 bg-accent-500/10 transition-all duration-300 group-hover:border-accent-500/50 group-hover:bg-accent-500/15">
						<svg viewBox="0 0 24 24" class="size-5 fill-none stroke-accent-500 stroke-2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-4.97-5.08-8-8.46-8-11a8 8 0 0116 0c0 2.54-3.03 5.92-8 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
					</div>
					<h3 class="text-base font-bold text-white">{salon.name}</h3>
					<div class="mt-4 flex flex-col gap-2.5">
						<div class="flex items-start gap-2"><span class="mt-0.5 shrink-0 text-accent-500"><svg viewBox="0 0 16 16" class="size-3.5 fill-current"><path fill-rule="evenodd" d="M8 1a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM2.5 5.5a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0zm4.95 5.854a6.5 6.5 0 013.1 0A8.001 8.001 0 0115 15H1a8.001 8.001 0 014.45-3.646z" clip-rule="evenodd" /></svg></span><span class="text-sm text-surface-300">{salon.metro}</span></div>
						<div class="flex items-start gap-2"><span class="mt-0.5 shrink-0 text-accent-500"><svg viewBox="0 0 16 16" class="size-3.5 fill-current"><path d="M8 1a5.5 5.5 0 100 11A5.5 5.5 0 008 1zm0 10.5a5 5 0 110-10 5 5 0 010 10z" /></svg></span><span class="text-sm text-surface-300">{salon.address}</span></div>
						<div class="flex items-center gap-2"><span class="shrink-0 text-accent-500"><svg viewBox="0 0 16 16" class="size-3.5 fill-current"><path fill-rule="evenodd" d="M1 8a7 7 0 1114 0A7 7 0 011 8zm7.75-4.25a.75.75 0 00-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 000-1.5h-2.5V3.75z" clip-rule="evenodd" /></svg></span><span class="text-sm text-surface-300">{salon.hours}</span></div>
					</div>
					<a href="tel:{salon.phone.replace(/\D/g, '')}" class="mt-6 flex items-center gap-2 text-sm font-semibold text-accent-500 transition-colors hover:text-accent-400">{salon.phone}</a>
				</div>
			{/each}
		</div>
	</div>
</section>
