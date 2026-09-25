<script lang="ts">
	import { readProjectModel } from './project-model';
	import HtmlProjectModel from './HtmlProjectModel.svelte';
	import type { GlbViewer, ModelView } from './project-glb-viewer';
	let { meta, title = 'Модель мебели' } = $props<{
		meta?: Record<string, unknown> | null;
		title?: string;
	}>();
	const model = $derived(readProjectModel(meta));
	const uid = $props.id();
	let activated = $state(false),
		loading = $state(false),
		error = $state('');
	let attempt = $state(0),
		upperAvailable = $state(false),
		upperVisible = $state(true);
	let currentView = $state<ModelView>('iso');
	let viewer = $state.raw<GlbViewer | undefined>();
	const views: { id: ModelView; label: string }[] = [
		{ id: 'iso', label: 'Перспектива' },
		{ id: 'front', label: 'Спереди' },
		{ id: 'top', label: 'Сверху' }
	];
	function start() {
		error = '';
		loading = true;
		activated = true;
		upperAvailable = false;
		upperVisible = true;
		currentView = 'iso';
		attempt++;
	}
	function close() {
		activated = false;
		loading = false;
		error = '';
	}
	function fail() {
		loading = false;
		error = 'Не удалось открыть 3D-модель. Проверьте подключение или попробуйте другое устройство.';
	}
	function mountViewer(node: HTMLDivElement, url: string) {
		let disposed = false,
			instance: GlbViewer | undefined;
		void import('./project-glb-viewer')
			.then(({ createGlbViewer }) => {
				if (disposed) return;
				instance = createGlbViewer(
					node,
					url,
					title,
					(available) => {
						if (!disposed) {
							upperAvailable = available;
							loading = false;
						}
					},
					() => {
						if (!disposed) fail();
					}
				);
				viewer = instance;
			})
			.catch(() => {
				if (!disposed) fail();
			});
		return {
			destroy() {
				disposed = true;
				instance?.dispose();
				if (viewer === instance) viewer = undefined;
			}
		};
	}
</script>

{#if model}
	<section class="mt-10 border-t border-ink-200 pt-8" aria-labelledby={`${uid}-heading`}>
		<div class="mb-5 flex flex-wrap items-end justify-between gap-3">
			<div>
				<h2 id={`${uid}-heading`} class="p1-title-section text-2xl text-ink-900">Проект в 3D</h2>
				<p class="mt-2 text-sm text-ink-600">
					{model.format === 'html'
						? 'Выбирайте ракурсы внутри окна просмотра.'
						: 'Вращайте мышью или пальцем. Приближайте колесом или двумя пальцами.'}
				</p>
			</div>
			<div class="flex items-center gap-4">
				{#if model.transfer_size || model.size}<span class="text-sm text-ink-600"
						>{((model.transfer_size ?? model.size ?? 0) / 1024 / 1024).toFixed(2)} МБ{model.encoding ===
						'gzip'
							? ' · сжато без потерь'
							: ''}</span
					>{/if}
				{#if activated}<button
						type="button"
						onclick={close}
						data-goal-ignore="Закрытие 3D-просмотра, не формы заявки"
						class="min-h-11 rounded-lg border border-ink-300 px-4 py-2 text-sm text-ink-700 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-link-500"
						>Закрыть 3D</button
					>{/if}
			</div>
		</div>
		<div
			class="relative overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 {model.format ===
			'html'
				? 'h-[640px] sm:h-[680px]'
				: 'h-[360px] sm:h-[520px]'}"
			aria-busy={loading}
		>
			{#if activated && !error}
				{#key attempt}
					{#if model.format === 'html'}<HtmlProjectModel
							url={model.url}
							{title}
							onready={() => (loading = false)}
							onerror={fail}
						/>
					{:else}<div class="h-full w-full" use:mountViewer={model.url}></div>{/if}
				{/key}
			{/if}
			{#if !activated || error}
				<div
					class="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center"
				>
					<svg
						width="56"
						height="56"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.2"
						class="text-ink-500"
						aria-hidden="true"><path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10 9-5M12 12 3 7m9 5v10" /></svg
					>
					{#if error}<p role="alert" class="max-w-md text-sm text-ink-800">{error}</p>{/if}
					<button
						type="button"
						onclick={start}
						data-goal-ignore="Интерактивный просмотр 3D-модели, не отправка заявки"
						class="min-h-12 rounded-lg bg-link-600 px-6 py-3 text-sm font-semibold text-on-accent hover:bg-link-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link-500"
						>{error ? 'Попробовать ещё раз' : 'Посмотреть в 3D'}</button
					>
					{#if !error}<p class="text-sm text-ink-600">Модель загрузится после нажатия</p>{/if}
				</div>
			{:else if loading}<p
					role="status"
					class="pointer-events-none absolute inset-x-0 bottom-6 text-center text-sm text-ink-700"
				>
					Загружаем 3D-модель…
				</p>{/if}
		</div>
		{#if activated && !loading && !error && model.format !== 'html'}
			<div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="Управление 3D-моделью">
				{#each views as view (view.id)}
					<button
						type="button"
						aria-pressed={currentView === view.id}
						onclick={() => {
							currentView = view.id;
							viewer?.setView(view.id);
						}}
						data-goal-ignore="Выбор ракурса 3D-модели"
						class="min-h-11 rounded-lg border border-ink-300 px-4 py-2 text-sm text-ink-700 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-link-500 aria-pressed:border-link-600 aria-pressed:bg-link-50 aria-pressed:text-link-700"
						>{view.label}</button
					>
				{/each}
				{#if upperAvailable}<button
						type="button"
						aria-pressed={upperVisible}
						onclick={() => {
							upperVisible = !upperVisible;
							viewer?.setUpper(upperVisible);
						}}
						data-goal-ignore="Показ верхних шкафов в 3D"
						class="min-h-11 rounded-lg border border-ink-300 px-4 py-2 text-sm text-ink-700 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-link-500"
						>{upperVisible ? 'Скрыть верхние шкафы' : 'Показать верхние шкафы'}</button
					>{/if}
				<button
					type="button"
					onclick={() => {
						currentView = 'iso';
						upperVisible = true;
						viewer?.reset();
					}}
					data-goal-ignore="Сброс ракурса 3D-модели"
					class="min-h-11 rounded-lg border border-ink-300 px-4 py-2 text-sm text-ink-700 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-link-500"
					>Сброс</button
				>
			</div>
		{/if}
	</section>
{/if}
