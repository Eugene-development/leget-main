<script lang="ts">
	// Артикул: 1.19.4.1 — см. docs/architecture/component-articles-map.md
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

	async function saveField(field: string, value: any) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'StoleshnicaBenefits', updated);
		data = updated;
	}

	const items = $derived(
		data.items || [
			{
				title: 'Точный расчёт',
				desc: 'Замер с точностью до миллиметра для идеальной подгонки',
				icon: 'calc',
				color: 'amber'
			},
			{
				title: 'Профессиональный монтаж',
				desc: 'Установка с герметизацией стыков и вырезами под технику',
				icon: 'tools',
				color: 'sky'
			},
			{
				title: 'Гарантия 2-10 лет',
				desc: 'Гарантия на материал и работы по установке вашего изделия',
				icon: 'shield',
				color: 'emerald'
			}
		]
	);

	const colorClasses: Record<string, string> = {
		amber: 'bg-cat-1-100 text-cat-1-600 group-hover:bg-cat-1-500 group-hover:text-on-accent',
		sky: 'bg-link-100 text-link-600 group-hover:bg-link-500 group-hover:text-on-accent',
		emerald: 'bg-cat-2-100 text-cat-2-600 group-hover:bg-cat-2-500 group-hover:text-on-accent'
	};
</script>

<div class="mebel-container mt-12 mb-12">
	<h2 class="mb-8 text-2xl text-ink-900">
		<EditableField
			fieldKey="StoleshnicaBenefits.title"
			label="Заголовок блока"
			value={String(data.title || 'Работаем напрямую с поставщиками')}
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
					class="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 {colorClasses[
						item.color
					] || 'bg-ink-100 text-ink-600'}"
				>
					{#if item.icon === 'calc'}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
							/>
						</svg>
					{:else if item.icon === 'tools'}
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
							/>
						</svg>
					{:else}
						<!-- shield -->
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
					{/if}
				</div>

				<h3
					class="p1-title-sub mt-4 text-lg text-ink-900 transition-colors group-hover:text-cat-1-600"
				>
					{item.title}
				</h3>
				<p class="mt-2 text-sm leading-relaxed text-ink-600">{item.desc ?? ''}</p>
			</div>
		{/each}
	</div>
</div>
