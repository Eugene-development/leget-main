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
			? (data.items as { name: string; text: string }[])
			: [
					{ name: 'Анна К.', text: 'Отличное качество, быстрая доставка. Очень довольна покупкой!' },
					{ name: 'Михаил Р.', text: 'Заказывали кухню — всё сделали точно в срок, мастера аккуратные.' },
					{ name: 'Светлана В.', text: 'Уже второй раз обращаемся, всегда на высоте.' },
				]
	);
</script>

<section class="bg-white px-6 py-20">
	<div class="mx-auto max-w-5xl">
		<h2 class="text-center text-3xl font-light text-stone-900">Отзывы клиентов</h2>
		<div class="mt-12 grid gap-6 sm:grid-cols-3">
			{#each items as item}
				<blockquote class="rounded-2xl border border-stone-100 bg-stone-50 p-8">
					<p class="text-stone-700 italic">«{item.text}»</p>
					<footer class="mt-4 text-sm font-medium text-stone-500">— {item.name}</footer>
				</blockquote>
			{/each}
		</div>
	</div>
</section>
