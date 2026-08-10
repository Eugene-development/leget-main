<script lang="ts">
	// Артикул: 2.8.4.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
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
		await saveComponentData(editContext, 'ActionsBanner', updated);
		data = updated;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.2 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section class="relative z-10 px-6 xl:px-1" bind:this={sectionEl}>
	<div class="mx-auto max-w-screen-xl">
		<div
			class="relative overflow-hidden opacity-0 transition-all duration-700"
			class:animate-scale-in={visible}
		>
			<img
				loading="lazy"
				src={String(data?.image ?? '')}
				alt={String(data?.title ?? '')}
				class="h-[400px] w-full object-cover lg:h-[520px]"
			/>
			<div
				class="absolute inset-0 bg-linear-to-r from-primary/90 via-primary/60 to-transparent"
			></div>

			<!-- Overlay Content -->
			<div class="absolute inset-0 flex items-center p-8 lg:p-16">
				<div class="max-w-xl">
					<EditableField
						fieldKey="ActionsBanner.eyebrow"
						label="Надпись над заголовком"
						value={String(data?.eyebrow ?? 'Специальное предложение')}
						{isEditable}
						onSave={(v) => saveField('eyebrow', v)}
					>
						{#snippet children(displayValue)}
							<span class="text-[11px] tracking-[0.3em] text-accent uppercase">{displayValue}</span>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="ActionsBanner.title"
						label="Заголовок"
						value={String(data?.title ?? 'Кухня мечты −30%')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="mt-4 block"
					>
						{#snippet children(displayValue)}
							<h2
								class="mt-4 text-3xl text-white lg:text-5xl"
								style="font-family: var(--font-heading);"
							>
								{displayValue}
							</h2>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="ActionsBanner.description"
						label="Описание"
						value={String(data?.description ?? '')}
						{isEditable}
						multiline
						onSave={(v) => saveField('description', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p class="mt-4 max-w-md text-sm leading-relaxed text-white/75 lg:text-base">
								{displayValue}
							</p>
						{/snippet}
					</EditableField>

					<div class="mt-8 flex flex-wrap gap-4">
						<EditableField
							fieldKey="ActionsBanner.ctaText"
							label="Текст кнопки"
							value={String(data?.ctaText ?? 'Консультация по акции')}
							{isEditable}
							onSave={(v) => saveField('ctaText', v)}
						>
							{#snippet children(displayValue)}
								<a
									href={String(data?.ctaLink ?? '/contact')}
									class="group inline-flex cursor-pointer items-center gap-3 rounded-sm border border-accent bg-accent px-7 py-3.5 text-xs tracking-[0.15em] text-primary uppercase transition-all duration-300 hover:bg-accent-light"
								>
									{displayValue}
									<svg
										class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
										/>
									</svg>
								</a>
							{/snippet}
						</EditableField>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
