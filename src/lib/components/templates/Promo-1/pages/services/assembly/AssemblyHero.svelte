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
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'AssemblyHero', updated);
		data = updated;
	}
</script>

<section class="relative h-[calc(100vh-88px)] flex items-center overflow-hidden bg-slate-950">
	<div class="absolute inset-0 z-0">
		<div class="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
		<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4"></div>
		<div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
	</div>

	<div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 w-full">
		<div class="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
			<div class="lg:col-span-6" in:fly={{ x: -50, duration: 1000, easing: cubicOut }}>
				<EditableField
					fieldKey="AssemblyHero.badge"
					label="Бейдж"
					value={String(data?.badge ?? 'Услуга компании')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="mb-6 inline-block"
				>
					{#snippet children(displayValue)}
						<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
							<span class="relative flex h-2 w-2">
								<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
								<span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
							</span>
							{displayValue}
						</div>
					{/snippet}
				</EditableField>

				<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
					<EditableField
						fieldKey="AssemblyHero.title_part1"
						label="Заголовок часть 1"
						value={String(data?.title_part1 ?? 'Сборка и')}
						{isEditable}
						onSave={(v) => saveField('title_part1', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							{displayValue}
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="AssemblyHero.title_part2"
						label="Заголовок часть 2"
						value={String(data?.title_part2 ?? 'установка')}
						{isEditable}
						onSave={(v) => saveField('title_part2', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							<span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">{displayValue}</span>
						{/snippet}
					</EditableField>
				</h1>

				<EditableField
					fieldKey="AssemblyHero.description"
					label="Описание"
					value={String(data?.description ?? 'Профессиональная сборка и установка мебели любой сложности профессиональным инструментом. Быстро, чисто, аккуратно и с гарантией качества.')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="mt-8 block"
				>
					{#snippet children(displayValue)}
						<p class="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-xl">
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<div class="mt-12 flex flex-wrap gap-6">
					<EditableField
						fieldKey="AssemblyHero.cta_text"
						label="Текст кнопки"
						value={String(data?.cta_text ?? 'Заказать сборку')}
						{isEditable}
						onSave={(v) => saveField('cta_text', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							<button
								type="button"
								class="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-rose-500/20 transition-all duration-300 hover:scale-105 hover:shadow-rose-500/40 active:scale-95"
							>
								<span>{displayValue}</span>
								<svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</button>
						{/snippet}
					</EditableField>
				</div>
			</div>

			<div class="relative lg:col-span-6 lg:justify-self-end lg:block w-full" in:fly={{ x: 50, duration: 1000, delay: 200, easing: cubicOut }}>
				<div class="absolute -inset-10 bg-gradient-to-tr from-rose-500/20 to-pink-500/20 blur-[80px] opacity-50"></div>
				<div class="relative group">
					<div class="relative z-10 overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-3xl bg-white/5 p-4 transition-transform duration-500 group-hover:scale-[1.02]">
						<img
							src={String(data?.hero_image ?? '/kitchen_assembly_modern.png')}
							alt="Furniture Assembly"
							class="rounded-[2rem] w-full aspect-[4/3] object-cover"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
		<button 
			onclick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
			class="group p-2 transition-all duration-300 hover:translate-y-1"
			aria-label="Скролл вниз"
		>
			<svg 
				class="w-10 h-10 text-white/20 group-hover:text-rose-400 transition-colors" 
				fill="none" 
				viewBox="0 0 24 24" 
				stroke="currentColor" 
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
	</div>
</section>
