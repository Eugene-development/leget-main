<script lang="ts">
	import { type EditContext } from '$lib/utils/page-edit';

	let {
		data = {},
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const items = $derived(
		Array.isArray(data?.items) && data.items.length > 0
			? (data.items as { title: string; description: string }[])
			: [
					{ title: 'Качество', description: 'Используем только проверенные материалы' },
					{ title: 'Скорость', description: 'Изготовление от 14 рабочих дней' },
					{ title: 'Гарантия', description: '5 лет на все изделия' },
				]
	);
</script>

<section class="bg-white px-6 py-20">
	<div class="mx-auto max-w-6xl">
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each items as item}
				<div class="rounded-2xl border border-slate-100 bg-slate-50 p-8 shadow-sm">
					<h3 class="text-xl font-semibold text-slate-900">{item.title}</h3>
					<p class="mt-3 text-slate-600">{item.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
