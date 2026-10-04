<script lang="ts">
	import { untrack } from 'svelte';
	import { layouts } from '$lib/growth/estimates/api';
	import GrowthFrame from '$lib/growth/GrowthFrame.svelte';
	import '$lib/growth/selections/surfaces.css';
	let { data } = $props();
	type Material = { key: string; label: string; multiplier: number };
	type Rules = {
		base_min: number | undefined;
		base_max: number | undefined;
		equipment_min: number | undefined;
		equipment_max: number | undefined;
		layouts: Record<string, number>;
		materials: Material[];
		note: string;
	};
	let enabled = $state(untrack(() => Boolean(data.settings.enabled)));
	let rules = $state<Rules>(
		untrack(
			() =>
				data.settings.rules || {
					base_min: undefined,
					base_max: undefined,
					equipment_min: undefined,
					equipment_max: undefined,
					layouts: { straight: 1, l: 1, u: 1, island: 1 },
					materials: [{ key: 'basic', label: '', multiplier: 1 }],
					note: ''
				}
		)
	);
	let busy = $state(false);
	let error = $state('');
	let notice = $state('');
	let settingsVersion = $state<string | null>(untrack(() => data.settings.version || null));
	let retry: { fingerprint: string; key: string } | null = null;
	let saveGeneration = 0;
	$effect(() => {
		const site = data.site.id;
		const settings = data.settings;
		untrack(() => {
			saveGeneration++;
			enabled = Boolean(settings.enabled);
			rules = JSON.parse(
				JSON.stringify(
					settings.rules || {
						base_min: undefined,
						base_max: undefined,
						equipment_min: undefined,
						equipment_max: undefined,
						layouts: { straight: 1, l: 1, u: 1, island: 1 },
						materials: [{ key: 'basic', label: '', multiplier: 1 }],
						note: ''
					}
				)
			);
			settingsVersion = settings.version || null;
			retry = null;
			busy = false;
			error = '';
			notice = '';
		});
	});
	function addMaterial() {
		rules.materials.push({
			key: `material-${crypto.randomUUID().slice(0, 8)}`,
			label: '',
			multiplier: 1
		});
		notice = '';
	}
	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		busy = true;
		error = '';
		notice = '';
		const generation = ++saveGeneration;
		const site = data.site.id;
		const enabledSnapshot = enabled;
		const payload = {
			enabled,
			rules: JSON.parse(JSON.stringify(rules)),
			expected_version: settingsVersion
		};
		const fingerprint = JSON.stringify({ site, ...payload });
		if (retry?.fingerprint !== fingerprint) retry = { fingerprint, key: crypto.randomUUID() };
		try {
			const response = await fetch(`${data.base}/api/sites/${site}/calculator`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({ ...payload, save_key: retry!.key }),
				signal: AbortSignal.timeout(20000)
			});
			const result = await response.json().catch(() => null);
			if (generation !== saveGeneration || site !== data.site.id) return;
			if (!response.ok || !result?.success)
				throw new Error(
					result?.message || 'Не удалось сохранить правила. Проверьте значения и повторите.'
				);
			settingsVersion = result.version;
			retry = null;
			notice = enabledSnapshot
				? 'Правила сохранены. Калькулятор доступен посетителям сайта.'
				: 'Правила сохранены. Калькулятор скрыт от посетителей.';
		} catch (e) {
			if (generation === saveGeneration)
				error =
					e instanceof TypeError
						? 'Связь прервалась. Повторите сохранение.'
						: e instanceof Error
							? e.message
							: 'Не удалось сохранить правила.';
		} finally {
			if (generation === saveGeneration) busy = false;
		}
	}
</script>

