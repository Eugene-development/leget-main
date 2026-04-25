<script lang="ts">
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
		await saveComponentData(editContext, 'Mission', updated);
		data = updated;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	const defaultStats = [
		{ value: '25000+', label: 'площадь производства' },
		{ value: '200+', label: 'комплектов в день' },
		{ value: '780+', label: 'сотрудников на фабрике' },
		{ value: '25+', label: 'лет на мебельном рынке' }
	];

	const stats = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultStats)
			: defaultStats
	);

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
	class="relative overflow-hidden py-section-sm lg:py-section"
	bind:this={sectionEl}
>
	<!-- Subtle Background Pattern -->
	<div
		class="absolute inset-0 opacity-[0.03]"
		style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%232c2c2c\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>

	<div class="relative mx-auto max-w-screen-xl px-6 xl:px-1">
		<div class="grid gap-16 lg:grid-cols-2 lg:gap-20">
			<!-- Left: Mission -->
			<div
				class="opacity-0 transition-all duration-700"
				class:animate-fade-up={visible}
			>
				<EditableField
					fieldKey="Mission.label"
					label="Лейбл"
					value={String(data?.label ?? 'Наша миссия')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Mission.heading"
					label="Заголовок"
					value={String(data?.heading ?? 'Мы создаём мебель, которая дарит радость')}
					{isEditable}
					onSave={(v) => saveField('heading', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="mt-3 text-4xl font-light text-primary lg:text-5xl"
							style="font-family: var(--font-heading);"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<div class="mt-8 space-y-5">
					<p class="text-base leading-relaxed text-secondary">
						Миссия нашей компании заключается в том, чтобы предоставлять клиентам высококачественную
						мебель, которая не только удовлетворяет функциональные потребности, но и приносит
						радость и комфорт в их жизни.
					</p>
					<p class="text-base leading-relaxed text-secondary">
						Мы уделяем особое внимание каждой детали — от выбора материалов до конечного
						производства. Тщательно подбираем только самые лучшие материалы, чтобы наша мебель была
						долговечной и выглядела прекрасно на протяжении многих лет.
					</p>
					<p class="text-base leading-relaxed text-secondary">
						Мы учитываем потребности каждого клиента, чтобы создать мебель, которая идеально
						подходит его индивидуальному стилю.
					</p>
				</div>
			</div>

			<!-- Right: Stats -->
			<div class="flex flex-col justify-center">
				{#each stats as stat, i}
					<div
						class="group flex gap-6 rounded-sm border-b border-border-light py-8 opacity-0 transition-colors duration-300 first:border-t hover:bg-surface-warm/50 lg:px-6 xl:px-1"
						class:animate-slide-right={visible}
						style="animation-delay: {0.2 + i * 0.15}s"
					>
						<div>
							<div
								class="text-4xl font-light text-primary transition-colors duration-300 group-hover:text-secondary lg:text-5xl"
								style="font-family: var(--font-heading);"
							>
								{stat.value}
							</div>
							<div class="mt-1 text-sm text-muted">{stat.label}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
