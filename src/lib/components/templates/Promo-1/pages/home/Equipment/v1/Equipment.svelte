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
		await saveComponentData(editContext, 'Equipment', updated);
		data = updated;
	}
</script>

<!-- Комплектация проектов (Equipment) -->
<section class="relative overflow-hidden bg-slate-50/50 py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto mb-16 max-w-2xl text-center lg:max-w-none lg:text-left">
			<span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
				<EditableField
					fieldKey="Equipment.badge"
					label="Метка"
					value={String(data?.badge ?? 'Дополнительно')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</span>
			<EditableField
				fieldKey="Equipment.title"
				label="Заголовок"
				value={String(data?.title ?? 'Комплектация проектов')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">{displayValue}</h2>
				{/snippet}
			</EditableField>
		</div>

		<div class="grid gap-8 lg:grid-cols-6 lg:grid-rows-2">
			<!-- Столешницы -->
			<div class="group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-500 hover:shadow-xl hover:ring-slate-300 lg:col-span-3">
				<div class="aspect-video w-full overflow-hidden">
					<img class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={String(data?.item1Image ?? '/equipment/worktops.png')} alt="Столешницы" />
				</div>
				<div class="p-8">
					<h3 class="text-xl font-bold text-slate-900 transition-colors group-hover:text-sky-600">
						{String(data?.item1Title ?? 'Столешницы')}
					</h3>
					<p class="mt-3 text-base leading-relaxed text-slate-600">
						{String(data?.item1Description ?? 'Широкий выбор дизайнов для вашей кухни. Качественные столешницы от ведущих производителей. Большой выбор материалов и цветов')}
					</p>
				</div>
			</div>

			<!-- Системы выдвижения -->
			<div class="group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-500 hover:shadow-xl hover:ring-slate-300 lg:col-span-3">
				<div class="aspect-video w-full overflow-hidden">
					<img class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={String(data?.item2Image ?? '/equipment/drawers.png')} alt="Системы выдвижения" />
				</div>
				<div class="p-8">
					<h3 class="text-xl font-bold text-slate-900 transition-colors group-hover:text-sky-600">
						{String(data?.item2Title ?? 'Системы выдвижения')}
					</h3>
					<p class="mt-3 text-base leading-relaxed text-slate-600">
						{String(data?.item2Description ?? 'Современные механизмы Hettich и BLUM, обеспечивающие плавность, надежность и бесшумность. Широкий ассортимент для комфортного хранения')}
					</p>
				</div>
			</div>

			<!-- Бытовая техника -->
			<div class="group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-500 hover:shadow-xl hover:ring-slate-300 lg:col-span-2">
				<div class="aspect-4/4 w-full overflow-hidden">
					<img class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={String(data?.item3Image ?? '/equipment/appliances.png')} alt="Бытовая техника" />
				</div>
				<div class="p-6">
					<h3 class="text-lg font-bold text-slate-900 transition-colors group-hover:text-sky-600">
						{String(data?.item3Title ?? 'Бытовая техника')}
					</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">
						{String(data?.item3Description ?? 'Встраиваемая и отдельностоящая техника от проверенных производителей с гарантией')}
					</p>
				</div>
			</div>

			<!-- Мойки и смесители -->
			<div class="group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-500 hover:shadow-xl hover:ring-slate-300 lg:col-span-2">
				<div class="aspect-4/4 w-full overflow-hidden">
					<img class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={String(data?.item4Image ?? '/equipment/sinks.png')} alt="Мойки и смесители" />
				</div>
				<div class="p-6">
					<h3 class="text-lg font-bold text-slate-900 transition-colors group-hover:text-sky-600">
						{String(data?.item4Title ?? 'Мойки и смесители')}
					</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">
						{String(data?.item4Description ?? 'Качественная сантехника от ведущих мировых производителей с гарантией до 5 лет')}
					</p>
				</div>
			</div>

			<!-- Освещение -->
			<div class="group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-500 hover:shadow-xl hover:ring-slate-300 lg:col-span-2">
				<div class="aspect-4/4 w-full overflow-hidden">
					<img class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={String(data?.item5Image ?? '/equipment/lighting.png')} alt="Освещение" />
				</div>
				<div class="p-6">
					<h3 class="text-lg font-bold text-slate-900 transition-colors group-hover:text-sky-600">
						{String(data?.item5Title ?? 'Зональное освещение')}
					</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">
						{String(data?.item5Description ?? 'Комфортное освещение для создания уютной атмосферы в каждом уголке вашего дома')}
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
