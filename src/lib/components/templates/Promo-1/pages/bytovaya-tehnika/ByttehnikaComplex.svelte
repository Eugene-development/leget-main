<script lang="ts">
	// Артикул: 1.20.6.1 — см. docs/architecture/component-articles-map.md
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

	async function saveField(field: string, value: string | string[]) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ByttehnikaComplex', updated);
		data = updated;
	}

	async function updatePerk(index: number, value: string) {
		const updatedPerks = [...perks];
		updatedPerks[index] = value;
		await saveField('perks', updatedPerks);
	}

	const perks = $derived(
		data.perks || [
			'Единый проект кухни и техники',
			'Скидка на комплект до 15%',
			'Одновременная доставка и установка'
		]
	);
</script>

<div class="mebel-container mt-12 mb-12">
	<div
		class="rounded-2xl bg-surface-raised p-8 shadow-sm"
		in:fly={{ y: 20, duration: 500, easing: cubicOut }}
	>
		<h2 class="text-2xl text-ink-900">
			<EditableField
				fieldKey="ByttehnikaComplex.title"
				label="Заголовок"
				value={String(data.title || 'Комплексное решение')}
				{isEditable}
				inline
				onSave={(v) => saveField('title', v)}
			>
				{#snippet children(val)}{val}{/snippet}
			</EditableField>
		</h2>
		<p class="mt-3 leading-relaxed text-ink-600">
			<EditableField
				fieldKey="ByttehnikaComplex.description"
				label="Описание"
				value={String(
					data.description ||
						'Закажите кухню вместе с техникой и получите скидку до 15% на весь комплект. Наши дизайнеры подберут технику, которая идеально впишется в ваш проект.'
				)}
				{isEditable}
				inline
				multiline
				onSave={(v) => saveField('description', v)}
			>
				{#snippet children(val)}{val}{/snippet}
			</EditableField>
		</p>

		<ul class="mt-5 space-y-2">
			{#each perks as perk, i}
				<li
					class="flex items-center gap-2 text-sm text-ink-600"
					in:fly={{ x: -10, duration: 400, delay: i * 80, easing: cubicOut }}
				>
					<svg
						class="h-5 w-5 shrink-0 text-cat-2-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<EditableField
						fieldKey="ByttehnikaComplex.perks.{i}"
						label="Пункт списка"
						value={String(perk ?? '')}
						{isEditable}
						inline
						onSave={(value) => updatePerk(i, value)}
					>
						{#snippet children(value)}{value}{/snippet}
					</EditableField>
				</li>
			{/each}
		</ul>
	</div>
</div>
