<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}

	/** Фото коллажа: ключи те же (img1…img4), пустые просто не рендерятся. */
	const photos = $derived([
		{ key: 'img1', label: 'Фото 1 (URL)', value: String(data?.img1 ?? '') },
		{ key: 'img2', label: 'Фото 2 (URL)', value: String(data?.img2 ?? '') },
		{ key: 'img3', label: 'Фото 3 (URL)', value: String(data?.img3 ?? '') },
		{ key: 'img4', label: 'Фото 4 (URL)', value: String(data?.img4 ?? '') }
	]);

	const hasPhotos = $derived(photos.some((p) => p.value));
</script>

<!--
	Hero страницы «О компании».

	ВНИМАНИЕ — стык секций: снизу Hero обрезан волной, её заливка обязана
	совпадать с фоном следующего блока. Ниже идут Text и Statistics — оба на
	`bg-slate-50` (#f8fafc), поэтому стык держится даже если блок Text пуст
	или отключён. Цвет волны — переменная `--ah-wave`: меняешь фон Text/Statistics,
	меняешь и её (фон body тут другой, #faf9f7).
-->
<section
	class="ab-enter relative isolate overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-red-900"
>
	<!-- Декор: сетка-ромбы прежней версии, красные свечения, линия сверху -->
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div
			class="absolute inset-0 opacity-20"
			style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
		></div>
		<div class="ab-glow absolute -top-40 -left-24 size-112 bg-red-500/20"></div>
		<div class="ab-glow absolute top-1/3 -right-24 size-96 bg-red-400/15"></div>
		<div
			class="absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-linear-to-r from-transparent via-red-500/60 to-transparent"
		></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 pt-20 pb-32 sm:px-6 sm:pt-28 sm:pb-40 lg:px-8 lg:pb-44">
		<div class="lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
			<div>
				<EditableField
					fieldKey="Hero.badge"
					label="Бейдж"
					value={String(data?.badge ?? 'О компании')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="ab-item inline-block"
				>
					{#snippet children(displayValue)}
						<div
							class="inline-flex items-center gap-2.5 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-red-400 uppercase sm:text-xs"
						>
							<span
								class="size-1.5 rounded-full bg-red-400 shadow-[0_0_12px_2px_rgba(248,113,113,0.7)]"
								aria-hidden="true"
							></span>
							{displayValue}
						</div>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Hero.title"
					label="Заголовок"
					value={String(data?.title ?? 'О нас')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="ab-item ab-d1 mt-6 block"
				>
					{#snippet children(displayValue)}
						<h1
							class="text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-pretty text-white sm:text-5xl lg:text-6xl"
						>
							{displayValue}
						</h1>
					{/snippet}
				</EditableField>

				<div class="ab-rule ab-d2 mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
					<span class="h-px flex-1 bg-white/15"></span>
					<span class="size-1.5 rotate-45 border border-red-500/80"></span>
					<span class="h-px flex-1 bg-white/15"></span>
				</div>

				<EditableField
					fieldKey="Hero.lead"
					label="Вводный текст"
					value={String(data?.lead ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('lead', v)}
					class="ab-item ab-d3 mt-6 block"
				>
					{#snippet children(displayValue)}
						{#if displayValue}
							<p class="max-w-xl text-lg leading-relaxed text-pretty text-red-50">{displayValue}</p>
						{/if}
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Hero.text"
					label="Основной текст"
					value={String(data?.text ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('text', v)}
					class="ab-item ab-d3 mt-4 block"
				>
					{#snippet children(displayValue)}
						{#if displayValue}
							<p class="max-w-xl text-sm/6 text-slate-300 sm:text-base/7">{displayValue}</p>
						{/if}
					{/snippet}
				</EditableField>

				<div class="ab-item ab-d4 mt-10">
					<a
						href="/contact"
						class="group inline-flex items-center justify-center gap-2.5 rounded-full bg-red-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(239,68,68,0.95)] transition duration-300 hover:bg-red-400 hover:shadow-[0_22px_55px_-16px_rgba(239,68,68,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 motion-safe:hover:-translate-y-0.5"
					>
						<EditableField
							fieldKey="Hero.buttonText"
							label="Текст кнопки"
							value={String(data?.buttonText ?? 'Связаться с нами')}
							{isEditable}
							onSave={(v) => saveField('buttonText', v)}
							class="inline"
						>
							{#snippet children(displayValue)}
								{displayValue}
							{/snippet}
						</EditableField>
						<span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
					</a>
				</div>
			</div>

			<!--
				Коллаж фото. Раньше это были две колонки с жёстко заданной высотой 48
				и вторая колонка со сдвигом pt-8: при одном-двух заполненных фото
				сетка «проваливалась» и сдвиг выглядел ошибкой. Теперь masonry-подобная
				раскладка из колонок CSS: сколько фото задано — столько и рисуется.
			-->
			{#if hasPhotos || isEditable}
				<div class="ab-card ab-d2 mt-12 lg:mt-0">
					<div class="gap-4 sm:columns-2">
						{#each photos as photo (photo.key)}
							<EditableField
								fieldKey="Hero.{photo.key}"
								label={photo.label}
								value={photo.value}
								{isEditable}
								onSave={(v) => saveField(photo.key, v)}
								class="block"
							>
								{#snippet children(displayValue)}
									{#if displayValue}
										<div
											class="mb-4 overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)]"
										>
											<img
												loading="lazy"
												src={displayValue}
												alt=""
												class="w-full object-cover transition-transform duration-500 motion-safe:hover:scale-105"
											/>
										</div>
									{/if}
								{/snippet}
							</EditableField>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!--
		Волна-переход — РОВНО ОДИН слой в цвет фона следующей секции.
		Полупрозрачный подслой для «глубины» тут не работает: над градиентом секции
		он читается как посторонняя полоса вдоль волны.
		preserveAspectRatio="none" + фиксированная высота — чтобы на широких
		экранах не оставалось щели между волной и краем секции.
	-->
	<div class="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
		<svg
			class="ah-wave block h-16 w-full sm:h-20 lg:h-28"
			viewBox="0 0 1440 120"
			preserveAspectRatio="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				class="ah-wave-front"
				d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
			/>
		</svg>
	</div>
</section>

<style>
	/* Цвет волны = фон следующих секций (Text и Statistics, bg-slate-50). */
	.ah-wave {
		--ah-wave: #f8fafc;
	}

	.ah-wave-front {
		fill: var(--ah-wave);
	}
</style>
