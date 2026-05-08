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
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'SantehnikaComplex', updated);
		data = updated;
	}

	const perks = $derived(data.perks || [
		'Мойка + смеситель в едином стиле',
		'Измельчитель пищевых отходов',
		'Диспенсер для моющего средства'
	]);
</script>

<div class="mebel-container mb-12 mt-12">
	<div class="rounded-2xl bg-white p-8 shadow-sm" in:fly={{ y: 20, duration: 500, easing: cubicOut }}>
		<div class="lg:flex lg:items-center lg:gap-12">
			<div class="lg:flex-1">
				<h2 class="text-2xl font-bold text-slate-900">
					<EditableField fieldKey="SantehnikaComplex.title" label="Заголовок"
						value={String(data.title || 'Комплект для кухни')} {isEditable} inline
						onSave={(v) => saveField('title', v)}>
						{#snippet children(val)}{val}{/snippet}
					</EditableField>
				</h2>
				<p class="mt-3 leading-relaxed text-slate-600">
					<EditableField fieldKey="SantehnikaComplex.description" label="Описание"
						value={String(data.description || 'Закажите мойку вместе со смесителем, измельчителем и диспенсером — получите скидку до 20% на комплект.')}
						{isEditable} inline multiline onSave={(v) => saveField('description', v)}>
						{#snippet children(val)}{val}{/snippet}
					</EditableField>
				</p>

				<ul class="mt-5 space-y-2">
					{#each perks as perk, i}
						<li class="flex items-center gap-2 text-sm text-slate-600"
							in:fly={{ x: -10, duration: 400, delay: i * 80, easing: cubicOut }}>
							<svg class="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							{perk}
						</li>
					{/each}
				</ul>
			</div>

			<div class="mt-8 flex shrink-0 lg:mt-0">
				<button class="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-6 py-3 font-medium text-white transition-all hover:bg-sky-600">
					<EditableField fieldKey="SantehnikaComplex.buttonText" label="Кнопка"
						value={String(data.buttonText || 'Собрать комплект')} {isEditable} inline
						onSave={(v) => saveField('buttonText', v)}>
						{#snippet children(val)}{val}{/snippet}
					</EditableField>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>
