<script lang="ts">
	import { formatPhone } from '$lib/utils/phone';

	let {
		value = $bindable(''),
		error = '',
		id = 'phone-input',
		label = 'Телефон',
		required = true
	}: {
		value: string;
		error?: string;
		id?: string;
		label?: string;
		required?: boolean;
	} = $props();

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		const rawValue = input.value;

		if (!rawValue) {
			value = '';
			return;
		}

		const formatted = formatPhone(rawValue);
		value = formatted;
		input.value = formatted;
	}
</script>

<div class="flex w-full flex-col gap-1.5">
	<label for={id} class="text-sm font-semibold text-ink-300">
		{label}
		{#if required}<span class="text-cat-6-400">*</span>{/if}
	</label>
	<div class="relative">
		<input
			type="tel"
			{id}
			placeholder="+7 (___) ___-__-__"
			{value}
			oninput={handleInput}
			class="w-full rounded-xl border border-ink-700/80 bg-ink-900/60 px-4 py-3.5 text-base text-on-dark placeholder-ink-500 transition duration-300 focus:border-link-500 focus:ring-4 focus:ring-link-500/10 focus:outline-none {error
				? 'border-cat-6-400 focus:border-cat-6-400 focus:ring-cat-6-400/10'
				: ''}"
		/>
	</div>
	{#if error}
		<span class="mt-1 text-xs font-medium text-cat-6-400">{error}</span>
	{/if}
</div>
