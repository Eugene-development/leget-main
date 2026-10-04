<script lang="ts">
	import { growthRequest, type SelectionItem } from './api';
	import './surfaces.css';
	let { projectIds }: { projectIds: string[] } = $props();
	let expanded = $state(false);
	let title = $state('Подборка для моего проекта');
	let materials = $state<SelectionItem[]>([]);
	let selectedMaterials = $state<string[]>([]);
	let busy = $state(false);
	let error = $state('');
	let result = $state<{ token: string; expires_at: string } | null>(null);
	let creation: { fingerprint: string; key: string } | null = null;
	async function expand() {
		expanded = !expanded;
		if (!expanded || materials.length) return;
		busy = true;
		error = '';
		try {
			materials = (
				await growthRequest<{ items: SelectionItem[] }>('selection-catalog')
			).items.filter((item) => item.kind === 'material');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Не удалось загрузить материалы.';
		} finally {
			busy = false;
		}
	}
	async function create(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		busy = true;
		error = '';
		result = null;
		const items = [
			...projectIds.map((id) => ({ kind: 'project', id })),
			...selectedMaterials.map((id) => ({ kind: 'material', id }))
		];
		const fingerprint = JSON.stringify({ title, items });
		if (creation?.fingerprint !== fingerprint) creation = { fingerprint, key: crypto.randomUUID() };
		try {
			result = await growthRequest('selections', { title, items, creation_key: creation!.key });
		} catch (e) {
			error = e instanceof Error ? e.message : 'Не удалось сохранить подборку.';
		} finally {
			busy = false;
		}
	}
</script>

<div class="selection-builder">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h2 class="p1-title-sub text-lg">Обсудите избранное вместе</h2>
			<p class="p1-body mt-1 text-sm">
				Добавьте материалы и поделитесь подборкой с близкими или дизайнером.
			</p>
		</div>
		<button
			type="button"
			class="planning-button"
			onclick={expand}
			aria-expanded={expanded}
			data-goal-ignore="Создание подборки — операция каталога"
			>{expanded ? 'Свернуть подборку' : 'Собрать подборку'}</button
		>
	</div>
	{#if expanded}
		<form onsubmit={create}>
			<div class="planning-fields">
				<label>Название подборки<input bind:value={title} required maxlength="160" /></label>
			</div>
			{#if materials.length}<fieldset class="selection-materials">
					<legend class="p1-title mb-2">Материалы и комплектация</legend>
					{#each materials as item (`${item.kind}:${item.id}`)}<label class="p1-body"
							><input
								type="checkbox"
								bind:group={selectedMaterials}
								value={item.id}
							/>{item.title}</label
						>{/each}
				</fieldset>{/if}
			<p class="p1-body mt-4 text-sm">
				В подборке: {projectIds.length} проектов и {selectedMaterials.length} материалов. Ссылка действует
				30 дней; её можно закрыть в этом браузере.
			</p>
			<div class="planning-actions">
				<button
					class="planning-button primary"
					disabled={busy ||
						projectIds.length + selectedMaterials.length === 0 ||
						projectIds.length + selectedMaterials.length > 30}
					data-goal-ignore="Сохранение подборки — операция каталога"
					>{busy ? 'Сохраняем…' : 'Создать ссылку'}</button
				><a href="/calculator" class="p1-body underline">Предварительный расчёт кухни</a>
			</div>
		</form>
		{#if error}<p class="planning-error" role="alert">{error}</p>{/if}
		{#if result}<p class="p1-body mt-4" role="status">
				Подборка сохранена. <a class="underline" href={`/selection/${result.token}`}
					>Открыть и поделиться ссылкой</a
				>
			</p>{/if}
	{/if}
</div>
