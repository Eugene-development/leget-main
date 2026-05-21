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

<div class="flex flex-col gap-1.5 w-full">
	<label for={id} class="text-sm font-semibold text-slate-300">
		{label} {#if required}<span class="text-red-400">*</span>{/if}
	</label>
	<div class="relative">
		<input
			type="tel"
			{id}
			placeholder="+7 (___) ___-__-__"
			value={value}
			oninput={handleInput}
			class="w-full rounded-xl border bg-slate-900/60 border-slate-700/80 px-4 py-3.5 text-base text-white placeholder-slate-500 transition duration-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none {error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}"
		/>
	</div>
	{#if error}
		<span class="text-xs font-medium text-red-400 mt-1">{error}</span>
	{/if}
</div>
