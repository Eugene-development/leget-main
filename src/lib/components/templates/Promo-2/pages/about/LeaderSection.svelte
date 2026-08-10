<script lang="ts">
	// Артикул: 2.2.2.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'LeaderSection', updated);
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
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section
	class="relative z-10 overflow-hidden bg-surface py-20 lg:py-32"
	bind:this={sectionEl}
>
	<!-- Decorative lines -->
	<div class="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-border-light to-transparent"></div>
	<div class="absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-border-light to-transparent"></div>

	<!-- Subtle Background Pattern -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.02]"
		style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%232c2c2c\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>

	<!-- Abstract shape -->
	<div class="absolute -top-32 -right-32 h-96 w-96 rounded-full border border-accent/10 lg:h-[36rem] lg:w-[36rem]"></div>

	<div class="relative mx-auto max-w-screen-xl px-6 xl:px-1">
		<div class="flex flex-col items-center justify-between gap-16 lg:flex-row lg:gap-32">
			<!-- Photo -->
			<div
				class="relative flex w-full justify-center opacity-0 lg:w-5/12 lg:justify-end"
				class:animate-fade-up={visible}
				style="animation-delay: 0.2s"
			>
				<div class="relative">
					<div class="absolute inset-0 -m-8 scale-110 rounded-full bg-primary/[0.03] blur-3xl"></div>
					<div class="absolute -top-6 -left-6 h-12 w-12 border-t border-l border-accent/40 lg:h-16 lg:w-16"></div>
					<div class="absolute -right-6 -bottom-6 h-12 w-12 border-r border-b border-accent/40 lg:h-16 lg:w-16"></div>
					<img loading="lazy"
						src={String(data?.image ?? 'https://storage.yandexcloud.net/leget-main/templates/promo-2/zovdir.png')}
						alt={String(data?.name ?? 'Руководитель фабрики')}
						class="relative z-10 w-64 object-cover transition-transform duration-1000 hover:scale-105 md:w-80 lg:w-[22rem]">
				</div>
			</div>

			<!-- Text Content -->
			<div
				class="relative flex w-full flex-col items-center text-center opacity-0 lg:w-7/12 lg:items-start lg:text-left"
				class:animate-fade-up={visible}
				style="animation-delay: 0.4s"
			>
				<!-- Large Quote Icon -->
				<svg
					class="absolute -top-10 -left-6 -z-10 h-28 w-28 text-primary/[0.03] md:-left-12 lg:-top-16 lg:-left-20 lg:h-48 lg:w-48"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
				</svg>

				<EditableField
					fieldKey="LeaderSection.quote"
					label="Цитата"
					value={String(data?.quote ?? 'Мы вкладываем весь свой опыт и душу в создание мебели')}
					{isEditable}
					multiline
					onSave={(v) => saveField('quote', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="text-3xl font-light text-primary md:text-4xl lg:text-[2.5rem] lg:leading-tight"
							style="font-family: var(--font-heading);"
						>
							<span class="italic text-secondary">{displayValue}</span>
						</h2>
					{/snippet}
				</EditableField>

				<div class="mt-8 space-y-4">
					<p class="text-base leading-relaxed text-secondary">
						Каждая кухня, гардероб и любая другая мебель — это результат кропотливого труда нашей
						большой команды, где передовые технологии сочетаются с любовью к своему делу.
					</p>
					<p class="text-base leading-relaxed text-secondary">
						Мы гордимся тем, что можем стать частью вашей повседневной жизни.
					</p>
				</div>

				<div class="mt-10 flex w-full flex-col items-center gap-6 border-t border-border-light pt-8 lg:flex-row lg:items-center lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
					<div class="flex flex-col items-center lg:items-start">
						<EditableField
							fieldKey="LeaderSection.name"
							label="Имя"
							value={String(data?.name ?? 'Зуховицкий О.В.')}
							{isEditable}
							onSave={(v) => saveField('name', v)}
						>
							{#snippet children(displayValue)}
								<p class="text-sm font-medium tracking-[0.1em] text-primary">{displayValue}</p>
							{/snippet}
						</EditableField>
						<EditableField
							fieldKey="LeaderSection.role"
							label="Должность"
							value={String(data?.role ?? 'Руководитель фабрики')}
							{isEditable}
							onSave={(v) => saveField('role', v)}
						>
							{#snippet children(displayValue)}
								<p class="mt-1 text-[11px] tracking-wider text-muted uppercase">{displayValue}</p>
							{/snippet}
						</EditableField>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
