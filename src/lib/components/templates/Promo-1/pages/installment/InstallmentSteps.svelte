<script lang="ts">
	// Артикул: 1.8.4.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { revealOnScroll } from './theme';
	import './theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'InstallmentSteps', updated);
		data = updated;
	}

	const defaultSteps = [
		{
			number: '1',
			title: 'Выберите проект',
			text: 'Подберите мебель или технику в нашем каталоге на сайте',
			final: false
		},
		{
			number: '2',
			title: 'Оставьте заявку',
			text: 'Заполните анкету онлайн или в салоне нашего партнёра',
			final: false
		},
		{
			number: '3',
			title: 'Получите решение',
			text: 'Одобрение как правило в течение 15 минут от банка',
			final: false
		},
		{
			number: '✓',
			title: 'Заберите покупку',
			text: 'Подпишите договор и пользуйтесь новой мебелью или техникой',
			final: true
		}
	];

	async function updateStep(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedSteps = [...steps];
		updatedSteps[index] = { ...updatedSteps[index], [field]: value };
		await saveField('steps', updatedSteps);
	}

	const steps = $derived(
		Array.isArray(data?.steps) && (data.steps as unknown[]).length > 0
			? (data.steps as typeof defaultSteps)
			: defaultSteps
	);
</script>

<section class="relative isolate overflow-hidden bg-ink-50 py-section-sm">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="it-rules"></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div use:revealOnScroll class="it-reveal text-center">
			<EditableField
				fieldKey="InstallmentSteps.title"
				label="Заголовок"
				value={String(data?.title ?? 'Как оформить рассрочку')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="it-item block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl text-pretty text-ink-900 sm:text-4xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="InstallmentSteps.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Простой процесс за 4 шага')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="it-item it-d1 mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-2xl text-sm/6 text-ink-600 sm:text-base/7">{displayValue}</p>
				{/snippet}
			</EditableField>
			<div class="it-rule it-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="h-px flex-1 bg-ink-900/10"></span>
				<span class="size-1.5 rotate-45 border border-brand-500/70"></span>
				<span class="h-px flex-1 bg-ink-900/10"></span>
			</div>
		</div>

		<div use:revealOnScroll class="it-reveal mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each steps as step, i}
				<!--
					Обёртка нужна, чтобы соединитель между шагами не срезался `overflow-hidden`
					карточки: пунктир живёт снаружи, в промежутке грида.
				-->
				<div class="it-card relative" style="--it-delay: {i * 80}ms">
					<div
						class="group relative h-full overflow-hidden rounded-3xl border border-ink-900/10 bg-surface-raised p-8 text-center shadow-[0_30px_80px_-50px] shadow-ink-900/35 transition duration-300 motion-safe:hover:-translate-y-1 {step.final
							? 'hover:border-cat-2-500/40'
							: 'hover:border-brand-500/40'}"
					>
						<div
							class="pointer-events-none absolute inset-x-8 top-0 h-px opacity-70 transition-opacity duration-300 group-hover:opacity-100 {step.final
								? 'bg-linear-to-r from-transparent via-cat-2-500 to-transparent'
								: 'bg-linear-to-r from-transparent via-brand-500 to-transparent'}"
							aria-hidden="true"
						></div>

						<div class="relative">
							<div
								class="mx-auto flex size-16 items-center justify-center rounded-2xl text-2xl font-semibold text-on-dark ring-1 ring-on-dark/25 transition-transform duration-300 motion-safe:group-hover:-rotate-6 {step.final
									? 'bg-linear-to-br from-cat-2-500 to-cat-9-600 shadow-[0_16px_40px_-18px] shadow-cat-2-600/90'
									: 'bg-linear-to-br from-brand-500 to-brand-600 shadow-[0_16px_40px_-18px] shadow-brand-600/90'}"
							>
								{step.number}
							</div>

							<h3 class="p1-title-sub mt-6 text-lg text-ink-900">
								<EditableField
									fieldKey="InstallmentSteps.{i}.title"
									label="Заголовок шага"
									value={step.title}
									{isEditable}
									inline
									onSave={(v) => updateStep(i, 'title', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</h3>
							<p class="mt-3 text-sm/6 text-ink-500">
								<EditableField
									fieldKey="InstallmentSteps.{i}.text"
									label="Описание шага"
									value={step.text}
									{isEditable}
									inline
									onSave={(v) => updateStep(i, 'text', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</p>
						</div>
					</div>

					<!--
						Соединитель между шагами. В прежней версии линия шла поверх карточек
						(absolute w-full от края блока) и на части ширин налезала на текст —
						теперь это короткий пунктир строго в промежутке грида.
					-->
					{#if !step.final}
						<div
							class="absolute top-16 -right-6 hidden w-6 border-t border-dashed border-brand-300 lg:block"
							aria-hidden="true"
						></div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
