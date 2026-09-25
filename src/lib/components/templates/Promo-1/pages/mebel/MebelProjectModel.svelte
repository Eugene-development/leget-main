<script lang="ts">
	// Артикул: 1.18.6.1 — см. docs/architecture/component-articles-map.md
	import { tick } from 'svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { blockTheme } from '$lib/utils/block-theme';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { readProjectModel, type ProjectModel } from './project-model';
	import MebelProjectModelDialog from './MebelProjectModelDialog.svelte';
	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	} = $props<{
		data?: Record<string, any>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	}>();
	const uid = $props.id();
	const model = $derived(readProjectModel(data.project?.meta));
	const projectKey = $derived(`${data.project?.id ?? ''}:${model?.url ?? ''}`);
	let session = $state.raw<{ model: ProjectModel; title: string; key: string } | null>(null);
	let loading = $state(false),
		error = $state('');
	let trigger = $state<HTMLButtonElement>();
	$effect(() => {
		if (session && session.key !== projectKey) close();
	});
	function start() {
		if (!model || session) return;
		error = '';
		loading = true;
		session = { model, title: data.project?.value || '3D-модель проекта', key: projectKey };
	}
	function close() {
		session = null;
		loading = false;
		void tick().then(() => trigger?.focus({ preventScroll: true }));
	}
	function fail() {
		close();
		error = 'Не удалось загрузить 3D-модель. Проверьте подключение и повторите попытку.';
	}
	async function save(field: string, value: string) {
		if (!editContext) return;
		const { project, ...content } = data;
		const updated = { ...content, [field]: value };
		await saveComponentData(editContext, 'MebelProjectModel', updated);
		data = { ...updated, project };
	}
</script>

{#if model || isEditable}
	<section
		class="p1-catalog-container mt-8"
		data-p1-theme={blockTheme(data)}
		aria-label="Просмотр 3D-модели проекта"
	>
		<div
			class="p1-card p1-border flex items-center justify-between gap-4 rounded-xl border p-5 sm:px-7"
		>
			<div class="p1-title min-w-0 text-base sm:text-lg">
				<EditableField
					fieldKey="MebelProjectModel.text"
					label="Текст блока 3D"
					value={String(data.text ?? 'Доступен просмотр 3D модели проекта')}
					{isEditable}
					inline
					onSave={(value) => save('text', value)}
				>
					{#snippet children(value)}<RichText {value} />{/snippet}
				</EditableField>
			</div>
			<div class="flex shrink-0 flex-wrap items-center gap-3">
				<EditableField
					fieldKey="MebelProjectModel.buttonText"
					label="Текст кнопки 3D"
					value={String(data.buttonText || 'Посмотреть в 3D')}
					{isEditable}
					inline
					richText={false}
					onSave={(value) => save('buttonText', value)}
				>
					{#snippet children(value)}
						<button
							bind:this={trigger}
							type="button"
							onclick={start}
							disabled={!model || !!session}
							aria-busy={loading}
							aria-describedby={error || !model ? `${uid}-status` : undefined}
							data-metrika-goal="mebel_project_model_open"
							data-goal-action="open"
							data-goal-label="Посмотреть в 3D — модель проекта"
							class="min-h-12 rounded-lg bg-link-600 px-4 py-3 text-sm font-semibold text-on-accent hover:bg-link-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link-500 disabled:cursor-wait disabled:opacity-60 sm:px-6"
						>
							{loading ? 'Загрузка…' : value}
						</button>
					{/snippet}
				</EditableField>
				{#if loading}<button
						type="button"
						onclick={close}
						data-goal-ignore="Отмена загрузки 3D-модели"
						class="p1-body min-h-11 rounded-lg px-3 py-2 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-link-500"
						>Отмена</button
					>{/if}
			</div>
		</div>
		<div id={`${uid}-status`}>
			{#if error}<p role="alert" class="text-cat-6-700 mt-2 text-sm">{error}</p>
			{:else if !model}<p class="p1-body mt-2 text-sm">
					Добавьте модель через «Редактировать проект». Посетители увидят блок после загрузки
					модели.
				</p>{/if}
			{#if loading}<span role="status" class="sr-only"
					>Загружаем 3D-модель. Окно откроется после загрузки.</span
				>{/if}
		</div>
	</section>
{/if}

{#if session}
	<MebelProjectModelDialog
		model={session.model}
		title={session.title}
		onready={() => (loading = false)}
		onclose={close}
		onerror={fail}
	/>
{/if}
