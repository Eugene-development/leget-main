<script lang="ts">
	// Артикул: 2.7.1.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'ContactForm', updated);
		data = updated;
	}

	let name = $state('');
	let phone = $state('');
	let message = $state('');
	let submitted = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();
		submitted = true;
	}
</script>

<section class="bg-stone-50 px-6 py-20">
	<div class="mx-auto max-w-2xl">
		<EditableField
			fieldKey="ContactForm.title"
			label="Заголовок"
			value={String(data?.title ?? 'Контакты')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="text-3xl text-stone-900">{displayValue}</h2>
			{/snippet}
		</EditableField>

		{#if data?.email}
			<p class="mt-2 text-stone-500">
				<a href="mailto:{data.email}" class="hover:text-stone-900">{data.email}</a>
			</p>
		{/if}

		{#if submitted}
			<div class="mt-10 rounded-2xl bg-green-50 p-8 text-center text-green-700">
				Спасибо! Мы свяжемся с вами в ближайшее время.
			</div>
		{:else}
			<form onsubmit={handleSubmit} class="mt-10 space-y-6">
				<div>
					<label for="name" class="block text-sm font-medium text-stone-700">Имя</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						required
						class="mt-1 block w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 shadow-sm focus:border-stone-400 focus:outline-none"
					/>
				</div>
				<div>
					<label for="phone" class="block text-sm font-medium text-stone-700">Телефон</label>
					<input
						id="phone"
						type="tel"
						bind:value={phone}
						required
						class="mt-1 block w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 shadow-sm focus:border-stone-400 focus:outline-none"
					/>
				</div>
				<div>
					<label for="message" class="block text-sm font-medium text-stone-700">Сообщение</label>
					<textarea
						id="message"
						bind:value={message}
						rows="4"
						class="mt-1 block w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-900 shadow-sm focus:border-stone-400 focus:outline-none"
					></textarea>
				</div>
				<button
					type="submit"
					class="w-full rounded-xl bg-stone-900 px-6 py-4 text-base font-medium text-white shadow-sm transition hover:bg-stone-700"
				>
					Отправить
				</button>
			</form>
		{/if}
	</div>
</section>
