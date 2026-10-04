<script lang="ts">
	import { untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { growthRequest } from '$lib/growth/selections/api';
	import {
		layouts,
		rubles,
		type EstimateInputs,
		type EstimateResult
	} from '$lib/growth/estimates/api';
	import { createFormSender } from '$lib/utils/form-submission';
	import SiteAnalytics from '$lib/components/SiteAnalytics.svelte';
	import '$lib/growth/selections/surfaces.css';
	let { data } = $props();
	let inputs = $state<EstimateInputs>({
		run_cm: 300,
		layout: 'straight',
		material: untrack(() => data.settings.materials?.[0]?.key || ''),
		equipment: 0
	});
	let result = $state<EstimateResult | null>(null);
	let calculatedFor = $state('');
	const current = $derived(JSON.stringify(inputs));
	const validResult = $derived(result && current === calculatedFor ? result : null);
	let calculating = $state(false);
	let sending = $state(false);
	let error = $state('');
	let accepted = $state(false);
	let name = $state('');
	let phone = $state('');
	let message = $state('');
	const sendForm = createFormSender('kitchen-estimate');
	$effect(() => {
		const materials = data.settings.materials || [];
		untrack(() => {
			if (!materials.some((material) => material.key === inputs.material)) {
				inputs.material = materials[0]?.key || '';
				result = null;
			}
		});
	});
	async function calculate(event: SubmitEvent) {
		event.preventDefault();
		if (calculating) return;
		calculating = true;
		error = '';
		accepted = false;
		const snapshot = { ...inputs };
		const fingerprint = JSON.stringify(snapshot);
		try {
			result = await growthRequest<EstimateResult>('estimate', { inputs: snapshot });
			calculatedFor = fingerprint;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Не удалось рассчитать стоимость.';
		} finally {
			calculating = false;
		}
	}
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (sending || !validResult) return;
		sending = true;
		error = '';
		try {
			await sendForm(
				{
					service_type: 'kitchen-estimate',
					estimate_version: validResult.version,
					estimate_inputs: JSON.stringify(validResult.inputs),
					name,
					phone,
					message
				},
				'service-request',
				event
			);
			accepted = true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Не удалось отправить заявку.';
			if (e instanceof Error && 'code' in e && e.code === 'estimate_stale') {
				result = null;
				calculatedFor = '';
				await invalidateAll().catch(() => {});
			}
		} finally {
			sending = false;
		}
	}
</script>

<svelte:head
	><title>Предварительный расчёт кухни — {data.site.name || 'Мебель на заказ'}</title></svelte:head
>
<SiteAnalytics data={data.site.header?.data} />
<main class="planning-surface">
	<div class="planning-wrap">
		<nav class="planning-nav" aria-label="Навигация">
			<a href="/">{data.site.name || 'Главная'}</a><a href="/projects">Проекты</a><a
				href="/favorites">Избранное</a
			>
		</nav>
		<header class="planning-heading">
			<h1>Сколько будет стоить кухня</h1>
			<p>
				Укажите размеры и комплектацию, чтобы получить предварительный диапазон. Точную стоимость
				менеджер уточнит после обсуждения проекта и замера.
			</p>
		</header>
		{#if !data.settings.available}<section class="planning-section">
				<h2>Расчёт пока недоступен</h2>
				<p>
					Владелец сайта ещё не настроил ставки. Выберите понравившиеся проекты и отправьте подборку
					на индивидуальный расчёт.
				</p>
				<a href="/favorites" class="planning-button">Перейти в избранное</a>
			</section>
		{:else}<div class="planning-layout">
				<section class="planning-section">
					<h2>Параметры кухни</h2>
					<form
						class="planning-fields"
						onsubmit={calculate}
						data-form-business="estimate-calculation"
					>
						<label
							>Общая длина шкафов, см<input
								type="number"
								min="50"
								max="3000"
								step="1"
								bind:value={inputs.run_cm}
								required
							/><span>Сложите длины всех сторон, включая остров.</span></label
						>
						<label
							>Планировка<select bind:value={inputs.layout}
								>{#each layouts as layout}<option value={layout.key}>{layout.label}</option
									>{/each}</select
							></label
						>
						<label
							>Материал фасадов<select bind:value={inputs.material}
								>{#each data.settings.materials || [] as material}<option value={material.key}
										>{material.label}</option
									>{/each}</select
							></label
						>
						<label
							>Количество единиц техники<input
								type="number"
								min="0"
								max="10"
								step="1"
								bind:value={inputs.equipment}
								required
							/><span
								>Плита, духовка, холодильник и другая техника, которую нужно включить в расчёт.</span
							></label
						>
						<button
							class="planning-button primary"
							disabled={calculating}
							data-goal-ignore="Предварительный расчёт — вычисление без заявки"
							>{calculating ? 'Рассчитываем…' : 'Рассчитать диапазон'}</button
						>
					</form>
				</section>
				<section class="planning-section">
					<h2>Предварительная стоимость</h2>
					{#if validResult}<div class="planning-range">
							{rubles(validResult.min)} – {rubles(validResult.max)}
						</div>
						<p>{validResult.note || 'Диапазон рассчитан по действующим правилам этого сайта.'}</p>
						<dl class="planning-summary">
							<dt>Длина</dt>
							<dd>{validResult.inputs.run_cm} см</dd>
							<dt>Планировка</dt>
							<dd>{layouts.find((layout) => layout.key === validResult.inputs.layout)?.label}</dd>
							<dt>Фасады</dt>
							<dd>{validResult.material_label}</dd>
							<dt>Техника</dt>
							<dd>{validResult.inputs.equipment} ед.</dd>
						</dl>
						{#if accepted}<p class="planning-notice" role="status">
								Заявка принята. Менеджер получил параметры кухни и свяжется с вами.
							</p>
						{:else}<h2>Уточнить расчёт</h2>
							<form class="planning-fields ym-hide-content" onsubmit={submit}>
								<label
									>Имя<input
										class="ym-disable-keys"
										bind:value={name}
										required
										maxlength="255"
										autocomplete="name"
									/></label
								><label
									>Телефон<input
										class="ym-disable-keys"
										type="tel"
										bind:value={phone}
										required
										maxlength="50"
										autocomplete="tel"
									/></label
								><label
									>Пожелания<textarea
										class="ym-disable-keys"
										bind:value={message}
										maxlength="2000"
										rows="3"
									></textarea></label
								>
								<p>Отправляя заявку, вы соглашаетесь с обработкой персональных данных.</p>
								<button
									class="planning-button primary"
									disabled={sending}
									data-metrika-goal="kitchen_estimate_submit"
									data-goal-action="submit_click"
									>{sending ? 'Отправляем…' : 'Обсудить с менеджером'}</button
								>
							</form>{/if}
					{:else}<p>
							{result
								? 'Параметры изменились. Рассчитайте диапазон ещё раз.'
								: 'Заполните параметры кухни и нажмите «Рассчитать диапазон».'}
						</p>{/if}
				</section>
			</div>{/if}
		{#if error}<p class="planning-error" role="alert">{error}</p>{/if}
	</div>
</main>
