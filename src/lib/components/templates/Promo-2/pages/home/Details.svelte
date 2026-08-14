<script lang="ts">
	// Артикул: 2.1.4.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
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
		await saveComponentData(editContext, 'HomeDetails', updated);
		data = updated;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	const defaultItems = [
		'Гарантия на всю продукцию',
		'Самый широкий выбор фасадов',
		'Фурнитура BLUM, Hettich, GTV',
		'Столешницы из акрила, кварца и HPL',
		'Конкурентные цены'
	];

	const items = $derived(Array.isArray(data?.items) ? (data.items as string[]) : defaultItems);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.25, rootMargin: '0px 0px -100px 0px' }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section
	class="relative mt-12 bg-surface-warm pt-28 pb-section-sm lg:mt-20 lg:pt-40 lg:pb-section"
	bind:this={sectionEl}
>
	<div class="mx-auto max-w-screen-xl px-6 xl:px-1">
		<div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
			<!-- Image -->
			<div class="relative opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.2s">
				<div class="relative z-40 overflow-hidden">
					<ImageFallback
						loading="lazy"
						src={String(
							data?.image ?? 'https://storage.yandexcloud.net/zovtop/logo/logo-2-sdgjkbnrklbmnk.jpg'
						)}
						alt={String(data?.imageAlt ?? '')}
						class="h-[400px] w-full object-cover lg:h-[500px]"
					/>
				</div>
				<!-- Floating Accent -->
				<div
					class="absolute -right-4 -bottom-4 h-24 w-24 border border-accent/30 lg:-right-6 lg:-bottom-6 lg:h-32 lg:w-32"
				></div>
			</div>

			<!-- Content -->
			<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.4s">
				<EditableField
					fieldKey="HomeDetails.label"
					label="Лейбл"
					value={String(data?.label ?? '')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span
						>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="HomeDetails.heading"
					label="Заголовок"
					value={String(data?.heading ?? '')}
					{isEditable}
					onSave={(v) => saveField('heading', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="mt-3 text-4xl text-primary lg:text-5xl"
							style="font-family: var(--font-heading);"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="HomeDetails.description"
					label="Описание"
					value={String(data?.description ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="mt-6 text-base leading-relaxed text-secondary">
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<ul class="mt-8 flex flex-col gap-4">
					{#each items as item}
						<li class="flex items-start gap-3 text-sm text-primary">
							<svg
								class="mt-0.5 h-4 w-4 flex-shrink-0 text-accent"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
							</svg>
							{item}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>
