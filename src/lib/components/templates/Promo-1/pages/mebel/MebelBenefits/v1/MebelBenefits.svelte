<script lang="ts">
	// Артикулы: 1.16.3.1, 1.17.4.1 — см. docs/architecture/component-articles-map.md
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { MEBEL_BENEFITS_DEFAULT_TITLE, resolveMebelBenefits } from '../data';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: any) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelBenefits', updated);
		data = updated;
	}

	async function updateItem(index: number, field: string, value: string) {
		const newItems = [...items];
		newItems[index] = { ...newItems[index], [field]: value };
		await saveField('items', newItems);
	}

	const items = $derived(resolveMebelBenefits(data.items));

	const iconColors: Record<string, string> = {
		shield: 'bg-link-100 text-link-600 group-hover:bg-link-500 group-hover:text-on-accent',
		clock: 'bg-cat-2-100 text-cat-2-600 group-hover:bg-cat-2-500 group-hover:text-on-accent',
		design: 'bg-cat-1-100 text-cat-1-600 group-hover:bg-cat-1-500 group-hover:text-on-accent'
	};
</script>

<div class="mebel-container mt-12 mb-12">
	<h2 class="mb-8 text-2xl text-ink-900">
		<EditableField
			fieldKey="MebelBenefits.title"
			label="Заголовок блока"
			value={String(data.title || MEBEL_BENEFITS_DEFAULT_TITLE)}
			{isEditable}
			inline
			onSave={(v) => saveField('title', v)}
		>
			{#snippet children(val)}
				{val}
			{/snippet}
		</EditableField>
	</h2>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each items as item, i}
			<div
				class="group rounded-2xl border border-ink-50 bg-surface-raised p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink-200/50"
				in:fly={{ y: 20, duration: 600, delay: i * 100, easing: cubicOut }}
			>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 {iconColors[
						item.icon
					] || 'bg-ink-100'}"
				>
					{#if item.icon === 'shield'}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
					{:else if item.icon === 'clock'}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					{:else}
						<!-- design / fallback -->
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
					{/if}
				</div>

				<h3
					class="p1-title-sub mt-4 text-lg text-ink-900 transition-colors group-hover:text-link-600"
				>
					<EditableField
						fieldKey="MebelBenefits.item.{i}.title"
						label="Заголовок карточки"
						value={String(item.title)}
						{isEditable}
						inline
						onSave={(v) => updateItem(i, 'title', v)}
					>
						{#snippet children(val)}
							{val}
						{/snippet}
					</EditableField>
				</h3>

				<div class="mt-2 text-sm leading-relaxed text-ink-600">
					<EditableField
						fieldKey="MebelBenefits.item.{i}.desc"
						label="Описание карточки"
						value={String(item.desc ?? '')}
						{isEditable}
						inline
						multiline
						onSave={(v) => updateItem(i, 'desc', v)}
					>
						{#snippet children(val)}
							{val}
						{/snippet}
					</EditableField>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.mebel-container {
		max-width: 1536px;
		margin-left: auto;
		margin-right: auto;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	@media (min-width: 1024px) {
		.mebel-container {
			padding-left: 360px;
		}
	}
</style>
