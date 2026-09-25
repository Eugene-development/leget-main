<script lang="ts">
	import { validateModelFile, type ProjectModel } from './project-model';
	let {
		file = $bindable<File | null>(null),
		removed = $bindable(false),
		current = null,
		disabled = false,
		error = '',
		validating = $bindable(false)
	} = $props<{
		file?: File | null;
		removed?: boolean;
		current?: ProjectModel | null;
		disabled?: boolean;
		error?: string;
		validating?: boolean;
	}>();
	const uid = $props.id();
	let localError = $state('');
	let chooser = $state<HTMLInputElement>();
	const hasModel = $derived(!!file || (!!current && !removed));
	async function select(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const selected = input.files?.[0];
		input.value = '';
		if (!selected || disabled) return;
		validating = true;
		localError = '';
		try {
			await validateModelFile(selected);
			file = selected;
			removed = false;
		} catch (cause) {
			localError = cause instanceof Error ? cause.message : 'Не удалось прочитать файл.';
		} finally {
			validating = false;
		}
	}
</script>

<section class="border-b border-ink-200 py-5" aria-labelledby={`${uid}-title`}>
	<h3 id={`${uid}-title`} class="p1-title-sub text-base">3D-модель</h3>
	<p id={`${uid}-help`} class="mt-1 text-sm text-ink-600">
		GLB до 25 МБ со встроенными текстурами. Сжатие без потерь — автоматически при сохранении. До 300
		000 треугольников и 500 частей; текстуры до 4096 px и 16 Мп суммарно.
	</p>
	{#if hasModel}
		<p class="mt-3 text-sm break-all text-ink-800">
			{file?.name ?? '3D-модель добавлена'}
			{#if file?.size || current?.size}<span class="text-ink-600">
					· {((file?.size ?? current?.size ?? 0) / 1024 / 1024).toFixed(1)} МБ</span
				>{/if}
		</p>
	{:else if removed}<p class="mt-3 text-sm text-ink-600">
			Модель будет убрана после сохранения проекта.
		</p>{/if}
	<input
		bind:this={chooser}
		type="file"
		accept=".glb,model/gltf-binary"
		aria-label="Файл 3D-модели"
		onchange={select}
		disabled={disabled || validating}
		class="hidden"
		tabindex="-1"
	/>
	<div class="mt-3 flex flex-wrap gap-3">
		<button
			type="button"
			onclick={() => chooser?.click()}
			disabled={disabled || validating}
			aria-describedby={`${uid}-help ${uid}-error`}
			data-invalid={!!(localError || error)}
			data-goal-ignore="Загрузка 3D-модели в редакторе проекта"
			class="min-h-11 rounded-lg border border-ink-300 px-4 py-2 text-sm text-link-700 hover:bg-link-50 focus-visible:outline-2 focus-visible:outline-link-500 disabled:opacity-50"
		>
			{validating ? 'Проверяем файл…' : hasModel ? 'Заменить модель' : 'Добавить GLB'}
		</button>
		{#if hasModel || removed}
			<button
				type="button"
				disabled={disabled || validating}
				onclick={() => {
					file = null;
					removed = !removed;
					localError = '';
				}}
				data-goal-ignore="Изменение 3D-модели в редакторе проекта"
				class="min-h-11 rounded-lg px-4 py-2 text-sm text-ink-700 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-link-500 disabled:opacity-50"
				>{removed ? 'Отменить удаление' : 'Убрать модель'}</button
			>
		{/if}
	</div>
	<div id={`${uid}-error`}>
		{#if localError || error}<p role="alert" class="text-cat-6-700 mt-2 text-sm">
				{localError || error}
			</p>{/if}
	</div>
</section>
