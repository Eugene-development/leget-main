<script lang="ts">
	import { tick } from 'svelte';
	import HtmlProjectModel from './HtmlProjectModel.svelte';
	import ProjectAR from './ProjectAR.svelte';
	import type { ProjectModel } from './project-model';
	import type { GlbViewer, ModelView } from './project-glb-viewer';
	let { model, title, onready, onclose, onerror } = $props<{
		model: ProjectModel;
		title: string;
		onready: () => void;
		onclose: () => void;
		onerror: () => void;
	}>();
	const uid = $props.id();
	let dialog = $state<HTMLDialogElement>();
	let opened = $state(false),
		upperAvailable = $state(false),
		upperVisible = $state(true);
	let currentView = $state<ModelView>('iso');
	let arMode = $state(false);
	let viewer = $state.raw<GlbViewer>();
	let disposed = false;
	let restoreScroll: (() => void) | undefined;
	const views: { id: ModelView; label: string }[] = [
		{ id: 'iso', label: 'Перспектива' },
		{ id: 'front', label: 'Спереди' },
		{ id: 'top', label: 'Сверху' }
	];
	function mountDialog(node: HTMLDialogElement) {
		const previousFocus = document.activeElement;
		document.body.appendChild(node);
		return {
			destroy() {
				disposed = true;
				node.close();
				restoreScroll?.();
				node.remove();
				if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
					previousFocus.focus({ preventScroll: true });
			}
		};
	}
	async function show() {
		if (disposed || !dialog || opened) return;
		const previousOverflow = document.body.style.overflow;
		restoreScroll = () => {
			document.body.style.overflow = previousOverflow;
		};
		opened = true;
		await tick();
		if (disposed || !dialog?.isConnected) return;
		dialog.showModal();
		document.body.style.overflow = 'hidden';
		onready();
	}
	function mountViewer(node: HTMLDivElement) {
		let cancelled = false,
			instance: GlbViewer | undefined;
		void import('./project-glb-viewer')
			.then(({ createGlbViewer }) => {
				if (cancelled) return;
				instance = createGlbViewer(
					node,
					model.url,
					title,
					(available) => {
						if (!cancelled) {
							upperAvailable = available;
							show();
						}
					},
					() => {
						if (!cancelled) onerror();
					}
				);
				viewer = instance;
			})
			.catch(() => {
				if (!cancelled) onerror();
			});
		return {
			destroy() {
				cancelled = true;
				instance?.dispose();
			}
		};
	}
</script>

<!-- Closed dialog stays offscreen at its final size so assets can load before showModal(). -->
<dialog
	bind:this={dialog}
	use:mountDialog
	data-loading={!opened}
	aria-labelledby={`${uid}-title`}
	aria-describedby={`${uid}-help`}
	oncancel={(event) => {
		event.preventDefault();
		onclose();
	}}
	onclick={(event) => {
		if (event.target === dialog && dialog) {
			const rect = dialog.getBoundingClientRect();
			if (
				event.clientX < rect.left ||
				event.clientX > rect.right ||
				event.clientY < rect.top ||
				event.clientY > rect.bottom
			)
				onclose();
		}
	}}
	onkeydown={(event) => {
		if (event.key === 'Escape') event.stopPropagation();
	}}
	class="model-dialog m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-6xl overflow-y-auto rounded-2xl border border-ink-200 bg-surface-raised p-0 text-ink-800 shadow-2xl backdrop:bg-scrim/60"
>
	<header class="flex items-start justify-between gap-4 border-b border-ink-200 px-5 py-4 sm:px-7">
		<div>
			<h2 id={`${uid}-title`} class="p1-title-sub text-xl">{title}</h2>
			<p id={`${uid}-help`} class="mt-1 text-sm text-ink-600">
				{model.format === 'html'
					? 'Управление доступно внутри модели.'
					: 'Вращайте мышью или пальцем. Приближайте колесом или двумя пальцами.'}
			</p>
		</div>
		<button
			type="button"
			onclick={onclose}
			aria-label="Закрыть 3D-модель"
			data-metrika-goal="mebel_project_model_close"
			data-goal-action="close"
			data-goal-label="Закрыть просмотр 3D-модели"
			class="flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-link-500"
			><svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg
			></button
		>
	</header>
	<div class="model-stage bg-ink-50">
		{#if model.format === 'html'}<HtmlProjectModel
				url={model.url}
				{title}
				onready={show}
				{onerror}
			/>
		{:else if arMode}<ProjectAR {model} {title} />
		{:else}<div class="h-full w-full" use:mountViewer></div>{/if}
	</div>
	{#if model.format !== 'html'}
		<footer
			class="flex flex-wrap gap-2 border-t border-ink-200 p-4"
			role="group"
			aria-label="Управление 3D-моделью"
		>
			{#if arMode}<button
					type="button"
					onclick={() => (arMode = false)}
					data-metrika-goal="mebel_project_ar_close"
					data-goal-action="close"
					data-goal-label="Вернуться из AR в обычный 3D-просмотр"
					class="min-h-11 rounded-lg border border-ink-300 px-4 py-2 text-sm text-ink-700 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-link-500"
					>Вернуться в 3D</button
				>{:else}<button
					type="button"
					onclick={() => (arMode = true)}
					data-metrika-goal="mebel_project_ar_open"
					data-goal-action="open"
					data-goal-label="Переключить на размещение мебели в комнате"
					class="min-h-11 rounded-lg border border-ink-300 px-4 py-2 text-sm text-ink-700 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-link-500"
					>Посмотреть в своей комнате</button
				>{/if}
			{#if !arMode}
				{#each views as view (view.id)}<button
						type="button"
						aria-pressed={currentView === view.id}
						onclick={() => {
							currentView = view.id;
							viewer?.setView(view.id);
						}}
						data-goal-ignore="Выбор ракурса 3D-модели"
						class="min-h-11 rounded-lg border border-ink-300 px-4 py-2 text-sm text-ink-700 hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-link-500 aria-pressed:border-link-600 aria-pressed:bg-link-50 aria-pressed:text-link-700"
						>{view.label}</button
					>{/each}
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
			{/if}
		</footer>
	{/if}
</dialog>

<style>
	.model-dialog[data-loading='true'] {
		display: block;
		position: fixed;
		left: -100000px;
		top: 0;
		margin: 0;
		visibility: hidden;
		pointer-events: none;
	}
	.model-stage {
		height: clamp(220px, 58dvh, 600px);
	}
	.model-dialog[open] {
		animation: model-reveal 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	.model-dialog[open]::backdrop {
		animation: backdrop-reveal 220ms ease-out both;
	}
	@keyframes model-reveal {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	@keyframes backdrop-reveal {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.model-dialog[open],
		.model-dialog[open]::backdrop {
			animation: none;
		}
	}
</style>
