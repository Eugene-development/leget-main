<script lang="ts">
	// Артикул: 1.6.5.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import BlockThemeToggle from '$lib/components/BlockThemeToggle.svelte';
	import { createThemeToggle, isLightBlock } from '$lib/utils/block-theme';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Тема блока: нейтральная палитра — из классов p1-*, акценты не зависят от темы.
	const isLight = $derived(isLightBlock(data, 'light'));
	const toggleTheme = createThemeToggle({
		type: 'HowToStart',
		fallback: 'light',
		getData: () => data,
		setData: (next) => (data = next),
		getContext: () => editContext
	});

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'HowToStart', updated);
		data = updated;
	}

	const defaultSteps = [
		{
			number: '1',
			title: 'Оставьте заявку',
			text: 'Заполните форму или позвоните нам',
			final: false
		},
		{
			number: '2',
			title: 'Обсудим условия',
			text: 'Менеджер детально расскажет условия',
			final: false
		},
		{ number: '3', title: 'Начало работы', text: 'Стартуем сотрудничество', final: false },
		{ number: '✓', title: 'Результат', text: 'Фиксируем положительную динамику', final: true }
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

<div class="p1-surface-alt relative py-24" data-p1-theme={isLight ? 'light' : 'dark'}>
	<BlockThemeToggle {isLight} onToggle={toggleTheme} {isEditable} {editContext} />

	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<EditableField
				fieldKey="HowToStart.title"
				label="Заголовок"
				value={String(data?.title ?? 'Как стать партнёром')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="p1-title text-3xl">{displayValue}</h2>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="HowToStart.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Простой процесс от первого контакта до результата')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="p1-body mx-auto mt-4 max-w-2xl">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
			{#each steps as step, i}
				<div class="relative text-center">
					<div
						class="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-on-dark shadow-lg
						{step.final
							? 'bg-linear-to-br from-cat-2-500 to-cat-9-600 shadow-cat-2-500/25'
							: 'bg-linear-to-br from-brand-500 to-brand-600 shadow-brand-500/25'}"
					>
						{step.number}
					</div>
					<h3 class="p1-title p1-title-sub mt-6 text-lg">
						<EditableField
							fieldKey="HowToStart.{i}.title"
							label="Заголовок"
							value={step.title}
							{isEditable}
							inline
							onSave={(v) => updateStep(i, 'title', v)}
						>
							{#snippet children(val)}{val}{/snippet}
						</EditableField>
					</h3>
					<p class="p1-muted mt-2 text-sm">
						<EditableField
							fieldKey="HowToStart.{i}.text"
							label="Описание"
							value={step.text}
							{isEditable}
							inline
							onSave={(v) => updateStep(i, 'text', v)}
						>
							{#snippet children(val)}{val}{/snippet}
						</EditableField>
					</p>
					{#if !step.final}
						<div
							class="absolute top-8 right-0 hidden h-0.5 w-full bg-linear-to-r from-brand-200 to-transparent lg:block lg:w-1/2 lg:translate-x-1/2"
						></div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
