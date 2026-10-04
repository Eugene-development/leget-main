<script lang="ts">
	import type { ProjectModel } from './project-model';
	let { model, title } = $props<{ model: ProjectModel; title: string }>();
	type ARViewer = HTMLElement & { canActivateAR: boolean; activateAR: () => Promise<void> };
	let element = $state.raw<ARViewer>(),
		ready = $state(false),
		available = $state(false),
		failure = $state('');
	function mount(node: HTMLDivElement) {
		let disposed = false,
			viewer: ARViewer | undefined;
		const timer = window.setTimeout(() => {
			if (!disposed && !ready)
				failure = 'Загрузка заняла слишком много времени. Вернитесь в 3D и повторите попытку.';
		}, 60000);
		void import('@google/model-viewer')
			.then(() => {
				if (disposed) return;
				viewer = document.createElement('model-viewer') as ARViewer;
				for (const [key, value] of Object.entries({
					src: model.url,
					alt: title,
					ar: '',
					'ar-modes': 'webxr scene-viewer quick-look',
					'ar-scale': 'fixed',
					'ar-placement': 'floor',
					'camera-controls': '',
					'touch-action': 'pan-y',
					'interaction-prompt': 'none'
				}))
					viewer.setAttribute(key, value);
				viewer.style.cssText = 'width:100%;height:100%;background:transparent';
				const hiddenButton = document.createElement('span');
				hiddenButton.slot = 'ar-button';
				viewer.append(hiddenButton);
				viewer.addEventListener('load', () => {
					window.clearTimeout(timer);
					if (!disposed && viewer) {
						ready = true;
						available = viewer.canActivateAR;
					}
				});
				viewer.addEventListener('error', () => {
					if (!disposed)
						failure =
							'Не удалось загрузить модель. Вернитесь в обычный 3D-просмотр и повторите попытку.';
				});
				viewer.addEventListener('ar-status', (event) => {
					if ((event as CustomEvent).detail?.status === 'failed')
						failure =
							'Не удалось начать AR-просмотр. Проверьте разрешение камеры и попробуйте ещё раз.';
				});
				node.append(viewer);
				element = viewer;
			})
			.catch(() => {
				if (!disposed) failure = 'Не удалось подготовить AR-просмотр. Повторите попытку.';
			});
		return {
			destroy() {
				window.clearTimeout(timer);
				disposed = true;
				viewer?.remove();
				element = undefined;
			}
		};
	}
	async function activate() {
		failure = '';
		try {
			await element?.activateAR();
		} catch {
			failure = 'AR-просмотр не запустился. Проверьте разрешение камеры и повторите попытку.';
		}
	}
</script>

<div class="ar-wrap">
	<div class="ar-stage" use:mount aria-label={`Модель для размещения в комнате: ${title}`}></div>
	<div class="ar-controls">
		{#if failure}<p role="alert">{failure}</p>{:else if !ready}<p role="status">
				Подготавливаем модель для AR…
			</p>{:else if !available}<p>
				На этом устройстве размещение через камеру недоступно. Модель можно рассмотреть в 3D.
			</p>{:else}<p>
				Наведите камеру на пол и разместите мебель. Масштаб зафиксирован по размерам модели.
			</p>{/if}
		{#if ready && available}<button
				type="button"
				onclick={activate}
				data-metrika-goal="mebel_project_ar_activate"
				data-goal-action="open"
				data-goal-label="Разместить мебель в своей комнате"
				class="min-h-11 rounded-lg bg-link-600 px-4 py-2 text-sm text-on-accent hover:bg-link-700 focus-visible:outline-2 focus-visible:outline-link-500"
				>Разместить в комнате</button
			>{/if}
	</div>
</div>

<style>
	.ar-wrap {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.ar-stage {
		flex: 1;
		min-height: 160px;
	}
	.ar-controls {
		padding: 12px 20px;
		color: var(--ds-ink-700);
		font-size: var(--text-sm);
	}
	.ar-controls p {
		margin: 0 0 10px;
		max-width: 65ch;
	}
</style>
