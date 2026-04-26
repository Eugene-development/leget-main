<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let { data = $bindable(), editContext = null, isEditable = false }: { data: Record<string, unknown>; editContext?: EditContext | null; isEditable?: boolean } = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Form', updated);
		data = updated;
	}

	let name = $state('');
	let phone = $state('');
	let submitted = $state(false);
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		await new Promise((r) => setTimeout(r, 1200));
		loading = false;
		submitted = true;
	}

	function resetForm() { name = ''; phone = ''; submitted = false; }
</script>

<section class="relative overflow-hidden py-24 lg:py-32">
	<div class="absolute inset-0 bg-gradient-to-br from-accent-600/10 via-surface-900 to-surface-900"></div>
	<div class="pointer-events-none absolute inset-0 opacity-[0.04]" style="background-image: linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px); background-size: 40px 40px;"></div>

	<div class="relative px-10 lg:px-24 xl:px-32">
		<div class="mx-auto max-w-2xl">
			<div class="mb-12 text-center">
				<EditableField fieldKey="Form.label" label="Лейбл" value={String(data?.label ?? 'Специальное предложение')} {isEditable} onSave={(v) => saveField('label', v)}>
					{#snippet children(displayValue)}<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase">{displayValue}</span>{/snippet}
				</EditableField>
				<EditableField fieldKey="Form.heading" label="Заголовок" value={String(data?.heading ?? 'Скидка 10%')} {isEditable} onSave={(v) => saveField('heading', v)} class="block">
					{#snippet children(displayValue)}<h2 class="mt-3 font-display text-4xl font-bold tracking-wide text-white lg:text-5xl">{displayValue}</h2>{/snippet}
				</EditableField>
				<EditableField fieldKey="Form.description" label="Описание" value={String(data?.description ?? 'Оставьте имя и номер телефона — мы пришлём промокод в WhatsApp или Telegram. Без спама, только актуальные предложения.')} {isEditable} multiline onSave={(v) => saveField('description', v)} class="block">
					{#snippet children(displayValue)}<p class="mt-4 text-surface-300">{displayValue}</p>{/snippet}
				</EditableField>
			</div>

			<div class="relative rounded-3xl border border-surface-700/50 bg-surface-800/50 p-8 shadow-2xl backdrop-blur-sm lg:p-10">
				<div class="absolute -top-px right-12 h-px w-24 bg-linear-to-r from-transparent via-accent-500 to-transparent"></div>
				<div class="absolute -bottom-px left-12 h-px w-24 bg-linear-to-r from-transparent via-accent-500/50 to-transparent"></div>

				{#if submitted}
					<div class="flex flex-col items-center py-8 text-center">
						<div class="mb-6 flex size-20 items-center justify-center rounded-full border border-accent-500/30 bg-accent-500/10">
							<svg viewBox="0 0 24 24" class="size-10 fill-none stroke-accent-500 stroke-2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
						</div>
						<h3 class="font-display text-2xl font-bold text-white">Промокод отправлен!</h3>
						<p class="mt-3 text-surface-300">Мы отправили вам промокод — используйте его при оформлении заказа.</p>
						<button onclick={resetForm} class="mt-8 text-sm font-medium text-surface-300 transition-colors hover:text-surface-200">← Вернуться</button>
					</div>
				{:else}
					<form onsubmit={handleSubmit} class="flex flex-col gap-6">
						<div class="flex flex-col gap-2">
							<label for="contact-name" class="text-sm font-medium text-surface-300">Ваше имя</label>
							<input id="contact-name" type="text" bind:value={name} required placeholder="Как вас зовут?" class="w-full rounded-xl border border-surface-600 bg-surface-700/50 px-5 py-4 text-sm text-white placeholder-surface-300 transition-all duration-300 outline-none focus:border-accent-500/60 focus:bg-surface-700" />
						</div>
						<div class="flex flex-col gap-2">
							<label for="contact-phone" class="text-sm font-medium text-surface-300">Номер телефона</label>
							<input id="contact-phone" type="tel" bind:value={phone} required placeholder="+7 (___) ___-__-__" class="w-full rounded-xl border border-surface-600 bg-surface-700/50 px-5 py-4 text-sm text-white placeholder-surface-300 transition-all duration-300 outline-none focus:border-accent-500/60 focus:bg-surface-700" />
						</div>
						<p class="text-xs leading-relaxed text-surface-300">Нажимая кнопку, вы соглашаетесь с <a href="/privacy" class="text-surface-300 underline underline-offset-2 transition-colors hover:text-accent-500">политикой конфиденциальности</a>.</p>
						<button type="submit" disabled={loading} class="group relative overflow-hidden rounded-xl bg-accent-500 px-8 py-4 text-sm font-bold tracking-wide text-surface-900 uppercase transition-all duration-300 hover:bg-accent-400 hover:shadow-2xl hover:shadow-accent-500/30 disabled:cursor-not-allowed disabled:opacity-70">
							{#if loading}
								<span class="flex items-center justify-center gap-3"><svg viewBox="0 0 24 24" class="size-4 animate-spin fill-none stroke-current stroke-2"><circle cx="12" cy="12" r="10" stroke-opacity="0.3" /><path d="M12 2a10 10 0 0110 10" stroke-linecap="round" /></svg>Отправляем...</span>
							{:else}
								{String(data?.buttonText ?? 'Получить промокод на 10%')}
							{/if}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>
</section>