<svelte:head><title>Настройки расчёта кухни — CRM</title></svelte:head>
<GrowthFrame title="Расчёт кухни" sites={data.sites} site={data.site.id} base={data.base}>
	<p>
		{data.site.name || data.site.domain}. Задайте собственные ставки. Диапазон считается как длина в
		метрах × ставка × коэффициент планировки × коэффициент материала, плюс стоимость выбранного
		количества единиц техники.
	</p>
	<div class="planning-actions">
		<a href={new URL('/calculator', `https://${data.site.domain}`).href}
			>Открыть калькулятор сайта</a
		>
	</div>
	<form onsubmit={save}>
		<div class="planning-layout">
			<div>
				<section class="planning-section">
					<h2>Ставки, ₽</h2>
					<div class="planning-fields">
						<label
							>Метр кухни — от<input
								type="number"
								min="0"
								max="100000000"
								step="0.01"
								required
								bind:value={rules.base_min}
							/></label
						><label
							>Метр кухни — до<input
								type="number"
								min={rules.base_min ?? 0}
								max="100000000"
								step="0.01"
								required
								bind:value={rules.base_max}
							/></label
						>
						<label
							>Единица техники — от<input
								type="number"
								min="0"
								max="10000000"
								step="0.01"
								required
								bind:value={rules.equipment_min}
							/></label
						><label
							>Единица техники — до<input
								type="number"
								min={rules.equipment_min ?? 0}
								max="10000000"
								step="0.01"
								required
								bind:value={rules.equipment_max}
							/></label
						>
					</div>
				</section>
				<section class="planning-section">
					<h2>Планировка</h2>
					<div class="planning-fields">
						{#each layouts as layout}<label
								>{layout.label} — коэффициент<input
									type="number"
									min="0.1"
									max="10"
									step="0.01"
									required
									bind:value={rules.layouts[layout.key]}
								/></label
							>{/each}
					</div>
				</section>
			</div>
			<div>
				<section class="planning-section">
					<h2>Материалы фасадов</h2>
					<p>
						Названия увидят посетители. Коэффициент 1 сохраняет базовую ставку, 1,2 увеличивает её
						на 20%.
					</p>
					{#each rules.materials as material, index (material.key)}<fieldset
							class="planning-section planning-fields"
						>
							<legend>Материал {index + 1}</legend><label
								>Название<input required maxlength="80" bind:value={material.label} /></label
							><label
								>Коэффициент<input
									type="number"
									min="0.1"
									max="10"
									step="0.01"
									required
									bind:value={material.multiplier}
								/></label
							><button
								type="button"
								class="planning-button"
								disabled={rules.materials.length <= 1}
								onclick={() => {
									rules.materials = rules.materials.filter((entry) => entry.key !== material.key);
								}}
								data-goal-ignore="Редактирование правил калькулятора владельцем"
								>Удалить материал</button
							>
						</fieldset>{/each}
					<button
						type="button"
						class="planning-button"
						disabled={rules.materials.length >= 12}
						onclick={addMaterial}
						data-goal-ignore="Редактирование правил калькулятора владельцем"
						>Добавить материал</button
					>
				</section>
				<section class="planning-section">
					<h2>Условия расчёта</h2>
					<div class="planning-fields">
						<label
							>Что включено и как уточняется стоимость<textarea
								bind:value={rules.note}
								maxlength="1000"
								rows="4"
								placeholder="Например: монтаж включён, точная стоимость после замера"
							></textarea></label
						>
					</div>
				</section>
			</div>
		</div>
		<label class="planning-enable"
			><input type="checkbox" bind:checked={enabled} />Показывать калькулятор посетителям</label
		>
		<div class="planning-actions">
			<button
				class="planning-button primary"
				disabled={busy}
				data-goal-ignore="Сохранение правил калькулятора владельцем"
				>{busy ? 'Сохраняем…' : 'Сохранить правила'}</button
			>
		</div>
	</form>
	{#if error}<p class="planning-error" role="alert">{error}</p>{/if}{#if notice}<p
			class="planning-notice"
			role="status"
		>
			{notice}
		</p>{/if}
</GrowthFrame>
